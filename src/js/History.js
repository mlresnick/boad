'use strict';

const Util = require('./Util.js');

// IDEA: Split view from model
// IDEA: Store (and display) intermediate steps during a roll
// IDEA: Think about how to incorporate intermediate steps in the keypad display

module.exports = (() => {
  let _instance;

  function _init() {
    const _HISTORY = 'history';
    let _history = null;
    const _util = Util.getInstance();

    function _updateStorage() {
      localStorage.setItem(_HISTORY, JSON.stringify(_history));
    }

    function _add(dieSpecHtml, resultHtml) {
      _history.push({
        dieSpec: dieSpecHtml,
        result: resultHtml,
      });

      while (_history.length > _util.boadApp.boadSettings.history.limit) {
        _history.shift();
      }

      _updateStorage();
    }

    function _clear() {
      _history.length = 0;
      _updateStorage();
    }

    function _delete(index) {
      _history.splice(index, 1);
      _updateStorage();
    }

    const _historyView = $('#history');
    const _historyListBlockList = _historyView.find('.list-block ul');
    function _refreshTab() {
      // const keypad = Keypad.getInstance();

      _historyListBlockList.empty();

      _history.forEach((historyEntry, index) => {
        _historyListBlockList.append(
          `<li class="swipeout" data-index="${index}">
            <div class="item-content swipeout-content">
              <div class="item-inner">
                <div class="item-title">${historyEntry.dieSpec}${_util.RESULT_SYMBOL}${historyEntry.result}</div>
              </div>
            </div>
            <div class="swipeout-actions-right">
              <a href="#" class="swipeout-delete swipeout-overswipe">Delete</a>
            </div>
          </li>`
        );
      });
    }

    // Initialize the UI
    // _historyView.on('tab:show', () => { $('#history .delete-all').css('display', 'flex'); });
    // _historyView.on('tab:hide', () => { $('#history .delete-all').css('display', 'none'); });
    _historyListBlockList.on('swipeout:deleted', event => _delete($(event.target).data('index')));
    _historyView.find('.navbar .delete-all').click(() => {
      _util.boadApp.confirm('Delete all history?', 'BoAD', () => {
        _clear();
        _refreshTab();
      });
    });

    _history = _util.getLocalStorage(_HISTORY, []);

    return {
      add: _add,
      clear: _clear,
      delete: _delete,
      refreshTab: _refreshTab,
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
