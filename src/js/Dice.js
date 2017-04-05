// TODO: Implement !, d66, dF and possibly d1000
'use strict';

module.exports = (() => {
  const _EXPLODE = 1;
  const _COUNT = 2;
  const _SIDES = 3;
  const _LOW_HIGH_COUNT = 4;
  const _LOW_HIGH = 5;
  const _KEEP_COUNT = 6;
  const _MODIFIER = 7;
  const _REPEATS = 8;

  /* eslint-disable max-len */
  // Visual of this expression can be found at http://tinyurl.com/h5wt99z
  // It is meant to deal with two similar but subtly different expressions.
  const _REGEX =
    /^(!)?([1-9]\d*)?d([1-9]\d*|%)(?:(?:([+-](?:[1-9]\d*)?)([LH])|k([+-]?[1-9]\d*))?([+-][1-9]\d*)?)(?:x([1-9]\d*))?$/;
  /* eslint-enable maxlen */

  let _parseResults = [];

  let _randomizer = { random: sides => (Math.floor((Math.random() * sides)) + 1) };

  function _explode() { return (_parseResults[_EXPLODE] === '!'); }

  function _count() {
    return (_parseResults[_COUNT] === undefined)
              ? 1
              : Number.parseInt(_parseResults[_COUNT],
            10);
  }

  function _sides() {
    return (_parseResults[_SIDES] === '%')
              ? 100
              : Number.parseInt(_parseResults[_SIDES],
            10);
  }

  function _modifier() {
    return (_parseResults[_MODIFIER] !== undefined)
      ? Number.parseInt(_parseResults[_MODIFIER], 10)
      : 0;
  }

  function _lowHighCount() {
    let result = 0;
    const lowHighCount = _parseResults[_LOW_HIGH_COUNT];

    /* eslint-disable no-multi-spaces */
    switch(lowHighCount) {
      case '-':       result = -1; break;
      case '+':       result =  1; break;
      case undefined: result =  0; break;
      default:        result =  Number.parseInt(lowHighCount, 10);
    }
    /* eslint-enable no-multi-spaces */

    return result;
  }

  function _lowHigh() { return _parseResults[_LOW_HIGH]; }

  function _repeats() {
    const repeats = _parseResults[_REPEATS];

    return (repeats !== undefined) ? Number.parseInt(repeats, 10) : 0;
  }

  function _keepType() {
    let result = _parseResults[_LOW_HIGH];
    if ((result === undefined) && (_parseResults[_KEEP_COUNT] !== undefined)) {
      result = 'k';
    }
    return result;
  }

  function _kCount() {
    const kCount = _parseResults[_KEEP_COUNT];
    return (kCount !== undefined) ? Number.parseInt(kCount, 10) : 0;
  }

  function _addCount() {
    let result = 0;
    if ((_keepType() === 'H') || (_keepType() === 'L')) {
      if (_lowHighCount() > 0) {
        result = _lowHighCount();
      }
    }
    return result;
  }

  function _keepHigh() {
    let result = null;

    /* eslint-disable no-multi-spaces */
    switch(_keepType()) {
      case 'k': result = _kCount() >= 0; break;
      case 'H': result = false;          break;
      case 'L': result = true;           break;
      default:  // Do nothing
    }
    /* eslint-enable no-multi-spaces */
    return result;
  }

  function _removeCount() {
    let result;

    if ((_keepType() !== 'k') && (_lowHighCount() > -1)) {
      result = 0;
    }
    else {
      /* eslint-disable no-multi-spaces */
      switch(_keepType()) {
        case 'H':
        case 'L': result = -_lowHighCount();               break;
        case 'k': result = _count() - Math.abs(_kCount()); break;
        default:  result = 0;
      }
      /* eslint-enable no-multi-spaces */
    }
    return result;
  }

  let _rollResults = [];

  function _validateSpec() {
    let result;
    let offendingValue = null;
    let keepSpec = null;
    let action;

    const count = _count();
    const lowHighCount = _lowHighCount();

    if (Math.abs(lowHighCount) > count) {
      offendingValue = lowHighCount;
      keepSpec = lowHighCount + _lowHigh();
      action = (lowHighCount > 0) ? 'add, again,' : 'drop';
    }
    else {
      const kCount = _kCount();
      if (Math.abs(kCount) > count) {
        offendingValue = kCount;
        keepSpec = `k${offendingValue}`;
        action = (offendingValue > 0) ? 'keep' : 'drop';
      }
    }

    if (offendingValue) {
      result = `Dice to ${action} (${keepSpec}) is larger than the number of dice to roll (${count})`;
    }

    return result;
  }

  function _parse(spec) {
    _parseResults = _REGEX.exec(spec);
    return _validateSpec();
  }


  function _setRandomizer(arg) { _randomizer = arg; }

  function _resultSort(a, b) { return b - a; }

  function _random() { return _randomizer.random(_sides()); }

  function _rollOne() {
    let result = 0;
    let start;
    let end;
    let originalStart;
    let originalLength;
    let addedCount;
    let i;

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
      if (_keepType() === 'H') {
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
            addedCount += 1;
          }
        }
        originalStart = originalLength;
        originalLength = _rollResults.length;
      } while (addedCount > 0);
    }

    for (i = 0; i < _rollResults.length; i++) {
      result += _rollResults[i];
    }

    result += _modifier();
    return result;
  }

  function _roll() {
    let result;
    result = [];
    if (_repeats() === 0) {
      result = _rollOne();
    }
    else {
      for (let i = 0; i < _repeats(); i++) {
        result.push(_rollOne());
      }
    }
    return result;
  }

  function _toString() {
    let result = '';
    if (_explode()) {
      result += '!';
    }

    if (_count() > 1) {
      result += _count();
    }

    result += 'd';
    if (_sides() === 100) {
      result += '%';
    }
    else {
      result += _sides();
    }

    if (_lowHighCount() !== 0) {
      if (_lowHighCount() === -1) {
        result += '-';
      }
      else if (_lowHighCount() === 1) {
        result += '+';
      }
      else {
        if (_lowHighCount() > 0) {
          result += '+';
        }
        result += _lowHighCount();
      }
      result += _lowHigh();
    }

    if (_kCount() !== 0) {
      result += `k${_kCount()}`;
    }

    if (_modifier() !== 0) {
      if (_modifier() > 0) {
        result += '+';
      }
      result += _modifier();
    }

    if (_repeats() !== 0) {
      result += `x${_repeats()}`;
    }

    return result;
  }

  return {
    parse: _parse,
    roll: _roll,
    setRandomizer: _setRandomizer,
    toString: _toString,
  };
});
