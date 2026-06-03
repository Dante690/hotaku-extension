// Liquipedia — multi-game wiki: https://liquipedia.net/<game>/<Page>
(function () {
  const clean = globalThis.__hotakuClean;

  // First path segment is the game wiki; map it to a Hotaku game slug.
  const WIKI_TO_GAME = {
    counterstrike: 'cs2',
    leagueoflegends: 'lol',
    dota2: 'dota2',
    valorant: 'valorant',
    ageofempires: 'aoe',
    brawlstars: 'brawl',
    fifa: 'fifa',
    easportsfc: 'fifa', // Liquipedia renamed the FIFA wiki to EA Sports FC
  };

  function detect() {
    const wiki = location.pathname.split('/')[1] || '';
    const game = WIKI_TO_GAME[wiki.toLowerCase()];
    if (!game) return null;

    // Match infoboxes / brackets expose team names via .team-template-text links.
    const names = Array.from(document.querySelectorAll('.team-template-text a, .team-template-text'))
      .map((el) => clean(el.textContent))
      .filter(Boolean);

    const teams = [...new Set(names)].slice(0, 2);
    if (teams.length < 1) return null;

    return {
      site: 'liquipedia',
      game,
      teams,
      title: teams.join(' vs '),
      url: location.href,
    };
  }

  globalThis.__hotakuRegisterDetector(detect);
})();
