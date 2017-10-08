/* eslint-env jasmine */

'use strict';

const testUtil = require('./helpers/util.js');

const Nightmare = require('nightmare');
const Diespec = require('../src/js/diespec.js');

let nightmare;

const initialFavorites = [
  { name: 'a', diespec: '2d4' },
  { name: 'b', diespec: '5d4' },
  { name: 'c', diespec: '5d4+1' },
  { name: 'd', diespec: '5d4+12' },
  { name: 'f', diespec: '5d4+123' },
];

describe('Favorites', () => {
  // let platform;

  function initialize(done, platform) {
    const nightmareOpts = {};
    // nightmareOpts.show = true;
    nightmare = Nightmare(nightmareOpts);
    testUtil.init(nightmare);

    return nightmare
      .goto(testUtil.url, platform ? testUtil.userAgentString(platform) : null)
      .wait('body')
      .evaluate(
        (favorites) => {
          localStorage.setItem('favorites', JSON.stringify(favorites));
        },
        [
          { name: 'a', diespec: '2d4' },
          { name: 'b', diespec: '5d4' },
          { name: 'c', diespec: '5d4-2L+1x2' },
          { name: 'd', diespec: '5d4+12' },
          { name: 'f', diespec: '5d4+123' },
        ]
      )
      .catch(testUtil.logError)
      .then(done);
  }

  describe('model', () => {

    beforeAll(initialize);

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


    it('can find by diespec', (done) => {
      nightmare
        .evaluate(() =>
          JSON.stringify(
            window.__nightmare.boadFavoritesModel.findByDiespec('5d4+12')
          )
        )
        .then((favoriteString) => {
          expect(favoriteString.toString())
            .toBe(JSON.stringify({ name: 'd', diespec: '5d4+12' }));
        })
        .catch(testUtil.logError)
        .then(done);
    });

    it('can tell if a name is in use', (done) => {
      nightmare
        .evaluate(
          () => window.__nightmare.boadFavoritesModel.nameInUse('b')
        )
        .then(result => expect(result).toBe(true))
        .catch(testUtil.logError)
        .then(done);
    });

    it('can tell if a name is NOT in use', (done) => {
      nightmare
        .evaluate(
          () => window.__nightmare.boadFavoritesModel.nameInUse('unused')
        )
        .then(result => expect(result).toBe(false))
        .catch(testUtil.logError)
        .then(done);
    });

    it('can remove an entry', (done) => {
      nightmare
        .evaluate(() => {
          const fname = 'toBeDeleted';
          if (!window.__nightmare.boadFavoritesModel.nameInUse(fname)) {
            window
              .__nightmare
              .boadFavoritesModel
              .setFavorite(fname, '3d20');
            if (!window.__nightmare.boadFavoritesModel.nameInUse(fname)) {
              return Promise.reject('didn\'t add new favorite');
            }
          }

          window.__nightmare.boadFavoritesModel.remove(fname);
          return window.__nightmare.boadFavoritesModel.nameInUse(fname);
        })
        .then(result => expect(result).toBe(false))
        .catch(fail)
        .then(done);

    });
  });

  describe('tab', () => {

    afterAll(done =>
      nightmare
        .end()
        .catch(testUtil.logError)
        .then(done)
    );


    describe('on common platform', () => {

      beforeAll(initialize);

      beforeEach(done =>
        nightmare
          .goto(testUtil.url)
          .wait('body')
          .click('a.tab-link[href="#favorites"]')
          .wait(() => $('#favorites:visible').length > 0)
          .catch(testUtil.logError)
          .then(done)
      );

      it('displays favorites correctly', (done) => {
        nightmare
          .evaluate(() => {
            const el = $('#favorites .list-block ul').children('li').first();
            const diespec = el.find('.item-subtitle');
            return {
              name: el.find('.item-title').text(),
              diespecHtml: diespec && diespec.html().trim(),
            };
          })
          .then((favoriteObj) => {
            expect(favoriteObj.name).toBe(initialFavorites[0].name);
            expect(favoriteObj.diespecHtml)
              .toBe(Diespec(initialFavorites[0].diespec).toHTML());
          })
          .catch(testUtil.logError)
          .then(done);
      });

      it('will change to calculator tab when a favorite is clicked',
        (done) => {

          let favoritesTabVersion;

          nightmare
            .evaluate(() => {
              const h =
                $('#favorites .list-block li:nth-of-type(3)')
                  .find('.item-subtitle')
                  .html();
              return h && h.trim();
            })
            .then((html) => {
              favoritesTabVersion = html;
              return nightmare
                .click('#favorites .list-block li:nth-of-type(3) a')
                .wait(() => $('#calculator:visible').length !== 0)
                .evaluate(() => {
                  const y = $('#calculator .display .display-diespec').html();
                  const x = y && y.trim();
                  return x;
                });
            })
            .then(calculatorTabVersion =>
              expect(calculatorTabVersion).toBe(favoritesTabVersion)
            )
            .catch(testUtil.logError)
            .then(done);
        }
      );

      it('rolls dice', (done) => {
        nightmare
          .click(
            '#favorites .pages .list-block ul li .roll-favorite  ' +
            '.item-content .item-inner'
          )
          .wait(() => $('#calculator:visible').length > 0)
          .evaluate(() => $('#calculator .display-diespec').text())
          .then(diespec => expect(diespec).toBe('2d4'))
          .catch(testUtil.logError)
          .then(done);
      });
    });

    testUtil.supportedOSList.forEach((os) => {

      describe(`on ${os}`, () => {
        const platform = os;

        beforeAll(() => initialize(platform));

        beforeEach(done =>
          nightmare
            .goto(testUtil.url, testUtil.userAgentString(platform))
            .wait('body')
            .click('a.tab-link[href="#favorites"]')
            .wait(() => $('#favorites:visible').length > 0)
            .catch(testUtil.logError)
            .then(done)
        );

        it('changes to edit mode when "edit" is clicked', (done) => {
          nightmare
            .click(`#favorites .link.edit.${platform}`)
            .wait('#favorites .page.edit-mode')
            .catch(testUtil.logError)
            .then(done);
        });

        it('changes back to normal mode when "done" is clicked', (done) => {
          nightmare
            .click(`#favorites .link.edit.${platform}`)
            .wait('#favorites .page.edit-mode')
            .click(`#favorites .link.done.${platform}`)
            .wait('#favorites .page:not(.edit-mode)')
            .catch(testUtil.logError)
            .then(done);
        });

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

        it('changes the name', (done) => {
          nightmare
            .click(`#favorites .link.edit.${platform}`)
            .wait(
              '#favorites .page.edit-mode .list-block ul ' +
              'li:nth-of-type(2) .favorite-edit'
            )
            .click(
              '#favorites .page.edit-mode .list-block ul ' +
              'li:nth-of-type(2) .favorite-edit'
            )
            .wait(() => $('.panel.panel-right.active'))
            .type('.panel.panel-right .item-input input', 'AutoGenned')
            .click('.panel.panel-right a.save')
            .wait('.panel.panel-right:not(.active)')
            .evaluate(() => {
              const favoritesList =
                JSON.parse(localStorage.getItem('favorites'));
              return favoritesList[1];
            })
            .then((obj) => {
              expect(obj)
                .toEqual({ name: 'AutoGenned', diespec: '5d4-2L+1x2' });
            })
            .catch(testUtil.logError)
            .then(done);
        });

      });

    });

    /*
     * NOTE: Nightmare doesn't support drag and drop
     *
    it('supports the rearrangement of favorites', (done) => {
      nightmare
        .catch(testUtil.logError)
        .then(done);
    });
    *
    *
    */

  });

});
