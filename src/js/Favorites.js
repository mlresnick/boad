
// FIXME: in favorites 1) sort  handle isn't disappearing when delete shows up
// FIXME: in favorites 2) after first delete the delete but stops working

'use strict';

const Util = require('./Util.js');
const DieSpec = require('./DieSpec.js');

module.exports = (($) => {
  const _NAME_OK = 0;
  const _NAME_BLANK = 1;
  const _NAME_IN_USE = 2;

  const _util = Util.getInstance();

  let _instance;
  let _view;
  let _model;

  function _validateAndSave() {
    const { newName, dieSpec, currentName } = _view.panel.getFavorite();
    const returnCode = _model.validateName(newName);
    if (returnCode) {
      _view.reportNameError(returnCode, newName);
    }
    else {
      _model.setFavorite(newName, dieSpec, currentName);
      _view.updateListItem(currentName, newName);
      _view.getCalculator().isFavorite(true);
      _util.boadApp.closePanel('right', true);
    }
  }

  function _init() {
    _model = (() => {
      const _FAVORITES = 'favorites';
      let _favoritesList = null;

      function _findIndexByName(name) {
        return _favoritesList.findIndex(
          favorite => favorite.name === name.toString()
        );
      }

      function _findByDieSpec(dieSpec) {
        return _favoritesList.find(
          favorite => (favorite.dieSpec.toString() === `${dieSpec}*`)
        );
      }

      function _find(arg) {
        let result;

        switch(typeof arg) {
          case 'number':
            result = _favoritesList[arg];
            break;

          case 'string':
            result = _favoritesList.find(
              favorite => favorite.name === arg.toString()
            );
            break;

          default:
            throw new Error(
              `Unexpected argument type ${typeof arg} in Favorites.model.find`
            );
        }

        return result;
      }

      function _updateStorage() {
        _util.updateStorage(_FAVORITES, _favoritesList);
      }

      function _setFavorite(name, dieSpec, currentName) {
        // Presence of currentName indicates whether this is a new Favorite or
        // an edit.
        if (currentName) {
          // Update
          const index = _findIndexByName(currentName);
          _favoritesList[index].name = name;
        }
        else {
          // New
          // TODO Have DieSpec constructor take arguments
          dieSpec.isFavorite(true);
          _favoritesList.push({ name, dieSpec });
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

      function _forEach(cb) { return _favoritesList.forEach(cb); }

      function _validateName(name) {
        let result = _NAME_OK;

        if (!name || (name === '')) {
          result = _NAME_BLANK;
        }
        else if (_nameInUse(name)) {
          result = _NAME_IN_USE;
        }

        return result;
      }

      _favoritesList = _util.getLocalStorage(_FAVORITES, [], (key, value) => {
        if (key === 'dieSpec') {
          const dieSpec = DieSpec();
          dieSpec.set(value);
          return dieSpec;
        }
        return value;
      });

      return {
        // addOrModify: _addOrModify,
        delete: _delete,
        find: _find,
        findByDieSpec: _findByDieSpec,
        forEach: _forEach,
        move: _move,
        nameInUse: _nameInUse,
        setFavorite: _setFavorite,
        validateName: _validateName,
      };
    })();

    _view = (() => {
      const _favoritesView = $('#favorites');
      const _favoritesListBlock = _favoritesView.find('.list-block');
      const _favoritesList = _favoritesListBlock.find('ul');

      let _calculator;

      const _panel = (() => {
        const _dieSpecEl = $('.panel.panel-right .die-spec')[0];

        const _newNameEl =
          $('.panel.panel-right ' +
            '.list-block ' +
            '.item-input input')[0];

        function _currentName(arg) {
          return (arg !== undefined)
            ? $(_dieSpecEl).data('currentName', arg)
            : $(_dieSpecEl).data('currentName');
        }

        function _removeCurrentName() {
          $(_dieSpecEl).removeData('currentName');
        }

        function _getFavorite() {
          const newName = $(_newNameEl).val();
          const currentName = _currentName();
          const dieSpec = DieSpec();
          dieSpec.set($(_dieSpecEl).html());
          return { newName, dieSpec, currentName };
        }

        function _setDieSpec(arg) {
          let dieSpec;
          if (typeof arg === 'string') {
            dieSpec = arg;
          }
          else if (typeof arg === 'object') {
            const favorite = arg;
            dieSpec = favorite.dieSpec.toHTML();
            _currentName(favorite.name);
          }

          $(_dieSpecEl).children().remove();
          $(_dieSpecEl).append(dieSpec);
        }

        function _reset() {
          _removeCurrentName();
          $(_newNameEl).val('');
        }

        return {
          getFavorite: _getFavorite,
          setDieSpec: _setDieSpec,
          reset: _reset,
        };
      })();

      function _getCalculator() {
        if (!_calculator) {
          _calculator = require('./Calculator.js').getInstance(); // eslint-disable-line global-require, max-len
        }
        return _calculator;
      }

      function _add(dieSpecHtml) {
        _panel.setDieSpec(dieSpecHtml);
        _util.boadApp.openPanel('right', true);
      }

      function _rollFavorite(event) {
        const name = $(event.currentTarget).closest('li').data('name');
        _util.boadApp.showTab('#calculator');
        _getCalculator().roll(_model.find(name).dieSpec);
      }

      function _refreshTab() {
        _favoritesList.empty();

        _model.forEach((favorite) => {
          _favoritesList.append(
            `<li class="swipeout" data-name="${favorite.name}">
              <a href="#" class="item-link roll-favorite">
                <div class="item-content swipeout-content">
                  <div class="item-media">
                    <i class="icon ion-android-remove-circle"></i>
                  </div>
                  <div class="item-inner">
                    <div class="item-title-row">
                      <div class="item-title">${favorite.name}</div>
                    </div>
                    <div class="item-subtitle">
                      ${favorite.dieSpec.toHTML()}
                    </div>
                  </div>
                </div>
                <div class="sortable-handler edit-mode"></div>
                <div class="swipeout-actions-right"></div>
              </a>
            </li>`
          );
        });

        // TODO: Refactor part A - can we avoid having to do this for every
        // refreshTab call
        _favoritesList.find('.roll-favorite').on('click', _rollFavorite);
      }

      function _reportNameError(reason, name) {
        let message;
        switch(reason) {
          case _NAME_BLANK: message = 'Name cannot be blank'; break;
          case _NAME_IN_USE: message = `"${name}" already in use`; break;
          default: throw new Error(`Unexpected name error value: '${reason}='`);
        }
        _util.boadApp.alert(message, 'Favorites');
      }

      function _enterEditMode() {
        if (!_favoritesView.find('.page').hasClass('edit-mode')) {
          // Transition here and now, update DOM in event handler
          _util.boadApp.sortableOpen(_favoritesListBlock);
          _favoritesView.find('.page').addClass('edit-mode');
        }
      }

      // Wait until the link reappears
      _favoritesView.find('.navbar a.link.done').on('transitionend', () => {
        if (_favoritesView.find('.page').hasClass('edit-mode')) {
          // Remove links first - so they dont interfere with the replacement...
          _favoritesList.find('li > .roll-favorite .item-content').unwrap();

          // ... then replace
          _favoritesList
            .find('.icon.ion-android-remove-circle')
            .wrap('<a href="#" class="favorite-delete"></a>');
          _favoritesList.find('.favorite-delete')
            .on('click',
                event => _util.boadApp.swipeoutOpen($(event.target)
                                                    .closest('li.swipeout'))
            );

          const innerItems = _favoritesList.find('.item-content .item-inner');
          $(innerItems).each((i, innerItem) => {
            $(innerItem)
            .children(':not(.item-after)')
            .wrapAll('<a href="#" class="item-link favorite-edit"></a>');
          });

          const li = _favoritesList.children('li');

          // Under normal circumstances make the whole list item display touch
          // feedback. However, if there is a swipeout open anywhere, skip the
          // feedback and close the swipeout.
          li.on('mousedown touchstart', '.item-inner', (event) => {
            if (_favoritesList.children('li.swipeout-opened').length
                === 0) {
              $(event.delegateTarget).addClass('active-state');
            }
            else {
              _util.boadApp.swipeoutClose(event.delegateTarget);
            }
          });

          li.on('mouseup touchend',
                '.item-inner',
                event => $(event.delegateTarget).removeClass('active-state'));

          li.on('swipeout:open', () => {
            _favoritesList
              .find('.favorite-edit')
              .each((i, link) => $(link).css('pointer-events', 'none'));
            _favoritesList
              .find('.favorite-delete')
              .each((i, link) => $(link).css('pointer-events', 'none'));
          });

          li.on('swipeout:closed', () => {
            _favoritesList
              .find('.favorite-edit')
              .each((i, link) => $(link).css('pointer-events', ''));
            _favoritesList
              .find('.favorite-delete')
              .each((i, link) => $(link).css('pointer-events', ''));
          });

          _favoritesList
            .find('.item-content .item-inner :not(.item-after)')
            .on('click', (event) => {
              const currentTarget = event.currentTarget;
              if (currentTarget.matches('a.item-link.favorite-edit')) {
                const listItem = $(currentTarget).closest('li');
                const favorite = _model.find($(listItem).data('name'));
                _panel.setDieSpec(favorite);
                _util.boadApp.openPanel('right', true);
              }
            });

          _favoritesList
            .find('.swipeout-actions-right')
            .append('<a href="#" class="swipeout-delete swipeout-overswipe">' +
                      'Delete' +
                    '</a>');
        }
      });

      function _exitEditMode() {
        if (_favoritesView.find('.page').hasClass('edit-mode')) {
          // Transition here and now, update DOM in event handler
          _util.boadApp.sortableClose(_favoritesListBlock);
          _favoritesView.find('.page').removeClass('edit-mode');
        }
      }

      _favoritesView.find('.navbar a.link.edit').on('transitionend', () => {
        if (!_favoritesView.find('.page').hasClass('edit-mode')) {
          const li = _favoritesList.children('li');
          li.off('mousedown touchstart', '.item-inner');
          li.off('mouseup touchend', '.item-inner');

          // Remove links first - so they dont interfere with the replacement...
          _favoritesList.find('.icon.ion-android-remove-circle').unwrap();
          _favoritesList.find('.swipeout-delete').remove();
          _favoritesList.find('.favorite-edit').children().unwrap();

          // ... the add links in transitionend event handler
          _favoritesList
            .find('li')
            .wrapInner('<a href="#" class="item-link roll-favorite"></a>');
          // TODO Refactor Part B
          _favoritesList.find('.roll-favorite').on('click', _rollFavorite);
        }
      });

      function _updateListItem(currentName, newName) {
        if ($('.tabbar a[href="#favorites"]').hasClass('active')) {
          const listItem =
            $(`#favorites .list-block li[data-name="${currentName}"]`);
          $(listItem).data(newName);
          $(listItem).find('.item-title').text(newName);
        }
      }

      _favoritesView.on('tab:show', _refreshTab);
      _favoritesView.on('tab:hide', _exitEditMode);

      // Enter/exit edit module
      _favoritesView.find('.navbar  .link.edit').on('click', _enterEditMode);
      _favoritesView.find('.navbar  .link.done').on('click', _exitEditMode);

      // Sorting events
      _favoritesListBlock
        .on(
          'sortable:sort',
          event => _model.move(event.detail.startIndex, event.detail.newIndex)
        );

      // Delete event
      _favoritesList
        .on(
          'swipeout:delete', 'li.swipeout',
          event => _model.delete($(event.target).data('name'))
        );

      $('.panel.panel-right a.save').on('click', _validateAndSave);
      $('.panel.panel-right').on('panel:closed', _panel.reset);

      return {
        add: _add,
        getCalculator: _getCalculator,
        panel: _panel,
        refreshTab: _refreshTab,
        reportNameError: _reportNameError,
        updateListItem: _updateListItem,
        validateAndSave: _validateAndSave,
      };
    })();


    return {
      add: _view.add,
      delete: _model.delete,
      findByDieSpec: _model.findByDieSpec,
      initialize: _model.initialize,
      nameInUse: _model.nameInUse,
      refreshTab: _view.refreshTab,
      validateAndSave: _validateAndSave,
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
