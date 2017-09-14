/* eslint-env jasmine */

'use strict';

const util = require('../spec/util.js');

// TODO: maybe move this to a new debug/test library library
function dumpObject(object) { // eslint-disable-line no-unused-vars
  function cmp(a, b) {
    let result = 0;
    if (a < b) {
      result = -1;
    }
    else if (a > b) {
      result = 1;
    }
    return result;
  }
  const propertyList = Object.getOwnPropertyNames(object)
    .filter(propertyName =>
      [
        /^AnalyserNode*/,
        /^Animate7*/,
        /^AnimationEvent*/,
        /^ApplicationCache*/,
        /^Array*/,
        /^DOM*/,
        /^Canvas*/,
        /^CSS*/,
        /^on.+/,
        /^RTC*/,
        /^Screen*/,
        /^Presentation*/,
        /^Performance*/,
        /^MIDI*/,
        /^Media*/,
        /^Int*/,
        /^IDB*/,
        /^HTML*/,
        /^WebGL*/,
        /^Uint*/,
        /\*Event$/,
        /^SVG*/,
        /^Text.+/,
        /^WebKit*/,
        /^webkit*/,
        /^Worker/,
        /^XMLDocument/,
        /^XMLHttp*/,
        /^XMLSerializer/,
        /^XPath/,
        /^XSLTProcessor/,
        // /^[A-Z]*/,
      ].find(pattern => pattern.test(propertyName)) === undefined)
    .sort((a, b) => /* cmp(a.toLowerCase(), b.toLocaleLowerCase()) || */
      cmp(a, b));
  console.log(propertyList.join('\n')); // eslint-disable-line no-console
// console.log(`propertyList.length=${propertyList.length}`);
//   console.log(
//         `window.__nightmare.boadFavoritesModel.findByDieSpec('5d4+12')=${
//     window.__nightmare.boadFavoritesModel
//     .findByDieSpec('5d4+12')}`);
// // console.log(`localStorage.getItem('favorites')=${localStorage.getItem('favorites')}`);
}

const Nightmare = require('nightmare');
// const History = require('../src/js/History');
// const util = require('./util.js');
// const favorites = require('../src/js/Favorites.js');

let nightmare;

const initialHistory = [
  {
    dieSpec: 'first - <span class="display-die">d4</span>',
    result:
      '<span class="display-result"> ' +
        '⇒ ' +
        '<span class="display-result-value">2</span>' +
      '</span>',
  },
  {
    dieSpec:
      'second - ' +
      '<span class="display-digit">5</span>' +
      '<span class="display-die">d4</span>',
    result:
      '<span class="display-result"> ' +
        '⇒ ' +
        '<span class="display-result-value">11</span>' +
      '</span>',
  },
  {
    dieSpec:
      'third - ' +
      '<span class="display-digit">5</span>' +
      '<span class="display-die">d4</span>' +
      '<span class="display-operator">+</span>' +
      '<span class="display-digit">1</span>',
    result:
      '<span class="display-result"> ' +
        '⇒ ' +
        '<span class="display-result-value">9</span>' +
      '</span>',
  },
  {
    dieSpec:
      'fourth - ' +
      '<span class="display-digit">5</span>' +
      '<span class="display-die">d4</span>' +
      '<span class="display-digit">+</span>' +
      '<span class="display-digit">1</span>' +
      '<span class="display-digit">2</span>',
    result:
      '<span class="display-result"> ' +
        '⇒ ' +
        '<span class="display-result-value">21</span>' +
      '</span>',
  },
  {
    dieSpec:
      'fifth - ' +
      '<span class="display-digit">5</span>' +
      '<span class="display-die">d4</span>' +
      '<span class="display-operator">+</span>' +
      '<span class="display-digit">1</span>' +
      '<span class="display-digit">2</span>' +
      '<span class="display-digit">3</span>',
    result:
      '<span class="display-result"> ' +
        '⇒ ' +
        '<span class="display-result-value">131</span>' +
      '</span>',
  },
];

const platform = 'ios';
const userAgentString = {
  ios: {
    'User-Agent':
      // eslint-disable-next-line max-len
      'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
  },
  android: {},
};


function initialize(done) {
  nightmare = Nightmare();
  // nightmare = Nightmare({ show: true });
  util.init(nightmare);

  nightmare
    .goto(util.url, userAgentString[platform])
    .wait('body')
    .evaluate(
      (history) => {
        localStorage.setItem('history', JSON.stringify(history));
        // window.__nightmare.boadHistoryModel = localStorage.getItem('history');
      },
      initialHistory
    )
    .catch(util.logError)
    .then(done);
}

describe('history model', () => {
  beforeAll(initialize);

  afterAll(done =>
    nightmare
      .end()
      .catch(util.logError)
      .then(done)
  );

  beforeEach((done) => {
    nightmare
      .goto(util.url, userAgentString[platform])
      .wait('body')
      .catch(util.logError)
      .then(done);
  });

  it('can traverse values', (done) => {
    nightmare
      .evaluate(() => {
        const result = { reconstructedList: [] };
        result.currentList = JSON.parse(localStorage.getItem('history'));
        window.__nightmare.boadHistoryModel.forEach((entry/* , index */) => {
          result.reconstructedList.push(entry);
        });
        return result;
      })
      .then(result =>
        expect(result.reconstructedList).toEqual(result.currentList)
      )
      .catch(util.logError)
      .then(done);
  });

  it('can add entries', (done) => {
    const newVals = [
      {
        dieSpec:
          '<span class="display-die">d6</span>' +
          '<span class="display-operator">+</span>' +
          '<span class="display-digit">1</span>',
        result:
          '<span class="display-result"> ' +
            '⇒ ' +
            '<span class="display-result-value">2</span>' +
          '</span>',
      },
      {
        favoriteName: 'fooFav',
        dieSpec:
          '<span class="display-die">d6</span>' +
          '<span class="display-operator">+</span>' +
          '<span class="display-digit">12</span>',
        result:
          '<span class="display-result"> ' +
            '⇒ ' +
            '<span class="display-result-value">8</span>' +
          '</span>',
      },
    ];

    nightmare
      .evaluate((nvs) => {
        const result = {};
        result.before = JSON.parse(localStorage.getItem('history'));
        nvs.forEach((nv) => {
          if (Object.prototype.hasOwnProperty.call(nv, 'favoriteName')) {
            window.__nightmare.boadHistoryModel.add(
              nv.dieSpec,
              nv.result,
              nv.favoriteName
            );
          }
          else {
            window.__nightmare.boadHistoryModel.add(nv.dieSpec, nv.result);
          }
        });
        result.after = localStorage.getItem('history');
        return result;
      },
      newVals)
      .then((result) => {
        let fn;
        const x = result.before;
        newVals.forEach(nv => x.push(nv));
        expect(result.after).toEqual(JSON.stringify(x, (key, value) => {
          let retVal;
          switch(key) {
            case 'favoriteName':
              fn = value;
              retVal = undefined;
              break;

            case 'dieSpec':
              retVal = value;
              if (fn !== undefined) {
                retVal = `${fn} - ${retVal}`;
                fn = undefined;
              }
              break;

            default:
              retVal = value;
          }
          return retVal;
        }));
      })
      // // .then(() => nightmare.wait(10000))
      .catch(util.logError)
      .then(done);
  });

  it('can delete entry', (done) => {
    const indexes = [1, 4].reverse();
    nightmare
      .evaluate((idxs) => {
        const retVal = {};
        retVal.original = localStorage.getItem('history');
        idxs.forEach(
          index => window.__nightmare.boadHistoryModel.delete(index)
        );
        retVal.updated = localStorage.getItem('history');
        return retVal;
      },
      indexes)
      .then((values) => {
        const expectedValue = JSON.parse(values.original);
        indexes.forEach(index => expectedValue.splice(index, 1));
        expect(values.updated).toEqual(JSON.stringify(expectedValue));
      })
      .catch(util.logError)
      .then(done);
  });

  it('can clear all entries', (done) => {
    nightmare
      .evaluate(() => {
        window.__nightmare.boadHistoryModel.clear();
        return localStorage.getItem('history');
      })
      .then(result => expect(result).toEqual('[]'))
      .catch(util.logError)
      .then(done);
  });
});

describe('history tab', () => {

  beforeAll(initialize);
  afterAll(done => nightmare.end().catch(util.logError).then(done));
  // TODO: Do this everywhere
  // TODO: modify to test android too
  beforeEach(done =>
    nightmare
      .goto(util.url, userAgentString[platform])
      .wait('body')
      .click('a.tab-link[href="#history"]')
      .wait(() => $('#history:visible').length > 0)
      .catch(util.logError)
      .then(done)
  );

  it('displays history correctly', (done) => {
    nightmare
      .evaluate(() => {
        const els = $('#history .list-block ul > li .item-title');
        const retVal = { actual: [], expected: [] };
        els.each((index, el) => {
          retVal.actual.push(el.innerHTML.trim());
        }
        );
        JSON
          .parse(localStorage.getItem('history'))
          .forEach((elt) => {
            retVal.expected.push(elt.dieSpec + elt.result);
          });
        return retVal;
      })
      .then((historyList) => {
        expect(JSON.stringify(historyList.actual))
          .toBe(JSON.stringify(historyList.expected));
      })
      .catch(util.logError)
      .then(done);
  });

  // TODO: Finish - make sure limit - 1 and limit are fine, limit + 1 results in limit.
  // fit('does not display more than the set max', (done) => {
  //   nightmare
  //     .evaluate(() => {
  //       const retVal = {};
  //       retVal.historyLimit =
  //         JSON.parse(localStorage.getItem('settings')).history.limit;
  //       retVal.entryCount = $('#history .list-block ul > li').length;
  //       return retVal;
  //     })
  //     .then((info) => {
  //       expect(info.entryCount).toBeLessThan(info.historyLimit);
  //       return nightmare
  //         .click('a.tab-link[href="#calculator"]')
  //         .wait(() => $('#calculator:visible').length > 0)
  //         // .then(() => console.log('foo ok'), () => console.log('foo err'))
  //         .click('#calculator a.key-die-d6')
  //         .wait(() => $('#window .display-die-spec:visible'))
  //         .then(() => {
  //           for (let i = info.entryCount; i < (info.historyLimit - 1); i++) {
  //             nightmare
  //               .click('#calculator a.key-roll')
  //               .catch(util.logError)
  //               .then(done);
  //           }
  //           return nightmare
  //             .evaluate()
  //         })
  //         // .wait(10000)
  //         // .evaluate(() => {
  //         //   .wait(() => $('#calculator:visible').length > 0)
  //         //   const retVal = {};
  //         //   info.historyLimit =
  //         //     JSON.parse(localStorage.getItem('settings')).history.limit;
  //         //   return retVal;
  //         // })
  //         .catch(util.logError)
  //         .then(done);
  //     })
  //     .catch(util.logError)
  //     .then(done);
  // });

  // TODO: Nightmare doesn't support swipe
  // it('deletes an entry', (done) => {
  //
  //   nightmare
  //     .click(`#favorites .link.edit.${platform}`)
  //     .wait(
  //       '#favorites .page.edit-mode .list-block ul ' +
  //       'li:nth-of-type(2) .favorite-delete'
  //     )
  //     .click(
  //       '#favorites .page.edit-mode .list-block ul ' +
  //       'li:nth-of-type(2) .favorite-delete'
  //     )
  //     .wait(
  //       '#favorites .page.edit-mode .list-block ul ' +
  //       'li:nth-of-type(2).swipeout-opened'
  //     )
  //     .click(
  //       '#favorites .page.edit-mode .list-block ul ' +
  //       'li:nth-of-type(2).swipeout-opened .swipeout-delete'
  //     )
  //     .wait(
  //       '#favorites .page.edit-mode .list-block ul ' +
  //       'li:nth-of-type(2):not(swipout-opened)'
  //     )
  //     .catch(util.logError)
  //     .then(done);
  // });
});
