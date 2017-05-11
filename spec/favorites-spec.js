/* eslint-env jasmine */

'use strict';

const Nightmare = require('nightmare');
const xutil = require('./util.js');

let nightmare;

describe('favorites tab', () => {

  beforeAll((done) => {
    nightmare = Nightmare({ show: true });
    xutil.init(nightmare);

    return nightmare
    .goto('http://localhost')
    .wait('body')
    .evaluate(() => {
      localStorage.setItem('favorites',
        '[{' +
          '"name":"a",' +
          '"dieSpec":{"parts":[{"type":"die","value":"d4"}]}' +
        '},{' +
          '"name":"b",' +
          '"dieSpec":{"parts":[' +
            '{"type":"digit","value":"5"},' +
            '{"type":"die","value":"d4"}' +
          ']}' +
        '},{' +
          '"name":"c",' +
          '"dieSpec":{"parts":[' +
            '{"type":"digit","value":"5"},' +
            '{"type":"die","value":"d4"},' +
            '{"type":"operator","value":"+"},' +
            '{"type":"digit","value":"1"}' +
          ']}' +
        '},{' +
          '"name":"d",' +
          '"dieSpec":{"parts":[' +
            '{"type":"digit","value":"5"},' +
            '{"type":"die","value":"d4"},' +
            '{"type":"operator","value":"+"},' +
            '{"type":"digit","value":"12"}' +
          ']}' +
        '},{' +
          '"name":"f",' +
          '"dieSpec":{"parts":[' +
            '{"type":"digit","value":"5"},' +
            '{"type":"die","value":"d4"},' +
            '{"type":"operator","value":"+"},' +
            '{"type":"digit","value":"123"}' +
          ']}' +
        '}]'
      );
    })
    .then(() => done());
  });

  beforeEach(done =>
    nightmare
      .goto('http://localhost')
      .wait('body')
      .click('a.tab-link[href="#favorites"]')
      .wait(() => $('#favorites:visible').length > 0)
      .then(() => done())
  );

  it('will change to calculator when a favorite is clicked', (done) => {
    let favoritesPageVersion;

    nightmare.evaluate(() =>
      $('#favorites .list-block li')
      .first()
      .find('.item-subtitle')
      .html()
      .trim()
    )
    .then((html) => {
      favoritesPageVersion = html;
      return nightmare
        .click('#favorites .list-block li a')
        .wait(() => $('#calculator:visible').length !== 0)
        .evaluate(() =>
          $('#calculator .display .display-die-spec')
          .html()
          .trim()
        );
    })
    .then(
      calculatorPageVersion =>
        expect(calculatorPageVersion).toBe(favoritesPageVersion)
    )
    .then(() =>
      nightmare
      .end()
      .then(() => done())
    )
    .catch(xutil.logError);
  });

});
