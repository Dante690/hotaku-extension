// Background worker: fetches and briefly caches Hotaku markets so the popup stays
// snappy and we don't hammer the API on every open.
//
// Self-contained (no imports) so the same file works both as a Chrome MV3
// service worker (`background.service_worker`) and as a Firefox background
// script (`background.scripts`).

const HOTAKU_API_BASE = 'https://api.hotaku.fun';
const TTL_MS = 60_000;
const cache = new Map(); // game -> { ts, markets }

async function listMarkets(game) {
  const url = new URL('/markets', HOTAKU_API_BASE);
  if (game) url.searchParams.set('game', game);
  url.searchParams.set('status', 'active');
  url.searchParams.set('limit', '100');

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Hotaku API ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.markets) ? data.markets : [];
}

async function getMarkets(game) {
  const key = game || '_all';
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL_MS) return hit.markets;

  const markets = await listMarkets(game);
  cache.set(key, { ts: Date.now(), markets });
  return markets;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== 'HOTAKU_GET_MARKETS') return;
  getMarkets(msg.game)
    .then((markets) => sendResponse({ ok: true, markets }))
    .catch((err) => sendResponse({ ok: false, error: String(err) }));
  return true; // keep the channel open for the async response
});
