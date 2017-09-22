'use strict';

// SETTINGS Maybe use list of cards with sections for each page

module.exports = (() => {
  let _name = null;
  let _diespec = null;
  let _pseudoPrototype = null;

  // Returns the object as we'd like it to be serialized.
  function _toJSON() { return { name: _name, diespec: _diespec }; }

  function _toString() { return JSON.stringify(_toJSON()); }

  _pseudoPrototype = function () {
    return {
      get diespec() { return _diespec; },
      set diespec(d) { _diespec = d; },
      get name() { return _name; },
      set name(n) { _name = n; },
      toJSON: _toJSON,
      toString: _toString(),
    };
  };

  // TODO: is this extra layer necessary?
  return _pseudoPrototype();
});
