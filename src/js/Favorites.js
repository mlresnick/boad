'use strict';

/* exported favorites */
const Favorites = (() => {
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

  const _favoritesView = $('#favorites');
  // const _swipeoutItems = _favoritesView.find('li.swipeout');
  const _swipeoutItems = _favoritesView.find('.list-block ul');
  const _linkableItemSelector = '.list-block .item-content';
  const _sortableObject = _favoritesView.find('.sortable');
  const _navbarLeft = _favoritesView.find('.navbar-inner .left');

  function _refreshTab() {
    const displayList = $('#favorites .list-block ul');

    displayList.empty();

    _favorites.forEach((favorite) => {
      displayList.append(
        `<li class="swipeout" data-name="${favorite.name}">
          <div class="item-content swipeout-content">
            <div class="item-media">
              <a href="#" class="favorite-delete">
                <i class="icon ion-android-remove-circle"></i>
              </a>
            </div>
            <a href='#'>
              <div class="item-inner">
                <div class="item-title">${favorite.name}</div>
                <div class="item-after">${favorite.dieSpec}</div>
              </div>
            </a>
          </div>
          <div class="sortable-handler"></div>
          <div class="swipeout-actions-right">
            <a href="#" class="swipeout-delete swipeout-overswipe">Delete</a>
          </div>
        </li>`
      );
    });

    _favoritesView.find('.favorite-delete').click(event => boadApp.swipeoutOpen($(event.target).closest('li')));
  }

  function _exitEditMode() {
    const favorites = $('#favorites');
    favorites.addClass('sorting');
    favorites.removeClass('editing');
    favorites.find(`${_linkableItemSelector} > .item-link`).removeClass('item-link');
    boadApp.sortableOpen(_sortableObject);
  }

  function _getInstance() { return _instance; }

  // Entering and exiting the tab
  _favoritesView.on('tab:show', () => { boadApp.sortableOpen($('#favorites .sortable')); });

  _favoritesView.on('tab:hide', () => {
    _exitEditMode();
    boadApp.sortableClose(_sortableObject);
  });

  // Edit/Done link
  _navbarLeft.find('.editing').click(() => { _exitEditMode(); });
  _navbarLeft.find('.sorting').click(() => {
    // Enter edit mode
    _favoritesView.addClass('editing');
    _favoritesView.removeClass('sorting');
    _favoritesView.find(`${_linkableItemSelector} > a:not(.item-link)`).addClass('item-link');
    boadApp.sortableClose(_sortableObject);
  });

  // Sorting events
  _sortableObject.on('sortable:sort', event => _move(event.detail.startIndex, event.detail.newIndex));

  // Delete event
  _swipeoutItems.on('swipeout:delete', event => _delete($(event.target).data('name')));

  // TEMP fix to clear old format
  if (localStorage.getItem(_FAVORITES) === JSON.stringify([null, null, null, null, null, null, null, null, null, null])) {
    localStorage.removeItem(_FAVORITES);
  }

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
