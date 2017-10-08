/* eslint-env jasmine */

'use strict';

const Nightmare = require('nightmare');
const testUtil = require('./helpers/util.js');

let nightmare;

const diespecSelector = '.display .display-diespec';

describe('Calculator', () => {

  beforeAll((done) => {
    const nightmareOpts = {};
    // nightmareOpts.show = true;
    nightmare = Nightmare(nightmareOpts);
    testUtil.init(nightmare);
    nightmare.then(done);
  });

  afterAll(done =>
    nightmare
      .end()
      .catch(testUtil.logError)
      .then(done)
  );

  beforeEach((done) => {
    nightmare
      .goto(testUtil.url)
      .wait('body')
      .catch(testUtil.logError)
      .then(done);
  });

  function clickButtons(arg) {
    const selectorList = (typeof arg === 'string') ? [arg] : arg;
    const retVal = selectorList.reduce((n, selectorListEl) => {
      const selector =
        (typeof selectorListEl === 'string')
          ? selectorListEl : selectorListEl[0];
      return n.click(`.keypad .key-${selector}`);
    },
    nightmare);
    return retVal;
  }

  function expectedResult(arg) {
    const buttons = (typeof arg === 'string') ? [arg] : arg;
    return buttons.reduce((html, el) => {
      let result;
      const button = (typeof el === 'string') ? el : el[1];

      if (button) {
        const x = button.split('-');
        result =
          `${html}<span class="display-${x[0]}">${x[1] || '-'}</span>`;
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
        .wait(`${diespecSelector} span`)
        .evaluate(ds => $(`${ds} span`)[0].outerHTML, diespecSelector)
        .then(text => expect(text).toBe(expectedResult(button)))
        .catch(testUtil.logError)
        .then(done);
    });

    it('can handle a single die', (done) => {
      const button = 'die-d4';

      clickButtons(button)
        .wait(`${diespecSelector} span`)
        .evaluate(ds => $(`${ds} span`)[0].outerHTML, diespecSelector)
        .then(text => expect(text).toBe(expectedResult(button)))
        .catch(testUtil.logError)
        .then(done);
    });

    it('should handle a dx die', (done) => {
      const buttons =
        ['digit-4', ['die-dx', 'die-d'], 'digit-4', 'digit-4', 'digit-6'];

      clickButtons(buttons)
        .wait(`${diespecSelector} span:nth-of-type(${buttons.length})`)
        .evaluate(ds => $(ds).html(), diespecSelector)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(testUtil.logError)
        .then(done);
    });

    it('should handle a full die specification', (done) => {
      const buttons =
        [
          'digit-4',
          'die-d6',
          'operator--',
          'keep-L',
          'operator-x',
          'digit-6',
        ];

      clickButtons(buttons)
        .wait(`${diespecSelector} span:nth-of-type(${buttons.length})`)
        .evaluate(ds => $(ds).html(), diespecSelector)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(testUtil.logError)
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
        .wait(`${diespecSelector} span:nth-of-type(${buttons.length - 2})`)
        .evaluate(ds => $(ds).html(), diespecSelector)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(testUtil.logError)
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
        .wait(ds => $(ds).children().length === 2, diespecSelector)
        .evaluate(ds => $(ds).html(), diespecSelector)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(testUtil.logError)
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
        .wait(diespecSelector)
        .evaluate(ds => $(ds).html(), diespecSelector)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(testUtil.logError)
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
        .catch(testUtil.logError)
        .then(done);
    });

    it('should handle the Roll key more than once', (done) => {
      const buttons = ['digit-4', 'die-d6', 'operator--', 'keep-L', 'roll'];

      clickButtons(buttons)
        .wait('.display > span:nth-of-type(2)')
        .visible('.display-result')
        .then(isVisible =>
          expect(isVisible)
            .toBeTruthy('because a result is visible after a roll')
        )
        .then(() =>
          nightmare
            .evaluate(() => {
              const info = {};
              info.firstRoll = JSON.parse(localStorage.getItem('history'));
              info.historyLimit =
                JSON.parse(localStorage.getItem('settings')).history.limit;
              return info;
            })
        )
        .then((info) => {
          clickButtons('roll');
          return nightmare
            .evaluate((i) => {
              i.secondRoll = JSON.parse(localStorage.getItem('history'));
              i.newResult = {};
              i.newResult.result =
                $('.display .display-result')[0].outerHTML;
              i.newResult.diespec =
                $('.display > span:not(:last-child)').html();
              return i;
            }, info);
        })
        .then((info) => {
          expect(info.firstRoll.length + 1).toBe(info.secondRoll.length);
          expect(info.secondRoll[info.secondRoll.length - 1])
            .toEqual(info.newResult);
        })
        .catch(testUtil.logError)
        .then(done);
    });

    it('should handle Roll > digit', (done) => {
      const buttons = ['digit-4', 'die-d6', 'operator--', 'keep-L', 'roll'];
      clickButtons(buttons)
        .wait('.display > span:nth-of-type(2)')
        .click('.keypad .key-digit-8')
        .evaluate(() => $('.display').text().trim())
        .then(result => expect(result).toBe('8'))
        .catch(testUtil.logError)
        .then(done);
    });

    it('should handle Roll > delete', (done) => {
      const buttons = ['die-d8', 'operator--', 'digit-1', 'roll'];
      clickButtons(buttons)
        .wait('.display > span:nth-of-type(2)')
        .click('.keypad .key-delete')
        .evaluate(() => $('.display').text().trim())
        .then((result) => {
          expect(result).toBe('d8-1');
          return clickButtons(['operator-x', 'digit-2'])
            .evaluate(() => $('.display').text().trim())
            .then(r => expect(r).toBe('d8-1x2'));
        })
        .catch(testUtil.logError)
        .then(done);
    });

    function enterStuff(args) {
      return clickButtons(args.buttons)
        .wait(args.waitCondition)
        .evaluate(() => $('.display').text().trim())
        .then((actual) => {
          switch(typeof args.expected) {
            case 'string': expect(actual).toBe(args.expected); break;

            case 'object':
              if (args.expected instanceof RegExp) {
                expect(actual).toMatch(args.expected);
              }
              else {
                expect(actual).toEqual(args.expected);
              }
              break;

            default:
              throw Error(`Unexpected datatype for expected value: ${
                typeof args.expecterd
              }`);
          }
        });
    }

    it('should handle Roll > bad-key > delete', (done) => {
      const buttons = ['die-d12', 'roll'];
      enterStuff({
        buttons,
        waitCondition: '.display > span:nth-of-type(2)',
        expected: /d12\s+⇒\s+[1-9]\d*/u,
      })
        .then(() => enterStuff({
          buttons: 'operator-plus',
          waitCondition: 250,
          expected: /d12\s+⇒\s+[1-9]\d*/u,
        }))
        .then(() => enterStuff({
          buttons: 'delete',
          waitCondition: 250,
          expected: 'd12',
        }))
        .catch(testUtil.logError)
        .then(done);
    });

    it('should handle Roll > bad-key > delete > correction', (done) => {
      const buttons = ['die-d12', 'roll'];
      enterStuff({
        buttons,
        waitCondition: '.display > span:nth-of-type(2)',
        expected: /d12\s+\u21d2\s+[1-9]\d*/u,
      })
        .then(() => enterStuff({
          buttons: 'operator-plus',
          waitCondition: 250,
          expected: /d12\s+\u21d2\s+[1-9]\d*/u,
        }))
        .then(() => enterStuff({
          buttons: 'delete',
          waitCondition: 250,
          expected: 'd12',
        }))
        .then(() => enterStuff({
          buttons: ['operator-plus', 'digit-1'],
          waitCondition: 250,
          expected: 'd12+1',
        }))
        .catch(testUtil.logError)
        .then(done);
    });

    it('should handle d12 > delete > d6', (done) => {
      enterStuff({
        buttons: ['die-d12'],
        waitCondition: '.display .display-diespec .display-die',
        expected: 'd12',
      })
        .then(() => enterStuff({
          buttons: 'delete',
          waitCondition: '.display .display-diespec:empty',
          expected: '',
        }))
        .then(() => enterStuff({
          buttons: ['die-d6'],
          waitCondition: '.display .display-diespec .display-die',
          expected: 'd6',
        }))
        .catch(testUtil.logError)
        .then(done);
    });

    it('should handle 4 > d20 > d4 > +', (done) => {
      // This sequqnce contains an error (d4), but should be able to continue
      enterStuff({
        buttons: ['digit-4', 'die-d20'],
        waitCondition: '.display .display-diespec .display-die',
        expected: '4d20',
      })
        .then(() => enterStuff({
          buttons: ['die-d4'],
          waitCondition: '.display .display-diespec .display-die',
          expected: '4d20',
        }))
        .then(() => enterStuff({
          buttons: 'operator-plus',
          waitCondition: '.display .display-operator',
          expected: '4d20+',
        }))
        .catch(testUtil.logError)
        .then(done);
    });

    it('should handle 4 > d20 > d4 > roll', (done) => {
      // This sequqnce contains an error (d4), but should be able to continue
      enterStuff({
        buttons: ['digit-4', 'die-d20'],
        waitCondition: '.display .display-diespec .display-die',
        expected: '4d20',
      })
        .then(() => enterStuff({
          buttons: ['die-d4'],
          waitCondition: '.display .display-diespec .display-die',
          expected: '4d20',
        }))
        .then(() => enterStuff({
          buttons: 'roll',
          waitCondition: '.display .display-result',
          expected: /4d20\s+\u21d2\s+[1-9]\d*/u,
        }))
        .catch(testUtil.logError)
        .then(done);
    });

    it('should allow explode', (done) => {
      enterStuff({
        buttons: 'explode',
        waitCondition: '.display .display-explode',
        expected: '!',
      })
        .catch(testUtil.logError)
        .then(done);
    });

    it('should allow !<count>d<sides>', (done) => {
      enterStuff({
        buttons: ['explode', 'digit-3', 'die-d12'],
        waitCondition: '.display .display-die',
        expected: '!3d12',
      })
        .catch(testUtil.logError)
        .then(done);
    });

    it('should roll !<count>d<sides>', (done) => {
      enterStuff({
        buttons: ['explode', 'digit-3', 'die-d12', 'roll'],
        waitCondition: '.display .display-result',
        expected: /!3d12\s+\u21d2\s+[1-9]\d*/u,
      })
        .catch(testUtil.logError)
        .then(done);
    });

  });

  describe('tab bar', () => {

    it('changes to favorites when link is clicked', (done) => {
      nightmare
        .goto(testUtil.url)
        .wait('body');

      return testUtil.testTabBarLink(nightmare, 'favorites')
        .catch(testUtil.logError)
        .then(done);
    });

    it('changes to history when link is clicked', (done) => {
      nightmare
        .goto(testUtil.url)
        .wait('body');

      return testUtil.testTabBarLink(nightmare, 'history')
        .catch(testUtil.logError)
        .then(done);
    });

  });

  function saveFavorite(args, timeout = 0) {
    return clickButtons(args.buttons)
      .wait(
        subargs => $(subargs.selector).text() === subargs.text,
        { selector: diespecSelector, text: args.favorite.diespec }
      )
      .wait(timeout)
      .click('#calculator .favorite-status')
      .wait('.panel.panel-right.active')
      .type('.panel.panel-right .item-input input', args.favorite.name)
      .click('.panel.panel-right a.save')
      .wait('.panel.panel-right:not(.active)')
      .evaluate(() => JSON.parse(localStorage.getItem('favorites')).pop())
      .then(obj => expect(obj).toEqual(args.favorite));
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
        favorite: { diespec: '4d6-L', name: 'AutoGenned' },
      },
      {
        buttons: [
          ['digit-3', ''],
          ['die-d4', ''],
          ['operator-plus', ''],
          ['digit-3', ''],
        ],
        favorite: { diespec: '3d4+3', name: 'AutoGenned-2' },
      },
    ];

    saveFavorite(b[0])
      .then(() =>
        nightmare
          .wait(() => $('#calculator:visible').length > 0)
          .click('.keypad .key-clear')
          .wait(() => $('#window .display-diespec *').length === 0)
      )
      /*
       * Don't why the timeout is needed. Without it, the click on the favorite
       * star is not seen.
       */
      .then(() => saveFavorite(b[1], 500))
      .catch(testUtil.logError)
      .then(done);
  });

});
