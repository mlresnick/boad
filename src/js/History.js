// FIXME: in history there two "=>" in each entry

'use strict';

const Util = require('./Util.js');

// IDEA: Store (and display) intermediate steps during a roll
// IDEA: How to incorporate intermediate steps in the calculator display

module.exports = (($) => {
  let _instance;

  function _init() {
    const _util = Util.getInstance();

    const _model = (() => {
      const _HISTORY = 'history';
      let _historyList;

      function _updateStorage() {
        _util.updateStorage(_HISTORY, _historyList);
      }

      function _add(dieSpecHtml, resultHtml) {
        _historyList.push({
          dieSpec: dieSpecHtml,
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
    })();

    const _view = (() => {
      const _historyView = $('#history');
      const _historyListBlockList = _historyView.find('.list-block ul');

      function _refreshTab() {
        // const keypad = Keypad.getInstance();

        _historyListBlockList.empty();

        _model.forEach((historyEntry, index) => {
          _historyListBlockList.append(
            `<li class="swipeout" data-index="${index}">
              <div class="item-content swipeout-content">
                <div class="item-inner">
                  <div class="item-title">
                    ${historyEntry.dieSpec}
                    ${_util.RESULT_SYMBOL}
                    ${historyEntry.result}
                  </div>
                </div>
              </div>
              <div class="swipeout-actions-right">
                <a href="#" class="swipeout-delete swipeout-overswipe">
                  Delete
                </a>
              </div>
            </li>`
          );
        });
      }

      _historyListBlockList
        .on(
          'swipeout:deleted',
          event => _model.delete($(event.target).data('index'))
        );

      _historyView.find('.navbar .delete-all').on('click', () => {
        _util.boadApp.confirm('Delete all history?', 'BoAD', () => {
          _model.clear();
          _view.refreshTab();
        });
      });

      _historyView.on('tab:show', _refreshTab());
      return { refreshTab: _refreshTab };
    })();

    return {
      add: _model.add,
      clear: _model.clear,
      delete: _model.delete,
      refreshTab: _view.refreshTab,
    };
  }

  function _getInstance() {
    if (!_instance) {
      _instance = _init();
    }
    return _instance;
  }

  return { getInstance: _getInstance };
})(jQuery);
