/* eslint-env jasmine */

'use strict';

const DS = require('../src/js/ds.js');

describe('New dice-spec class', () => {
  it('can be referenced as a module', () => {
    expect(DS).toBeDefined();
  });

  describe('parsing', () => {

    function test(dieSpecString, differentExpected) {
      expect(DS(dieSpecString).toString())
        .toBe(differentExpected || dieSpecString);
    }

    it('supports a simple die', () => test('d4'));
    it('supports a count', () => test('3d6'));
    it('supports a modifer', () => { test('d8+2'); test('d8-4'); });

    it('supports keep', () => {
      test('5d10k2');
      test('3d8k-2');
      test('4d12k+1', '4d12k1');
    });

    it('supports L/H', () => {
      test('4d6-L');
      test('5d10+L');
      test('5d10-1L', '5d10-L');
      test('5d10+1L', '5d10+L');
      test('8d4-2L');
      test('8d46+2L');
      test('3d4-H');
      test('5d6+H');
      test('3d4-1H', '3d4-H');
      test('5d6+1H', '5d6+H');
      test('8d4-2H');
      test('8d46+2H');
    });

    it('supports x', () => {
      test('d12x3');
      test('d4x11');
    });

    it('supports complicated specs', () => {
      test('4d6-L+2x3');
      test('40d6k10-5x6');
    });

    it('support special Dice', () => {
      test('d%');
      test('dF');

      test('4d%-2L+3x2');
      test('4dF-2L+3x2');
    });
  });

  describe('can roll', () => {

    const mockRandomizer = {
      random: () => 0,
      random2: () => 0,
      random3: () => 0,
      random4: () => 0,
    };

    describe('a simple die', () => {
      beforeEach(() => {
        spyOn(mockRandomizer, 'random').and.returnValue(2 / 4);
      });

      it('(d4)', () => {
        const ds = DS('d4');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [{ roll: 2, adjust: 0 }],
          result: 2,
        }]);
      });
    });

    describe('multple dice', () => {
      beforeEach(() => {
        spyOn(mockRandomizer, 'random').and.returnValues(
          (2 / 6), (5 / 6), (6 / 6)
        );
      });

      it('(3d6)', () => {
        const ds = DS('3d6');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 2, adjust: 0 },
            { roll: 5, adjust: 0 },
            { roll: 6, adjust: 0 },
          ],
          result: 13,
        }]);
      });
    });

    describe('multple dice with modifier', () => {
      beforeEach(() => {
        spyOn(mockRandomizer, 'random').and.returnValues(
          (8 / 8), (4 / 8), (3 / 8)
        );
        spyOn(mockRandomizer, 'random2').and.returnValues(
          (4 / 10), (2 / 10), (1 / 10)
        );
      });

      it('(3d8+2)', () => {
        const ds = DS('3d8+2');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 8, adjust: 0 },
            { roll: 4, adjust: 0 },
            { roll: 3, adjust: 0 },
          ],
          result: 17,
        }]);
      });

      it('(3d10-2)', () => {
        const ds = DS('3d10-2');
        ds.setRandom(mockRandomizer.random2);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 4, adjust: 0 },
            { roll: 2, adjust: 0 },
            { roll: 1, adjust: 0 },
          ],
          result: 5,
        }]);
      });
    });

    describe('dice with "k"', () => {
      beforeEach(() => {
        spyOn(mockRandomizer, 'random').and.returnValues(
          (4 / 6), (2 / 6), (1 / 6), (6 / 6)
        );
      });

      it('(4d6k3)', () => {
        const ds = DS('4d6k3');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 4, adjust: 0 },
            { roll: 2, adjust: 0 },
            { roll: 1, adjust: -1 },
            { roll: 6, adjust: 0 },
          ],
          result: 12,
        }]);
      });

      it('(4d6k-1)', () => {
        const ds = DS('4d6k-1');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 4, adjust: 0 },
            { roll: 2, adjust: 0 },
            { roll: 1, adjust: -1 },
            { roll: 6, adjust: 0 },
          ],
          result: 12,
        }]);
      });
    });

    describe('dice with "-L/-H"', () => {
      beforeEach(() => {
        spyOn(mockRandomizer, 'random').and.returnValues(
          (4 / 12), (2 / 12), (1 / 12), (6 / 12), (3 / 12)
        );
        spyOn(mockRandomizer, 'random2').and.returnValues(
          (6 / 12), (10 / 12), (2 / 12), (8 / 12), (4 / 12)
        );
        spyOn(mockRandomizer, 'random3').and.returnValues(
          (10 / 20), (15 / 20), (2 / 20), (5 / 20), (17 / 20)
        );
        spyOn(mockRandomizer, 'random4').and.returnValues(
          (17 / 20), (5 / 20), (2 / 20), (15 / 20), (10 / 20)
        );
      });
      it('(5d12-L)', () => {
        const ds = DS('5d12-L');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 4, adjust: 0 },
            { roll: 2, adjust: 0 },
            { roll: 1, adjust: -1 },
            { roll: 6, adjust: 0 },
            { roll: 3, adjust: 0 },
          ],
          result: 15,
        }]);
      });

      it('(4d12-2L)', () => {
        const ds = DS('5d12-2L');
        ds.setRandom(mockRandomizer.random2);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 6, adjust: 0 },
            { roll: 10, adjust: 0 },
            { roll: 2, adjust: -1 },
            { roll: 8, adjust: 0 },
            { roll: 4, adjust: -1 },
          ],
          result: 24,
        }]);
      });

      it('(5d20-H)', () => {
        const ds = DS('5d20-H');
        ds.setRandom(mockRandomizer.random3);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 10, adjust: 0 },
            { roll: 15, adjust: 0 },
            { roll: 2, adjust: 0 },
            { roll: 5, adjust: 0 },
            { roll: 17, adjust: -1 },
          ],
          result: 32,
        }]);
      });

      it('(5d20-2H)', () => {
        const ds = DS('5d20-2H');
        ds.setRandom(mockRandomizer.random4);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 17, adjust: -1 },
            { roll: 5, adjust: 0 },
            { roll: 2, adjust: 0 },
            { roll: 15, adjust: -1 },
            { roll: 10, adjust: 0 },
          ],
          result: 17,
        }]);
      });
    });

    describe('dice with "+L/+H"', () => {
      beforeEach(() => {
        spyOn(mockRandomizer, 'random').and.returnValues(
          (17 / 20), (5 / 20), (2 / 20), (15 / 20), (10 / 20)
        );
        spyOn(mockRandomizer, 'random2').and.returnValues(
          (10 / 20), (15 / 20), (2 / 20), (5 / 20), (17 / 20)
        );
      });

      it('(5d20+L)', () => {
        const ds = DS('5d20+L');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 17, adjust: 0 },
            { roll: 5, adjust: 0 },
            { roll: 2, adjust: 1 },
            { roll: 15, adjust: 0 },
            { roll: 10, adjust: 0 },
          ],
          result: 51,
        }]);
      });

      it('(5d20+3L)', () => {
        const ds = DS('5d20+3L');
        ds.setRandom(mockRandomizer.random2);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 10, adjust: 1 },
            { roll: 15, adjust: 0 },
            { roll: 2, adjust: 1 },
            { roll: 5, adjust: 1 },
            { roll: 17, adjust: 0 },
          ],
          result: 66,
        }]);
      });

      it('(5d20+H)', () => {
        const ds = DS('5d20+H');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 17, adjust: 1 },
            { roll: 5, adjust: 0 },
            { roll: 2, adjust: 0 },
            { roll: 15, adjust: 0 },
            { roll: 10, adjust: 0 },
          ],
          result: 66,
        }]);
      });

      it('(5d20+3H)', () => {
        const ds = DS('5d20+3H');
        ds.setRandom(mockRandomizer.random2);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 10, adjust: 1 },
            { roll: 15, adjust: 1 },
            { roll: 2, adjust: 0 },
            { roll: 5, adjust: 0 },
            { roll: 17, adjust: 1 },
          ],
          result: 91,
        }]);
      });
    });

    describe('dice with "x"', () => {
      beforeEach(() => {
        spyOn(mockRandomizer, 'random').and.returnValues(
          (17 / 20), (5 / 20), (2 / 20), (15 / 20), (10 / 20), (9 / 20)
        );
      });

      it('(d20x3)', () => {
        const ds = DS('d20x3');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [{ roll: 17, adjust: 0 }],
          result: 17,
        },
        {
          rolls: [{ roll: 5, adjust: 0 }],
          result: 5,
        },
        {
          rolls: [{ roll: 2, adjust: 0 }],
          result: 2,
        }]);
      });

      it('(2d20x3)', () => {
        const ds = DS('2d20x3');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 17, adjust: 0 },
            { roll: 5, adjust: 0 },
          ],
          result: 22,
        },
        {
          rolls: [
            { roll: 2, adjust: 0 },
            { roll: 15, adjust: 0 },
          ],
          result: 17,
        },
        {
          rolls: [
            { roll: 10, adjust: 0 },
            { roll: 9, adjust: 0 },
          ],
          result: 19,
        }]);
      });
    });

    describe('complex die specifications', () => {
      beforeEach(() =>
        spyOn(mockRandomizer, 'random').and.returnValues(
          (4 / 6), (6 / 6), (1 / 6), (6 / 6),
          (2 / 6), (5 / 6), (3 / 6), (4 / 6),
          (6 / 6), (6 / 6), (5 / 6), (3 / 6),
          (1 / 6), (6 / 6), (2 / 6), (4 / 6),
          (5 / 6), (4 / 6), (2 / 6), (3 / 6),
          (1 / 6), (3 / 6), (5 / 6), (2 / 6)
        )
      );

      it('(4d6k3x6)', () => {
        const ds = DS('4d6k3x6');
        ds.setRandom(mockRandomizer.random);
        expect(ds.roll()).toEqual([{
          rolls: [
            { roll: 4, adjust: 0 },
            { roll: 6, adjust: 0 },
            { roll: 1, adjust: -1 },
            { roll: 6, adjust: 0 },
          ],
          result: 16,
        },
        {
          rolls: [
            { roll: 2, adjust: -1 },
            { roll: 5, adjust: 0 },
            { roll: 3, adjust: 0 },
            { roll: 4, adjust: 0 },
          ],
          result: 12,
        },
        {
          rolls: [
            { roll: 6, adjust: 0 },
            { roll: 6, adjust: 0 },
            { roll: 5, adjust: 0 },
            { roll: 3, adjust: -1 },
          ],
          result: 17,
        },
        {
          rolls: [
            { roll: 1, adjust: -1 },
            { roll: 6, adjust: 0 },
            { roll: 2, adjust: 0 },
            { roll: 4, adjust: 0 },
          ],
          result: 12,
        },
        {
          rolls: [
            { roll: 5, adjust: 0 },
            { roll: 4, adjust: 0 },
            { roll: 2, adjust: -1 },
            { roll: 3, adjust: 0 },
          ],
          result: 12,
        },
        {
          rolls: [
            { roll: 1, adjust: -1 },
            { roll: 3, adjust: 0 },
            { roll: 5, adjust: 0 },
            { roll: 2, adjust: 0 },
          ],
          result: 10,
        },
        ]);
      });
    });
  });
});
