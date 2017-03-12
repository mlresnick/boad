'use strict';

const Util = require('./Util.js');

// IDEA: Split view from model
// IDEA: Store (and display) intermediate steps during a roll
// IDEA: Think about how to incorporate intermediate steps in the keypad display

module.exports = (() => {
  let _instance;

  function _init() {
    const _util = Util.getInstance();

    const _model = (() => {
      const _HISTORY = 'history';
      let _history;

      function _updateStorage() {
        _util.updateStorage(_HISTORY, _history);
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

      _history = _util.getLocalStorage(_HISTORY, []);

      return {
        add: _add,
        clear: _clear,
        delete: _delete,
      };
    })();

    const _view = (() => {
      const _historyView = $('#history');
      const _historyListBlockList = _historyView.find('.list-block ul');

      function _refreshTab() {
        // const keypad = Keypad.getInstance();

        _historyListBlockList.empty();

        _model._history.forEach((historyEntry, index) => {
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

      _historyListBlockList.on('swipeout:deleted', event => _model._delete($(event.target).data('index')));

      _historyView.find('.navbar .delete-all').click(() => {
        _util.boadApp.confirm('Delete all history?', 'BoAD', () => {
          _model._clear();
          _model._refreshTab();
        });
      });

      _historyView.on('tab:show', _refreshTab());
      return { refreshTab: _refreshTab };
    })();

    return {
      add: _model._add,
      clear: _model._clear,
      delete: _model._delete,
      refreshTab: _view._refreshTab,
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
