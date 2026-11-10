const form = document.getElementById('settings');
const field = (name) => form.elements[name];
const $ = (id) => document.getElementById(id);
function populate(state) {
  for (const key of ['channelName', 'subscriberCount', 'target', 'mode', 'refreshSeconds']) field(key).value = state[key];
  field('accent').value = state.colors.accent;
  field('text').value = state.colors.text;
  field('titleSize').value = state.sizes.title;
  field('countSize').value = state.sizes.count;
  field('barSize').value = state.sizes.bar;
  preview(state);
  $('status').textContent = state.status?.message || 'Connected';
  $('led').className = state.status?.state === 'error' ? 'bad' : 'good';
  $('interval-wrap').hidden = state.mode !== 'auto';
}
function preview(state) {
  const count = Number(state.subscriberCount) || 0, target = Number(state.target) || 1;
  const percent = Math.min(100, count / target * 100);
  $('preview-count').textContent = count.toLocaleString();
  $('preview-target').textContent = target.toLocaleString();
  $('preview-percent').textContent = `${Math.floor(percent)}% complete`;
  $('preview-fill').style.width = `${percent}%`;
}
function connect() {
  const socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
  socket.onmessage = ({ data }) => { const message = JSON.parse(data); if (message.type === 'state') populate(message.state); };
  socket.onclose = () => { $('status').textContent = 'Reconnecting…'; setTimeout(connect, 1500); };
}
form.addEventListener('change', () => { $('interval-wrap').hidden = field('mode').value !== 'auto'; });
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = { channelName: field('channelName').value.trim(), subscriberCount: Number(field('subscriberCount').value), target: Number(field('target').value), mode: field('mode').value, refreshSeconds: Number(field('refreshSeconds').value), colors: { accent: field('accent').value, text: field('text').value }, sizes: { title: Number(field('titleSize').value), count: Number(field('countSize').value), bar: Number(field('barSize').value) } };
  try {
    const response = await fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to save settings.');
    $('saved').textContent = 'Tersimpan';
    setTimeout(() => $('saved').textContent = '', 2200);
  } catch (error) { $('saved').textContent = error.message; $('saved').style.color = '#ff7777'; }
});
$('overlay-url').textContent = `${location.origin}/`;
fetch('/api/state').then((response) => response.json()).then(populate).catch(() => {});
connect();
