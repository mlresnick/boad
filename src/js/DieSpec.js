'use strict';

module.exports = (() => {
  let _parts;
  let _favorite;

  function _set(arg, isFavorite) {
    if (typeof arg === 'object') {
      _parts = arg._parts;
      _favorite = arg._favorite;
    }
    else {
      const html = arg;
      _parts = [];
      let currentPart = { type: null, value: null };

      $(html).each((index, node) => {
        if (node.nodeType === node.ELEMENT_NODE) {
          const clazz = $(node).attr('class');
          const newType = clazz.substr(8);
          const newValue = $(node).text();

          if (newType !== currentPart.type) {
            currentPart = { type: newType, value: '' };
            _parts.push(currentPart);
          }
          currentPart.value += newValue;
        }
      });

      if (isFavorite) {
        _favorite = true;
      }
    }
  }

  function _isFavorite(value) {
    if (value !== undefined) {
      _favorite = value;
    }
    return (_favorite === true);
  }

  function _toJSON() { return { _parts, _favorite }; }

  function _toString() {
    return _parts.reduce((result, part) => result.concat(part.value), '')
           + (_favorite ? '*' : '');
  }

  function _toHTML() {
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

    this.next = () => {
      let result = false;
      if (this.partIndex === -1
          || (this.charIndex === _parts[this.partIndex].value.length)) {
        this.partIndex += 1;
        this.charIndex = 0;
      }

      if (this.partIndex < _parts.length) {
        if (_parts[this.partIndex].type === 'd') {
          this.value = _parts[this.partIndex].value;
        }
        else {
          this.value = _parts[this.partIndex].value.charAt(this.charIndex);
        }
        this.charIndex += this.value.length;
        result = true;
      }
      return result;
    };
  }

  return {
    set: _set,
    toString: _toString,
    newWalker: () => new Walker(),
    parts: _parts,
    toJSON: _toJSON,
    toHTML: _toHTML,
    isFavorite: _isFavorite,
    type: 'DieSpec',
  };
});
