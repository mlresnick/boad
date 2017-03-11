'use strict';

module.exports = (() => {
  let _instance;

  function _init() {
    const _boadApp = new Framework7({ material: Framework7.prototype.device.android });
    const _RESULT_SYMBOL = ' ⇒ ';
    const _SETTINGS = 'settings';

    function _getLocalStorage(key, initialValue) {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, JSON.stringify(initialValue));
      }

      return JSON.parse(localStorage.getItem(key));
    }

    _boadApp.boadSettings = _getLocalStorage(_SETTINGS, { history: { limit: 10 } });
    _boadApp.addView('.view-main', { domCache: true });

    return {
      boadApp: _boadApp,
      getLocalStorage: _getLocalStorage,
      RESULT_SYMBOL: _RESULT_SYMBOL,
    };
  }

  function _getInstance() {
    if (!_instance) {
      _instance = _init();
    }
    return _instance;
  }

  return { getInstance: _getInstance };
})();
