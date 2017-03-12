'use strict';

const Util = require('./Util.js');

module.exports = (() => {
  let _instance;

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
          default: // TODO: What to do here?
        }

        return result;
      }

      function _updateStorage() {
        localStorage.setItem(_FAVORITES, JSON.stringify(_favoritesList));
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

      _favoritesList = _util.getLocalStorage(_FAVORITES, []);

      return {
        addOrModify: _addOrModify,
        delete: _delete,
        find: _find,
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

      function _refreshTab() {
        _favoritesListBlockList.empty();

        _model.favoritesList.forEach((favorite) => {
          _favoritesListBlockList.append(
            `<li class="swipeout" data-name="${favorite.name}">
              <div class="item-content swipeout-content">
                <div class="item-media">
                  <a href="#" class="favorite-delete">
                    <i class="icon ion-android-remove-circle"></i>
                  </a>
                </div>
                <div class="item-inner">
                  <div class="item-title">${favorite.name} (${favorite.dieSpec})</div>
                  <div class="item-after"><a href="#" class="edit"><i class="icon ion-chevron-right"></i></a></div>
                </div>
              </div>
              <div class="sortable-handler"></div>
              <div class="swipeout-actions-right">
                <a href="#" class="swipeout-delete swipeout-overswipe">Delete</a>
              </div>
            </li>`
          );
        });

        _favoritesView.find('.favorite-delete').click(event => _util.boadApp.swipeoutOpen($(event.target).closest('li')));
        _favoritesListBlockList.find('a.edit').click((event) => {
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

      _favoritesView.on('tab:show', () => _util.boadApp.sortableOpen(_favoritesListBlock));
      _favoritesView.on('tab:hide', () => _util.boadApp.sortableClose(_favoritesListBlock));

      // Sorting events
      _favoritesListBlock.on('sortable:sort', event => _model.move(event.detail.startIndex, event.detail.newIndex));

      // Delete event
      _favoritesListBlockList.on('swipeout:delete', 'li.swipeout', event => _model.delete($(event.target).data('name')));

      return {
        promptForName: _promptForName,
        refreshTab: _refreshTab,
      };
    })();


    return {
      delete: _model.delete,
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
})();
