// Hotaku API client + match-resolution helpers.
// Shared by the popup (matching/rendering) and the service worker (fetching).
// API reference: https://hotaku.fun/openapi.json  (public read endpoints, no auth).

export const HOTAKU_API_BASE = 'https://api.hotaku.fun';
export const HOTAKU_SITE = 'https://hotaku.fun';

// Game slugs Hotaku uses (note: short forms — 'aoe', 'brawl'). Detectors emit these.
export const GAMES = ['cs2', 'lol', 'dota2', 'valorant', 'fifa', 'aoe', 'brawl'];

/**
 * Fetch active markets for a game from the public Hotaku API.
 * @param {{game?: string, status?: 'active'|'live'|'resolved', limit?: number}} opts
 * @returns {Promise<Array>} markets (see openapi.json Market schema)
 */
export async function listMarkets({ game, status = 'active', limit = 100 } = {}) {
  const url = new URL('/markets', HOTAKU_API_BASE);
  if (game) url.searchParams.set('game', game);
  if (status) url.searchParams.set('status', status);
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Hotaku API ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.markets) ? data.markets : [];
}

/** Normalize a team name for fuzzy comparison: lowercase, strip accents & non-alphanumerics. */
export function normalizeName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** True if a detected name matches a market team name (full or short), either direction. */
function namesMatch(detected, candidate) {
  const a = normalizeName(detected);
  const b = normalizeName(candidate);
  if (!a || !b) return false;
  return a === b || (a.length >= 3 && b.length >= 3 && (a.includes(b) || b.includes(a)));
}

function teamMatchesAnySide(detected, market) {
  return (
    namesMatch(detected, market.team1) ||
    namesMatch(detected, market.team1_short) ||
    namesMatch(detected, market.team2) ||
    namesMatch(detected, market.team2_short)
  );
}

/**
 * Rank markets by how well they match the detected teams.
 * Markets matching both detected teams score highest; live markets break ties.
 * @returns {Array<{market: object, score: number}>} sorted desc, score > 0 only.
 */
export function rankMarkets(markets, teams = []) {
  const detected = teams.filter(Boolean);
  if (!detected.length) return [];

  return markets
    .map((market) => {
      let score = 0;
      for (const t of detected) if (teamMatchesAnySide(t, market)) score += 1;
      if (score && market.live) score += 0.5; // prefer the live match
      return { market, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** Format a 0..1 implied probability as a percentage string. */
export function formatPct(p) {
  if (typeof p !== 'number' || Number.isNaN(p)) return '—';
  return `${(p * 100).toFixed(0)}%`;
}

/**
 * Derive a human status for a market from its flags and end_date.
 * @returns {{kind: 'live'|'resolved'|'closed'|'upcoming', label: string, winner: string|null}}
 */
export function marketStatus(market) {
  if (market.resolved) {
    const winner =
      market.outcome === 'team1' ? market.team1 :
      market.outcome === 'team2' ? market.team2 : null;
    return { kind: 'resolved', label: winner ? `Finalizado · ganó ${winner}` : 'Finalizado', winner };
  }
  if (market.live) return { kind: 'live', label: 'EN VIVO', winner: null };

  const end = market.end_date ? new Date(market.end_date) : null;
  if (end && !Number.isNaN(end.getTime())) {
    if (end.getTime() <= Date.now()) {
      return { kind: 'closed', label: 'Cerrado · pendiente de resolución', winner: null };
    }
    return { kind: 'upcoming', label: `Programado · ${formatDateTime(end)}`, winner: null };
  }
  return { kind: 'upcoming', label: 'Programado', winner: null };
}

/** Sort priority: live first, then upcoming, then closed, then resolved. */
export function statusRank(market) {
  return { live: 0, upcoming: 1, closed: 2, resolved: 3 }[marketStatus(market).kind];
}

function formatDateTime(date) {
  return date.toLocaleString('es-ES', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

/** Canonical Hotaku market URL. */
export function marketUrl(id) {
  return `${HOTAKU_SITE}/markets/${encodeURIComponent(id)}`;
}
