import { rankMarkets, formatPct, marketUrl, marketStatus, statusRank } from '../lib/hotaku.js';

const content = document.getElementById('content');

const GAME_LABEL = {
  cs2: 'CS2',
  lol: 'League of Legends',
  dota2: 'Dota 2',
  valorant: 'VALORANT',
  fifa: 'EA Sports FC',
  aoe: 'Age of Empires',
  brawl: 'Brawl Stars',
};

init();

async function init() {
  try {
    const tab = await activeTab();
    const match = await getMatchFromTab(tab.id);
    if (!match) return renderUnsupported();

    const markets = await getMarkets(match.game);
    render(match, markets);
  } catch (err) {
    renderError(err);
  }
}

/* ---------- messaging ---------- */

function activeTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (tab) resolve(tab);
      else reject(new Error('No active tab'));
    });
  });
}

// Returns the detected match, or null if the tab has no Hotaku content script.
function getMatchFromTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: 'HOTAKU_GET_MATCH' }, (resp) => {
      if (chrome.runtime.lastError || !resp || !resp.ok) return resolve(null);
      resolve(resp.match);
    });
  });
}

function getMarkets(game) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'HOTAKU_GET_MARKETS', game }, (resp) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!resp || !resp.ok) return reject(new Error(resp?.error || 'Failed to load markets'));
      resolve(resp.markets || []);
    });
  });
}

/* ---------- rendering ---------- */

function render(match, markets) {
  content.replaceChildren();
  content.append(detectedBanner(match));

  // Specific match: we know both teams -> try to pin the exact market.
  if (match.teams.length) {
    const ranked = rankMarkets(markets, match.teams);
    if (ranked.length) {
      content.append(marketCard(ranked[0].market));
      const rest = ranked.slice(1, 3);
      if (rest.length) content.append(listSection('Related markets', rest.map((r) => r.market)));
      return;
    }
    content.append(emptyForMatch(match));
  }

  // No teams (Twitch/op.gg) or no exact match: show the game's top markets.
  const top = [...markets]
    .sort((a, b) => statusRank(a) - statusRank(b) || (b.volume || 0) - (a.volume || 0))
    .slice(0, 4);

  if (top.length) {
    content.append(listSection(`Top ${GAME_LABEL[match.game] || ''} markets`, top));
  } else if (!match.teams.length) {
    content.append(emptyForGame(match));
  }
}

function detectedBanner(match) {
  const d = el('div', 'detected');
  const game = el('span', 'game');
  game.textContent = GAME_LABEL[match.game] || match.game;
  d.append('Detected ', game, ' · ');
  const title = document.createElement('strong');
  title.style.color = 'var(--text)';
  title.textContent = match.title || '';
  d.append(title);
  return d;
}

function marketCard(market) {
  const card = el('div', 'market');

  const status = marketStatus(market);
  const badge = el('span', `badge badge-${status.kind}`);
  badge.textContent = status.label;
  card.append(badge);

  const head = el('div', 'market-tourney');
  head.textContent = market.tournament || GAME_LABEL[market.game] || '';
  card.append(head);

  card.append(teamRow(market.team1, market.team1_color, market.team1_price));
  card.append(probBar(market.team1_price, market.team1_color));
  card.append(teamRow(market.team2, market.team2_color, market.team2_price));

  const meta = el('div', 'meta');
  meta.append(span(`Vol $${fmtNum(market.volume)}`));
  meta.append(span(`Best of ${market.best_of || '—'}`));
  card.append(meta);

  const tradable = status.kind === 'live' || status.kind === 'upcoming';
  const cta = el('a', tradable ? 'trade' : 'trade trade-muted');
  cta.href = marketUrl(market.id);
  cta.target = '_blank';
  cta.rel = 'noopener';
  cta.textContent = tradable
    ? 'Trade on Hotaku ↗'
    : status.kind === 'resolved'
      ? 'Ver resultado ↗'
      : 'Ver mercado ↗';
  card.append(cta);

  return card;
}

function teamRow(name, color, price) {
  const row = el('div', 'team');
  const dot = el('span', 'dot');
  dot.style.background = color || '#888';
  const nm = el('span', 'name');
  nm.textContent = name || '—';
  const pct = el('span', 'pct');
  pct.textContent = formatPct(price);
  row.append(dot, nm, pct);
  return row;
}

function probBar(price, color) {
  const bar = el('div', 'bar');
  const fill = document.createElement('span');
  fill.style.width = `${Math.round((price || 0) * 100)}%`;
  fill.style.background = color || 'var(--teal)';
  bar.append(fill);
  return bar;
}

function listSection(title, markets) {
  const wrap = document.createDocumentFragment();
  const t = el('div', 'list-title');
  t.textContent = title;
  wrap.append(t);
  markets.forEach((m) => wrap.append(marketCard(m)));
  return wrap;
}

function emptyForMatch(match) {
  return stateBox(
    ['No Hotaku market for ', strongText(match.title), ' yet.'],
    'See open markets',
    'https://hotaku.fun/markets'
  );
}

function emptyForGame(match) {
  return stateBox(
    ['No open ', strongText(GAME_LABEL[match.game] || match.game), ' markets right now.'],
    'Browse all markets',
    'https://hotaku.fun/markets'
  );
}

function renderUnsupported() {
  content.replaceChildren(
    stateBox(
      ['Open a match on ', strongText('HLTV'), ', ', strongText('Liquipedia'), ', ',
        strongText('Twitch'), ' or ', strongText('op.gg'), ' to see live Hotaku odds.'],
      'Explore markets',
      'https://hotaku.fun/markets'
    )
  );
}

function renderError(err) {
  const detail = el('small');
  detail.textContent = String(err.message || err);
  content.replaceChildren(
    stateBox(
      ["Couldn't reach the Hotaku API.", document.createElement('br'), detail],
      'Open Hotaku',
      'https://hotaku.fun'
    )
  );
}

/* ---------- dom helpers ---------- */

// parts: array of strings (text nodes) and/or DOM nodes appended to the message.
function stateBox(parts, ctaText, ctaHref) {
  const box = el('div', 'state');
  const p = document.createElement('p');
  for (const part of parts) {
    p.append(typeof part === 'string' ? document.createTextNode(part) : part);
  }
  box.append(p);
  if (ctaText) {
    const a = el('a', 'cta');
    a.href = ctaHref;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = ctaText;
    box.append(a);
  }
  return box;
}

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function span(text) {
  const s = document.createElement('span');
  s.textContent = text;
  return s;
}

function strongText(text) {
  const s = document.createElement('strong');
  s.textContent = text;
  return s;
}

function fmtNum(n) {
  const v = Number(n) || 0;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toFixed(0);
}
