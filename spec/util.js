/* eslint-env jasmine */

'use strict';

// const util = require('./util.js');

module.exports = (() => {

  function _logError(...error) {
    console.error(...error); // eslint-disable-line no-console
  }

  function _init(nightmare) {
    nightmare.on(
      'console',
      // eslint-disable-next-line no-console
      (log, msg) => console.log(`BROWSER CONSOLE(${log}): ${msg}`)
    );
  }

  function _testTabBarLink(nightmare, tabName) {
    return nightmare
      .click(`a.tab-link[href="#${tabName}"]`)
      .wait(tName => ($(`#${tName}:visible`).length) !== 0, tabName)
      .evaluate(tName => $(`#${tName}:visible`).length, tabName)
      .then(length => expect(length).toBe(1));
  }

  return {
    init: _init,
    logError: _logError,
    testTabBarLink: _testTabBarLink,
  };

})();
