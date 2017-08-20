/* eslint-env jasmine, browser */

'use strict';

const stateMachine = require('../src/js/state-machine.js');

const state = stateMachine.states;

describe('State machine', () => {

  const startState =
    new stateMachine.State({ state: stateMachine.states.start });

  describe('properly', () => {

    it('imports as a module', () => {
      expect(stateMachine).toBeDefined();
    });

    it('exports list of states', () => {
      expect(stateMachine.states).toBeDefined();
    });

    it('handles a single character', () => {
      expect(stateMachine.nextState(startState, 'd').state).toBe(state.die);
    });

    it('handles a string of characters', () => {
      expect(stateMachine.nextState(startState, '4d6').state)
        .toBe(state.dieDigit);
    });

    it('return a state object', () => {
      const expectedState = new stateMachine.State({
        state: 'dieDigit',
        value: '6',
        previousState: 'die',
      });

      expect(stateMachine.nextState(startState, '4d6'))
        .toEqual(expectedState);
    });
  });

  describe('fails properly when it', () => {

    it('handles a bad character', () => {
      const expectedState = new stateMachine.State({
        state: state.error,
        errorCode: state.errorCode.invalidChar,
        value: '#',
        previousState: 'start',
      });
      expect(stateMachine.nextState(startState, '#')).toEqual(expectedState);
    });

    it('handles a bad state', () => {
      const initialStste = new stateMachine.State({ state: '#' });

      const expectedState = new stateMachine.State({
        state: state.error,
        errorCode: state.errorCode.invalidState,
        value: '#',
      });

      expect(stateMachine.nextState(initialStste, 'd'))
        .toEqual(expectedState);
    });

    it('handles a bad combination of legal values', () => {
      const expectedState = new stateMachine.State({
        state: state.error,
        errorCode: state.errorCode.invalidTransition,
        value: `[${startState.state}, +]`,
        previousState: stateMachine.states.start,
      });

      expect(stateMachine.nextState(startState, '+'))
        .toEqual(expectedState);
    });
  });
});
