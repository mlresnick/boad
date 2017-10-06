'use strict';

const Diespec = require('./diespec.js');
const Favorite = require('./favorite.js');

module.exports = (() => {

  function _reviver(key, value) {
    let result = value;
    if (key !== ''
        && !Number.isNaN(Number.parseInt(key, 10))
        && (typeof value === 'object')) {
      // It's an array element.
      result = Favorite(value);
    }
    else if (key === 'diespec') {
      // It's a die spec. Return a die spec object
      result = Diespec(value);
    }
    return result;
  }

  return { reviver: _reviver };
})();
