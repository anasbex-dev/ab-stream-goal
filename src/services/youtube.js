async function fetchSubscribers(channelId, apiKey) {
  if (!channelId || !apiKey) throw new Error('Set YOUTUBE_CHANNEL_ID and YOUTUBE_API_KEY in .env to enable automatic updates.');
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.search = new URLSearchParams({ part: 'statistics', id: channelId, key: apiKey });
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = payload?.error?.errors?.[0]?.reason;
    if (response.status === 403 && reason === 'quotaExceeded') throw new Error('YouTube API quota limit reached. Using the last known count.');
    throw new Error(payload?.error?.message || `YouTube API returned HTTP ${response.status}.`);
  }
  const stats = payload.items?.[0]?.statistics;
  if (!stats || stats.hiddenSubscriberCount) throw new Error('Subscriber count is unavailable for this channel.');
  const count = Number(stats.subscriberCount);
  if (!Number.isSafeInteger(count)) throw new Error('YouTube returned an invalid subscriber count.');
  return count;
}
module.exports = { fetchSubscribers };
