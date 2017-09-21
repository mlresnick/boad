'use strict';

// SETTINGS Maybe use list of cards with sections for each page

// TODO: funky casing on purpose, now what was the reason?
// module.exports = (function fAvOrItE() {
module.exports = (() => {
  let _name = null;
  let _diespec = null;
  let pseudoPrototype = null;

  // Returns the object as we'd like it to be serialized.
  function toJSON() { return { name: _name, diespec: _diespec }; }

  function toString() { return JSON.stringify(toJSON()); }

  pseudoPrototype = function () {
    return {
      // create,
      // diespec,
      get diespec() { return _diespec; },
      set diespec(d) { _diespec = d; },
      // name,
      get name() { return _name; },
      set name(n) { _name = n; },
      // reviver,
      toJSON,
      toString,
    };
  };

  // TODO: is this extra layer necessary?
  return pseudoPrototype();
});
