'use strict';

// SETTINGS Maybe use list of cards with sections for each page

// TODO: funky casing on purpose, now what was the reason?
// module.exports = (function fAvOrItE() {
module.exports = (() => {
  let _name = null;
  let _dieSpec = null;
  let pseudoPrototype = null;

  // Returns the object as we'd like it to be serialized.
  function toJSON() { return { name: _name, dieSpec: _dieSpec }; }

  function toString() { return JSON.stringify(toJSON()); }

  pseudoPrototype = function () {
    return {
      // create,
      // dieSpec,
      get dieSpec() { return _dieSpec; },
      set dieSpec(d) { _dieSpec = d; },
      // name,
      get name() { return _name; },
      set name(n) { _name = n; },
      // reviver,
      toJSON,
      toString,
    };
  };

  return pseudoPrototype();
});
