'use strict';

/* exported favorites */
const Favorites = (() => {
  const _FAVORITES = 'favorites';
  let _instance;
  let _initializationCheckDone = false;
  let _favorites = null;

  function _updateStorage() {
    localStorage.setItem(_FAVORITES, JSON.stringify(_favorites));
  }

  function _add(index, dieSpec, decoratedText) {
    _favorites[Number.parseInt(index, 10)] = {};
    _favorites[Number.parseInt(index, 10)].dieSpec = dieSpec;
    _favorites[Number.parseInt(index, 10)].decoratedText = decoratedText;
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
    displayList.empty();
    for (let i = 0; i < 10; i++) {
      displayList.append(
        `<li class="swipeout" data-index="${i}">
          <div class="swipeout-content item-content">
            <div class="item-media">${i}</div>
            <div class="item-inner">
              <div class="item-title">${((_favorites[i] !== null) ? _favorites[i].decoratedText : '&nbsp;')}</div>
            </div>
          </div>
          <div class="swipeout-actions-right">
            <a href="#" class="swipeout-delete swipeout-overswipe">Delete</a>
          </div>
        </li>`
      );
    }
  }

  $('#favorites ul').on('swipeout:deleted', 'li.swipeout', (event) => {
    _delete($(event.target).data('index'));
  });

  function _checkInitialization() {
    if (!_instance) {
      _instance = {
        add: _add,
        delete: _delete,
        refreshTab: _refreshTab,
        isInUse: _isInUse
      };
    }

    if (!_initializationCheckDone) {
      if (localStorage.getItem(_FAVORITES) === null) {
        localStorage.setItem(_FAVORITES, JSON.stringify(new Array(10)));
      }

      if (_favorites === null) {
        _favorites = JSON.parse(localStorage.getItem(_FAVORITES));
      }

      _initializationCheckDone = true;
    }
  }

  function _getInstance() {
    _checkInitialization();
    return _instance;
  }

  return { getInstance: _getInstance };
})();

const favorites = Favorites.getInstance();
