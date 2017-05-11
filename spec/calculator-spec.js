/* eslint-env jasmine */

/* eslint-disable func-names, prefer-arrow-callback */

'use strict';

const Nightmare = require('nightmare');
const xutil = require('./util.js');

// XXX: Is this really being used?
const COMMON_TIMEOUT = 3000; // eslint-disable-line no-unused-vars

const nightmare = Nightmare({
  // openDevTools: true,
  // show: true, // Display browser XXX comment out
  // waitTimeout: COMMON_TIMEOUT,
  // executionTimeout: COMMON_TIMEOUT,
});
// jasmine.DEFAULT_TIMEOUT_INTERVAL = COMMON_TIMEOUT;

const dieSpec = '.display .display-die-spec';

function logError(error) {
  console.log(error); // eslint-disable-line no-console
}

nightmare.on(
  'console',
  // eslint-disable-next-line no-console
  (log, msg) => console.log(`BROWSER CONSOLE(${log}): ${msg}`)
);

describe('Calculator', function () {

  beforeEach(function () {
    nightmare.goto('http://localhost').wait('body');
  });

  function clickButtons(arg) {
    let retval;
    const selectors = (typeof arg === 'string') ? [arg] : arg;
    selectors.forEach(function (el) {
      const selector = (typeof el === 'string') ? el : el[0];
      retval = nightmare.click(`.keypad .key-${selector}`);
    });
    return retval;
  }

  function expectedResult(arg) {
    const buttons = (typeof arg === 'string') ? [arg] : arg;
    return buttons.reduce((html, el) => {
      let result;
      const button = (typeof el === 'string') ? el : el[1];
      if (button !== '') {
        const x = button.split('-');
        result = `${html}<span class="display-${x[0]}">${x[1] || '-'}</span>`;
      }
      else {
        result = html;
      }
      return result;
    },
    '');
  }

  describe('keypad', function () {

    it('can handle a single click', function (done) {
      const button = 'digit-1';

      clickButtons('digit-1')
      .wait(`${dieSpec} span`)
      .evaluate(ds => $(`${ds} span`)[0].outerHTML, dieSpec)
      .then((text) => {
        expect(text).toBe(expectedResult(button));
        done();
      })
      .catch(logError);
    });

    it('can handle a single die', function (done) {
      const button = 'die-d4';

      clickButtons(button)
      .wait(`${dieSpec} span`)
      .evaluate(ds => $(`${ds} span`)[0].outerHTML, dieSpec)
      .then((text) => {
        expect(text).toBe(expectedResult(button));
        done();
      })
      .catch(logError);
    });

    it('should handle a dx die', (done) => {
      const buttons =
        ['digit-4', ['die-dx', 'die-d'], 'digit-4', 'digit-4', 'digit-6'];

      clickButtons(buttons)
      .wait(`${dieSpec} span:nth-of-type(${buttons.length})`)
      .evaluate(ds => $(ds).html(), dieSpec)
      .then((text) => {
        expect(text).toBe(expectedResult(buttons));
        done();
      })
      .catch(logError);
    });

    it('should handle a full die specification', (done) => {
      const buttons =
      ['digit-4', 'die-d6', 'operator--', 'keep-L', 'operator-x', 'digit-6'];

      clickButtons(buttons)
      .wait(`${dieSpec} span:nth-of-type(${buttons.length})`)
      .evaluate(ds => $(ds).html(), dieSpec)
      .then((text) => {
        expect(text).toBe(expectedResult(buttons));
        done();
      })
      .catch(logError);
    });

    it('should handle the delete button', (done) => {
      const buttons = [
        'digit-4',
        ['die-dx', 'die-d'],
        'digit-4',
        'digit-4',
        ['digit-6', ''],
        ['delete', ''],
      ];

      clickButtons(buttons)
      .wait(
        `${dieSpec} span:nth-of-type(${buttons.length - 2})`
      )
      .evaluate(ds => $(ds).html(), dieSpec)
      .then((text) => {
        expect(text).toBe(expectedResult(buttons));
        done();
      })
      .catch(logError);
    });

    it('should handle the clear key', (done) => {
      const buttons = [
        ['digit-4', ''],
        ['die-d6', ''],
        ['operator--', ''],
        ['keep-L', ''],
        ['operator-x', ''],
        ['digit-6', ''],
        ['clear', ''],
      ];

      clickButtons(buttons)
      .wait(dieSpec)
      .evaluate(ds => $(ds).html(), dieSpec)
      .then((text) => {
        expect(text).toBe(expectedResult(buttons));
        done();
      })
      .catch(logError);
    });

    it('should handle the Roll key', (done) => {
      const buttons = ['digit-4', 'die-d6', 'operator--', 'keep-L', 'roll'];

      clickButtons(buttons)
      .wait('.display > span:nth-of-type(2)')
      .visible('.display-result')
      .then(isVisible => expect(isVisible).toBeTruthy(
        'because a result is visible after a roll'
      ))
      .then(() => nightmare.visible('.display-result-value')
      .then(isVisible => expect(isVisible).toBeTruthy(
        'because a result value is visible after a roll')
      ))
      .then(() => nightmare.evaluate(() => $('.display-result-value').text()))
      // 0, positive/negative, possibly comma separated
      .then(text => expect(text).toMatch(
        /^(0|-?[1-9]\d*)(,(0|-?[1-9]\d*))*$/,
        'because the result value is a number'
      ))
      .catch(msg => logError(msg))
      .then(() => done());
    });

    describe('tab bar', () => {
      it('changes to favorites when link is clicked', (done) => {
        nightmare.goto('http://localhost').wait('body');

        return xutil.testTabBarLink(nightmare, 'favorites', done)
          .catch(xutil.logError);
      });

      it('changes to history when link is clicked', (done) => {
        nightmare.goto('http://localhost').wait('body');

        return xutil.testTabBarLink(nightmare, 'history', done)
          .catch(xutil.logError);
      });
    });

    // TODO: Roll an 'CdxR' dieSpec
    // TODO: Roll > Roll
    // TODO: Roll > digit
    // TODO: Roll > delete
    // TODO: Favorite key swichtes tab
  });

});
