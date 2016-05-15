"use strict";
/*global $ */
/* exported Favorites */
/**
 *
 */
var Favorites = (function () {
  var _FAVORITES = "favorites";
  var _instance;
  var _favorites = JSON.parse(localStorage.getItem(_FAVORITES));

  if (_favorites === null) {
    _favorites = {};
  }

  function _updateStorage() {
    localStorage.setItem(_FAVORITES, JSON.stringify(_favorites));
  }

// TODO - Rename to something more generic (_update?)
  function _add(name, dieSpec) {
    _favorites[name] = dieSpec;
    _updateStorage();
  }

  function _delete(name) {
    delete _favorites[name];
    _updateStorage();
  }

  function _updateDisplay() {
    var list = $(".favorites-list");
    var names = Object.keys(_favorites);
    var i;
    var name;

    names.sort(function (left, right) {
      var leftLC = left.toLowerCase();
      var rightLC = right.toLowerCase();
      // Test ignoring case, then with case
      return leftLC < rightLC ? -1
             : (leftLC > rightLC ? 1
               : (left < right ? -1
                 : (left > right ? 1
                   : 0)));
    });

    list.empty();

    for (i in names /*_favorites*/) {
      name = names[i];
      list.append(
        "<a href='#' class='list-group-item collapse'>" +
          "<div class='row'>" +
            "<div class='col-xs-1 col-md-1 vertical-middle control'>" +
              "<button class='btn' data-original-name='" + name + "'>" +
                "<i class='fa fa-2x fa-minus-circle'></i>" +
              "</button>" +
            "</div>" +
            "<div class='col-xs-11 col-md-11 vertical-middle entry'>" +
              "<h4 class='list-group-item-heading'>" + name + " <span class='list-group-item-text'>(" + _favorites[name] + ")</span></h4>" +
            "</div>" +
          "</div>" +
        "</a>"
      );

      $(".favorites-list .control > button").click(function () {
        _delete($(this).data("original-name"));
        // $(this).closest("a.list-group-item").removeClass("in"/*"deleted"*/);
        $(this).closest("a.list-group-item").collapse("hide");
        return false;
      });
    }
  }

  function _editFavorite(e) {
    alert(JSON.stringify(e));
  }

  function _getInstance() {
    if (!_instance) {
      _instance = {
        add: _add,
        updateDisplay: _updateDisplay(),
        delete: _delete,
        editFavorite: _editFavorite
      };
    }
    return _instance;
  }

  return { getInstance: _getInstance };
})();
