// HLTV — Counter-Strike 2 match pages: https://www.hltv.org/matches/<id>/<slug>
(function () {
  const clean = globalThis.__hotakuClean;

  function detect() {
    if (!/^\/matches\/\d+/.test(location.pathname)) return null;

    // Match page markup: two .teamName nodes inside the score box.
    const names = Array.from(document.querySelectorAll('.teamName'))
      .map((el) => clean(el.textContent))
      .filter(Boolean);

    const teams = [...new Set(names)].slice(0, 2);
    if (teams.length < 1) return null;

    return {
      site: 'hltv',
      game: 'cs2',
      teams,
      title: teams.join(' vs '),
      url: location.href,
    };
  }

  globalThis.__hotakuRegisterDetector(detect);
})();
