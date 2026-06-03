# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Manifest V3 browser extension (vanilla JS, **no build step**) that surfaces
[Hotaku](https://hotaku.fun) esports prediction-market odds on the page the user
is browsing. Load it via `chrome://extensions` → Developer mode → **Load unpacked**;
there is nothing to compile, bundle, or `npm install`. Edit a file and hit reload
on the extensions page.

## Architecture

Three contexts communicate by `chrome.runtime`/`chrome.tabs` messaging:

1. **Content scripts** (`src/content/`) — `shared.js` loads first and registers a
   `chrome.runtime.onMessage` listener that answers `{ type: 'HOTAKU_GET_MATCH' }`
   by calling the detector a site script registered via
   `globalThis.__hotakuRegisterDetector(fn)`. Each `sites/*.js` returns
   `{ site, game, teams, title, url }` or `null`. The `shared.js` + one site script
   pairing is declared per-site in `manifest.json` `content_scripts`.
2. **Service worker** (`src/background/service-worker.js`) — answers
   `{ type: 'HOTAKU_GET_MARKETS', game }` by fetching the Hotaku API and caching
   per-game for 60s. It's a `type: "module"` worker importing `src/lib/hotaku.js`.
3. **Popup** (`src/popup/`) — asks the active tab for its match, asks the worker
   for that game's markets, then ranks/renders. Imports `src/lib/hotaku.js`.

`src/lib/hotaku.js` is the only module shared between worker and popup (content
scripts can't use ES imports, so they stay self-contained classic scripts).

## Key constraints to respect

- **Detectors emit a Hotaku game slug** from `GAMES` in `src/lib/hotaku.js`:
  `cs2`, `lol`, `dota2`, `valorant`, `fifa`, `aoe` (Age of Empires), `brawl`
  (Brawl Stars). Note the short forms. The Hotaku API keys everything on these,
  so a new game needs both an API slug and a mapping in the relevant detector
  (Liquipedia wiki path / Twitch category).
- **Twitch and op.gg can't resolve a specific match**, so their detectors return
  `teams: []`. The popup treats an empty `teams` as "show this game's top markets"
  rather than pinning one market — keep that branch intact in `popup.js#render`.
- **Team matching is fuzzy** (`rankMarkets`/`normalizeName`): it compares detected
  names against both full (`team1`) and short (`team1_short`) names, accent- and
  case-insensitive. Site DOM changes are the most likely thing to break detection.
- **CORS**: the API only allows `hotaku.fun` origins. Fetches work only because of
  `host_permissions: ["https://api.hotaku.fun/*"]` in the manifest — don't remove it,
  and don't try to fetch the API from a content script (that *is* CORS-blocked).
- **Render API/page strings via `textContent` or `escapeHtml`**, never raw
  `innerHTML` — team names and titles are untrusted input.

## Hotaku API (the data source)

Public, no-auth read endpoints (full schema: <https://hotaku.fun/openapi.json>):

- `GET /markets?game=<slug>&status=active|live|resolved&limit=<=100&offset=`
  → `{ markets: [...] }`. Each market has `team1`/`team2`, `team1_short`/`team2_short`,
  `team1_price`/`team2_price` (implied probability 0..1), `team1_color`, `tournament`,
  `best_of`, `volume`, `live`, `id`.
- `GET /markets/:id`, `/markets/:id/orderbook`, `/teams`, `/trading/quote` are also
  public if more data is ever needed.

Market detail pages live at `https://hotaku.fun/markets/:id` (`marketUrl(id)`).
The Hotaku product repo (Vue SPA + Cloudflare Worker backend) is at `C:\Git\hotaku`.

## Manual verification

No test suite. To verify a change: load unpacked, open a real match page
(an HLTV `/matches/...` URL is the most reliable both-teams case), open the popup,
and check the worker/popup consoles via the extensions page **Inspect views** links.
