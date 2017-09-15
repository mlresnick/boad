'use strict';

// SETTINGS: Allow user to configure bottom 4 buttons - add/removee/order

const Util = require('./Util.js');
const DS = require('./ds.js');
const stateMachine = require('./state-machine.js');
const Favorites = require('./Favorites.js');
const History = require('./History.js');

// IDEA: Add cursor keys to allow editing of dieSpecHtml
// IDEA: Split view from model
// FIXME: d12 > Roll > + > ⌫ > + doesn't work, need to tap C
// TODO: Look for commented out code that can be removed.
module.exports = (($) => {
  let _instance;

  function _init() {
    const _AUTO = -1;
    const _displayDieSpecEl = $('.display .display-die-spec');
    let _dice;
    const _history = History.getInstance();
    const _favorites = Favorites.getInstance();
    const _util = Util.getInstance();

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

    const UndoStack = (() => {
      const _stack = [stateMachine.getInitialState()];


      function _peek() {
        let result = null;
        if (_stack.length) {
          result = _stack[_stack.length - 1];
        }

        return result;
      }

      function _reinit() { _stack.length = 1; }

      function _pop() { return (_stack.length > 1) ? _stack.pop() : null; }

      function _push(newState) { _stack.push(newState); }

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

    function _getCurrentState() { return _undoStack.peek(); }

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

    function _transitionToNewState(chars) {
      const l = chars.length;
      let newState = new stateMachine.State();
      for (
        let i = 0;
        (i < l) && (newState.state !== stateMachine.states.error);
        i++
      ) {
        const oldState = _getCurrentState();
        const c = chars.charAt(i);
        if (oldState.state !== stateMachine.states.error
            && (oldState !== stateMachine.states.die
                || c !== 'x')) {
          newState = stateMachine.nextState(oldState, c);
          if (newState !== undefined) {
            _undoStack.push(newState);
          }
        }
        else {
          newState = oldState;
        }
      }
      return newState;
    }

    function _enterNew(arg) {
      let displayCategory;
      let text;

      if (arg instanceof jQuery.Event) {
        displayCategory = _util.getTypeFromClass(arg.currentTarget, 'key-');
        text = $(arg.currentTarget).text();
      }
      else {
        displayCategory = arg.type;
        text = arg.value;

      }
      if (text === 'dx') {
        text = 'd';
      }

      const currentState = _getCurrentState();
      const newState = _transitionToNewState(text);

      if (newState.state !== stateMachine.states.error) {

        // Are we starting a new die specification?
        if (currentState.state === stateMachine.states.roll) {
          _clear();
        }

        $(_displayDieSpecEl).append(
          `<span class="display-${displayCategory}">` +
            `${text === 'dx' ? 'd' : text}` +
          '</span>'
        );

        // Test validity of diespec
        if (stateMachine.canRoll(newState)) {
          // Figure out if the favorite symbol should b highlighted.
          _isFavorite(_AUTO);
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
      if (stateMachine.canRoll(currentState)) {

        // If dice were just rolled, remove the old result before creating a new
        // one
        if (currentState.state === stateMachine.states.roll) {
          _undoStack.pop();
          _eraseDisplayResult();
        }

        _transitionToNewState(stateMachine.ROLL);

        _dice = DS($(_displayDieSpecEl).text());
        const result = _dice.roll();
        let resultList = result[0].result.toString(10);
        resultList = result.splice(1).reduce(
          (list, currentResult) =>
            `${list},${currentResult.result}`,
          resultList
        );
        const resultHtml =
          '<span class="display-result">' +
            `${_util.RESULT_SYMBOL}` +
            `<span class="display-result-value">${resultList}</span>` +
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
      if (stateMachine.canRoll(_getCurrentState())) {
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
