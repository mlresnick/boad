'use strict';

module.exports = (() => {
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
    end: null
  };
})();
