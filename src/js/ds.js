'use strict';

// FIXME: Default roll implementaton has wrong range.
// E.g. d4 results in values [1,3],  d6 results in values  [1,5]
const stateMachine = require('./state-machine.js');

function dumpObject(object) { // eslint-disable-line no-unused-vars
  function cmp(a, b) {
    let result = 0;
    if (a < b) {
      result = -1;
    }
    else if (a > b) {
      result = 1;
    }
    return result;
  }
  const propertyList = Object.getOwnPropertyNames(object)
    .filter(propertyName =>
      [
        /^AnalyserNode*/,
        /^Animate7*/,
        /^AnimationEvent*/,
        /^ApplicationCache*/,
        /^Array*/,
        /^DOM*/,
        /^Canvas*/,
        /^CSS*/,
        /^on.+/,
        /^RTC*/,
        /^Screen*/,
        /^Presentation*/,
        /^Performance*/,
        /^MIDI*/,
        /^Media*/,
        /^Int*/,
        /^IDB*/,
        /^HTML*/,
        /^WebGL*/,
        /^Uint*/,
        /\*Event$/,
        /^SVG*/,
        /^Text.+/,
        /^Text.+/,
        /^WebKit*/,
        /^webkit*/,
        /^Worker/,
        /^XMLDocument/,
        /^XMLHttp*/,
        /^XMLSerializer/,
        /^XPath/,
        /^XSLTProcessor/,
        // /^[A-Z]*/,
      ].find(pattern => pattern.test(propertyName)) === undefined)
    .sort((a, b) => /* cmp(a.toLowerCase(), b.toLocaleLowerCase()) || */
      cmp(a, b));
  console.log(propertyList.join('\n')); // eslint-disable-line no-console
// console.log(`propertyList.length=${propertyList.length}`);
//   console.log(
//         `window.__nightmare.boadFavoritesModel.findByDieSpec('5d4+12')=${
//     window.__nightmare.boadFavoritesModel
//     .findByDieSpec('5d4+12')}`);
// // console.log(`localStorage.getItem('favorites')=${localStorage.getItem('favorites')}`);
}

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
            result = this.count;
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

  // const explode = 'explode';
  const count = 'count';
  const sides = 'sides';
  const lowHighCount = 'lowHighCount';
  const lowHigh = 'lowHigh';
  const keepCount = 'keepCount';
  const modifier = 'modifier';
  const repeats = 'repeats';

  const _partsList = [
    'count',
    'sides',
    'lowHighCount',
    'lowHigh',
    'keepCount',
    'modifier',
    'repeats',
  ];

  // TODO: Giv 'y' a better name
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
  }; /* eslint-enable key-spacing */

  function _setRandom(rnd) { _random = rnd; }

  function _randomInt(first, second) {
    const low = second ? first : 1;
    const high = second || first;
    return Math.floor(_random() * (high - low)) + low;
  }

  // Base class for die definitions
  function DieDef(dieSpec) { this.dieSpec = dieSpec; }
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
  function DFDef(dieSpec) { DieDef.call(this, dieSpec); }
  DFDef.prototype = Object.create(DieDef.prototype);
  DFDef.prototype.sidesToString =
    function sidesToStringImpl() { return 'F'; };
  DFDef.prototype.roll = function rollImpl() { return _randomInt(-1, 1); };
  DieDef.prototype.explodeValue = function explodeValueImpl() { return 1; };
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
  DrepDef.prototype.explodeValue =
    function explodeValueImpl() { return this._explodeValue; };
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
    return [
      // TODO: Part of explode implementation
      // 'explode',
      'count',
      'sides',
      'lowHighCount',
      'lowHigh',
      'keepCount',
      'modifier',
      'repeats',
    ].reduce(
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
      // TODO: Part of explode implementation
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
        _spec[specpart] = (_spec[specpart] || '') + String(char);
        // this[`_${specpart}`] = (this[`_${specpart}`] || '') + String(char);
      }
    }

    // Because there's no look-ahead, if there is no Low/High, the modifier will
    // put in the wrong place.
    if (!_spec.lowHigh && _spec.lowHighCount) {
      _spec.modifier = _spec.lowHighCount;
      _spec.lowHighCount = null;
    }

    _partsList.forEach((propertyName) => {
      const value = parseInt(_spec[propertyName], 10);
      if (Number.isInteger(value)) {
        _spec[propertyName] = value;
      }
      else {
        switch(propertyName) {
          case 'count':
          case 'repeats':
            // this[propertyName] = 1;
            break;

          case 'sides':
          case 'lowHigh':
            /* Nothing to do */
            break;

          case 'lowHighCount':
            if ('+-'.includes(_spec.lowHighCount)) {
              _spec.lowHighCount = Number(`${_spec[propertyName]}1`);
            }
            break;

          default:
            // this[propertyName] = 0;
        }
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

  function toJSON() { return _toString(); }
  // this.toJSON = toJSON;

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
      // let partName;

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
    toJSON,
    toString: _toString,
  };
});
