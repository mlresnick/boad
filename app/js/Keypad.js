/* global $,Dice,Favorites */
/* exported keypad */
var Keypad = (function () {
  var _instance;
  var _dice;
  var _undoStack;
  _undoStack = [{text: null, state: "count"}];

  var _states = {
    start: {digit: "count", die: "die", dx: "dx"},
    count: {digit: "count", die: "die", dx: "dx"},
    die: {operator: "postDieOp", k: "k", x: "x", roll: "roll"},
    dx: {digit: "dxDigit" },
    dxDigit: {digit: "dxDigit", operator: "postDieOp", k: "k", x: "x", roll: "roll"},
    postDieOp: {digit: "postDieDigit", lh: "lh"},
    k: {operator: "kOperator", digit: "kCount"},
    kOperator: {digit: "kCount"},
    kCount: {digit: "kCount", operator: "modifierOperator", x: "x", roll: "roll"},
    postDieDigit: {digit: "postDieDigit", lh: "lh", x: "x", roll: "roll"},
    lh: {operator: "modifierOperator", x: "x", roll: "roll"},
    modifierOperator: {digit: "modifierOperator", x: "x"},
    x: {digit: "xDigit"},
    xDigit: {digit: "xDigit", roll: "roll"},
    locked: {}
  };

  var _category = {
    "0": "digit", "1": "digit", "2": "digit", "3": "digit", "4": "digit",
    "5": "digit", "6": "digit", "7": "digit", "8": "digit", "9": "digit",

    "d4": "die", "d6": "die", "d8": "die", "d10": "die", "d12": "die",
    "d20": "die", "d%": "die",
    "d": "dx",

    "+": "operator", "-": "operator",

    "k":    "k",
    "L":    "lh", "H": "lh",

    "x":    "x",

    "roll": "roll"
  };

  var _confirm = "confirm";
  var _error = "error";
  var _favorites = Favorites.getInstance();

  _undoStack.peek = function () {
    var result = null;
    if (this.length) {
      result = this[this.length - 1];
    }
    return result;
  };

  _undoStack.reinit = function () {
    this.length = 1;
  };

  _undoStack.pop = function () {
    var result = null;
    if (this.length > 1) {
      result = Array.prototype.pop.call(this);
    }
    return result;
  };

  _undoStack.push = function (newText, newState) {
    newState = newState || this.peek().state;
    Array.prototype.push.call(this, {text: newText, state: newState});
  };

  _undoStack.toString = function () {
    var result = "[";
    if (this.length > 0) {
      result = result + JSON.stringify(this[0]);
      for (var i = 1; i < this.length; i++) {
        result = result + ", " + JSON.stringify(this[i]);
      }
    }
    result = result + "]";
    return result;
  };

  function _clear() {
    _undoStack.reinit();
    $("#window").val("");
  }

  function _deleteLast() {
    var entry = _undoStack.pop();
    var oldVal = $("#window").val();
    if (entry) {
      $("#window").val(oldVal.substr(0, oldVal.length - entry.text.length));
    }
  }

  function _transitionToState(text) {
    var category = _category[text];
    var state = _undoStack.peek().state;
    var newState = _states[state][category];
    if (newState !== undefined) {
      _undoStack.push(text, newState);
    }
    return newState;
  }

  function _enterNew(text) {
    var newState = _transitionToState(text);
    var selector = ".keypad button[value='"+text+"']";
    if (newState !== undefined) {
      blink(selector, _confirm, 1, 64);
      $("#window").val($("#window").val() + text);
    }
    else {
      blink(selector, _error, 1, 64);
    }
    // // Deal with remnant color from hover on mobile devices.
    // $(selector).css("background-color", "black");
  }

  function _roll() {
    var result;
    var newState = _transitionToState("roll");
    if (newState !== undefined) {
      blink("button[value='roll']", _confirm, 1, 64);
      _dice = Dice;
      if (newState !== "locked") {
        _dice.parse($("#window").val());
        _undoStack.push(null, "locked");
      }
      result = _dice.roll();
      $("#window").val(_dice.toString()+" ⇒ "+result);
    }
    else {
      blink("button[value='roll']", _error, 1, 64);
    }
  }

  function _showFavoriteModal() {
    var state = _undoStack.peek().state;
    var newState = _states[state]["roll"];

    if (newState !== undefined) {
      blink("button[value='roll']", _confirm, 1, 64);
      $("#newFavoriteSpec").text($("#window").val());
      $("#newFavoriteName").val("");
      $("#favorite-name-modal").modal({show:true});
    }
    else {
      blink("#favoriteButton", _error, 1, 100);
    }
    return false;
  }

  function _saveNewFavorite() {
    var name = $("#newFavoriteName").val();
    if (name !== "") {
      // TODO - make sure we only get die spec, not results.
      _favorites.add(name, $("#window").val());
      $("#favorite-name-modal").modal("hide");
      return false;
    }
    else {
      alert("The name cannot be blank");
    }
    return false;
  }
  /**
   * Purpose: blink a page element
   * Preconditions: the element you want to apply the blink to, the number of times to blink the element (or -1 for infinite times), the speed of the blink
   **/
  function blink(elem, clazz, times, speed) {
    if (times !=  0) {
      if ($(elem).hasClass(clazz)) {
        $(elem).removeClass(clazz);
      }
      else {
        $(elem).addClass(clazz);
      }
    }

    clearTimeout(function () { blink(elem, clazz, times, speed); });

    if (times != 0) {
      setTimeout(function () { blink(elem, clazz, times, speed); }, speed);
      times -= .5;
    }
  }

  function _getInstance() {
    if (!_instance) {
      _instance = {
        clear: _clear,
        deleteLast: _deleteLast,
        enterNew: _enterNew,
        roll: _roll,
        showFavoriteModal: _showFavoriteModal,
        saveNewFavorite: _saveNewFavorite
      };
    }
    return _instance;
  }
  return { getInstance: _getInstance };
})();
var keypad = Keypad.getInstance();
