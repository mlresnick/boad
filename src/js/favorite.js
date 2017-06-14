'use strict';

const DS = require('./ds.js');

// eslint-disable-next-line no-unused-vars
function stringify(object, replacer, indent = 2) {
  return JSON.stringify(
    object,
    replacer
    || ((k, v) => ((typeof k === 'function') ? '[function]' : v)),
    indent);
}

module.exports = (function fAvOrItE() {
  let _name = null;
  let _dieSpec = null;

  // XXX:
  // function name(n) {
  //   if (n === undefined) {
  //     return _name;
  //   }
  //   _name = n;
  //   return undefined;
  // }
  //
  // function dieSpec(d) {
  //   if (d === undefined) {
  //     return _dieSpec;
  //   }
  //   _dieSpec = d;
  //   return undefined;
  // }

  function reviver(key, value) {
    let result = value;
    if (key !== ''
        && !Number.isNaN(Number.parseInt(key, 10))
        && (typeof value === 'object')) {
      result = fAvOrItE();
      result.name = value.name;
      result.dieSpec = value.dieSpec;
    }
    else if (key === 'dieSpec') {
      result = DS(value);
    }
    return result;
  }

  // Returns the object as we'd like it to be serialized.
  function toJSON() { return { name: _name, dieSpec: _dieSpec }; }

  function toString() { return JSON.stringify(toJSON()); }

  return {
    // create,
    // dieSpec,
    get dieSpec() { return _dieSpec; },
    set dieSpec(d) { _dieSpec = d; },
    // name,
    get name() { return _name; },
    set name(n) { _name = n; },
    reviver,
    toJSON,
    toString,
  };
}());

  // XXX:
  // function create(arg1, arg2) {
  //   if (arg1 !== undefined) {
  //     /* eslint-disable no-multi-spaces */
  //     switch(typeof arg1) {
  //       case 'string':
  //         try {
  //           const ds = JSON.parse(arg1);
  //           if ((ds.name !== undefined) && (ds.dieSpec !== undefined)) {
  //             name(ds.nam);
  //             dieSpec(DS(ds.dieSpec));
  //           }
  //           else {
  //             name(arg1);
  //           }
  //         }
  //         catch (exception) {
  //           if (!(exception instanceof SyntaxError)) {
  //             throw exception;
  //           }
  //         }
  //         name(arg1);
  //         switch(typeof arg2) {
  //           case 'object':    dieSpec(arg2); break;
  //           case 'undefined':                break;
  //           default:
  //             throw new
  //             Error(`Unexpected type for initDieSpec: "${typeof arg2}"`);
  //         }
  //         break;
  //
  //       case 'object': dieSpec(arg1); break;
  //       case 'undefined':             break;
  //       default:
  //         throw new Error(`Unexpected type for name: "${typeof arg1}"`);
  //     }
  //     /* eslint-enable no-multi-spaces */
  //   }
  // }
