'use strict';

// SETTINGS Maybe use list of cards with sections for each page

module.exports = ((initialValue) => {
  const _value = initialValue || {};

  // Returns the object as we'd like it to be serialized.
  function _toJSON() { return _value; }

  function _toString() { return JSON.stringify(_value); }

  return {
    get diespec() { return _value.diespec; },
    set diespec(diespec) { _value.diespec = diespec; },
    get name() { return _value.name; },
    set name(name) { _value.name = name; },
    toJSON: _toJSON,
    toString: _toString(),
  };
});
