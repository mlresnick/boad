/* eslint-env jasmine */

/* eslint-disable func-names, prefer-arrow-callback */

'use strict';

const Nightmare = require('nightmare');
const util = require('./util.js');

let nightmare;

const dieSpec = '.display .display-die-spec';
// TODO: rearrange nightmare calls so end() is called in after all
describe('Calculator', function () {

  beforeAll((done) => {
    // TODO:
    nightmare = Nightmare();
    // nightmare = Nightmare({ show: true });
    util.init(nightmare);
    nightmare.then(done);
  });

  beforeEach(function (done) {
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

  describe('keypad', function () {

    it('can handle a single click', function (done) {
      const button = 'digit-1';

      clickButtons('digit-1')
        .wait(`${dieSpec} span`)
        .evaluate(ds => $(`${ds} span`)[0].outerHTML, dieSpec)
        .then(text => expect(text).toBe(expectedResult(button)))
        .catch(util.logError)
        .then(done);
    });

    it('can handle a single die', function (done) {
      const button = 'die-d4';

      clickButtons(button)
        .wait(`${dieSpec} span`)
        .evaluate(ds => $(`${ds} span`)[0].outerHTML, dieSpec)
        .then(text => expect(text).toBe(expectedResult(button)))
        .catch(util.logError)
        .then(done);
    });

    it('should handle a dx die', (done) => {
      const buttons =
        ['digit-4', ['die-dx', 'die-d'], 'digit-4', 'digit-4', 'digit-6'];

      clickButtons(buttons)
        .wait(`${dieSpec} span:nth-of-type(${buttons.length})`)
        .evaluate(ds => $(ds).html(), dieSpec)
        .then(text => expect(text).toBe(expectedResult(buttons)))
        .catch(util.logError)
        .then(done);
    });

    it('should handle a full die specification', (done) => {
      const buttons =
      ['digit-4', 'die-d6', 'operator--', 'keep-L', 'operator-x', 'digit-6'];

      clickButtons(buttons)
        .wait(`${dieSpec} span:nth-of-type(${buttons.length})`)
        .evaluate(ds => $(ds).html(), dieSpec)
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
        .wait(`${dieSpec} span:nth-of-type(${buttons.length - 2})`)
        .evaluate(ds => $(ds).html(), dieSpec)
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
        .wait(ds => $(ds).children().length === 2, dieSpec)
        .evaluate(ds => $(ds).html(), dieSpec)
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
        .wait(dieSpec)
        .evaluate(ds => $(ds).html(), dieSpec)
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
    // TODO: Favorite key swichtes tab
  });

  // function saveFavorite(favoriteName, favoriteDieSpec) {
  //   return nightmare
  //   .wait(
  //     displayDieSpec => $(displayDieSpec).children('span').length === 4,
  //     dieSpec)
  //   .then(() => {
  //     console.log('about to click favorite start');
  //     return nightmare;
  //   })
  //   .click('#calculator .favorite-status')
  //   .wait(() => $('.panel.panel-right.active'))
  //   .type('.panel.panel-right .item-input input', favoriteName)
  //   .click('.panel.panel-right a.save')
  //   .wait('.panel.panel-right:not(.active)')
  //   .evaluate(() => {
  //     const favoritesList = JSON.parse(localStorage.getItem('favorites'));
  //     console.log(`favoritesList[${favoritesList.length - 1}]=${
  //       favoritesList[favoritesList.length - 1]}`);
  //     return favoritesList[favoritesList.length - 1];
  //   })
  //   .then(obj =>
  //     expect(obj)
  //     .toEqual({ name: favoriteName, dieSpec: favoriteDieSpec })
  //   );
  // }


  it('saves two favorites correctly', (done) => {
    const buttons = [[
      ['digit-4', ''],
      ['die-d6', ''],
      ['operator--', ''],
      ['keep-L', ''],
    ],
    [
      ['digit-3', ''],
      ['die-d4', ''],
      ['operator-plus', ''],
      ['digit-3', ''],
    ]];
    clickButtons(buttons[0])
    // .then(() => {    //   saveFavorite('AutoGenned', '4d6-L');    // })
      .wait(
        displayDieSpec => $(displayDieSpec).children('span').length === 4,
        dieSpec)
      .click('#calculator .favorite-status')
      .wait(() => $('.panel.panel-right.active'))
      .type('.panel.panel-right .item-input input', 'AutoGenned')
      .click('.panel.panel-right a.save')
      .wait('.panel.panel-right:not(.active)')
      .evaluate(() => {
        const favoritesList = JSON.parse(localStorage.getItem('favorites'));
        return favoritesList[favoritesList.length - 1];
      })
      .then((obj) => {
        expect(obj).toEqual({ name: 'AutoGenned', dieSpec: '4d6-L' });
      })
      .then(() =>
        nightmare
          .wait(() => $('#calculator:visible').length > 0)
          .click('.keypad .key-clear')
          .wait(() => $('#window .display-die-spec *').length === 0)
          .then(() =>
            clickButtons(buttons[1])
              .wait(
                displayDieSpec =>
                  $(displayDieSpec).children('span').length === 4,
                dieSpec
              )
              // FIXME: The following shouldn't be necessary.
              //        What do we really need to wait for?
              .wait(1000)
              .click('#calculator .favorite-status')
              .wait(() => $('.panel.panel-right.active'))
              .type('.panel.panel-right .item-input input', 'AutoGenned-2')
              .click('.panel.panel-right a.save')
              .wait('.panel.panel-right:not(.active)')
              // .wait(10000)
              .evaluate(() => {
                const favoritesList =
                JSON.parse(localStorage.getItem('favorites'));
                return favoritesList[favoritesList.length - 1];
              })
              .then(obj =>
                expect(obj).toEqual({ name: 'AutoGenned-2', dieSpec: '3d4+3' })
              )
              .catch(util.logError)
              .then(done)
          )
          .catch(util.logError)
          .then(done)
      )
      .catch(util.logError)
      .then(done);
  });

});
