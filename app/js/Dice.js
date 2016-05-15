/* exported Dice */
"use strict";
var Dice = (function () {

  // Buffers from parse
  // var _SOURCE = 0;
  var _EXPLODE = 1;
  var _COUNT = 2;
  var _SIDES = 3;
  var _LOW_HIGH_COUNT = 4;
  var _LOW_HIGH = 5;
  var _KEEP_COUNT = 6;
  var _MODIFIER = 7;
  var _REPEATS = 8;

  // Visual of this expression can be found at http://tinyurl.com/z3jpzbv
  // It is meant to deal with two similar but subtly different expressions.
  var _REGEX = /^(!)?([1-9]\d*)?d([1-9]\d*|%)(?:(?:([+\-](?:[1-9]\d*)?)([LH])|k([+\-]?[1-9]\d*))?([+\-]\d+)?)(?:x([1-9]\d*))?$/;

  var _parseResults = [];

  var _randomizer = {
    random: function (sides) { return (Math.floor((Math.random() * sides)) + 1); }
  };

  function _explode() {
    return (_parseResults[_EXPLODE] === "!");
  }

  function _count() {
    return (_parseResults[_COUNT] === undefined)
           ? 1
           : Number.parseInt(_parseResults[_COUNT]);
  }

  function _sides() {
    return (_parseResults[_SIDES] === "%")
            ? 100
            : Number.parseInt(_parseResults[_SIDES]);
  }

  function _modifier() {
    return (_parseResults[_MODIFIER] !== undefined)
           ? Number.parseInt(_parseResults[_MODIFIER])
           : 0;
  }

  function _lowHighCount () {
    var result = 0;
    var lowHighCount = _parseResults[_LOW_HIGH_COUNT];
    // TODO - either remove if statement or case undefined
    if (lowHighCount !== undefined) {
      switch (lowHighCount) {
        case "-":
          result = -1;
          break;
        case "+":
          result = 1;
          break;
        case undefined:
          result = 0;
          break;
        default:
          result = Number.parseInt(lowHighCount);
      }
    }
    return result;
  }

  function _lowHigh() {
    return _parseResults[_LOW_HIGH];
  }

  function _repeats() {
    var repeats = _parseResults[_REPEATS];

    return (repeats !== undefined) ? Number.parseInt(repeats) : 0;
  }

  function _keepType() {
    var result = _parseResults[_LOW_HIGH];
    if ((result === undefined) && (_parseResults[_KEEP_COUNT] !== undefined)) {
      result = "k";
    }
    return result;
  }

  function _kCount() {
    var kCount = _parseResults[_KEEP_COUNT];
    return (kCount !== undefined) ? Number.parseInt(kCount) : 0;
  }

  function _addCount() {
    var result = 0;
    if ((_keepType() == "H") || (_keepType() == "L")) {
      if (_lowHighCount() > 0) {
        result = _lowHighCount();
      }
    }
    return result;
  }

  function _keepHigh() {
    var result = null;

    switch (_keepType()) {
      case "k": result = _kCount() >= 0; break;
      case "H": result = false;          break;
      case "L": result = true;           break;
    }
    return result;
  }

  function _removeCount() {
    var result;

    if ((_keepType() != "k") && (_lowHighCount() > -1)) {
      result = 0;
    }
    else {
      switch (_keepType()) {
        case "H":
        case "L":
          result = -_lowHighCount();
          break;

        case "k":
          result = _count() - Math.abs(_kCount());
          break;

        default:
          result = 0;
      }
    }
    return result;
  }

  var _rollResults = [];

  function parse(spec) {
    _parseResults = _REGEX.exec(spec);
  }

  function setRandomizer(arg) {
    _randomizer = arg;
  }

  function _resultSort(a, b) {
    return b - a;
  }

  function _random() {
    return _randomizer.random(_sides());
  }

  function roll() {
    var result;
    result = [];
    if (_repeats() === 0) {
      result = _rollOne();
    }
    else {
      for (var i = 0; i < _repeats(); i++) {
        result.push(_rollOne());
      }
    }
    return result;
  }

  function _rollOne() {
    var result = 0;
    var start;
    var end;
    var originalStart;
    var originalLength;
    var addedCount;
    var i;

    _rollResults = [];
    for (i = 0; i < _count(); i++) {
      _rollResults[i] = _random(_sides());
    }

    if ((_removeCount() > 0) || (_addCount() > 0)) {
      _rollResults.sort(_resultSort);
    }

    if (_removeCount() > 0) {
      for (i = 0; i < _removeCount(); i++) {
        if (_keepHigh()) {
          _rollResults.pop();
        }
        else {
          _rollResults.shift();
        }
      }
    }

    if (_addCount() > 0) {
      originalLength = _rollResults.length;
      _rollResults.length += _addCount();
      if (_keepType() == "H") {
        start = 0;
        end = _addCount() + 1;
      }
      else {
        start = originalLength - _addCount();
        end = originalLength;
      }
      _rollResults.copyWithin(originalLength, start, end);
    }

    if (_explode()) {
      originalStart = 0;
      originalLength = _rollResults.length;
      do {
        addedCount = 0;
        for (i = originalStart; i < originalLength; i++) {
          if (_rollResults[i] === _sides()) {
            _rollResults.push(_random(_sides));
            addedCount++;
          }
        }
        originalStart = originalLength;
        originalLength = _rollResults.length;
      } while (addedCount > 0);
    }

    for (i = 0; i < _rollResults.length; i++) {
      result = result + _rollResults[i];
    }

    result = result + _modifier();
    return result;
  }

  function toString() {
    var result = "";
    if (_explode()) {
      result = result + "!";
    }

    if (_count() > 1) {
      result = result + _count();
    }

    result = result + "d";
    if (_sides() === 100) {
      result = result + "%";
    }
    else {
      result = result + _sides();
    }

    if (_lowHighCount() != 0) {
      if (_lowHighCount() === -1) {
        result = result + "-" ;
      }
      else if (_lowHighCount() === 1) {
        result = result + "+";
      }
      else {
        if (_lowHighCount() > 0) {
          result = result + "+";
        }
        result = result + _lowHighCount();
      }
      result = result + _lowHigh();
    }

    if (_kCount() != 0) {
      result = result + "k" + _kCount();
    }

    if (_modifier() != 0) {
      if (_modifier() > 0) {
        result = result + "+";
      }
      result = result + _modifier();
    }

    if (_repeats() != 0) {
      result = result + "x" + _repeats();
    }

    return result;
  }

  return {
  //  explode: _getExplode(),
    parse: parse,
    toString: toString,
    setRandomizer: setRandomizer,
    roll: roll
  };
})();
