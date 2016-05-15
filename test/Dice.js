/* eslint-env node */
var Dice = require("../js/Dice.js").Dice;
function main() {
  testParser("d6");
  testParser("d%");
  testParser("5d6");

  testParser("10d8+3");
  testParser("4d20-2");

  testParser("4d100-L", "4d%-L");
  testParser("4d6-1L", "4d6-L");
  testParser("4d6-2L");
  testParser("4d6+L");
  testParser("4d6+1L", "4d6+L");
  testParser("4d6+3L");
  testParser("4d6+H");
  testParser("4d6-H");
  testParser("4d6+3H");
  testParser("4d6-3H");

  testParser("3d10k2");
  testParser("5d4k-1");
  testParser("3d10k-11");
  testParser("3d10k+3","3d10k3");

  testParser("4d12-L+2");
  testParser("5d4+4H-3");
  testParser("4d12k-1+2");
  testParser("5d4k+4-3", "5d4k4-3");

  testParser("d9x3");
  testParser("d9x20");
  testParser("d9+2x20");
  testParser("5d9-5x20");
  testParser("d9-Lx3");
  testParser("d9+2Hx20");
  testParser("d20k16x3");
  testParser("d20k16+55x3");
  testParser("d9-L-10x3");
  testParser("d9+2H-6x20");

  testParser("!d9x3");
  testParser("!2d9x20");
  testParser("!3d9+2x20");
  testParser("!5d9-5x20");
  testParser("!d9-Lx3");
  testParser("!4d9+2Hx20");
  testParser("!d20k16x3");
  testParser("!d20k16+55x3");
  testParser("!d9-L-10x3");
  testParser("!d9+2H-6x20");

/* eslint-disable indent */
w("\n\n");
/* eslint-eable indent */

  testRoller("d6",[6], 6);
  testRoller("3d6",[2,5,4], 11);
  testRoller("4d%", [11,22,55,44], 132);

  testRoller("10d8+3", [8,4,4,8,8,2,8,1,8,8], 62);
  testRoller("4d20-2", [4,7,2,12], 23);

  testRoller("4d6-1L", [1, 4, 3, 5], 12);
  testRoller("4d6-3H", [5, 3, 6, 1], 1);
  testRoller("4d6k3", [1, 4, 3, 5], 12);
  testRoller("4d6k-1", [5, 3, 6, 1], 1);
  testRoller("4d6+3L", [3,6,4,3], 26);
  testRoller("4d6+2H", [4,2,6,2], 24);

  testRoller("4d12-L+2", [11, 4, 8, 4], 25);
  testRoller("5d4-4H-3", [1, 4, 3, 4, 2], -2);
  testRoller("4d12k-3+2", [3,8,12,4], 17);
  testRoller("4d6+3L-2", [3,6,4,3], 24);
  testRoller("4d6+H+2", [4,2,6,2], 22);

  testRoller("!d6",[3], 3);
  testRoller("!d8",[8,3], 11);
  testRoller("!d10",[10,10,4], 24);
  testRoller("!3d12",[10,12,4,6], 32);
  testRoller("!4d20",[20,20,20,20,20,17,20,20,20,20,10,15,20,4], 246);
  testRoller("!d6+3",[3], 6);
  testRoller("!d8-1",[8,3], 10);
  testRoller("!d10+5",[10,10,4], 29);
  testRoller("!3d12-5",[10,12,4,6], 27);
  testRoller("!4d20-100",[20,20,20,20,20,17,20,20,20,20,10,15,20,4], 146);

  testRoller("!4d6-1L", [1, 6, 3, 5, 3], 17);
  testRoller("!4d6-2H", [6,6,6,1, 6, 2], 15);
  testRoller("!4d6k3", [6,5,4,6, 2,6, 6, 6, 6, 6, 1], 50);
  testRoller("!4d6k-1", [6, 6, 6, 6, 6, 1], 13);
  testRoller("!4d6+3L", [3,6,4,6, /* 6,3,4, */ 3,2,4], 41);
  testRoller("!4d6+2H", [4,2,6,2, /* 6,4, */ 3,2], 29);

  testRoller("!4d6-1L+10", [1, 6, 3, 5, 3], 27);
  testRoller("!4d6-2H-10", [6,6,6,1, 6, 2], 5);
  testRoller("!4d6k3+3", [6,5,4,6, 2,6, 6, 6, 6, 6, 1], 53);
  testRoller("!4d6k-1-4", [6, 6, 6, 6, 6, 1], 9);
  testRoller("!4d6+3L-6", [3,6,4,6, /* 3,6,4, */ 3,2, 2], 33);
  testRoller("!4d6+2H-28", [4,2,6,2, /* 6,4, */ 3,2], 1);

  testRoller("d6x3", [3,4,5], [3,4,5]);
    testRoller("3d6x4", [3,3,3, 4,4,4, 6,6,6, 1,1,1],[9, 12, 18, 3]);
    testRoller("3d6+2x4", [3,3,3, 4,4,4, 6,6,6, 1,1,1],[11,14,20,5]);
    testRoller("4d6k3+2x4", [3,3,2,3, 4,3,4,4, 6,3,6,6, 1,1,1,1],[11,14,20,5]);
}

function testRoller(diespec, rollResults, expected) {
  var die = Dice;
  var actual;
  var passed;
  die.setRandomizer({
      random: function () { return this.preRolledResults.shift(); },
      preRolledResults: rollResults
  });

  die.parse(diespec);
  actual = die.roll();
  passed = (typeof actual == typeof expected);
  if (passed) {
    if (actual instanceof Array) {
        passed = (actual.length == expected.length);
        if (passed) {
          for (var i = 0; (i < actual.length) && passed; i++) {
              passed = (actual[i] == expected[i]);
          }
      }
  }
  else {
      passed = (actual === expected);
  }
    }
    if (!passed) {
        process.stdout.write("\n\n'"+diespec+"' failed, actual was '"+
           JSON.stringify(actual)+"'");
        process.stdout.write(", expected was '"+JSON.stringify(expected)+"'\n");
    }
}

function testParser(string, expected) {
    var die = Dice; //new Dice();
    var dieString;
    if (expected === undefined) {
      expected = string;
    }

//    w(" "+string);
    die.parse(string);
    dieString = die.toString();
    if (expected != dieString) {
        process.stdout.write("\n\n'"+string+"' failed, actual was '"+dieString
           +"'");
        if (expected !== string) {
            process.stdout.write(", expected was '"+expected+"'");
  }
        process.stdout.write("\n");
        process.stdout.write(JSON.stringify(die)+"\n\n");
    }
}

function w(string) { process.stdout.write(string); }
/*eslint-disable no-unused-vars */
function wl(string) { w(string+"\n"); }
/*eslint-enable no-unused-vars */
main();
