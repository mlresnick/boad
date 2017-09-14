/* eslint-env jasmine */

'use strict';

// const util = require('./util.js');

module.exports = (() => {

  function _logError(...error) {
    fail(...error);
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

  function _replaceFunctions(k, v) {
    return (k === 'function') ? '[function]' : v;
  }

  function _stringify(object, replacer = _replaceFunctions, indent = 2) {
    return JSON.stringify(object, replacer, indent);
  }

  return {
    init: _init,
    logError: _logError,
    stringify: _stringify,
    testTabBarLink: _testTabBarLink,
    url: 'http://localhost:8080',
  };

})();
