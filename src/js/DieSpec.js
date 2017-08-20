'use strict';

const Util = require('./Util.js');

module.exports = ((arg) => {
  const _util = Util.getInstance();

  let _parts;
  let _favorite;

  function _set() {
    if (typeof arg === 'object') {
      _parts = arg.parts;
    }
    else {
      const html = arg;
      _parts = [];
      let currentPart = { type: null, value: null };

      $(html).each((index, node) => {
        if (node.nodeType === node.ELEMENT_NODE) {
          const newType = _util.getTypeFromClass(node, 'display-');
          const newValue = $(node).text();

          if (newType !== currentPart.type) {
            currentPart = { type: newType, value: '' };
            _parts.push(currentPart);
          }
          currentPart.value += newValue;
        }
      });
    }

  }

  function _toString() {
    if (!_parts) {
      return 'NULL';
    }
    return _parts.reduce((result, part) => result.concat(part.value), '')
           + (_favorite ? '*' : '');
  }

  function _html() {
    if (!_parts) {
      return 'NULL';
    }
    // return 'foo';
    return _parts.reduce(
      (result, part) =>
        result.concat(
          `<span class="display-${part.type}">${part.value}</span>`),
      '')
      + (_favorite
        ? '<span class="display-favorite">' +
              '<i class="icon icon-android ion-android-star"></i>' +
              '<i class="icon icon-ios ion-ios-star"></i>' +
            '</span>'
        : '');
  }

  function Walker() {
    this.partIndex = -1;
    this.charIndex = 0;
    this.value = '';
    this.type = '';

    this.next = () => {
      let result = false;
      let value;

      if (this.partIndex === -1
          || (this.charIndex === _parts[this.partIndex].value.length)) {
        this.partIndex += 1;
        this.charIndex = 0;
      }

      if (this.partIndex < _parts.length) {
        if (_parts[this.partIndex].type === 'die') {
          value = _parts[this.partIndex].value;
        }
        else {
          value = _parts[this.partIndex].value.charAt(this.charIndex);
        }
        this.value = {
          type: _parts[this.partIndex].type,
          value,
        };
        this.charIndex += value.length;
        result = true;
      }
      return result;
    };
  }

  function _toObject() { return { parts: _parts }; }

  if (arg) {
    _set();
  }

  return {
    html: _html,
    toString: _toString,
    newWalker: () => new Walker(),
    toObject: _toObject,
  };
});
