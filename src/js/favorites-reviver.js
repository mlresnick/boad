'use strict';

const DS = require('./ds.js');
const Favorite = require('./favorite.js');

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

module.exports = (() => {

  function reviver(key, value) {
    let result = value;
    if (key !== ''
        && !Number.isNaN(Number.parseInt(key, 10))
        && (typeof value === 'object')) {
      // It's an array element.
      result = Favorite();
      result.name = value.name;
      result.dieSpec = value.dieSpec;
    }
    else if (key === 'dieSpec') {
      // It's a die spec. Return a die spec object
      result = DS(value);
    }
    return result;
  }

  return { reviver };
})();
