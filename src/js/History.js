/* global boadApp */
/* exported rollHistory */

'use strict';

// IDEA: Split view from model

const RollHistory = (() => {
  let _instance;
  let _history = null;

  function _add(dieSpec, displayText, result) {
    const historyEntry = {};
    historyEntry.dieSpec = dieSpec;
    historyEntry.displayText = displayText;
    historyEntry.result = result;
    _history.push(historyEntry);
    localStorage.setItem('history', JSON.stringify(_history));
  }

  function _clear() {
    _history.length = 0;
    localStorage.setItem('history', JSON.stringify(_history));
  }

  function _remove(index) {
    _history.splice(index, 1);
    localStorage.setItem('history', JSON.stringify(_history));
  }

  function _refreshTab() {
    // var displayList = $('#history .content-block');
    const displayList = $('#history .list-block ul');
    displayList.empty();
    let i = 0;
    _history.forEach((historyEntry) => {
      displayList.append(
        `<li class="swipeout" data-index="${i += 1}">
          <div class="swipeout-content item-content">
            <div class="item-inner">
              <div class="item-title">${historyEntry.displayText}</div>
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

  $('#history ul').on('swipeout:deleted', 'li.swipeout', (event) => {
    _remove($(event.target).data('index'));
  });

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

  // Initialize LocalStorage, if necessary
  if (localStorage.getItem('history') === null) {
    localStorage.setItem('history', JSON.stringify([]));
  }

  // initialize this object.
  _history = JSON.parse(localStorage.getItem('history'), null, 2);
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