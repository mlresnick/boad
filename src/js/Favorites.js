'use strict';

const Util = require('./Util.js');

module.exports = (() => {
  const _FAVORITES = 'favorites';
  let _instance;
  let _favorites = null;

  function _updateStorage() {
    localStorage.setItem(_FAVORITES, JSON.stringify(_favorites));
  }

  function _add(n, specHtml) {
    _favorites.push({
      name: n,
      dieSpec: specHtml
    });

    _updateStorage();
  }

  function _findIndexByName(name) {
    return _favorites.findIndex(favorite => favorite.name === name.toString());
  }

  function _delete(name) {
    const index = _findIndexByName(name);
    _favorites.splice(index, 1);
    _updateStorage();
  }

  function _move(oldIndex, newIndex) {
    const movedValue = _favorites.splice(oldIndex, 1)[0];
    _favorites.splice(newIndex, 0, movedValue);
    _updateStorage();
  }

  function _edit(event) {
    let a = event; // console.log(`event=${JSON.stringify(event, null, 2)}`);
    const b = a;
    a = b;
  }

  function _nameInUse(name) { return _findIndexByName(name) !== -1; }

  const _favoritesView = $('#favorites');
  const _favoritesListBlock = _favoritesView.find('.list-block');
  const _favoritesListBlockList = _favoritesListBlock.find('ul');

  function _refreshTab() {
    _favoritesListBlockList.empty();

    _favorites.forEach((favorite) => {
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

    _favoritesView.find('.favorite-delete').click(event => Util.boadApp.swipeoutOpen($(event.target).closest('li')));
    _favoritesListBlockList.find('a.edit').click(event => _edit(event));
  }

  function _getInstance() { return _instance; }

  // Sorting events
  _favoritesListBlock.on('sortable:sort', event => _move(event.detail.startIndex, event.detail.newIndex));

  // Delete event
  _favoritesListBlockList.on('swipeout:delete', event => _delete($(event.target).data('name')));

  // TEMP Fix to clear old format
  if (localStorage.getItem(_FAVORITES) === JSON.stringify([null, null, null, null, null, null, null, null, null, null])) {
    localStorage.removeItem(_FAVORITES);
  }

  _favorites = Util.getLocalStorage(_FAVORITES, []);

  _instance = {
    add: _add,
    delete: _delete,
    nameInUse: _nameInUse,
    refreshTab: _refreshTab
  };

  return { getInstance: _getInstance };
})();
