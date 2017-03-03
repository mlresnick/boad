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

  function _delete(index) {
    _favorites[index] = null;
    _updateStorage();
  }

  function _isInUse(index) {
    return _favorites[index] !== null;
  }

  function _refreshTab() {
    const displayList = $('#favorites .list-block ul');
    let i = 0;
    displayList.empty();
    _favorites.forEach((favorite) => {
      displayList.append(
        `<li data-index="${i += 1}">
          <div class="item-content">
            <div class="item-media">
              <a href="#"><i class="icon ion-minus-circled"></i></a>
            </div>
            <div class="item-inner">
              <div class="item-title">${favorite.name} (${favorite.decoratedText})</div>
            </div>
          </div>
          <div class="sortable-handler"></div>
        </li>`
      );
    });
    $('#favorites .sortable li').on('sortable:sort', (event) => {
      // TODO: implement
      console.log(`event=${JSON.stringify(event.detail, null, 2)}`);
      console.log(`event.detail.startIndex=${event.detail.startIndex}`);
      console.log(`event.detail.newIndex=${JSON.stringify(event.detail.newIndex, null, 2)}`);
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
