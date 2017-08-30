'use strict';

// SETTINGS Deal with configuring bottom row on calculator - add/removee/order
// SETTINGS Maybe use list of cards with sections for each page

// funky casing on purpose, now what was the reason?
// module.exports = (function fAvOrItE() {
module.exports = (() => {
  let _name = null;
  let _dieSpec = null;
  let pseudoPrototype = null;

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

  // function reviver(key, value) {
  //   let result = value;
  //   console.log(`key=${key}`);
  //   if (key !== ''
  //       && !Number.isNaN(Number.parseInt(key, 10))
  //       && (typeof value === 'object')) {
  //     // It's an array element.
  //     result = pseudoPrototype();
  //     result.name = value.name;
  //     result.dieSpec = value.dieSpec;
  //   }
  //   else if (key === 'dieSpec') {
  //     // It's a die spec. Return a die spec object
  //     result = DS(value);
  //     console.log(`DS(${value})=${JSON.stringify(result, null, 2)}`);
  //   }
  //   return result;
  // }

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
