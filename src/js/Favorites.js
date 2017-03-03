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

  function _delete(name) {
    const index = _favorites.findIndex(favorite => favorite.name === name);
    _favorites.splice(index, 1);
    _updateStorage();
  }

  function _isInUse(index) {
    return _favorites[index] !== null;
  }

  function _move(oldIndex, newIndex) {
    const movedValue = _favorites.splice(oldIndex, 1)[0];
    _favorites.splice(newIndex, 0, movedValue);
    _updateStorage();
  }

  function _refreshTab() {
    const displayList = $('#favorites .list-block ul');

    displayList.empty();
// TODO: add platform specific minus-circle icons
    _favorites.forEach((favorite) => {
      displayList.append(
        `<li class="swipeout" data-name="${favorite.name}">
          <div class="swipeout-content item-content">
            <div class="item-media">
              <a href="#" class="favorite-delete"><i class="icon ion-minus-circled"></i></a>
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

    // TODO Make sure favorite names are unique
    $('#favorites .favorite-delete').click(event => boadApp.swipeoutOpen($(event.target).closest('li')));

    $('#favorites li.swipeout').on('swipeout:open', () => { boadApp.sortableClose('#favorites .sortable'); });
    $('#favorites li.swipeout').on('swipeout:close', () => { boadApp.sortableOpen('#favorites .sortable'); });
    $('#favorites li.swipeout').on('swipeout:delete', (event) => {
      _delete($(event.target).data('name'));
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

  if (localStorage.getItem(_FAVORITES) === null) {
    localStorage.setItem(_FAVORITES, JSON.stringify([]));
  }

  _favorites = JSON.parse(localStorage.getItem(_FAVORITES));

  _instance = {
    add: _add,
    delete: _delete,
    refreshTab: _refreshTab,
    isInUse: _isInUse
  };

  return { getInstance: _getInstance };
})();

const favorites = Favorites.getInstance();
