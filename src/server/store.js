const fs = require('node:fs');
const path = require('node:path');

const defaults = {
  channelName: 'AnasBex', subscriberCount: 0, target: 1000, mode: 'manual',
  refreshSeconds: 300, colors: { accent: '#ff3434', track: 'rgba(255,255,255,.16)', text: '#ffffff' },
  sizes: { title: 18, count: 34, bar: 10 }, status: { state: 'manual', message: 'Manual mode' }
};
const file = path.join(__dirname, '../../data/config.json');

function read() {
  try {
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { ...defaults, ...saved, colors: { ...defaults.colors, ...saved.colors }, sizes: { ...defaults.sizes, ...saved.sizes } };
  }
  catch { return structuredClone(defaults); }
}
function write(config) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(config, null, 2));
  fs.renameSync(temp, file);
}
module.exports = { defaults, read, write };
