'use strict';

const Util = require('./Util.js');

module.exports = (($) => {
  let _instance;
  let _calculator;

  function _init() {
    const _util = Util.getInstance();

    const _model = (() => {
      const _FAVORITES = 'favorites';
      let _favoritesList = null;

      function _findIndexByName(name) {
        return _favoritesList.findIndex(favorite => favorite.name === name.toString());
      }

      function _find(arg) {
        let result;

        switch(typeof arg) {
          case 'number': result = _favoritesList[arg]; break;
          case 'string': result = _favoritesList.find(favorite => favorite.name === arg.toString()); break;
          default: // TODO: What to do switch/default case?
        }

        return result;
      }

      function _updateStorage() {
        _util.updateStorage(_FAVORITES, _favoritesList);
      }

      function _addOrModify(params) {
        if (!params.oldName) {
          _favoritesList.push({
            name: params.name,
            dieSpec: params.dieSpec,
          });
        }
        else {
          const index = _findIndexByName(params.oldName);
          _favoritesList[index].name = params.name;
        }

        _updateStorage();
      }

      function _delete(name) {
        const index = _findIndexByName(name);
        _favoritesList.splice(index, 1);
        _updateStorage();
      }

      function _move(oldIndex, newIndex) {
        const movedValue = _favoritesList.splice(oldIndex, 1)[0];
        _favoritesList.splice(newIndex, 0, movedValue);
        _updateStorage();
      }

      function _nameInUse(name) { return _findIndexByName(name) !== -1; }

      function _forEach(cb) {
        return _favoritesList.forEach(cb);
      }

      function _initialize(calculator) { _calculator = calculator; }

      _favoritesList = _util.getLocalStorage(_FAVORITES, []);

      return {
        addOrModify: _addOrModify,
        delete: _delete,
        find: _find,
        forEach: _forEach,
        initialize: _initialize,
        move: _move,
        nameInUse: _nameInUse,
      };
    })();

    const _view = (() => {
      const _favoritesView = $('#favorites');
      const _favoritesListBlock = _favoritesView.find('.list-block');
      const _favoritesListBlockList = _favoritesListBlock.find('ul');

      function _promptForName(params) {
        const result = _util.boadApp.modal({
          title: params.prompt,
          text: params.dieSpec,
          afterText: '<div class="input-field"><input type="text" class="modal-text-input"></div>',
          buttons: [
            { text: _util.boadApp.params.modalButtonCancel },
            { text: _util.boadApp.params.modalButtonOk, bold: true },
          ],
          onClick: (modal, index) => {
            if (index === 1) {
              const localParams = Object.assign({}, params);
              localParams.name = $(modal).find('.modal-text-input').val();
              let message;

              if (localParams.name !== localParams.oldName) {
                if (!localParams.name) {
                  message = 'Name cannot be blank';
                }
                else if (_model.nameInUse(localParams.name)) {
                  message = `"${localParams.name}" already in use`;
                }

                if (message) {
                  _util.boadApp.alert(message, 'Favorites');

                  // Get the original prompt to appear.
                  localParams.originalTarget.click();
                  // $('.key-favorite-set').click();
                }
                else {
                  _model.addOrModify(localParams);
                  if (localParams.refreshCallback) {
                    localParams.refreshCallback();
                  }
                }
              }
            }
          },
        });
        $('input.modal-text-input').focus();

        return result;
      }

      function _addFavorite(event, dieSpec) {
        _promptForName({
          prompt: 'Name for favorite?',
          dieSpec,
          originalTarget: $(event.currentTarget),
        });
      }

      function _getOriginalTargetAndName(event) {
        const originalTarget = $(event.currentTarget);
        return [
          originalTarget,
          originalTarget.closest('li').data('name'),
        ];
      }

      function _rollFavorite(event) {
        const [, name] = _getOriginalTargetAndName(event);
        console.log(`_rollFavorite for ${name}`);

        // const originalTarget = $(event.currentTarget);
        // const oldName = originalTarget.closest('li').data('name');

        // const dieSpec = _model.find(name).dieSpec;
        // _calculator.roll(dieSpec);
      }

      function _refreshTab() {
        _favoritesListBlockList.empty();

        _model.forEach((favorite) => {
          _favoritesListBlockList.append(
            `<li class="swipeout" data-name="${favorite.name}">
              <a href="#" class="item-link roll-favorite">
                <div class="item-content swipeout-content">
                  <div class="item-media">
                    <i class="icon ion-android-remove-circle"></i>
                  </div>
                  <div class="item-inner">
                    <div class="item-title">${favorite.name} (${favorite.dieSpec})</div>
                  </div>
                </div>
                <div class="sortable-handler edit-mode"></div>
                <div class="swipeout-actions-right"></div>
              </a>
            </li>`
          );
        });

        // TODO: Refactor part A - can we avoid having to do this for every refreshTab call
        _favoritesListBlockList.find('.roll-favorite').on('click', _rollFavorite);
        _favoritesListBlockList.find('.item-content a.edit').on('click', (event) => {
          const originalTarget = $(event.currentTarget);
          const oldName = originalTarget.closest('li').data('name');
          _promptForName({
            prompt: `New name for favorite ${oldName}?`,
            oldName,
            dieSpec: _model.find(oldName).dieSpec,
            originalTarget,
            refreshCallback: _refreshTab,
          });
        });
      }

      function _enterEditMode() {
        if (!_favoritesView.find('.page').hasClass('edit-mode')) {
          // Transition here and now, update DOM in event handler
          _util.boadApp.sortableOpen(_favoritesListBlock);
          _favoritesView.find('.page').addClass('edit-mode');
        }
      }

      // Wait until the link reappears
      _favoritesView.find('.navbar .left a.link.done').on('transitionend', () => {
        if (_favoritesView.find('.page').hasClass('edit-mode')) {
          // Remove links first - so they dont interfere with the replacement...
          _favoritesListBlockList.find('li > .roll-favorite .item-content').unwrap();

          // ... then replace
          _favoritesListBlockList.find('.icon.ion-android-remove-circle').wrap('<a href="#" class="favorite-delete"></a>');
          _favoritesListBlockList.find('.favorite-delete')
            .on('click', event => _util.boadApp.swipeoutOpen($(event.target).closest('li.swipeout')));

          const innerItems = _favoritesListBlockList.find('.item-content .item-inner');
          $(innerItems).each((i, innerItem) => {
            $(innerItem)
            .children(':not(.item-after)')
            .wrapAll('<a href="#" class="item-link favorite-edit"></a>');
          });

          const li = _favoritesListBlockList.children('li');

          // Under normal circumstances make the whole list item display touch feedback.
          // However, if there is a swipeou open anywhere, skip the feedback and close the swipeout.
          li.on('mousedown touchstart', '.item-inner', (event) => {
            if (_favoritesListBlockList.children('li.swipeout-opened').length === 0) {
              $(event.delegateTarget).addClass('active-state');
            }
            else {
              _util.boadApp.swipeoutClose(event.delegateTarget);
            }
          });

          li.on('mouseup touchend', '.item-inner', event => $(event.delegateTarget).removeClass('active-state'));

          li.on('swipeout:open', () => {
            _favoritesListBlockList.find('.favorite-edit').each((i, link) => $(link).css('pointer-events', 'none'));
            _favoritesListBlockList.find('.favorite-delete').each((i, link) => $(link).css('pointer-events', 'none'));
          });

          li.on('swipeout:closed', () => {
            _favoritesListBlockList.find('.favorite-edit').each((i, link) => $(link).css('pointer-events', ''));
            _favoritesListBlockList.find('.favorite-delete').each((i, link) => $(link).css('pointer-events', ''));
          });

          _favoritesListBlockList.find('.item-content .item-inner :not(.item-after)').on('click', (event) => {
            const currentTarget = event.currentTarget;
            if (currentTarget.matches('a.item-link.favorite-edit')) {
              const oldName = $(currentTarget).closest('li').data('name');
              _promptForName({
                prompt: `New name for favorite ${oldName}?`,
                oldName,
                dieSpec: _model.find(oldName).dieSpec,
                currentTarget,
                refreshCallback: _refreshTab,
              });
            }
          });

          _favoritesListBlockList.find('.swipeout-actions-right')
            .append('<a href="#" class="swipeout-delete swipeout-overswipe">Delete</a>');
        }
      });

      function _exitEditMode() {
        if (_favoritesView.find('.page').hasClass('edit-mode')) {
          // Transition here and now, update DOM in event handler
          _util.boadApp.sortableClose(_favoritesListBlock);
          _favoritesView.find('.page').removeClass('edit-mode');
        }
      }

      _favoritesView.find('.navbar .left a.link.edit').on('transitionend', () => {
        if (!_favoritesView.find('.page').hasClass('edit-mode')) {
          const li = _favoritesListBlockList.children('li');
          li.off('mousedown touchstart', '.item-inner');
          li.off('mouseup touchend', '.item-inner');

          // Remove links first - so they dont interfere with the replacement...
          _favoritesListBlockList.find('.icon.ion-android-remove-circle').unwrap();
          _favoritesListBlockList.find('.swipeout-delete').remove();
          _favoritesListBlockList.find('.favorite-edit').children().unwrap();

          // ... the add links in transitionend event handler
          _favoritesListBlockList.find('li').wrapInner('<a href="#" class="item-link roll-favorite"></a>');
          // // TODO Refactor Part B
          _favoritesListBlockList.find('.roll-favorite').on('click', _rollFavorite);
        }
      });

      _favoritesView.on('tab:show', _refreshTab);
      _favoritesView.on('tab:hide', _exitEditMode);

      // Enter/exit edit module
      _favoritesView.find('.navbar .left a.link:not(.edit-mode)').on('click', _enterEditMode);
      _favoritesView.find('.navbar .left a.link.edit-mode').on('click', _exitEditMode);

      // Add event
      // TODO:
      // _favoritesView.find('.navbar .right .link.plus').on('click', _addFavorite);

      // Sorting events
      _favoritesListBlock.on('sortable:sort', event => _model.move(event.detail.startIndex, event.detail.newIndex));

      // Delete event
      _favoritesListBlockList.on('swipeout:delete', 'li.swipeout', event => _model.delete($(event.target).data('name')));

      return {
        addFavorite: _addFavorite,
        promptForName: _promptForName,
        refreshTab: _refreshTab,
      };
    })();


    return {
      addFavorite: _view.addFavorite,
      delete: _model.delete,
      initialize: _model.initialize,
      nameInUse: _model.nameInUse,
      promptForName: _view.promptForName,
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
