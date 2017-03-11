'use strict';

const Util = require('./Util.js');

require('./Keypad.js').getInstance();

document.addEventListener('DOMContentLoaded', (/* event */) => {
  const _SETTINGS = 'settings';
  const _util = Util.getInstance();

  const isAndroid = (Framework7.prototype.device.android === true);
  const isIos = (Framework7.prototype.device.ios === true);
  let platform = '';

  // TODO: Try moving this to Utils
  _util.boadApp = new Framework7({ material: isAndroid });

  if (isIos) {
    platform = 'ios';
  }
  else {
    platform = 'material';
  }

  $('head').append(
    isIos
      ? '<meta name="apple-mobile-web-app-status-bar-style" content="black">'
      : '<meta name="theme-color" content="#2196f3">');

  $('head').append(`<link rel="stylesheet" href="lib/css/framework7.${platform}.css">
  <link rel="stylesheet" href="lib/css/framework7.${platform}.colors.css">`);

  // TODO: Try moving this to Utils
  _util.boadApp.boadSettings = _util.getLocalStorage(_SETTINGS, { history: { limit: 10 } });

  // TODO: Try moving this to Utils
  _util.boadApp.addView('.view-main', { domCache: true });
});

window.addEventListener('load', (/* event */) => {
  const toolbarHeight = $('.toolbar.toolbar-bottom').css('height');
  // Tweak calculator keypad height.
  $('#calculator .page-content').css('padding-bottom', toolbarHeight);
  // Adjust the margin at the bottom of a list.
  $('#favorites .list-block, #history .list-block').css('margin-bottom', toolbarHeight);

  $('html').css('display', 'block');
});
