'use strict';

const Util = require('./Util.js');
const historyModel = require('./history-model');

// IDEA: Store (and display) intermediate steps during a roll
// IDEA: How to incorporate intermediate steps in the calculator display

module.exports = (($) => {
  const _util = Util.getInstance();

  let _instance;

  function _init() {
    const _model = historyModel.getInstance();

    const _view = (() => {
      const _historyView = $('#history');
      const _historyListBlockList = _historyView.find('.list-block ul');

      function _refreshTab() {
        _historyListBlockList.empty();

        _model.forEach((historyEntry, index) => {
          _historyListBlockList.append(
            `<li class="swipeout" data-index="${index}">
              <div class="item-content swipeout-content">
                <div class="item-inner">
                  <div class="item-title">
                    ${historyEntry.dieSpec}${historyEntry.result}
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

      _historyView.on('tab:show', _refreshTab);
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
      if (window.__nightmare) {
        window.__nightmare.boadHistoryModel = // for testing
          // eslint-disable-next-line global-require
          require('./history-model').getInstance();
      }
    }
    return _instance;
  }

  return { getInstance: _getInstance };
})(jQuery);
