// Shared content-script runtime. Loaded before each site detector.
// A detector registers a function that returns the current match, or null.
// The popup queries the active tab with { type: 'HOTAKU_GET_MATCH' }.

(function () {
  let detect = null;

  // Site scripts call this with their detector function.
  globalThis.__hotakuRegisterDetector = function (fn) {
    detect = fn;
  };

  // Collapse repeated whitespace; used by detectors when pulling text nodes.
  globalThis.__hotakuClean = function (s) {
    return String(s || '').replace(/\s+/g, ' ').trim();
  };

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || msg.type !== 'HOTAKU_GET_MATCH') return;
    try {
      const match = detect ? detect() : null;
      sendResponse({ ok: true, match: match || null });
    } catch (err) {
      sendResponse({ ok: false, error: String(err) });
    }
    return true;
  });
})();
