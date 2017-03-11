'use strict';

const Util = require('./Util.js');

require('./Keypad.js').getInstance();

document.addEventListener('DOMContentLoaded', (/* event */) => {
  // const _SETTINGS = 'settings';
  const _util = Util.getInstance();

  // XXX:
  // const isAndroid = (Framework7.prototype.device.android === true);
  // const isIos = (Framework7.prototype.device.ios === true);
  const platform = _util.boadApp.device.ios ? 'ios' : 'material';
  //
  // // TODO: Try moving this to Utils
  // _util.boadApp = new Framework7({ material: isAndroid });
  // console.log(`_util.boadApp.device=${JSON.stringify(_util.boadApp.device, null, 2)}`);
  // console.log(`Framework7.device=${JSON.stringify(Framework7.device, null, 2)}`);
  // console.log(`Framework7.prototype.device=${JSON.stringify(Framework7.prototype.device, null, 2)}`);
// XXX:
  // if (isIos) {
  const meta = {
    ios: '<meta name="apple-mobile-web-app-status-bar-style" content="black">',
    material: '<meta name="theme-color" content="#2196f3">',
  };

  $('head').append(meta[platform]);
  $('head').append(`<link rel="stylesheet" href="lib/css/framework7.${platform}.css">`);
  $('head').append(`<link rel="stylesheet" href="lib/css/framework7.${platform}.colors.css">`);
  // if (_util.boadApp.device.ios) {
  //   platform = 'ios';
  //   $('head').append();
  //   $('head').append(`<link rel="stylesheet" href="lib/css/framework7.ios.css">);
  //   $('head').append(<link rel="stylesheet" href="lib/css/framework7.${platform}.colors.css">`);
  // }
  // else {
  //   platform = 'material';
  //   $('head').append('<meta name="theme-color" content="#2196f3">');
  // $('head').append(`<link rel="stylesheet" href="lib/css/framework7.${platform}.css">
  // <link rel="stylesheet" href="lib/css/framework7.${platform}.colors.css">`);
  // }

  // $('head').append(
  //   isIos
  //     ? '<meta name="apple-mobile-web-app-status-bar-style" content="black">'
  //     : '<meta name="theme-color" content="#2196f3">');

  // $('head').append(`<link rel="stylesheet" href="lib/css/framework7.${platform}.css">
  // <link rel="stylesheet" href="lib/css/framework7.${platform}.colors.css">`);

  // XXX:
  // TODO: Try moving this to Utils
  // _util.boadApp.boadSettings = _util.getLocalStorage(_SETTINGS, { history: { limit: 10 } });

  // XXX:
  // TODO: Try moving this to Utils
  // _util.boadApp.addView('.view-main', { domCache: true });
});

window.addEventListener('load', (/* event */) => {
  const toolbarHeight = $('.toolbar.toolbar-bottom').css('height');
  // Tweak calculator keypad height.
  $('#calculator .page-content').css('padding-bottom', toolbarHeight);
  // Adjust the margin at the bottom of a list.
  $('#favorites .list-block, #history .list-block').css('margin-bottom', toolbarHeight);

  $('html').css('display', 'block');
});
