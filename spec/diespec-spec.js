/* eslint-env jasmine */

'use strict';

const Diespec = require('../src/js/diespec.js');

describe('New Diespec class', () => {
  it('can be referenced as a module', () => {
    expect(Diespec).toBeDefined();
  });

  describe('parsing', () => {

    function test(dieSpecString, differentExpected) {
      expect(Diespec(dieSpecString).toString())
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
        spyOn(mockRandomizer, 'random').and.returnValue(1 / 4);
      });

      it('(d4)', () => {
        const diespec = Diespec('d4');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
          rolls: [{ roll: 2, adjust: 0 }],
          result: 2,
        }]);
      });
    });

    describe('multple dice', () => {
      beforeEach(() => {
        spyOn(mockRandomizer, 'random').and.returnValues(
          (1 / 6), (4 / 6), (5 / 6)
        );
      });

      it('(3d6)', () => {
        const diespec = Diespec('3d6');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
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
          (7 / 8), (3 / 8), (2 / 8)
        );
        spyOn(mockRandomizer, 'random2').and.returnValues(
          (3 / 10), (1 / 10), (0 / 10)
        );
      });

      it('(3d8+2)', () => {
        const diespec = Diespec('3d8+2');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
          rolls: [
            { roll: 8, adjust: 0 },
            { roll: 4, adjust: 0 },
            { roll: 3, adjust: 0 },
          ],
          result: 17,
        }]);
      });

      it('(3d10-2)', () => {
        const diespec = Diespec('3d10-2');
        diespec.setRandom(mockRandomizer.random2);
        expect(diespec.roll()).toEqual([{
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
          (3 / 6), (1 / 6), (0 / 6), (5 / 6)
        );
      });

      it('(4d6k3)', () => {
        const diespec = Diespec('4d6k3');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
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
        const diespec = Diespec('4d6k-1');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
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
          (3 / 12), (1 / 12), (0 / 12), (5 / 12), (2 / 12)
        );
        spyOn(mockRandomizer, 'random2').and.returnValues(
          (5 / 12), (9 / 12), (1 / 12), (7 / 12), (3 / 12)
        );
        spyOn(mockRandomizer, 'random3').and.returnValues(
          (9 / 20), (14 / 20), (1 / 20), (4 / 20), (16 / 20)
        );
        spyOn(mockRandomizer, 'random4').and.returnValues(
          (16 / 20), (4 / 20), (1 / 20), (14 / 20), (9 / 20)
        );
      });
      it('(5d12-L)', () => {
        const diespec = Diespec('5d12-L');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
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
        const diespec = Diespec('5d12-2L');
        diespec.setRandom(mockRandomizer.random2);
        expect(diespec.roll()).toEqual([{
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
        const diespec = Diespec('5d20-H');
        diespec.setRandom(mockRandomizer.random3);
        expect(diespec.roll()).toEqual([{
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
        const diespec = Diespec('5d20-2H');
        diespec.setRandom(mockRandomizer.random4);
        expect(diespec.roll()).toEqual([{
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
          (16 / 20), (4 / 20), (1 / 20), (14 / 20), (9 / 20)
        );
        spyOn(mockRandomizer, 'random2').and.returnValues(
          (9 / 20), (14 / 20), (1 / 20), (4 / 20), (16 / 20)
        );
      });

      it('(5d20+L)', () => {
        const diespec = Diespec('5d20+L');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
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
        const diespec = Diespec('5d20+3L');
        diespec.setRandom(mockRandomizer.random2);
        expect(diespec.roll()).toEqual([{
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
        const diespec = Diespec('5d20+H');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
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
        const diespec = Diespec('5d20+3H');
        diespec.setRandom(mockRandomizer.random2);
        expect(diespec.roll()).toEqual([{
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
          (16 / 20), (4 / 20), (1 / 20), (14 / 20), (9 / 20), (8 / 20)
        );
      });

      it('(d20x3)', () => {
        const diespec = Diespec('d20x3');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
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
        const diespec = Diespec('2d20x3');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
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
          (3 / 6), (5 / 6), (0 / 6), (5 / 6),
          (1 / 6), (4 / 6), (2 / 6), (3 / 6),
          (5 / 6), (5 / 6), (4 / 6), (2 / 6),
          (0 / 6), (5 / 6), (1 / 6), (3 / 6),
          (4 / 6), (3 / 6), (1 / 6), (2 / 6),
          (0 / 6), (2 / 6), (4 / 6), (1 / 6)
        )
      );

      it('(4d6k3x6)', () => {
        const diespec = Diespec('4d6k3x6');
        diespec.setRandom(mockRandomizer.random);
        expect(diespec.roll()).toEqual([{
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

  describe('correctly generates HTML for', () => {
    it(
      'a simple die',
      () =>
        expect(Diespec('d4').toHTML())
          .toBe('<span class="display-die">d4</span>')
    );

    it('a count', () =>
      expect(Diespec('3d6').toHTML())
        .toBe(
          '<span class="display-digit">3</span>' +
          '<span class="display-die">d6</span>'
        )
    );

    it('a modifier', () => {

      expect(Diespec('d8+2').toHTML())
        .toBe(
          '<span class="display-die">d8</span>' +
          '<span class="display-operator">+</span>' +
          '<span class="display-digit">2</span>'
        );

      expect(Diespec('d8-4').toHTML())
        .toBe(
          '<span class="display-die">d8</span>' +
          '<span class="display-operator">-</span>' +
          '<span class="display-digit">4</span>'
        );

    });

    it('a complex spec', () => {

      expect(Diespec('4d6-L+2x3').toHTML())
        .toBe(
          '<span class="display-digit">4</span>' +
          '<span class="display-die">d6</span>' +
          '<span class="display-operator">-</span>' +
          '<span class="display-keep">L</span>' +
          '<span class="display-operator">+</span>' +
          '<span class="display-digit">2</span>' +
          '<span class="display-operator">x</span>' +
          '<span class="display-digit">3</span>'
        );

      expect(Diespec('40d6k10-5x6').toHTML())
        .toBe(
          '<span class="display-digit">40</span>' +
          '<span class="display-die">d6</span>' +
          '<span class="display-keep">k</span>' +
          '<span class="display-digit">10</span>' +
          '<span class="display-operator">-</span>' +
          '<span class="display-digit">5</span>' +
          '<span class="display-operator">x</span>' +
          '<span class="display-digit">6</span>'
        );

    });
  });

  describe('correctly generates HTML for the calculator display with', () => {
    it(
      'a simple die',
      () =>
        expect(Diespec('d4').toHTML())
          .toBe('<span class="display-die">d4</span>')
    );

    it('a count', () =>
      expect(Diespec('33d6').toHTML(true))
        .toBe(
          '<span class="display-digit">3</span>' +
          '<span class="display-digit">3</span>' +
          '<span class="display-die">d6</span>'
        )
    );

    it('a modifier', () => {

      expect(Diespec('d8+23').toHTML(true))
        .toBe(
          '<span class="display-die">d8</span>' +
          '<span class="display-operator">+</span>' +
          '<span class="display-digit">2</span>' +
          '<span class="display-digit">3</span>'
        );

      expect(Diespec('d8-49').toHTML(true))
        .toBe(
          '<span class="display-die">d8</span>' +
          '<span class="display-operator">-</span>' +
          '<span class="display-digit">4</span>' +
          '<span class="display-digit">9</span>'
        );

    });

    it('a complex spec', () => {

      expect(Diespec('41d6-10L+20x32').toHTML(true))
        .toBe(
          '<span class="display-digit">4</span>' +
          '<span class="display-digit">1</span>' +
          '<span class="display-die">d6</span>' +
          '<span class="display-operator">-</span>' +
          '<span class="display-digit">1</span>' +
          '<span class="display-digit">0</span>' +
          '<span class="display-keep">L</span>' +
          '<span class="display-operator">+</span>' +
          '<span class="display-digit">2</span>' +
          '<span class="display-digit">0</span>' +
          '<span class="display-operator">x</span>' +
          '<span class="display-digit">3</span>' +
          '<span class="display-digit">2</span>'
        );
    });
  });

});
