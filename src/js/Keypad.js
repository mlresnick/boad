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
    const _ROLL = '<span>roll</span>';
    let _dice;
    const _history = History.getInstance();
    const _favorites = Favorites.getInstance();
    const _util = Util.getInstance();

    /* eslint-disable */
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
      modifierOperator: {digit: 'modifierOperator',                                                    x: 'x'},
      x:                {digit: 'xDigit'},
      xDigit:           {digit: 'xDigit',                                                                      roll: 'roll'},
      roll:             {digit: 'count',            die: 'die',
                                                    dx: 'dx',                                                  roll: 'roll'}
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

      roll: 'roll'
    };

    const _displayClass = {
      digit: 'digit',

      die: 'd',
      dx:  'd',

      operator: 'operation',
      x:        'operation',

      k:  'keep',
      lh: 'keep'
    };
    /* eslint-enable */

    const _confirm = 'confirm';
    const _error = 'error';

    const UndoStack = (() => {
      const _stack = [{ decoratedText: null, state: 'count' }];


      function _peek() {
        let result = null;
        if (_stack.length) {
          result = _stack[_stack.length - 1];
        }

        return result;
      }

      function _reinit() { _stack.length = 1; }

      function _pop() { return (_stack.length > 1) ? _stack.pop() : null; }

      function _push(keyHtml, newState) {
        _stack.push({
          decoratedText: keyHtml,
          state: (newState || _peek().state),
        });
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

    /**
     * TODO Replace blink() with CSS3 animation
     * Purpose: blink a page element
     * Preconditions: the element you want to apply the blink to, the number of times to blink
     * the element (or -1 for infinite times), the speed of the blink
     **/
    function blink(elem, clazz, times, speed) {
      if (times !== 0) {
        if ($(elem).hasClass(clazz)) {
          $(elem).removeClass(clazz);
        }
        else {
          $(elem).addClass(clazz);
        }
      }

      clearTimeout(() => blink(elem, clazz, times, speed));

      if (times !== 0) {
        setTimeout(() => blink(elem, clazz, times, speed), speed);
        times -= 0.5; // eslint-disable-line no-param-reassign
      }
    }

    function _eraseDisplayResult() {
      return ($('.display-result').remove().length !== 0);
    }

    function _clear(showConfirm = true) {
      if (showConfirm) {
        blink('.key-clear', _confirm, 1, 64);
      }

      _undoStack.reinit();
      $('.display').html('<span class="display-die-spec"></span>');
    }

    function _deleteLast() {
      _undoStack.pop();

      // If there's a result remove it. If not, remove the last die spec bit
      if (!_eraseDisplayResult()) {
        $('.display .display-die-spec :last-child').remove();
      }
    }

    function _getNextState(key) {
      const category = _category[$(key).text()];
      return _states[_getCurrentState()][category];
    }

    function _transitionToState(key) {
      const newState = _getNextState(key);

      if (newState !== undefined) {
        _undoStack.push(key, newState);
      }

      return newState;
    }

    function _enterNew(event) {
      const rawText = event.target.textContent;
      const displayClass = `display-${_displayClass[_category[rawText]]}`;
      const key = `<span class="${displayClass}">${rawText}</span>`;

      const currentState = _getCurrentState();
      const newState = _getNextState(key);
      let signal = _error;

      if (newState !== undefined) {
        // Are we starting a new die specification?
        if (currentState === 'roll') {
          _clear(false);
        }

        _transitionToState(key);

        $('.display .display-die-spec').append(key);

        signal = _confirm;
      }

      blink($(event.target).closest('.key'), signal, 1, 64);
    }

    function _getDieSpecHtml() { return $('.display .display-die-spec').html(); }

    function _roll() {
      const currentState = _getCurrentState();
      const newState = _getNextState('<span>roll</span>');
      let feedback = _error;

      if (newState !== undefined) {
        _dice = Dice;

        if (currentState === 'roll') {
          _undoStack.pop();
          _eraseDisplayResult();
        }

        _transitionToState(_ROLL);

        _dice.parse($('.display .display-die-spec').text());
        const result = _dice.roll();

        const resultValueHtml = `<span class="display-result-value">${result}</span>`;
        const resultHtml = `<span class="display-result">${_util.RESULT_SYMBOL}${resultValueHtml}</span>`;
        $('.display').append(resultHtml);

        _history.add(_getDieSpecHtml(), resultValueHtml);

        feedback = _confirm;
      }

      blink('.key-roll', feedback, 1, 64);
    }

    // SETTINGS: Length of history - will remove oldest when limit is reached
    // SETTINGS: Possibly make "k" vs "L/H" a user setting
    // SETTINGS: Move favorites Delete All to settings
    // QUESTION: Define both a dark and a light color scheme?

    function _addFavorite(event) {
      // If it's ok to roll at this point, it's ok to save a favorite
      if (_states[_getCurrentState()].roll !== undefined) {
        _favorites.addFavorite(event, _getDieSpecHtml());
      }
      else {
        blink($(event.currentTarget), _error, 1, 64);
      }
    }

    _favorites.initialize(this);

    $('.key-d, .key-digit, .key-keep, .key-operation')
      .on('click', _enterNew);
    $('.key-delete').on('click', _deleteLast);
    $('.key-roll').on('click', _roll);
    $('.key-clear').on('click', _clear);
    $('.key-favorite-set').on('click', _addFavorite);
    $('a[href="#favorites"]').on('click', _favorites.refreshTab);

    return {
      clear: _clear,
      deleteLast: _deleteLast,
      enterNew: _enterNew,
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
