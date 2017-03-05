'use strict';

/* exported favorites */
const Favorites = (() => {
  const _FAVORITES = 'favorites';
  let _instance;
  let _favorites = null;

  function _updateStorage() {
    localStorage.setItem(_FAVORITES, JSON.stringify(_favorites));
  }

  function _add(n, spec, text) {
    _favorites.push({
      name: n,
      dieSpec: spec,
      decoratedText: text
    });

    _updateStorage();
  }

  function _findIndexByName(name) {
    return _favorites.findIndex(favorite => favorite.name === name);
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

  function _nameInUse(name) { return _findIndexByName(name) !== -1; }

  function _refreshTab() {
    const displayList = $('#favorites .list-block ul');

    displayList.empty();

    _favorites.forEach((favorite) => {
      displayList.append(
        `<li class="swipeout" data-name="${favorite.name}">
          <div class="swipeout-content item-content">
            <div class="item-media">
              <a href="#" class="favorite-delete"><i class="icon ion-android-remove-circle"></i></a>
            </div>
            <div class="item-inner">
              <div class="item-title">${favorite.name} (${favorite.decoratedText})</div>
            </div>
          </div>
          <div class="sortable-handler"></div>
          <div class="swipeout-actions-right">
            <a href="#" class="swipeout-delete">Delete</a>
          </div>
        </li>`
      );
    });

    $('#favorites .sortable li').on('sortable:sort', (event) => {
      _move(event.detail.startIndex, event.detail.newIndex);
    });

    $('#favorites .favorite-delete').click(event => boadApp.swipeoutOpen($(event.target).closest('li')));

    $('#favorites li.swipeout').on('swipeout:open', () => { boadApp.sortableClose('#favorites .sortable'); });
    $('#favorites li.swipeout').on('swipeout:close', () => { boadApp.sortableOpen('#favorites .sortable'); });
    $('#favorites li.swipeout').on('swipeout:delete', (event) => {
      _delete($(event.target).data('name'));
      boadApp.sortableOpen('#favorites .sortable');
    });
  }

  function _getInstance() { return _instance; }

  $('#favorites .navbar-inner .left .main').click(() => {
    $('#favorites').addClass('editing');
    boadApp.sortableOpen('#favorites .sortable');
  });

  $('#favorites .navbar-inner .left .editing').click(() => {
    $('#favorites').removeClass('editing');
    boadApp.sortableClose('#favorites .sortable');
  });

  _favorites = _getLocalStorage(_FAVORITES, []);

  _instance = {
    add: _add,
    delete: _delete,
    nameInUse: _nameInUse,
    refreshTab: _refreshTab
  };

  return { getInstance: _getInstance };
})();

const favorites = Favorites.getInstance();
