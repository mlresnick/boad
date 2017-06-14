/* eslint-env jasmine */

'use strict';

const Favorite = require('../src/js/favorite.js');

describe('Favorite object', () => {
  it('can be restored', () => {
    const favoriteList = [
      { name: 'First', dieSpec: 'd6' },
      { name: 'Second', dieSpec: '4d12+2' },
      { name: 'Third', dieSpec: '4d6-Lx6' },
    ];
    const favoriteListString = JSON.stringify(favoriteList);
    const list = JSON.parse(favoriteListString, Favorite.reviver);
    expect(JSON.parse(JSON.stringify(list))).toEqual(favoriteList);
  });

  it('can be serialized', () => {
    const favoriteListString =
    '[' +
      '{ "name": "First", "dieSpec": "d6" }, ' +
      '{ "name": "Second", "dieSpec": "4d12+2" }, ' +
      '{ "name": "Third", "dieSpec": "4d6-Lx6" }' +
    ']';
    const expectedFavoriteListString =
    '[' +
      '{"name":"First","dieSpec":"d6"},' +
      '{"name":"Second","dieSpec":"4d12+2"},' +
      '{"name":"Third","dieSpec":"4d6-Lx6"},' +
      '{"name":"Next","dieSpec":"3d10"}' +
    ']';
    const favoriteList = JSON.parse(favoriteListString, Favorite.reviver);
    const newFavorite = Favorite;
    newFavorite.name = 'Next';
    newFavorite.dieSpec = '3d10';
    favoriteList.push(newFavorite);
    expect(JSON.stringify(favoriteList)).toBe(expectedFavoriteListString);
  });
});
