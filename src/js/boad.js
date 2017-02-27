/* global Framework7 Dom7 */

'use strict';

window.addEventListener('load', function (/*event*/) {
  var $$ = Dom7;
  $$('html').css('display', 'block');
});

document.addEventListener('DOMContentLoaded', function (/*event*/) {
  var isAndroid = (Framework7.prototype.device.android === true);
  var isIos = (Framework7.prototype.device.ios === true);
  var boadApp = new Framework7({ material: isAndroid });
  var $$ = Dom7;
  var platform = '';
  if (isIos) {
    platform = 'ios';
  }
  else {
    platform = 'material';
  }

  $$('head').append(
    isIos
      ? '<meta name="apple-mobile-web-app-status-bar-style" content="black">'
      : '<meta name="theme-color" content="#2196f3">');

  $$('head').append(
    '<link rel="stylesheet" href="lib/css/framework7.' + platform + '.css">' +
    '<link rel="stylesheet" href="lib/css/framework7.' + platform + '.colors.css">'
  );

  boadApp.addView('.view-main', { domCache: true });
});
