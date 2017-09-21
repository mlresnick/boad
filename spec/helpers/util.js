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

  function _afterAll(done, nightmare) {
    return nightmare
      .end()
      .catch(_logError)
      .then(done);
  }

  return {
    init: _init,
    afterAll: _afterAll,
    logError: _logError,
    stringify: _stringify,
    testTabBarLink: _testTabBarLink,
    url: 'http://localhost:8080',
  };

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
  }

})();
