const $ = (id) => document.getElementById(id);
let previousCount;
function render(state) {
  const count = Number(state.subscriberCount) || 0;
  const target = Number(state.target) || 1;
  const percent = Math.min(100, count / target * 100);
  $('channel').textContent = state.channelName;
  $('count').textContent = count.toLocaleString();
  $('target').textContent = target.toLocaleString();
  $('percent').textContent = `${Math.floor(percent)}% complete`;
  $('remaining').textContent = `${Math.max(0, target - count).toLocaleString()} to go`;
  $('fill').style.width = `${percent}%`;
  $('goal').style.setProperty('--accent', state.colors.accent);
  $('goal').style.setProperty('--track', state.colors.track);
  $('goal').style.setProperty('--text', state.colors.text);
  $('goal').style.setProperty('--title', `${state.sizes.title}px`);
  $('goal').style.setProperty('--count', `${state.sizes.count}px`);
  $('goal').style.setProperty('--bar', `${state.sizes.bar}px`);
  $('status').textContent = state.status?.state === 'error' ? state.status.message : '';
  if (previousCount !== undefined && previousCount !== count) {
    $('count').classList.add('bump');
    setTimeout(() => $('count').classList.remove('bump'), 260);
  }
  previousCount = count;
}
function connect() {
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
  ws.onmessage = (event) => { const data = JSON.parse(event.data); if (data.type === 'state') render(data.state); };
  ws.onclose = () => setTimeout(connect, 1500);
}
fetch('/api/state').then((response) => response.json()).then(render).catch(() => {});
connect();
