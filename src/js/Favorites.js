'use strict';

const Util = require('./Util.js');

module.exports = (() => {
  let _instance;

  function _init() {
    const _FAVORITES = 'favorites';
    let _favoritesList = null;
    const _util = Util.getInstance();

    function _updateStorage() {
      localStorage.setItem(_FAVORITES, JSON.stringify(_favoritesList));
    }

    function _add(n, specHtml) {
      _favoritesList.push({
        name: n,
        dieSpec: specHtml,
      });

      _updateStorage();
    }

    function _findIndexByName(name) {
      return _favoritesList.findIndex(favorite => favorite.name === name.toString());
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

    function _validateName(name) {
      let message;

      if (!name) {
        message = 'Name cannot be blank';
      }
      else if (_nameInUse(name)) {
        message = `"${name}" already in use`;
      }

      if (message) {
        _util.boadApp.alert(message, 'Favorites');
        $('.key-favorite-set').click();
      }
      else {
        _add(name, $('.modal .modal-text').html());
      }
    }

    function _promptForName(dieSpec) {
      _util.boadApp.prompt(dieSpec, 'Name for favorite?', _validateName);
      $('input.modal-text-input').focus();
    }


    function _edit(event) {
      let a = event; // console.log(`event=${JSON.stringify(event, null, 2)}`);
      const b = a;
      a = b;
    }

    const _favoritesView = $('#favorites');
    const _favoritesListBlock = _favoritesView.find('.list-block');
    const _favoritesListBlockList = _favoritesListBlock.find('ul');

    function _refreshTab() {
      _favoritesListBlockList.empty();

      _favoritesList.forEach((favorite) => {
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
      _favoritesListBlockList.find('a.edit').click(event => _edit(event));
    }

    // Sorting events
    _favoritesListBlock.on('sortable:sort', event => _move(event.detail.startIndex, event.detail.newIndex));

    // Delete event
    _favoritesListBlockList.on('swipeout:delete', event => _delete($(event.target).data('name')));

    // TEMP Fix to clear old format
    if (localStorage.getItem(_FAVORITES) === JSON.stringify([null, null, null, null, null, null, null, null, null, null])) {
      localStorage.removeItem(_FAVORITES);
    }

    _favoritesList = _util.getLocalStorage(_FAVORITES, []);

    return {
      add: _add,
      delete: _delete,
      nameInUse: _nameInUse,
      promptForName: _promptForName,
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
