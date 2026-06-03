// Service worker: fetches and briefly caches Hotaku markets so the popup stays
// snappy and we don't hammer the API on every open.
import { listMarkets } from '../lib/hotaku.js';

const TTL_MS = 60_000;
const cache = new Map(); // game -> { ts, markets }

async function getMarkets(game) {
  const key = game || '_all';
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL_MS) return hit.markets;

  const markets = await listMarkets({ game, status: 'active' });
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
