'use strict';

const stateMachine = require('./state-machine.js');

module.exports = ((arg) => {
  // XXX:
  // const _dieSpecString = arg;
  const _dieSpec = {
    count: '',
    sides: '',
    lowHighCount: '',
    lowHigh: '',
    keepCount: '',
    modifier: '',
    repeats: '',
  };
  let _die;
  let _random = Math.random;

  // const explode = 'explode';
  const count = 'count';
  const sides = 'sides';
  const lowHighCount = 'lowHighCount';
  const lowHigh = 'lowHigh';
  const keepCount = 'keepCount';
  const modifier = 'modifier';
  const repeats = 'repeats';


  const y = { /* eslint-disable key-spacing */
    start:            null,
    countDigit:       count,

    die:              null,
    dieDigit:         sides,
    specialDie:       sides,

    postDieOp:        lowHighCount,
    postDieDigit:     lowHighCount,

    k:                null,
    kOperator:        keepCount,
    kDigit:           keepCount,

    lh:               lowHigh,

    modifierOperator: modifier,
    modifierDigit:    modifier,

    x:                null,
    xDigit:           repeats,

    roll:             null,

    error:            null,
  };  /* eslint-enable */

  function _setRandom(rnd) { _random = rnd; }

  function _randomInt(first, second) {
    const low = second ? first : 1;
    const high = second || first;
    return Math.floor(_random() * (high - low)) + low;
  }

  // Base class for die definitions
  function DieDef(dieSpec) { this.dieSpec = dieSpec; }
  DieDef.prototype.sides = function sidesImpl() { return this.dieSpec.sides; };
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
  function DFDef(dieSpec) { DieDef.call(this, dieSpec); }
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
  function DrepDef(dieSpec, dieCount, actualSides) {
    DieDef.call(this, dieSpec);
    this._dieCount = dieCount;
    this._sides = actualSides;
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


  function D100Def(dieSpec) { DrepDef.call(this, dieSpec, 2, 10); }
  D100Def.prototype = Object.create(DrepDef.prototype);
  D100Def.prototype.sidesToString =
    function sidesToStringImpl() { return '%'; };
  D100Def.prototype.constructor = D100Def;

  function D66Def(dieSpec) { DrepDef.call(this, dieSpec, 2, 6); }
  D66Def.prototype = Object.create(DrepDef.prototype);
  D66Def.prototype.sidesToString =
    function sidesToStringImpl() { return '66'; };
  D66Def.prototype.constructor = D66Def;

  function D1000Def(dieSpec) { DrepDef.call(this, dieSpec, 3, 10); }
  D1000Def.prototype = Object.create(DrepDef.prototype);
  D1000Def.prototype.sidesToString =
    function sidesToStringImpl() { return '1000'; };
  D1000Def.prototype.constructor = D1000Def;

  function _toString() {
    let result = '';
    // XXX:
    // if (_explode()) {
    //   result += '!';
    // }
    if (_dieSpec.count > 1) {
      result += _dieSpec.count;
    }
    result += `d${_die.sidesToString()}`;

    if (_dieSpec.lowHighCount !== 0) {
      if (_dieSpec.lowHighCount === -1) {
        result += '-';
      }
      else if (_dieSpec.lowHighCount === 1) {
        result += '+';
      }
      else {
        if (_dieSpec.lowHighCount > 0) {
          result += '+';
        }
        result += _dieSpec.lowHighCount;
      }
      result += _dieSpec.lowHigh;
    }

    if (_dieSpec.keepCount !== 0) {
      result += `k${_dieSpec.keepCount}`;
    }

    if (_dieSpec.modifier !== 0) {
      if (_dieSpec.modifier > 0) {
        result += '+';
      }
      result += _dieSpec.modifier;
    }

    if (_dieSpec.repeats > 1) {
      result += `x${_dieSpec.repeats}`;
    }

    return result;
  }

  function _toHTML() { }

  // Initialize
  function _parse(dieSpecString) {
    const state = stateMachine.states;

    let currentState = {};
    currentState.state = state.start;

    let specpart;
    for (let i = 0; i < dieSpecString.length; i++) {
      const char = dieSpecString.charAt(i);
      currentState = stateMachine.nextState(currentState, char);
      if (currentState.state === state.error) {
        throw new Error(
          `${currentState.errorCode}: '${currentState.value}', ` +
          `${currentState.previousState}`
        );
      }
      specpart = y[currentState.state];
      if (specpart) {
        _dieSpec[specpart] += char;
      }
    }

    // Because there's no look-ahead, if there is no Low/High, the modifier will
    // put in the wrong place.
    if (!_dieSpec.lowHigh && _dieSpec.lowHighCount) {
      _dieSpec.modifier = _dieSpec.lowHighCount;
      _dieSpec.lowHighCount = 0;
    }

    Object.getOwnPropertyNames(_dieSpec).forEach((propertyName) => {
      const value = parseInt(_dieSpec[propertyName], 10);
      if (Number.isInteger(value)) {
        _dieSpec[propertyName] = value;
      }
      else {
        switch(propertyName) {
          case 'count':
          case 'repeats':
            _dieSpec[propertyName] = 1;
            break;

          case 'sides':
          case 'lowHigh':
            /* Nothing to do */
            break;

          case 'lowHighCount':
            if (_dieSpec.lowHighCount === '') {
              _dieSpec.lowHighCount = 0;
            }
            else if ('+-'.includes(_dieSpec.lowHighCount)) {
              _dieSpec.lowHighCount = Number(`${_dieSpec[propertyName]}1`);
            }
            break;

          default:
            _dieSpec[propertyName] = 0;
        }
      }
    });

    switch(_dieSpec.sides) {
      case '%': _die = new D100Def(_dieSpec); break;
      case '66': _die = new D66Def(_dieSpec); break;
      case '1000': _die = new D1000Def(_dieSpec); break;
      case 'F': _die = new DFDef(_dieSpec); break;
      default: _die = new DieDef(_dieSpec);
    }
  }

  function _adjust(result, adjustRange, adjustment) {
    if (adjustRange) {
      const workArray = [];
      result.rolls.forEach((item, index) => {
        workArray.push({ roll: item.roll, index });
      });
      workArray.sort((lhs, rhs) => lhs.roll - rhs.roll);
      for (let i = adjustRange.start; i < adjustRange.end; i++) {
        const indexToAdjust = workArray[i].index;
        result.rolls[indexToAdjust].adjust = adjustment;
      }
    }
  }

  function _getDropRange() {
    let dropRange = null;
    if (_dieSpec.keepCount) {
      if (_dieSpec.keepCount < 0) {
        dropRange = { start: 0, end: -_dieSpec.keepCount };
      }
      else {
        dropRange = { start: 0, end: (_dieSpec.count - _dieSpec.keepCount) };
      }
    }
    else if (_dieSpec.lowHighCount < 0) {
      if (_dieSpec.lowHigh === 'L') {
        dropRange = { start: 0, end: -_dieSpec.lowHighCount };
      }
      else {
        dropRange = {
          start: (_dieSpec.count + _dieSpec.lowHighCount),
          end: _dieSpec.count,
        };
      }
    }
    return dropRange;
  }


  function _getAddRange() {
    let addRange = null;
    if (_dieSpec.lowHighCount > 0) {
      if (_dieSpec.lowHigh === 'L') {
        addRange = { start: 0, end: _dieSpec.lowHighCount };
      }
      else {
        addRange = {
          start: (_dieSpec.count - _dieSpec.lowHighCount),
          end: _dieSpec.count,
        };
      }
    }
    return addRange;
  }

  function _dropDice(result) { _adjust(result, _getDropRange(), -1); }
  function _addDice(result) { _adjust(result, _getAddRange(), +1); }

  function _roll() {
    const results = [];

    for (let repeatIndex = 0; repeatIndex < _dieSpec.repeats; repeatIndex++) {

      const result = { rolls: [], result: 0 };

      for (let dieIndex = 0; dieIndex < _dieSpec.count; dieIndex++) {
        result.rolls[dieIndex] = { roll: _die.roll(), adjust: 0 };
      }

      _dropDice(result);

      _addDice(result);

      result.result = result.rolls.reduce((total, dieRoll) =>
        total + dieRoll.roll + (dieRoll.roll * dieRoll.adjust),
        0);

      result.result += _dieSpec.modifier;

      results.push(result);
    }
    return results;
  }

  _parse(arg);

  return {
    dieSpec: _dieSpec,
    roll: _roll,
    setRandom: _setRandom,
    toHTML: _toHTML,
    toString: _toString,
  };
});
