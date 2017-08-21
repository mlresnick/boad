/* eslint-env jasmine */

'use strict';

const util = require('../spec/util.js');

// TODO: Put this in a central location, but not in js/Util.js...
// That file can't be used for local testing (that is, without Nightmare)
function replaceFunctions(k, v) {
  return (k === 'function') ? '[function]' : v;
}
// eslint-disable-next-line no-unused-vars
function stringify(object, replacer = replaceFunctions, indent = 2) {
  return JSON.stringify(object, replacer, indent);
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

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
//         `window.boadFavoritesModel.findByDieSpec('5d4+12')=${
//     window.boadFavoritesModel
//     .findByDieSpec('5d4+12')}`);
// // console.log(`localStorage.getItem('favorites')=${localStorage.getItem('favorites')}`);
}

const Nightmare = require('nightmare');
const DS = require('../src/js/ds');
// const util = require('./util.js');
// const favorites = require('../src/js/Favorites.js');

let nightmare;

const initialFavorites = [
  { name: 'a', dieSpec: 'd4' },
  { name: 'b', dieSpec: '5d4' },
  { name: 'c', dieSpec: '5d4+1' },
  { name: 'd', dieSpec: '5d4+12' },
  { name: 'f', dieSpec: '5d4+123' },
];

const platform = 'ios';
const userAgentString = {};
userAgentString.ios = {
  'User-Agent':
    // eslint-disable-next-line max-len
    'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
};


function initialize(done) {
  // nightmare = Nightmare();
  nightmare = Nightmare({ show: true });
  util.init(nightmare);

  return nightmare
    .goto(util.url, userAgentString[platform])
    .wait('body')
    .evaluate(
      (favorites) => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
      },
      [
        { name: 'a', dieSpec: 'd4' },
        { name: 'b', dieSpec: '5d4' },
        { name: 'c', dieSpec: '5d4+1' },
        { name: 'd', dieSpec: '5d4+12' },
        { name: 'f', dieSpec: '5d4+123' },
      ]
    )
    .catch(util.logError)
    .then(done);
}

describe('favorites model', () => {
  beforeAll(initialize);
  afterAll(done => nightmare.end().catch(util.logError).then(done));

  beforeEach((done) => {
    nightmare
      .goto(util.url, userAgentString[platform])
      .wait('body')
      .catch(util.logError)
      .then(done);
  });


  it('can find by dieSpec', (done) => {
    nightmare
      .evaluate(() =>
        JSON.stringify(window.boadFavoritesModel.findByDieSpec('5d4+12'))
      )
      .then((favoriteString) => {
        expect(favoriteString.toString())
          .toBe(JSON.stringify({ name: 'd', dieSpec: '5d4+12' }));
      })
      .catch(util.logError)
      .then(done);
  });

  it('can tell if a name is in use', (done) => {
    nightmare
      .evaluate(() => window.boadFavoritesModel.nameInUse('b'))
      .then(result => expect(result).toBe(true))
      .catch(util.logError)
      .then(done);
  });

  it('can tell if a name is NOT in use', (done) => {
    nightmare
      .evaluate(() => window.boadFavoritesModel.nameInUse('unused'))
      .then(result => expect(result).toBe(false))
      .catch(util.logError)
      .then(done);
  });

  it('can remove an entry', (done) => {
    nightmare
      .evaluate(() => {
        const fname = 'toBeDeleted';
        if (!window.boadFavoritesModel.nameInUse(fname)) {
          window.boadFavoritesModel.setFavorite(fname, '3d20');
          if (!window.boadFavoritesModel.nameInUse(fname)) {
            return Promise.reject('didn\'t add new favorite');
          }
        }

        window.boadFavoritesModel.remove(fname);
        return window.boadFavoritesModel.nameInUse(fname);
      })
      .then(result => expect(result).toBe(false))
      .catch(fail)
      .then(done);

  });
  /*
  validateAndSave: _validateAndSave,

  delete: _model.delete,
  findByDieSpec: _model.findByDieSpec,
  initialize: _model.initialize,
  nameInUse: _model.nameInUse,
  */
});

describe('favorites tab', () => {

  beforeAll(initialize);
  afterAll(done => nightmare.end().catch(util.logError).then(done));
  // TODO: Do this everywhere
  // TODO: modify to test android too
  beforeEach(done =>
    nightmare
      .goto(util.url, userAgentString[platform])
      // XXX
      // .goto(util.url, {
      //   // eslint-disable-next-line max-len
      //   'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
      // })
      .wait('body')
      .click('a.tab-link[href="#favorites"]')
      .wait(() => $('#favorites:visible').length > 0)
      .catch(util.logError)
      .then(done)
  );


  it('displays favorites correctly', (done) => {
    nightmare
      .evaluate(() => {
        const el = $('#favorites .list-block ul').children('li').first();
        const dieSpec = el.find('.item-subtitle');
        return {
          name: el.find('.item-title').text(),
          dieSpecHtml: dieSpec && dieSpec.html().trim(),
        };
      })
      .then((favoriteObj) => {
        expect(favoriteObj.name).toBe(initialFavorites[0].name);
        expect(favoriteObj.dieSpecHtml)
          .toBe(DS(initialFavorites[0].dieSpec).toHTML());
      })
      .catch(util.logError)
      .then(done);
  });

  it('will change to calculator tab when a favorite is clicked', (done) => {

    let favoritesTabVersion;

    nightmare
      .evaluate(() => {
        const h =
          $('#favorites .list-block li').first().find('.item-subtitle').html();
        return h && h.trim();
      })
      .then((html) => {
        favoritesTabVersion = html;
        return nightmare
          .click('#favorites .list-block li a')
          .wait(() => $('#calculator:visible').length !== 0)
          .evaluate(() => {
            const y = $('#calculator .display .display-die-spec').html();
            const x = y && y.trim();
            // console.log(`x=${x}`);
            return x;
          });
      })
      .then(calculatorTabVersion =>
        expect(calculatorTabVersion).toBe(favoritesTabVersion)
      )
      .catch(util.logError)
      .then(done);
  });

  it('changes to edit mode when "edit" is clicked', (done) => {
    nightmare
      .click(`#favorites .link.edit.${platform}`)
      .wait('#favorites .page.edit-mode')
      .catch(util.logError)
      .then(done);
  });

  it('changes back to normal mode when "done" is clicked', (done) => {
    nightmare
      .click(`#favorites .link.edit.${platform}`)
      .wait('#favorites .page.edit-mode')
      .click(`#favorites .link.done.${platform}`)
      .wait('#favorites .page:not(.edit-mode)')
      .catch(util.logError)
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
      .catch(util.logError)
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
        const favoritesList = JSON.parse(localStorage.getItem('favorites'));
        return favoritesList[1];
      })
      .then((obj) => {
        expect(obj).toEqual({ name: 'AutoGenned', dieSpec: '5d4+1' });
      })
      .catch(util.logError)
      .then(done);
  });

  it('rolls dice', (done) => {
    nightmare
      .click(
        '#favorites .pages .list-block ul li .roll-favorite .item-content ' +
        '.item-inner'
      )
      .wait(() => $('#calculator:visible').length > 0)
      .evaluate(() => $('#calculator .display-die-spec').text())
      .then(dieSpec => expect(dieSpec).toBe('d4'))
      // .then(() => nightmare.wait(10000))
      .catch(util.logError)
      .then(done);
  });


  // Nightmare.js dioes n it support drag and drop
  xit('supports the rearrangement of favorites', (done) => {
    nightmare
      .catch(util.logError)
      .then(done);
  });
});
