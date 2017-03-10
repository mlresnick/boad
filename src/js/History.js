/* exported rollHistory */

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

    function _add(dieSpecHtml, resultHtml) {
      _history.push({
        dieSpec: dieSpecHtml,
        result: resultHtml,
      });

      while (_history.length > _util.boadApp.boadSettings.history.limit) {
        _history.shift();
      }

      localStorage.setItem(_HISTORY, JSON.stringify(_history));
    }

    function _clear() {
      _history.length = 0;
      localStorage.setItem(_HISTORY, JSON.stringify(_history));
    }

    function _remove(index) {
      _history.splice(index, 1);
      localStorage.setItem(_HISTORY, JSON.stringify(_history));
    }

    function _refreshTab() {
      const displayList = $('#history .list-block ul');
      displayList.empty();

      _history.forEach((historyEntry, index) => {
        displayList.append(
          `<li class="swipeout" data-index="${index}">
            <div class="swipeout-content item-content">
              <div class="item-inner">
                <div class="item-title">${historyEntry.dieSpec}</div>
                <div class="item-after">${historyEntry.result}</div>
              </div>
            </div>
            <div class="swipeout-actions-right">
              <a href="#" class="swipeout-delete swipeout-overswipe">Delete</a>
            </div>
          </li>`
        );
      });
    }

    function _values() { return _history.values(); }

    // Initialize the UI
    $('#history').on('tab:show', () => { $('#history .delete-all').css('display', 'flex'); });
    $('#history').on('tab:hide', () => { $('#history .delete-all').css('display', 'none'); });
    $('#history ul').on('swipeout:deleted', 'li.swipeout', (event) => { _remove($(event.target).data('index')); });
    $('#history .navbar .delete-all').click(() => {
      _util.boadApp.confirm('Delete all history?', 'BoAD', () => {
        _clear();
        _refreshTab();
      });
    });

    _history = _util.getLocalStorage(_HISTORY, []);

    return {
      add: _add,
      clear: _clear,
      refreshTab: _refreshTab,
      remove: _remove,
      values: _values,
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
