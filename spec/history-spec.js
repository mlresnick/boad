/* eslint-env jasmine */

'use strict';

const testUtil = require('./helpers/util.js');

const Nightmare = require('nightmare');

let nightmare;

let platform;

function initialize() {
  const nightmareOpts = {};
  // nightmareOpts.show = true;
  nightmare = Nightmare(nightmareOpts);
  testUtil.init(nightmare);
}

describe('History', () => {

  describe('model', () => {

    testUtil.supportedOSList.forEach((os) => {

      describe(`on ${os}`, () => {

        platform = os;

        beforeAll(initialize);

        afterAll(done =>
          nightmare
            .end()
            .catch(testUtil.logError)
            .then(done)
        );

        beforeEach((done) => {
          nightmare
            .goto(testUtil.url, testUtil.userAgentString(platform))
            .wait('body')
            .catch(testUtil.logError)
            .then(done);
        });

        it('can traverse values', (done) => {
          nightmare
            .evaluate(() => {
              const result = { reconstructedList: [] };
              result.currentList = JSON.parse(localStorage.getItem('history'));
              window.__nightmare.boadHistoryModel.forEach((entry) => {
                result.reconstructedList.push(entry);
              });
              return result;
            })
            .then(result =>
              expect(result.reconstructedList).toEqual(result.currentList)
            )
            .catch(testUtil.logError)
            .then(done);
        });

        it('can add entries', (done) => {
          const newVals = [
            {
              diespec:
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
              diespec:
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
                    nv.diespec,
                    nv.result,
                    nv.favoriteName
                  );
                }
                else {
                  window
                    .__nightmare
                    .boadHistoryModel
                    .add(nv.diespec, nv.result);
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

                  case 'diespec':
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
            .catch(testUtil.logError)
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
            .catch(testUtil.logError)
            .then(done);
        });

        it('can clear all entries', (done) => {
          nightmare
            .evaluate(() => {
              window.__nightmare.boadHistoryModel.clear();
              return localStorage.getItem('history');
            })
            .then(result => expect(result).toEqual('[]'))
            .catch(testUtil.logError)
            .then(done);
        });
      });
    });
  });

  let originalInfo;

  describe('tab', () => {

    testUtil.supportedOSList.forEach((os) => {

      describe(`on ${os}`, () => {

        platform = os;

        beforeAll(initialize);

        afterAll(done =>
          nightmare
            .end()
            .catch(testUtil.logError)
            .then(done)
        );

        beforeEach(done =>
          nightmare
            .goto(testUtil.url, testUtil.userAgentString(platform))
            .wait('body')
            .catch(testUtil.logError)
            .then(done)
        );


        function generateHistory(countArg) {
          const count = countArg || 5;
          const retVal = [];
          for (let i = 1; i <= count; i++) {

            const digitString = i.toString(10).split().reduce(
              (result, digit) =>
                `${result}<span class="display-digit">${digit}</span>`,
              ''
            );
            const favoriteString = ((i % 3) !== 0) ? '' : `Favorite#${i} - `;
            const diespecString =
              `${favoriteString}` +
              `${digitString}<span class="display-die">d4</span>` +
              `<span class="display-operator">+</span>${digitString}`;
            const resultString =
              '<span class="display-result">' +
                ' ⇒ ' +
                `<span class="display-result-value">${i}</span>` +
              '</span>';

            retVal.push({
              diespec: diespecString,
              result: resultString,
            });
          }
          return retVal;
        }

        function setHistory(done, count) {
          return nightmare
            .evaluate(
              history =>
                localStorage.setItem('history', JSON.stringify(history)),
              generateHistory(count)
            )
            .goto(testUtil.url, testUtil.userAgentString(platform))
            .wait('body')
            .click('a.tab-link[href="#history"]')
            .wait(() => $('#history:visible').length > 0);
        }

        it('displays history correctly', (done) => {
          setHistory(done)
            .evaluate(() => {
              const els = $('#history .list-block ul > li .item-title');
              const retVal = { actual: [], expected: [] };
              els.each((index, el) => {
                retVal.actual.push(el.innerHTML.trim());
              });
              JSON
                .parse(localStorage.getItem('history'))
                .forEach((elt) => {
                  retVal.expected.push(elt.diespec + elt.result);
                });
              return retVal;
            })
            .then((historyList) => {
              expect(JSON.stringify(historyList.actual))
                .toBe(JSON.stringify(historyList.expected));
            })
            .catch(testUtil.logError)
            .then(done);
        });

        it('is internally consistent', (done) => {
          setHistory(done)
            .click('a.tab-link[href="#calculator"]')
            .wait(() => $('#calculator:visible').length > 0)
            .click('a.tab-link[href="#history"]')
            .wait(() => $('#history:visible').length > 0)
            .evaluate(() => {
              const retVal = {};
              retVal.historyLimit =
                JSON.parse(localStorage.getItem('settings')).history.limit;
              retVal.pageEntryCount = $('#history .list-block ul > li').length;
              retVal.history = JSON.parse(localStorage.getItem('history'));
              return retVal;
            })
            .then((info) => {
              // TODO Move this (and the getting of the value) to an outer scope.
              originalInfo = info;
              expect(info.pageEntryCount).toBeLessThan(info.historyLimit);
              // The following is simply a sanity check
              expect(info.pageEntryCount).toBe(info.history.length);
            })
            .catch(testUtil.logError)
            .then(done);
        });

        it('handles a new entry', (done) => {
          setHistory(done)
            .click('a.tab-link[href="#calculator"]')
            .click('#calculator a.key-die-d6')
            .click('#calculator a.key-roll')
            .click('a.tab-link[href="#history"]')
            .evaluate(() => {
              const retVal = {};
              retVal.pageEntryCount = $('#history .list-block ul > li').length;
              retVal.history = JSON.parse(localStorage.getItem('history'));
              return retVal;
            })
            .then((info) => {
              expect(info.pageEntryCount)
                .toBeLessThan(originalInfo.historyLimit);
              expect(info.pageEntryCount).toBe(originalInfo.pageEntryCount + 1);
              expect(info.history.slice(0, -1)).toEqual(originalInfo.history);
            })
            .catch(testUtil.logError)
            .then(done);
        });

        it('Can handle limit - 1', (done) => {
          let historyLimit;

          nightmare
            .evaluate(
              () => JSON.parse(localStorage.getItem('settings')).history.limit
            )
            .then((limit) => { historyLimit = limit; })
            .then(() =>
              setHistory(done, historyLimit - 1)
                .click('a.tab-link[href="#calculator"]')
                .click('#calculator a.key-die-d6')
                .click('#calculator a.key-roll')
                .click('a.tab-link[href="#history"]')
                .evaluate(() => {
                  const retVal = {};
                  retVal.pageEntryCount =
                    $('#history .list-block ul > li').length;
                  retVal.history = JSON.parse(localStorage.getItem('history'));
                  return retVal;
                })
                .then((info) => {
                  expect(info.pageEntryCount).toBe(historyLimit);
                  expect(info.history.length).toBe(historyLimit);
                  expect(info.history.slice(0, -1))
                    .toEqual(generateHistory(historyLimit - 1));
                })
            )
            .catch(testUtil.logError)
            .then(done);
        });

        it('Can handle limit', (done) => {
          let historyLimit;

          nightmare
            .evaluate(
              () => JSON.parse(localStorage.getItem('settings')).history.limit
            )
            .then((limit) => { historyLimit = limit; })
            .then(() =>
              setHistory(done, historyLimit)
                .click('a.tab-link[href="#calculator"]')
                .click('#calculator a.key-die-d6')
                .click('#calculator a.key-roll')
                .click('a.tab-link[href="#history"]')
                .evaluate(() => {
                  const retVal = {};
                  retVal.pageEntryCount =
                    $('#history .list-block ul > li').length;
                  retVal.history = JSON.parse(localStorage.getItem('history'));
                  return retVal;
                })
                .then((info) => {
                  expect(info.pageEntryCount).toBe(historyLimit);
                  expect(info.history.length).toBe(historyLimit);
                  expect(info.history.slice(0, -1))
                    .toEqual(generateHistory(historyLimit).slice(1));
                })
            )
            .catch(testUtil.logError)
            .then(done);
        });

        /*
         * NOTE: Nightmare doesn't support swipe
         *

        it('deletes an entry', (done) => {
          nightmare
            .click(`#favorites .link.edit.${platform}`)
            .wait(
              '#favorites .page.edit-mode .list-block ul ' +
              'li:nth-of-type(2) .favorite-delete'
            )
            .click(
              '#favorites .page.edit-mode .list-block ul ' +
              'li:nth-of-type(2) .favorite-delete'
            )
            .wait(
              '#favorites .page.edit-mode .list-block ul ' +
              'li:nth-of-type(2).swipeout-opened'
            )
            .click(
              '#favorites .page.edit-mode .list-block ul ' +
              'li:nth-of-type(2).swipeout-opened .swipeout-delete'
            )
            .wait(
              '#favorites .page.edit-mode .list-block ul ' +
              'li:nth-of-type(2):not(swipout-opened)'
            )
            .catch(testUtil.logError)
            .then(done);
        });

        *
        */
      });
    });
  });
});


// /*
//  * Fake random async work.  Returns (input + i + " ")
//  */
// function doTheWork(input, i) {
//   // normal async work will probably have its own promise, but we need to create our own:
//   return new Promise((resolve/* , reject */) => {
//     setTimeout(() => {
//       const output = `${(input || '')}${i} `;
//       resolve(output);
//     }, Math.floor(Math.random() * 200) + 1);
//   });
// }
//
// /*
//  * Loops sequentially over async function named doTheWork.  Makes use of array reduce
//  * function to iterate sequentially and feed previous value into next.
//  *
//  * This sequential loop has the advantage of not explicitly using recursion, so it
//  * may be more memory-efficient than the recursive style.  Arguably it is also more readable.
//  */
// function seqLoopReduce(someInput, times) {
//   const arr = new Array(times);
//   // we need to populate the array because Array.reduce will ignore empty elements
//   for (let i = 1; i < times; i++) {
//     arr[i] = i;
//   }
//
//   // curr = current arr value, val = return val from last iteration
//   return arr.reduce(
//     (prev, curr) => prev.then(val => doTheWork(val, curr)),
//     doTheWork(someInput, 0)
//   );
// }
