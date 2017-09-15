/* eslint-env jasmine */

'use strict';

const Nightmare = require('nightmare');
const util = require('./util.js');

let nightmare;

const dieSpecSelector = '.display .display-die-spec';

describe('Calculator', () => {

  beforeAll((done) => {
    nightmare = Nightmare();
    // nightmare = Nightmare({ show: true });
    util.init(nightmare);
    nightmare.then(done);
  });

  afterAll(done =>
    nightmare
      .end()
      .catch(util.logError)
      .then(done)
  );

  beforeEach((done) => {
    nightmare
      .goto(util.url)
      .wait('body')
      .catch(util.logError)
      .then(done);
  });

  function clickButtons(arg) {
    // let retval;
    const selectorList = (typeof arg === 'string') ? [arg] : arg;
    const retVal = selectorList.reduce((n, selectorListEl) => {
      const selector =
        (typeof selectorListEl === 'string')
          ? selectorListEl : selectorListEl[0];
      return n.click(`.keypad .key-${selector}`);
    },
    nightmare);
    return retVal;
    // selectors.forEach(function (el) {
    //   const selector = (typeof el === 'string') ? el : el[0];
    //   retval = nightmare.click(`.keypad .key-${selector}`);
    // });
    // return retval;
  }

  function expectedResult(arg) {
    const buttons = (typeof arg === 'string') ? [arg] : arg;
    return buttons.reduce((html, el) => {
      let result;
      const button = (typeof el === 'string') ? el : el[1];

      if (button) {
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

  describe('keypad', () => {

    it('can handle a single click', (done) => {
      const button = 'digit-1';

      clickButtons('digit-1')
        .wait(`${dieSpecSelector} span`)
        .evaluate(ds => $(`${ds} span`)[0].outerHTML, dieSpecSelector)
        .then(text => expect(text).toBe(expectedResult(button)))
        .catch(util.logError)
        .then(done);
    });

    it('can handle a single die', (done) => {
      const button = 'die-d4';

      clickButtons(button)
        .wait(`${dieSpecSelector} span`)
        .evaluate(ds => $(`${ds} span`)[0].outerHTML, dieSpecSelector)
        .then(text => expect(text).toBe(expectedResult(button)))
        .catch(util.logError)
        .then(done);
    });

    it('should handle a dx die', (done) => {
      const buttons =
        ['digit-4', ['die-dx', 'die-d'], 'digit-4', 'digit-4', 'digit-6'];

      clickButtons(buttons)
        .wait(`${dieSpecSelector} span:nth-of-type(${buttons.length})`)
        .evaluate(ds => $(ds).html(), dieSpecSelector)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(util.logError)
        .then(done);
    });

    it('should handle a full die specification', (done) => {
      const buttons =
      ['digit-4', 'die-d6', 'operator--', 'keep-L', 'operator-x', 'digit-6'];

      clickButtons(buttons)
        .wait(`${dieSpecSelector} span:nth-of-type(${buttons.length})`)
        .evaluate(ds => $(ds).html(), dieSpecSelector)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(util.logError)
        .then(done);
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
        .wait(`${dieSpecSelector} span:nth-of-type(${buttons.length - 2})`)
        .evaluate(ds => $(ds).html(), dieSpecSelector)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(util.logError)
        .then(done);
    });

    it('should handle a button after the delete button', (done) => {
      const buttons = [
        'digit-4',
        ['die-dx', ''],
        ['digit-4', ''],
        ['digit-4', ''],
        ['delete', ''],
        ['delete', ''],
        ['delete', ''],
        'die-d6',
      ];

      clickButtons(buttons)
        .wait(ds => $(ds).children().length === 2, dieSpecSelector)
        .evaluate(ds => $(ds).html(), dieSpecSelector)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(util.logError)
        .then(done);
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
        .wait(dieSpecSelector)
        .evaluate(ds => $(ds).html(), dieSpecSelector)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(util.logError)
        .then(done);
    });

    it('should handle the Roll key', (done) => {
      const buttons = ['digit-4', 'die-d6', 'operator--', 'keep-L', 'roll'];

      clickButtons(buttons)
        .wait('.display > span:nth-of-type(2)')
        .visible('.display-result')
        .then(isVisible =>
          expect(isVisible)
            .toBeTruthy('because a result is visible after a roll')
        )
        .then(() => nightmare.visible('.display-result-value'))
        .then(isVisible =>
          expect(isVisible)
            .toBeTruthy('because a result value is visible after a roll')
        )
        .then(() =>
          nightmare.evaluate(() => $('.display-result-value').text())
        )
      // 0, positive/negative, possibly comma separated
        .then(text => expect(text).toMatch(
          /^(0|-?[1-9]\d*)(,(0|-?[1-9]\d*))*$/,
          'because the result value is a number'
        ))
        .catch(msg => util.logError(msg))
        .then(done);
    });
  });

  describe('tab bar', () => {

    it('changes to favorites when link is clicked', (done) => {
      nightmare
        .goto(util.url)
        .wait('body');

      return util.testTabBarLink(nightmare, 'favorites')
        .catch(util.logError)
        .then(done);
    });

    it('changes to history when link is clicked', (done) => {
      nightmare
        .goto(util.url)
        .wait('body');

      return util.testTabBarLink(nightmare, 'history')
        .catch(util.logError)
        .then(done);
    });

    // TODO: Roll an 'CdxR' dieSpec
    // TODO: Roll > Roll
    // TODO: Roll > digit
    // TODO: Roll > delete
  });

  function saveFavorite(args, timeout = 0) {
    return clickButtons(args.buttons)
      .wait(
        subargs => $(subargs.selector).text() === subargs.text,
        { selector: dieSpecSelector, text: args.favorite.dieSpec }
      )
      .wait(timeout)
      .click('#calculator .favorite-status')
      .wait('.panel.panel-right.active')
      .type('.panel.panel-right .item-input input', args.favorite.name)
      .click('.panel.panel-right a.save')
      .wait('.panel.panel-right:not(.active)')
      .evaluate(() => JSON.parse(localStorage.getItem('favorites')).pop())
      .then((obj) => { expect(obj).toEqual(args.favorite); });
  }

  it('saves two favorites correctly', (done) => {
    const b = [
      {
        buttons: [
          ['digit-4', ''],
          ['die-d6', ''],
          ['operator--', ''],
          ['keep-L', ''],
        ],
        favorite: { dieSpec: '4d6-L', name: 'AutoGenned' },
      },
      {
        buttons: [
          ['digit-3', ''],
          ['die-d4', ''],
          ['operator-plus', ''],
          ['digit-3', ''],
        ],
        favorite: { dieSpec: '3d4+3', name: 'AutoGenned-2' },
      },
    ];

    saveFavorite(b[0])
      .then(() =>
        nightmare
          .wait(() => $('#calculator:visible').length > 0)
          .click('.keypad .key-clear')
          .wait(() => $('#window .display-die-spec *').length === 0)
      )
      /*
       * Don't why the timeout is needed. Without it, the click on the favorite
       * star is not seen.
       */
      .then(() => saveFavorite(b[1], 500))
      .catch(util.logError)
      .then(done);
  });

});
