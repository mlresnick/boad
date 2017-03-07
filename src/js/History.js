/* global boadApp */
/* exported rollHistory */

'use strict';

// IDEA: Split view from model
// IDEA: Store (and display) intermediate steps during a roll
// IDEA: think about how to incorporate intermediate steps in the keypad display

const RollHistory = (() => {
  const _HISTORY = 'history';
  let _instance;
  let _history = null;

  function _add(dieSpecHtml, resultHtml) {
    _history.push({
      dieSpec: dieSpecHtml,
      result: resultHtml
    });

    while (_history.length > boadApp.boadSettings.history.limit) {
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

    $('#history ul').on('swipeout:deleted', 'li.swipeout', (event) => {
      _remove($(event.target).data('index'));
    });
  }

  function _values() { return _history.values(); }

  function _getInstance() { return _instance; }

  // Initialize the UI
  $('#history').on('tab:show', () => { $('#history .delete-all').css('display', 'flex'); });
  $('#history').on('tab:hide', () => { $('#history .delete-all').css('display', 'none'); });
  $('#history .navbar .delete-all').click(() => {
    boadApp.confirm('Delete all history?', 'BoAD', () => {
      _clear();
      _refreshTab();
    });
  });

  _history = _getLocalStorage(_HISTORY, []);

  _instance = {
    add: _add,
    clear: _clear,
    refreshTab: _refreshTab,
    remove: _remove,
    values: _values
  };

  return { getInstance: _getInstance };
})();

const rollHistory = RollHistory.getInstance();
