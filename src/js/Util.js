/* global Framework7 */

'use strict';

module.exports = ((Framework7) => {
  let _instance;

  function _init() {
    const _boadApp = new Framework7({
      material: Framework7.prototype.device.android,
      panelsCloseByOutside: false,
    });
    const _RESULT_SYMBOL = ' ⇒ ';
    const _SETTINGS = 'settings';

    function _getLocalStorage(key, initialValue, reviver) {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, JSON.stringify(initialValue));
      }

      return JSON.parse(localStorage.getItem(key), reviver);
    }

    function _updateStorage(key, value, replacer) {
      localStorage.setItem(key, JSON.stringify(value, replacer));
    }

    function _getTypeFromClass(node, prefix) {
      return $(node)
          .attr('class')
          .split(' ')
          .find(className => className.startsWith(prefix))
          .substring(prefix.length);
    }

    _boadApp.boadSettings =
      _getLocalStorage(_SETTINGS, { history: { limit: 10 } });
    _boadApp.addView('.view-main', { domCache: true });

    return {
      boadApp: _boadApp,
      getLocalStorage: _getLocalStorage,
      getTypeFromClass: _getTypeFromClass,
      RESULT_SYMBOL: _RESULT_SYMBOL,
      updateStorage: _updateStorage,
    };
  }

  function _getInstance() {
    if (!_instance) {
      _instance = _init();
    }
    return _instance;
  }

  return { getInstance: _getInstance };
})(Framework7);
