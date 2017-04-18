/* eslint-env jasmine */

/* eslint-disable func-names, prefer-arrow-callback */

'use strict';

const Nightmare = require('nightmare');

let nightmare;
// XXX: Is this really being used?
const COMMON_TIMEOUT = 3000; // eslint-disable-line no-unused-vars

function newNightmare() {
  return Nightmare({
    // show: true, // Display browser XXX comment out
    // waitTimeout: COMMON_TIMEOUT,
    // gotoTimeout: COMMON_TIMEOUT,
    // loadTimeout: COMMON_TIMEOUT,
    // executionTimeout: COMMON_TIMEOUT,
  });
}

function logError(error) {
  console.log(error); // eslint-disable-line no-console
}

describe('Calculator', function () {

  beforeEach(function () {
    nightmare = newNightmare();
    nightmare.goto('http://localhost').wait('body');
  });

  function clickButtons(arg) {
    let retval;
    const selectors = (typeof arg === 'string') ? [arg] : arg;
    selectors.forEach(function (selector) {
      retval = nightmare.click(`.keypad .key-${selector}`);
    });
    return retval;
  }

  function expectedResult(arg) {
    const buttons = (typeof arg === 'string') ? [arg] : arg;
    return buttons.reduce((html, button) => {
      const x = button.split('-');
      return `${html}<span class="display-${x[0]}">${x[1] || '-'}</span>`;
    },
    '');
  }

  describe('keypad', function () {
    it('can handle a single click', function (done) {
      const button = 'digit-1';

      clickButtons('digit-1')
      .wait('.display .display-die-spec span')
      .evaluate(() => $('.display .display-die-spec span')[0].outerHTML)
      .end()
      .then((text) => {
        expect(text).toBe(expectedResult(button));
        done();
      })
      .catch(logError);
    });
  });

  it('can handle a single die', function (done) {
    const button = 'die-d4';

    clickButtons(button)
    .wait('.display .display-die-spec span')
    .evaluate(() => $('.display .display-die-spec span')[0].outerHTML)
    .end()
    .then((text) => {
      expect(text).toBe(expectedResult(button));
      done();
    })
    .catch(logError);
  });

  it('should handle a full die specification', (done) => {
    const buttons =
    ['digit-4', 'die-d6', 'operator--', 'keep-L', 'operator-x', 'digit-6'];

    clickButtons(buttons)
    .wait(`.display .display-die-spec span:nth-of-type(${buttons.length})`)
    .evaluate(() => $('.display .display-die-spec').html())
    .end()
    .then((text) => {
      expect(text).toBe(expectedResult(buttons));
      done();
    })
    .catch(logError);
  });

  // TODO: dx key works
  // TODO: Delete key works
  // TODO: Clear key works
  // TODO: Roll key
  // TODO: Roll > Roll
  // TODO: Roll > digit
  // TODO: Roll > delete
  // TODO: Favorite key swichtes tab
  // TODO: clicking on favorites icon causes switch
  // TODO: clicking on history icon causes switch
});
