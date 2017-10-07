'use strict';

const stateMachine = require('./state-machine.js');

module.exports = ((arg) => {
  let _die;
  let _random = Math.random;

  const _spec = {
    count: null,
    sides: null,
    lowHighCount: null,
    lowHigh: null,
    keepCount: null,
    modifier: null,
    repeats: null,

    partToString: function _partToString(specPart) {
      let result = '';

      switch(specPart) {
        case 'count':
          if ((this.count !== null) && (this.count > 1)) {
            result = this.count.toString();
          }
          break;

        case 'sides':
          result = `d${_die.sidesToString()}`;
          break;

        case 'lowHighCount':
          if (this.lowHighCount !== null) {
            const value = Math.abs(this.lowHighCount);
            if (this.lowHighCount > 0) {
              result = '+';
            }
            else if (this.lowHighCount < 0) {
              result = '-';
            }
            else {
              throw new Error('lowHighCount cannot be 0');
            }

            if (value > 1) {
              result += value;
            }
          }
          break;

        case 'lowHigh':
          result = this.lowHigh || '';
          break;

        case 'keepCount':
          if (this.keepCount !== null) {
            result = `k${this.keepCount}`;
          }
          break;

        case 'modifier':
          if (this.modifier !== null) {
            if (this.modifier > 0) {
              result += '+';
            }
            result += this.modifier;
          }
          break;

        case 'repeats':
          if ((this.repeats !== null) && (this.repeats > 1)) {
            result += `x${this.repeats}`;
          }
          break;

        default:
          throw new Error(`Unknown die specification part name: '${
            JSON.stringify(specPart)
          }'`);
      }

      return result;
    },

    partToHTML:
    function _specPartToHTML(specPart, displayClass, wrapIndividual) {
      let result = '';
      let string = this.partToString(specPart);
      let wrapList;
      if (string !== '') {
        switch(specPart) {
          case 'lowHighCount':
          case 'modifier':
          case 'repeats':
            result +=
              `<span class="display-operator">${string.charAt(0)}</span>`;
            string = string.substring(1);
            break;

          case 'keepCount':
            result += `<span class="display-keep">${string.charAt(0)}</span>`;
            string = string.substring(1);
            break;

          default:
        }
        if (string !== '') {
          if (wrapIndividual && (displayClass !== 'die')) {
            wrapList = string.toString().split('');
          }
          else {
            wrapList = [string];
          }
          result +=
            wrapList.reduce((partialResult, part) =>
              `${partialResult}` +
              `<span class="display-${displayClass}">${part}</span>`,
            '');
        }
      }
      return result;
    },

    getDropRange: function _getDropRange() {
      let dropRange = null;
      if (this.keepCount) {
        if (this.keepCount < 0) {
          dropRange = { start: 0, end: -this.keepCount };
        }
        else {
          dropRange = { start: 0, end: (this.count - this.keepCount) };
        }
      }
      else if (this.lowHighCount < 0) {
        if (this.lowHigh === 'L') {
          dropRange = { start: 0, end: -this.lowHighCount };
        }
        else {
          dropRange = {
            start: (this.count + this.lowHighCount),
            end: this.count,
          };
        }
      }
      return dropRange;
    },

    getAddRange: function _getAddRange() {
      let addRange = null;
      if (this.lowHighCount > 0) {
        if (this.lowHigh === 'L') {
          addRange = { start: 0, end: this.lowHighCount };
        }
        else {
          addRange = {
            start: (this.count - this.lowHighCount),
            end: this.count,
          };
        }
      }
      return addRange;
    },
  };

  // TODO part of explode (!) implementation
  // const _EXPLODE = 'explode';
  const _COUNT = 'count';
  const _SIDES = 'sides';
  const _LOW_HIGH_COUNT = 'lowHighCount';
  const _LOW_HIGH = 'lowHigh';
  const _KEEP_COUNT = 'keepCount';
  const _MODIFIER = 'modifier';
  const _REPEATS = 'repeats';

  const _partsList = [
    // TODO part of explode (!) implementation
    // _EXPLODE,
    _COUNT,
    _SIDES,
    _LOW_HIGH_COUNT,
    _LOW_HIGH,
    _KEEP_COUNT,
    _MODIFIER,
    _REPEATS,
  ];

  const stateToSpecPart = {
    /* eslint-disable key-spacing */
    start:            null,
    countDigit:       _COUNT,

    die:              null,
    dieDigit:         _SIDES,
    specialDie:       _SIDES,

    postDieOp:        _LOW_HIGH_COUNT,
    postDieDigit:     _LOW_HIGH_COUNT,

    k:                null,
    kOperator:        _KEEP_COUNT,
    kDigit:           _KEEP_COUNT,

    lh:               _LOW_HIGH,

    modifierOperator: _MODIFIER,
    modifierDigit:    _MODIFIER,

    x:                null,
    xDigit:           _REPEATS,

    roll:             null,

    error:            null,
    /* eslint-enable key-spacing */
  };

  function _setRandom(rnd) { _random = rnd; }

  function _randomInt(first, second) {
    const low = second ? first : 1;
    const high = (second || first) + 1;
    return Math.floor(_random() * (high - low)) + low;
  }

  // Base class for die definitions
  function DieDef(diespec) { this.diespec = diespec; }
  DieDef.prototype.sides = function sidesImpl() { return _spec.sides || ''; };
  DieDef.prototype.sidesToString =
    function sidesToStringImpl() { return this.sides().toString(); };
  DieDef.prototype.roll =
    function rollImpl() { return _randomInt(this.sides()); };
  DieDef.prototype.explodeValue =
    function explodeValueImpl() { return this.sides(); };
  DieDef.prototype.canExplode =
    function canExplodeImpl(roll) { return this.exlodeValue() === roll; };
  DieDef.prototype.constructor = DieDef;

  // Fudge Dice (range of [-1, +1])
  function DFDef(diespec) { DieDef.call(this, diespec); }
  DFDef.prototype = Object.create(DieDef.prototype);
  DFDef.prototype.sidesToString =
    function sidesToStringImpl() { return 'F'; };
  DFDef.prototype.roll = function rollImpl() { return _randomInt(-1, 1); };
  DieDef.prototype.explodeValue = function explodeValueImpl() { return 1; };
  DFDef.prototype.constructor = DFDef;

  /*
   * Base class for die definitions where the final value is made up of
   * the concatenation of repeated rolls. Examples are
   *   - % which can be modelled as 2 D10 rolls, concatenated
   *   - d66 where the results of 2d6 are concanated, rather than summed. Lowest
   *     value is 11, highest is 66.
   */
  function DrepDef(diespec, dieCount, actualSides) {
    DieDef.call(this, diespec);
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
  DrepDef.prototype.explodeValue =
    function explodeValueImpl() { return this._explodeValue; };
  DrepDef.prototype.constructor = DrepDef;


  function D100Def(diespec) { DrepDef.call(this, diespec, 2, 10); }
  D100Def.prototype = Object.create(DrepDef.prototype);
  D100Def.prototype.sidesToString =
    function sidesToStringImpl() { return '%'; };
  D100Def.prototype.constructor = D100Def;

  function D66Def(diespec) { DrepDef.call(this, diespec, 2, 6); }
  D66Def.prototype = Object.create(DrepDef.prototype);
  D66Def.prototype.sidesToString =
    function sidesToStringImpl() { return '66'; };
  D66Def.prototype.constructor = D66Def;

  function D1000Def(diespec) { DrepDef.call(this, diespec, 3, 10); }
  D1000Def.prototype = Object.create(DrepDef.prototype);
  D1000Def.prototype.sidesToString =
    function sidesToStringImpl() { return '1000'; };
  D1000Def.prototype.constructor = D1000Def;

  function _toString() {
    return _partsList.reduce(
      (partialResult, specPart) => partialResult + _spec.partToString(specPart),
      ''
    );
  }

  const _partToDisplayClassMap = {
    count: 'digit',
    sides: 'die',
    lowHighCount: 'digit',
    lowHigh: 'keep',
    keepCount: 'digit',
    modifier: 'digit',
    repeats: 'digit',
  };

  function _toHTML(wrapIndividual = false) {
    return [
      /* eslint-disable no-multi-spaces */
      // TODO: Part of explode (!) implementation
      // { specPart: 'explode',      displayClass: 'explode' },
      { specPart: 'count',        displayClass: 'digit'   },
      { specPart: 'sides',        displayClass: 'die'     },
      { specPart: 'lowHighCount', displayClass: 'digit'   },
      { specPart: 'lowHigh',      displayClass: 'keep'    },
      { specPart: 'keepCount',    displayClass: 'digit'   },
      { specPart: 'modifier',     displayClass: 'digit'   },
      { specPart: 'repeats',      displayClass: 'digit'   },
      /* eslint-enable no-multi-spaces */
    ].reduce(
      (partialResult, el) =>
        partialResult +

        _spec.partToHTML(el.specPart, el.displayClass, wrapIndividual),
      ''
    );
  }

  // Initialize
  function _parse(diespecString) {
    const state = stateMachine.states;

    let currentState = {};
    currentState.state = state.start;

    let specpart;
    for (let i = 0; i < diespecString.length; i++) {
      const char = diespecString.charAt(i);
      currentState = stateMachine.nextState(currentState, char);
      if (currentState.state === state.error) {
        throw new Error(
          `${currentState.errorCode}: '${currentState.value}', ` +
          `${currentState.previousState}`
        );
      }
      specpart = stateToSpecPart[currentState.state];
      if (specpart) {
        _spec[specpart] = (_spec[specpart] || '') + String(char);
      }
    }

    /*
     * Because there's no look-ahead, if there is no Low/High, the modifier will
     * put in the wrong place.
     */
    if (!_spec.lowHigh && _spec.lowHighCount) {
      _spec.modifier = _spec.lowHighCount;
      _spec.lowHighCount = null;
    }

    _partsList.forEach((propertyName) => {
      const value = parseInt(_spec[propertyName], 10);
      if (Number.isInteger(value)) {
        _spec[propertyName] = value;
      }
      else if ((propertyName === 'lowHighCount') &&
          '+-'.includes(_spec.lowHighCount)) {
        _spec.lowHighCount = Number(`${_spec[propertyName]}1`);
      }
    });

    switch(_spec.sides) {
      case '%': _die = new D100Def(this); break;
      case '66': _die = new D66Def(this); break;
      case '1000': _die = new D1000Def(this); break;
      case 'F': _die = new DFDef(this); break;
      default: _die = new DieDef(this);
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

  function _dropDice(result) { _adjust(result, _spec.getDropRange(), -1); }
  function _addDice(result) { _adjust(result, _spec.getAddRange(), +1); }

  function _roll() {
    const results = [];

    for (
      let repeatIndex = 0;
      repeatIndex < (_spec.repeats || 1);
      repeatIndex++
    ) {

      const result = { rolls: [], result: 0 };

      for (let dieIndex = 0; dieIndex < (_spec.count || 1); dieIndex++) {
        result.rolls[dieIndex] = { roll: _die.roll(), adjust: 0 };
      }

      _dropDice(result);

      _addDice(result);

      result.result = result.rolls.reduce((total, dieRoll) =>
        total + dieRoll.roll + (dieRoll.roll * dieRoll.adjust),
      0);

      result.result += _spec.modifier;

      results.push(result);
    }
    return results;
  }

  function _toJSON() { return _toString(); }

  function Walker() {
    this.partIndex = -1;
    this.charIndex = 0;
    this.partValue = '';
    this.partName = '';
    this.value = '';
    this.type = '';

    this.next = () => {
      let result = false;
      let value;

      while (this.partIndex === -1
            || (this.charIndex === this.partValue.length)) {
        this.partIndex += 1;
        if (this.partIndex === _partsList.length) {
          break;
        }
        this.charIndex = 0;
        this.partName = _partsList[this.partIndex];
        this.partValue = (_spec.partToString(this.partName) || '');
      }

      if (this.partIndex < _partsList.length) {
        if (this.partName === 'sides') {
          value = this.partValue;
        }
        else {
          value = this.partValue.charAt(this.charIndex);
        }
        this.value = {
          type: _partToDisplayClassMap[this.partName],
          value,
        };
        this.charIndex += this.partValue.length;
        result = true;
      }
      return result;
    };
  }

  _parse(arg);

  return {
    newWalker: () => new Walker(),
    roll: _roll,
    setRandom: _setRandom,
    toHTML: _toHTML,
    toJSON: _toJSON,
    toString: _toString,
  };
});
