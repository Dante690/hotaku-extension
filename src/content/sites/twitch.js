// Twitch — detect the game/category being watched. Stream→match mapping isn't
// reliable, so we emit the game with no teams; the popup shows that game's markets.
(function () {
  const clean = globalThis.__hotakuClean;

  // Map Twitch category text to a Hotaku game slug.
  const CATEGORY_TO_GAME = [
    [/counter-?strike|cs2|cs:?go/i, 'cs2'],
    [/league of legends/i, 'lol'],
    [/dota\s*2/i, 'dota2'],
    [/valorant/i, 'valorant'],
    [/age of empires/i, 'aoe'],
    [/brawl stars/i, 'brawl'],
    [/\bfifa\b|ea sports fc|\bfc \d{2}\b/i, 'fifa'],
  ];

  function currentCategory() {
    const el = document.querySelector('a[data-a-target="stream-game-link"]');
    return el ? clean(el.textContent) : '';
  }

  function detect() {
    const category = currentCategory();
    if (!category) return null;

    const hit = CATEGORY_TO_GAME.find(([re]) => re.test(category));
    if (!hit) return null;

    return {
      site: 'twitch',
      game: hit[1],
      teams: [], // unknown — popup falls back to featured markets for the game
      title: category,
      url: location.href,
    };
  }

  globalThis.__hotakuRegisterDetector(detect);
})();
