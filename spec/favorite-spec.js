/* eslint-env jasmine */

'use strict';

const DS = require('../src/js/ds.js');
const Favorite = require('../src/js/favorite.js');

function getArgs(func) {
  // First match everything inside the function argument parens.
  const args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

  // Split the arguments string into an array comma delimited.
  return args.split(',')
    // Ensure no inline comments are parsed and trim the whitespace.
    .map(arg => arg.replace(/\/\*.*\*\//, '').trim())
    // Ensure no undefined values are added.
    .filter(arg => arg);
}
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
    .sort((a, b) => cmp(a, b))
    .map((propertyName) => {
      let value;
      switch(typeof object[propertyName]) {
        case 'string': value = `"${object[propertyName]}"`; break;

        case 'boolean':
        case 'number': value = object[propertyName]; break;

        case 'function': value = `(${getArgs(object[propertyName])})`; break;

        case 'object':
          dumpObject(object[propertyName]);
          value = '';
          break;

        default: value = typeof object[propertyName];
      }
      return `${propertyName}: ${value}`;
    });
  console.log(propertyList.join('\n')); // eslint-disable-line no-console
// console.log(`propertyList.length=${propertyList.length}`);
//   console.log(
//         `window.__nightmare.boadFavoritesModel.findByDieSpec('5d4+12')=${
//     window.__nightmare.boadFavoritesModel
//     .findByDieSpec('5d4+12')}`);
// // console.log(`localStorage.getItem('favorites')=${localStorage.getItem('favorites')}`);
}

function objectCompare(obj1, obj2) {
  // Loop through properties in object 1
  for (const p in obj1) {
    // Check property exists on both objects
    if (Object.prototype.hasOwnProperty.call(obj1, p)
        !== Object.prototype.hasOwnProperty.call(obj2, p)) {
      return false;
    }

    switch(typeof (obj1[p])) {
      // Deep compare objects
      case 'object':
        if (!objectCompare(obj1[p], obj2[p])) {
          return false;
        }
        break;

      // Compare function code
      case 'function':
        if ((typeof (obj2[p]) === 'undefined')
            || ((p !== 'compare')
                && (obj1[p].toString() !== obj2[p].toString()))) {
          return false;
        }
        break;

      // Compare values
      default:
        if (obj1[p] !== obj2[p]) {
          return false;
        }
    }
  }

  // Check object 2 for any extra properties
  for (const p in obj2) {
    if (typeof (obj1[p]) === 'undefined') {
      return false;
    }
  }
  return true;
}

const Favorites = {}; // Mock up the object.
Favorites.reviver = require('../src/js/favorites-reviver.js').reviver;

describe('Favorite object', () => {
  it('can be restored', () => {
    const favoriteListString =
    '[' +
      '{ "name": "First", "dieSpec": "d6" }, ' +
      '{ "name": "Second", "dieSpec": "4d12+2" }, ' +
      '{ "name": "Third", "dieSpec": "4d6-Lx6" }' +
    ']';

    const expectedFavoriteList = [];
    for (const expectedRawValue of [
      { name: 'First', dieSpec: 'd6' },
      { name: 'Second', dieSpec: '4d12+2' },
      { name: 'Third', dieSpec: '4d6-Lx6' },
    ]) {
      const expectedValue = Favorite();
      expectedValue.name = expectedRawValue.name;
      expectedValue.dieSpec = DS(expectedRawValue.dieSpec);
      expectedFavoriteList.push(expectedValue);
    }
    const actualFavoriteList =
      JSON.parse(favoriteListString, Favorites.reviver);
    expect(objectCompare(actualFavoriteList, expectedFavoriteList))
      .toBeTruthy();
  });

  it('can be serialized', () => {
    const favoriteList = [
      { name: 'First', dieSpec: DS('d6') },
      { name: 'Second', dieSpec: DS('4d12+2') },
      { name: 'Third', dieSpec: DS('4d6-Lx6') },
    ];
    const favoriteListString =
    '[' +
      '{"name":"First","dieSpec":"d6"},' +
      '{"name":"Second","dieSpec":"4d12+2"},' +
      '{"name":"Third","dieSpec":"4d6-Lx6"},' +
      '{"name":"Next","dieSpec":"3d10"}' +
    ']';
    const newFavorite = Favorite();
    newFavorite.name = 'Next';
    newFavorite.dieSpec = DS('3d10');
    favoriteList.push(newFavorite);
    expect(JSON.stringify(favoriteList)).toBe(favoriteListString);
  });
});