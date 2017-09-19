'use strict';

const Util = require('./util.js');

module.exports = (() => {
  const _util = Util.getInstance();

  let _instance;

  function _init() {
    const _HISTORY = 'history';
    let _historyList;

    function _updateStorage() {
      _util.updateStorage(_HISTORY, _historyList);
    }

    function _add(dieSpecHtml, resultHtml, favoriteName = null) {
      let dieSpec = dieSpecHtml;
      if (favoriteName) {
        dieSpec = `${favoriteName} - ${dieSpec}`;
      }
      _historyList.push({
        dieSpec,
        result: resultHtml,
      });

      while (_historyList.length > _util.boadApp.boadSettings.history.limit) {
        _historyList.shift();
      }

      _updateStorage();
    }

    function _clear() {
      _historyList.length = 0;
      _updateStorage();
    }

    function _delete(index) {
      _historyList.splice(index, 1);
      _updateStorage();
    }

    function _forEach(cb) {
      return _historyList.forEach(cb);
    }

    _historyList = _util.getLocalStorage(_HISTORY, []);

    return {
      add: _add,
      clear: _clear,
      delete: _delete,
      forEach: _forEach,
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
