/* eslint-env jasmine, browser */

'use strict';

const stateMachine = require('../src/js/state-machine.js');

const state = stateMachine.states;

describe('State machine', () => {

  describe('works properly by', () => {

    it('actually imports', () => {
      expect(stateMachine).toBeDefined();
    });

    it('exports list of states', () => {
      expect(stateMachine.states).toBeDefined();
    });

    it('handles a single character', () => {
      const newState = stateMachine.nextState(state.start, 'd');
      expect(newState.state).toBe(state.die);
    });

    it('handles a string of characters', () => {
      expect(stateMachine.nextState(state.start, '4d6').state)
        .toBe(state.dieDigit);
    });

    it('a state object', () => {
      expect(stateMachine.nextState(
          { state: state.start, errorCode: 0, value: '' },
          '4d6'
        ).state)
        .toBe(state.dieDigit);
    });
  });

  describe('fails properly when it', () => {

    it('handles a bad character', () => {
      expect(stateMachine.nextState(state.start, '#')).toEqual({
        state: state.error,
        errorCode: state.errorCode.invalidChar,
        value: '#',
        previousState: undefined,
      });
    });

    it('handles a bad state', () => {
      expect(stateMachine.nextState('#', 'd')).toEqual({
        state: state.error,
        errorCode: state.errorCode.invalidState,
        value: '#',
        previousState: undefined,
      });
    });

    it('handles a bad combination of legal values', () => {
      expect(stateMachine.nextState(state.start, '+')).toEqual({
        state: state.error,
        errorCode: state.errorCode.invalidTransition,
        value: `[${state.start}, +]`,
        previousState: undefined,
      });
    });
  });
});
