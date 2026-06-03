// op.gg — game is determined by subdomain. Player-stats pages rarely map to a
// specific match, so we emit the game with no teams and let the popup show markets.
(function () {
  function detectGameFromHost() {
    const host = location.hostname.toLowerCase();
    if (host.startsWith('valorant.')) return 'valorant';
    // www.op.gg / op.gg and esports pages are League of Legends.
    return 'lol';
  }

  function detect() {
    return {
      site: 'opgg',
      game: detectGameFromHost(),
      teams: [],
      title: document.title || location.host,
      url: location.href,
    };
  }

  globalThis.__hotakuRegisterDetector(detect);
})();
