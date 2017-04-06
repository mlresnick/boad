'use strict';

const Util = require('./Util.js');
const Dice = require('./Dice.js');
const Favorites = require('./Favorites.js');
const History = require('./History.js');

// IDEA: Add cursor keys to allow editing of dieSpecHtml
// IDEA: Split view from model

module.exports = (($) => {
  let _instance;

  function _init() {
    const _ROLL = 'roll';
    const _ERROR = 'error';
    const _AUTO = -1;
    const _displayDieSpecEl = $('.display .display-die-spec');
    let _dice;
    const _history = History.getInstance();
    const _favorites = Favorites.getInstance();
    const _util = Util.getInstance();

    /* eslint-disable */
    //
    // [count]die[keep-drop][modifier][repetitions]
    //
    // count = a positive integer
    // die = die-type|dx
    // keep-drop = (k-spec|lh-spec)
    // modifier = ('+'|'-')modifier-value
    // repetitions = 'x'repetition-count
    //
    //   die-type = 'd4'|'d6|'d8'|'d10'|'d12'|'d20'|'d%'
    //   dx = 'dx'side-count
    //   k-spec = 'k'['-']keep-drop-count
    //   lh-spec = ('+'|'-')keep-drop-count('L'|'H')
    //   modifier-value = amount to add or subtract from sum of dice
    //   repetition-count - number of times to repeat the roll
    //
    //     side-count = user defined number of sides
    //     keep-drop-count = integer number of dice to keep/drop
    //       ('k'n)  keep highest n
    //       ('k-'n) drop lowest n
    //       ('-'n'L') drop lowest n
    //       ('-'n'H') drop highest n
    //       ('+'n'L') re-add lowest n
    //       ('+'n'h') re-add highest-n
    //
    const _states = {
      start:            {digit: 'count',            die: 'die',
                                                    dx: 'dx'},
      count:            {digit: 'count',            die: 'die',
                                                    dx: 'dx'},
      die:              {                                      k: 'k',   operator: 'postDieOp',        x: 'x', roll: 'roll'},
      dx:               {digit: 'dxDigit' },
      dxDigit:          {digit: 'dxDigit',                     k: 'k',   operator: 'postDieOp',        x: 'x', roll: 'roll'},
      postDieOp:        {digit: 'postDieDigit',                lh: 'lh'},
      k:                {digit: 'kCount',                                operator: 'kOperator'},
      kOperator:        {digit: 'kCount'},
      kCount:           {digit: 'kCount',                                operator: 'modifierOperator', x: 'x', roll: 'roll'},
      postDieDigit:     {digit: 'postDieDigit',                lh: 'lh',                               x: 'x', roll: 'roll'},
      lh:               {                                                operator: 'modifierOperator', x: 'x', roll: 'roll'},
      modifierOperator: {digit: 'modifierDigit'},
      modifierDigit:    {digit: 'modifierDigit',                                                       x: 'x', roll: 'roll'},
      x:                {digit: 'xDigit'},
      xDigit:           {digit: 'xDigit',                                                                      roll: 'roll'},
      roll:             {digit: 'count',            die: 'die',
                                                    dx: 'dx',                                                  roll: 'roll'},
      error:            { /* There's no escape, except to delete */ }
    };

    const _category = {
      0: 'digit', 1: 'digit', 2: 'digit', 3: 'digit', 4: 'digit',
      5: 'digit', 6: 'digit', 7: 'digit', 8: 'digit', 9: 'digit',

      d4: 'die', d6: 'die', d8: 'die', d10: 'die', d12: 'die',
      d20: 'die', 'd%': 'die',
      d: 'dx',

      '+': 'operator', '-': 'operator',

      k:    'k',
      L:    'lh', H: 'lh',

      x:    'x',

      roll: 'roll',
    };

    const _displayClass = {
      digit: 'digit',

      die: 'die',
      dx:  'die',

      operator: 'operator',
      x:        'operator',

      k:  'keep',
      lh: 'keep'
    };
    /* eslint-enable */

    const UndoStack = (() => {
      const _stack = [{ state: 'count' }];


      function _peek() {
        let result = null;
        if (_stack.length) {
          result = _stack[_stack.length - 1];
        }

        return result;
      }

      function _reinit() { _stack.length = 1; }

      function _pop() { return (_stack.length > 1) ? _stack.pop() : null; }

      function _push(newState) {
        _stack.push({ state: (newState || _peek().state) });
      }

      function _toString() { return JSON.stringify(_stack); }

      return {
        peek: _peek,
        pop: _pop,
        push: _push,
        reinit: _reinit,
        toString: _toString,
      };
    })();

    const _undoStack = UndoStack;

    function _getCurrentState() { return _undoStack.peek().state; }

    function _eraseDisplayResult() {
      return ($('.display-result').remove().length !== 0);
    }

    function _isFavorite(isFavorite) {
      let flag = isFavorite;

      if (isFavorite === undefined) {
        return $('.favorite-status').hasClass('is-favorite');
      }

      if (isFavorite === _AUTO) {
        flag =
          (_favorites.findByDieSpec($('.display .display-die-spec').text())
            !== undefined);
      }

      if (flag) {
        $('.favorite-status').addClass('is-favorite');
      }
      else {
        $('.favorite-status').removeClass('is-favorite');
      }
      return null;
    }

    function _clear() {
      _undoStack.reinit();
      _isFavorite(false);
      $('.display .display-die-spec').children().remove();
      $('.display .display-result').remove();
    }

    function _deleteLast() {
      _undoStack.pop();

      // If there's a result remove it. If not, remove the last die spec bit
      if (!_eraseDisplayResult()) {
        $('.display .display-die-spec :last-child').remove();
      }

      _isFavorite(_AUTO);
    }

    function _getNextState(category) {
      return _states[_getCurrentState()][category];
    }

    function _transitionToNewState(category) {
      const newState =
        (category !== _ERROR) ? _getNextState(category) : _ERROR;

      if (newState !== undefined) {
        _undoStack.push(newState);
      }

      return newState;
    }

    function _enterNew(arg) {
      const categoryMap = {
        die: { dx: 'dx' },
        operator: { x: 'x' },
        keep: { k: 'k', L: 'lh', H: 'lh' },
      };
      let displayCategory;
      let category;
      let text;
      let result = null;

      if (arg instanceof jQuery.Event) {
        displayCategory = _util.getTypeFromClass(arg.currentTarget, 'key-');
        text = arg.target.textContent;
      }
      else {
        displayCategory = arg.type;
        text = arg.value;
      }

      if (categoryMap[displayCategory] && categoryMap[displayCategory][text]) {
        category = categoryMap[displayCategory][text];
      }
      else {
        category = displayCategory;
      }

      const newState = _getNextState(category);

      if (newState !== undefined) {
        // Are we starting a new die specification?
        if (_getCurrentState() === _ROLL) {
          _clear();
        }

        $(_displayDieSpecEl).append(
          `<span class="display-${displayCategory}">` +
            `${text === 'dx' ? 'd' : text}` +
          '</span>'
        );

        // Test validity of diespec
        if (_states[newState].roll !== undefined) {
          const _testDice = Dice();
          result = _testDice.parse($(_displayDieSpecEl).text());
        }

        if (!result) {
          _transitionToNewState(category);
          _isFavorite(_AUTO);
        }
        else {
          _util.boadApp.alert(result, 'BoAD');
          _transitionToNewState(_ERROR);
          $(_displayDieSpecEl).find(':last-child').addClass('invalid');
        }
      }
    }

    function _getDieSpecHtml() {
      return $(_displayDieSpecEl).html();
    }

    function _roll(arg) {
      let favoriteName = null;

      if (arg.dieSpec) {
        favoriteName = arg.name;
        // Feed the spec to the interpreter one character at
        // a time to get to the correct state.
        _clear();
        const c = arg.dieSpec.newWalker();
        while (c.next()) {
          _enterNew(c.value);
        }
      }
      else {
        // It's an event
      }

      const currentState = _getCurrentState();
      const newState = _getNextState(_ROLL);

      if (newState !== undefined) {
        _dice = Dice();

        if (currentState === _ROLL) {
          _undoStack.pop();
          _eraseDisplayResult();
        }

        _transitionToNewState(_ROLL);
        _dice.parse($(_displayDieSpecEl).text());
        const result = _dice.roll();

        const resultHtml =
          '<span class="display-result">' +
  `${_util.RESULT_SYMBOL}<span class="display-result-value">${result}</span>` +
          '</span>';
        $('.display').append(resultHtml);
        _history.add(_getDieSpecHtml(), resultHtml, favoriteName);
      }
    }

    // SETTINGS: Length of history - will remove oldest when limit is reached
    // SETTINGS: Possibly make "k" vs "L/H" a user setting
    // SETTINGS: Move favorites Delete All to settings
    // QUESTION: Define both a dark and a light color scheme?

    function _addFavorite() {
      // If it's ok to roll at this point, it's ok to save a favorite
      if (_states[_getCurrentState()].roll !== undefined) {
        _favorites.add(_getDieSpecHtml());
      }
    }

    $('.key-die, .key-digit, .key-keep, .key-operator')
      .on('click', _enterNew);
    $('.key-delete').on('click', _deleteLast);
    $('.key-roll').on('click', _roll);
    $('.key-clear').on('click', _clear);
    $('.favorite-status').on('click', _addFavorite);

    $(['.keypad .key:not(.key-disabled)', '.favorite-status'])
      .on('mousedown touchstart')
      .addClass('active-state');
    $(['.keypad .key:not(.key-disabled)', '.favorite-status'])
      .on('mouseup touchend')
      .removeClass('active-state');

    return {
      clear: _clear,
      deleteLast: _deleteLast,
      enterNew: _enterNew,
      isFavorite: _isFavorite,
      roll: _roll,
      addFavorite: _addFavorite,
      getDieSpecHtml: _getDieSpecHtml,
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
