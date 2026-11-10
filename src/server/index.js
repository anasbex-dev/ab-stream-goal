require('dotenv').config();
const express = require('express');
const http = require('node:http');
const path = require('node:path');
const store = require('./store');
const { fetchSubscribers } = require('../services/youtube');
const { attach } = require('../websocket');

const app = express();
const server = http.createServer(app);
let config = store.read();
let timer;
app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, '../../public')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '../../public/index.html')));
app.get('/dashboard', (_req, res) => res.sendFile(path.join(__dirname, '../../public/dashboard.html')));
app.get('/api/state', (_req, res) => res.json(config));

const sockets = attach(server, () => config);
function publish() { store.write(config); sockets.broadcast(config); }
function validate(body) {
  const next = { ...config, ...body, colors: { ...config.colors, ...body.colors }, sizes: { ...config.sizes, ...body.sizes } };
  if (typeof next.channelName !== 'string' || !next.channelName.trim() || next.channelName.length > 40) throw new Error('Channel name must be 1–40 characters.');
  for (const key of ['target', 'subscriberCount', 'refreshSeconds']) {
    const limits = { target: [1, 1000000000], subscriberCount: [0, 1000000000], refreshSeconds: [60, 86400] }[key];
    if (!Number.isInteger(next[key]) || next[key] < limits[0] || next[key] > limits[1]) throw new Error(`Invalid ${key}.`);
  }
  if (!['manual', 'auto'].includes(next.mode)) throw new Error('Mode must be manual or auto.');
  for (const key of ['title', 'count', 'bar']) if (!Number.isInteger(next.sizes[key]) || next.sizes[key] < 6 || next.sizes[key] > 96) throw new Error(`Invalid ${key} size.`);
  for (const key of ['accent', 'track', 'text']) if (typeof next.colors[key] !== 'string' || next.colors[key].length > 40) throw new Error(`Invalid ${key} color.`);
  return next;
}
app.put('/api/config', (req, res) => {
  try {
    config = validate(req.body);
    if (config.mode === 'manual') config.status = { state: 'manual', message: 'Manual mode' };
    publish();
    if (config.mode === 'auto') updateFromYouTube(); else clearInterval(timer);
    res.json(config);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

async function updateFromYouTube() {
  if (config.mode !== 'auto') return;
  try {
    const subscriberCount = await fetchSubscribers(process.env.YOUTUBE_CHANNEL_ID, process.env.YOUTUBE_API_KEY);
    config = { ...config, subscriberCount, status: { state: 'connected', message: 'YouTube data updated. Public counts may be rounded by YouTube.' } };
  } catch (error) {
    config = { ...config, status: { state: 'error', message: `${error.message} Showing the last known count; switch to manual mode if needed.` } };
  }
  publish();
}
function scheduleUpdates() {
  clearInterval(timer);
  if (config.mode === 'auto') {
    updateFromYouTube();
    timer = setInterval(updateFromYouTube, config.refreshSeconds * 1000);
  }
}
scheduleUpdates();
const port = Number(process.env.PORT) || 3000;
server.listen(port, () => console.log(`AB Stream Goal running at http://localhost:${port}`));
process.on('SIGINT', () => { clearInterval(timer); sockets.close(); server.close(() => process.exit(0)); });
