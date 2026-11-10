const { WebSocketServer, WebSocket } = require('ws');
function attach(server, getState) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const broadcast = (state) => {
    const message = JSON.stringify({ type: 'state', state });
    for (const client of wss.clients) if (client.readyState === WebSocket.OPEN) client.send(message);
  };
  wss.on('connection', (client) => client.send(JSON.stringify({ type: 'state', state: getState() })));
  return { broadcast, close: () => wss.close() };
}
module.exports = { attach };
