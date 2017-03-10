'use strict';

module.exports = (() => {
  let _instance;

  function _init() {
    let _boadApp;

    function _getLocalStorage(key, initialValue) {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, JSON.stringify(initialValue));
      }

      return JSON.parse(localStorage.getItem(key));
    }

    return {
      boadApp: _boadApp,
      getLocalStorage: _getLocalStorage,
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
