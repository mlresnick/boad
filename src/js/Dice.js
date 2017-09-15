'use strict';

// TODO: Implement explode (!)
module.exports = (() => {
  const _EXPLODE = 1;
  const _COUNT = 2;
  const _SIDES = 3;
  const _LOW_HIGH_COUNT = 4;
  const _LOW_HIGH = 5;
  const _KEEP_COUNT = 6;
  const _MODIFIER = 7;
  const _REPEATS = 8;

  // Visual of this expression can be found at http://tinyurl.com/kf85ogn
  // It is meant to deal with two similar but subtly different expressions.
  // eslint-disable-next-line max-len
  const _REGEX = /^(!)?([1-9]\d*)?d([1-9]\d*|%|F)(?:(?:([+-](?:[1-9]\d*)?)(?=[LH])([LH])|k([+-]?[1-9]\d*))?([+-][1-9]\d*)?)(?:x([1-9]\d*))?$/;

  let _parseResults = [];
  let _die;

  function _randomInt(first, second) {
    let low = 1;
    let high;
    if (second) {
      low = first;
      high = second;
    }
    else {
      high = first;
    }
    return (Math.floor(Math.random() * (high - low)) + low);
  }

  // Base class for die definitions
  function DieDef() {}
  DieDef.prototype.sides =
    function sidesImpl() { return Number.parseInt(_parseResults[_SIDES], 10); };
  DieDef.prototype.sidesToString =
    function sidesToStringImpl() { return this.sides().toString(); };
  DieDef.prototype.roll =
    function rollImpl() { return _randomInt(this.sides()); };
  DieDef.prototype.exlodeValue =
    function exlodeValueImpl() { return this.sides(); };
  DieDef.prototype.canExplode =
    function canExplodeImpl(roll) { return this.exlodeValue() === roll; };
  DieDef.prototype.constructor = DieDef;

  // Fudge Dice (range of -1 - +1)
  function DFDef() { DieDef.call(this); }
  DFDef.prototype = Object.create(DieDef.prototype);
  DFDef.prototype.sidesToString =
    function sidesToStringImpl() { return 'F'; };
  DFDef.prototype.roll = function rollImpl() { return _randomInt(-1, 1); };
  DieDef.prototype.exlodeValue = function exlodeValueImpl() { return 1; };
  DFDef.prototype.constructor = DFDef;

  // Base class for die definitions where the final value is made up of
  // the concatenation of repeated rolls. Examples are
  //   - % which can be modelled as 2 D10 rolls, concatenated
  //   - d66 where the results of 2d6 are concanated, rather than summed. Lowest
  //     value is 11, highest is 66.
  function DrepDef(dieCount, sides) {
    DieDef.call(this);
    this._dieCount = dieCount;
    this._sides = sides;
    this._explodeValue = 0;
    for (let i = 0; i < this._sides; i++) {
      this._exlodeValue = (this._explodeValue * 10) + this._sides;
    }
  }
  DrepDef.prototype = Object.create(DieDef.prototype);
  DrepDef.prototype.sides = function sidesImpl() { return this._sides; };
  DrepDef.prototype.rollOne =
    function rollOneImpl() { return _randomInt(this._sides); };
  DrepDef.prototype.roll = function rollImpl() {
    let result = 0;
    for (let i = 0; i < this._dieCount; i++) {
      result = (result * 10) + this.rollOne();
    }
    return result;
  };
  DrepDef.prototype.exlodeValue =
    function exlodeValueImpl() { return this._explodeValue; };
  DrepDef.prototype.constructor = DrepDef;


  function D100Def() { DrepDef.call(this, 2, 10); }
  D100Def.prototype = Object.create(DrepDef.prototype);
  D100Def.prototype.sidesToString =
    function sidesToStringImpl() { return '%'; };
  D100Def.prototype.constructor = D100Def;

  function D66Def() { DrepDef.call(this, 2, 6); }
  D66Def.prototype = Object.create(DrepDef.prototype);
  D66Def.prototype.sidesToString =
    function sidesToStringImpl() { return '66'; };
  D66Def.prototype.constructor = D66Def;

  function D1000Def() { DrepDef.call(this, 3, 10); }
  D1000Def.prototype = Object.create(DrepDef.prototype);
  D1000Def.prototype.sidesToString =
    function sidesToStringImpl() { return '1000'; };
  D1000Def.prototype.constructor = D1000Def;

  function _explode() { return (_parseResults[_EXPLODE] === '!'); }

  function _count() {
    let result = 1;

    if (_parseResults[_COUNT] !== undefined) {
      result = Number.parseInt(_parseResults[_COUNT], 10);
    }

    return result;
  }

  function _modifier() {
    let result = 0;
    if (_parseResults[_MODIFIER] !== undefined) {
      result = Number.parseInt(_parseResults[_MODIFIER], 10);
    }
    return result;
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

    if (Math.abs(lowHighCount) >= count) {
      offendingValue = lowHighCount;
      keepSpec = lowHighCount + _lowHigh();
      action = (offendingValue > 0) ? 'add again,' : 'drop';
    }
    else {
      const kCount = _kCount();
      if (Math.abs(kCount) >= count) {
        offendingValue = kCount;
        keepSpec = `k${offendingValue}`;
        action = (offendingValue > 0) ? 'keep' : 'drop';
      }
    }

    if (offendingValue) {
      result = `Dice to roll (${count}) must be larger than the dice to `
        + `${action} (${keepSpec})`;
    }

    return result;
  }

  function _parse(spec) {
    _parseResults = _REGEX.exec(spec);
    const result = _validateSpec();
    if (!result) {
      switch(_parseResults[_SIDES]) {
        case '%': _die = new D100Def(); break;
        case '66': _die = new D66Def(); break;
        case '1000': _die = new D1000Def(); break;
        case 'F': _die = new DFDef(); break;
        default: _die = new DieDef();
      }
    }
    return result;
  }

  function _resultSort(a, b) { return b - a; }

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
      _rollResults[i] = _die.roll();
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
          if (_rollResults[i] === _die.sides()) {
            _rollResults.push(_die.roll());
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

    result += `d${_die.sidesToString()}`;

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
    toString: _toString,
  };
});
