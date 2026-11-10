const test = require('node:test');
const assert = require('node:assert/strict');
const { defaults } = require('../src/server/store');
const { fetchSubscribers } = require('../src/services/youtube');

test('default config has manual mode and safe refresh interval', () => {
  assert.equal(defaults.mode, 'manual');
  assert.ok(defaults.refreshSeconds >= 60);
  assert.equal(defaults.channelName, 'AnasBex');
});

test('YouTube service requires server-side credentials', async () => {
  await assert.rejects(fetchSubscribers('', ''), /YOUTUBE_CHANNEL_ID and YOUTUBE_API_KEY/);
});

test('YouTube service parses a returned subscriber count', async (t) => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ items: [{ statistics: { subscriberCount: '1234' } }] }) });
  t.after(() => { global.fetch = originalFetch; });
  assert.equal(await fetchSubscribers('channel', 'secret'), 1234);
});

test('YouTube service reports quota errors', async (t) => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 403, json: async () => ({ error: { errors: [{ reason: 'quotaExceeded' }] } }) });
  t.after(() => { global.fetch = originalFetch; });
  await assert.rejects(fetchSubscribers('channel', 'secret'), /quota limit/);
});
