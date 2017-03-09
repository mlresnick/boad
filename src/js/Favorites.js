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

  const _editButtonSelector = 'li > a';
  const _favoritesView = $('#favorites');
  const _navbarLeft = _favoritesView.find('.navbar-inner .left');
  const _favoritesListBlock = _favoritesView.find('.list-block');
  const _favoritesListBlockList = _favoritesListBlock.find('ul');
  let _editButtons = _favoritesListBlockList.find(_editButtonSelector);

  function _refreshTab() {
    _favoritesListBlockList.empty();

    _favorites.forEach((favorite) => {
      _favoritesListBlockList.append(
        `<li class="swipeout" data-name="${favorite.name}">
          <a href='#' ${_favoritesView.hasClass('sorting') ? 'class="item-link"' : ''}>
            <div class="item-content swipeout-content">
              <div class="item-media">
                <!-- <a href="#" class="favorite-delete"> -->
                  <i class="icon ion-android-remove-circle"></i>
                <!-- </a> -->
              </div>
              <div class="item-inner">
                <div class="item-title">${favorite.name}</div>
                <div class="item-after">${favorite.dieSpec}</div>
                <div class="item-after">${favorite.dieSpec}</div>
              </div>
            </div>
          </a>
          <div class="sortable-handler"></div>
          <div class="swipeout-actions-right">
            <a href="#" class="swipeout-delete swipeout-overswipe">Delete</a>
          </div>
        </li>`
      );
    });

    _editButtons = _favoritesListBlockList.find(_editButtonSelector);
    // QUESTION can this be placed on the _fvoritesListBlockList object just once?
    _favoritesView.find('.favorite-delete').click(event => boadApp.swipeoutOpen($(event.target).closest('li')));
  }

  function _exitEditMode() {
    _favoritesView.removeClass('editing');
    _editButtons.removeClass('item-link');
    boadApp.sortableOpen(_favoritesListBlock);
  }

  function _enterEditMode() {
    _favoritesView.addClass('editing');
    _editButtons.addClass('item-link');
    boadApp.sortableClose(_favoritesListBlock);
  }

  function _getInstance() { return _instance; }

  // Entering and exiting the tab
  _favoritesView.on('tab:show', () => { boadApp.sortableOpen(_favoritesListBlock); });

  _favoritesView.on('tab:hide', _exitEditMode);

  // Edit/Done link
  _navbarLeft.find('.done').click(() => { _exitEditMode(); });
  _navbarLeft.find('.edit').click(() => { _enterEditMode(); });

  // Sorting events
  _favoritesListBlock.on('sortable:sort', event => _move(event.detail.startIndex, event.detail.newIndex));

  // Delete event
  _favoritesListBlockList.on('swipeout:delete', event => _delete($(event.target).data('name')));

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
