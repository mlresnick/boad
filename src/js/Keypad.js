'use strict';

// IDEA: Maybe split display into two spans - the diespec and the result.

// TODO Adjust state machine so that after a roll...
// * delete will remove result and last entry in stack
// * entering a digit or a die will cause the current entry to be deleted and the state
//   machine will be reset
const Keypad = (() => {
  let _instance;
  let _dice;
  const _resultSymbol = ' ⇒ ';

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
    const _stack = [{ text: null, decoratedText: null, state: 'count' }];


    function _peek() {
      let result = null;
      if (_stack.length) {
        result = _stack[_stack.length - 1];
      }

      return result;
    }

    function _reinit() { _stack.length = 1; }

    function _pop() {
      let result = null;
      if (_stack.length > 1) {
        result = Array.prototype.pop.call(_stack);
      }

      return result;
    }

    function _push(newText, newDecoratedText, newState) {
      // newState = newState || _stack.peek().state;
      Array.prototype.push.call(
        _stack,
        { text: newText, decoratedText: newDecoratedText, state: (newState || _stack.peek().state) });
    }

    function _toString() {
      let result = '[';
      if (_stack.length > 0) {
        result += JSON.stringify(_stack[0]);
        for (let i = 1; i < _stack.length; i++) {
          result = `${result}, ${JSON.stringify(_stack[i])}`;
        }
      }

      result += ']';
      return result;
    }

    return {
      peek: _peek,
      pop: _pop,
      push: _push,
      reinit: _reinit,
      toString: _toString
    };
  })();

  const _undoStack = UndoStack;

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

    clearTimeout(() => { blink(elem, clazz, times, speed); });

    if (times !== 0) {
      setTimeout(() => { blink(elem, clazz, times, speed); }, speed);
      times -= 0.5; // eslint-disable-line no-param-reassign
    }
  }

  function _eraseDisplayResult() {
    $('.display-result').remove();
  }

  function _clear(showConfirm = true) {
    if (showConfirm) {
      blink('.key-clear', _confirm, 1, 64);
    }

    _undoStack.reinit();
    $('#window').html('');
  }

  function _deleteLast() {
    _undoStack.pop();
    $('.display').children().last().remove();
  }

  function _getNextState(text) {
    const category = _category[text];
    const state = _undoStack.peek().state;
    return _states[state][category];
  }

  function _transitionToState(text, decoratedText) {
    const newState = _getNextState(text);
    if (newState !== undefined) {
      _undoStack.push(text, decoratedText, newState);
    }
    return newState;
  }

  function _enterNew(event) {
    const text = event.target.textContent;
    const oldState = _undoStack.peek().state;
    const newState = _getNextState(text);
    let signal = _error;

    if (newState !== undefined) {
      // Are we starting a new die specification?
      if (oldState === 'roll') {
        _clear(false);
      }
      const displayClass = `display-${_displayClass[_category[text]]}`;
      const decoratedText = `<span class="${displayClass}">${text}</span>`;
      _transitionToState(text, decoratedText);
      $('#window').html($('#window').html() + decoratedText);
      signal = _confirm;
    }

    blink($(event.target).closest('.key'), signal, 1, 64);
  }

  function _roll() {
    let result;
    let decoratedResult;
    const oldState = _undoStack.peek().state;
    const newState = _transitionToState('roll', '');
    const display = $('.display');

    if (newState !== undefined) {
      blink('.key-roll', _confirm, 1, 64);
      _dice = Dice;
      if (oldState === 'roll') {
        _eraseDisplayResult();
      }
      _dice.parse(display.text());
      result = _dice.roll();

      display.append(`<span class="display-result">${_resultSymbol}<span class="display-result-value">${result}</span></span>`);

      rollHistory.add('', display.html(), decoratedResult);
    }
    else {
      blink('.key-roll', _error, 1, 64);
    }
  }

  // IDEA: User setting: length of history - will remove oldest when limit is reached
  // IDEA: Possibly make "k" vs "L/H" a user setting
  // TODO: Allow edit of existing favorite name
  // TODO: Enable Favorites as buttons to roll
  // TODO: Move favorites Delete All to settings
  // TODO: Roll favorite (Fx key)
  // QUESTION: Define both a dark and a light color scheme?
  function _getDieSpecHtml() {
    let dieSpecHtml = '';
    $('.display > span:not(.display-result').each((index, element) => { dieSpecHtml += $(element).html(); });
    return dieSpecHtml;
  }

  function _validateName(name) {
    const keyFavoriteSet = $('.key-favorite-set');
    if (!name) {
      boadApp.alert('Favorite name cannot be blank');
      keyFavoriteSet.click();
    }
    else if (favorites.nameInUse(name)) {
      boadApp.alert(`"${name}" already in use`);
      keyFavoriteSet.click();
    }
    else {
      favorites.add(name, '', _getDieSpecHtml());
    }
  }

// FIXME faorites->Edit->Delete Symbole->Delete Button, sortable handles do not reappear
  function _addFavorite() {
    const state = _undoStack.peek().state;

    // If it's ok to roll at this point, it's ok to save a favorite
    if (_states[state].roll !== undefined) {
      boadApp.prompt(_getDieSpecHtml(), 'Name for favorite?', _validateName);
    }
    else {
      blink('.key-favorite-set', _error, 1, 64);
    }
  }

  function _getInstance() { return _instance; }

  $('.key-d, .key-digit, .key-keep, .key-operation')
    .click(_enterNew);
  $('.key-delete').click(_deleteLast);
  $('.key-roll').click(_roll);
  $('.key-clear').click(_clear);
  $('.key-favorite-set').click(_addFavorite);
  $('a[href="#history"]').click(rollHistory.refreshTab);
  $('a[href="#favorites"]').click(favorites.refreshTab);

  _instance = {
    clear: _clear,
    deleteLast: _deleteLast,
    enterNew: _enterNew,
    // initialize: _initialize,
    roll: _roll,
    // showFavoriteModal: _showFavoriteModal,
    addFavorite: _addFavorite
  };

  return { getInstance: _getInstance };
})();

const keypad = Keypad.getInstance();
