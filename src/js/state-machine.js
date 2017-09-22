'use strict';

module.exports = (() => {
  let _instance;

  function _State(initialValues = {}) {
    this.state = initialValues.state || '';
    this.errorCode = initialValues.errorCode || 0;
    this.value = initialValues.value || null;
    this.previousState = initialValues.previousState || null;
  }

  function _init() {
    const _ROLL = 'r';

    /* eslint-disable object-property-newline, key-spacing */
    const _category = {
      0: '0',

      1: 'digit', 2: 'digit', 3: 'digit', 4: 'digit', 5: 'digit',
      6: 'digit', 7: 'digit', 8: 'digit', 9: 'digit',

      // d4: 'die', d6: 'die', d8: 'die', d10: 'die', d12: 'die',
      // d20: 'die', 'd%': 'die',
      d: 'die',

      '%': 'die-char', F: 'die-char',

      '+': 'operator', '-': 'operator',

      k:    'k',
      L:    'lh', H: 'lh',

      x:    'x',

      r:    'roll',
    }; /* eslint-enable */


    const _states = { /* eslint-disable key-spacing */
      start:      'start',
      countDigit: 'countDigit',

      die:          'die',
      dieDigit:     'dieDigit',
      specialDie:   'specialDie',

      postDieOp:    'postDieOp',
      postDieDigit: 'postDieDigit',

      k:          'k',
      kOperator:  'kOperator',
      kDigit:     'kDigit',

      lh: 'lh',

      modifierOperator: 'modifierOperator',
      modifierDigit:    'modifierDigit',

      x:      'x',
      xDigit: 'xDigit',

      roll: 'roll',

      error: 'error',

      errorCode: {
        invalidChar: 'invalidChar',
        invalidState: 'invalidState',
        invalidTransition: 'invalidTransition',
      },

    }; /* eslint-enable */


    function _getInitialState() { return new _State({ state: 'start' }); }

    /* eslint-disable indent, key-spacing, no-multi-spaces, max-len */
    const _stateTable = {
start:            { digit: 'countDigit',                  die: 'die' },
countDigit:       { digit: 'countDigit', 0: 'countDigit', die: 'die' },

die:              { digit: 'dieDigit',                'die-char': 'specialDie',                               x: 'dieDigit'              },
dieDigit:         { digit: 'dieDigit', 0: 'dieDigit',                          k: 'k', operator: 'postDieOp', x: 'x',       roll: 'roll' },
specialDie:       {                                                            k: 'k', operator: 'postDieOp', x: 'x',       roll: 'roll' },

postDieOp:        { digit: 'postDieDigit',                    lh: 'lh'                       },
postDieDigit:     { digit: 'postDieDigit', 0: 'postDieDigit', lh: 'lh', x: 'x', roll: 'roll' },

k:                { digit: 'kDigit',              operator: 'kOperator'                              },
kOperator:        { digit: 'kDigit'                                                                  },
kDigit:           { digit: 'kDigit', 0: 'kDigit', operator: 'modifierOperator', x: 'x', roll: 'roll' },

lh:               {                               operator: 'modifierOperator', x: 'x', roll: 'roll' },

modifierOperator: { digit: 'modifierDigit' },
modifierDigit:    { digit: 'modifierDigit', 0: 'modifierDigit', x: 'x', roll: 'roll' },

x:                { digit: 'xDigit'                            },
xDigit:           { digit: 'xDigit', 0: 'xDigit', roll: 'roll' },

roll:             { digit: 'countDigit', die: 'die', roll: 'roll' },

error:            { /* There's no escape, except to delete */ },
    }; /* eslint-enable */

    function _nextState(originalState, chars) {
      let char;
      let charClass;
      let result = new _State(originalState);

      for (
        let i = 0;
        (i < chars.length) && (result.state !== _states.error);
        i++
      ) {
        char = chars.charAt(i);
        charClass = _category[char];

        if (charClass) {
          if (_stateTable[result.state]) {
            if (_stateTable[result.state][charClass]) {
              result = new _State({
                state: _stateTable[result.state][charClass],
                value: char,
                previousState: result.state,
              });
            }
            else {
              result = new _State({
                state: _states.error,
                errorCode: _states.errorCode.invalidTransition,
                value: `[${result.state}, ${char}]`,
                previousState: result.state,
              });
            }
          }
          else {
            result = new _State({
              state: _states.error,
              errorCode: _states.errorCode.invalidState,
              value: result.state,
            });
          }
        }
        else {
          result = new _State({
            state: _states.error,
            errorCode: _states.errorCode.invalidChar,
            value: char,
            previousState: result.state,
          });
        }
      }
      return result;
    }

    function _canRoll(state) {
      return (_nextState(state, _ROLL).state !== _states.error);
    }

    return {
      canRoll: _canRoll,
      getInitialState: _getInitialState,
      nextState: _nextState,
      ROLL: _ROLL,
      State: _State,
      states: _states,
    };
  }

  if (!_instance) {
    _instance = _init();
  }
  return _instance;
})();
