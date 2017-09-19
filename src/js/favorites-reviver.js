'use strict';

const DS = require('./diespec.js');
const Favorite = require('./favorite.js');

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
