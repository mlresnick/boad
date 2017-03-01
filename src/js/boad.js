'use strict';

const $$ = Dom7;

document.addEventListener('DOMContentLoaded', (/* event */) => {
  const isAndroid = (Framework7.prototype.device.android === true);
  const isIos = (Framework7.prototype.device.ios === true);
  const boadApp = new Framework7({ material: isAndroid });
  let platform = '';
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

  $$('head').append(`<link rel="stylesheet" href="lib/css/framework7.${platform}.css">
  <link rel="stylesheet" href="lib/css/framework7.${platform}.colors.css">`);

  keypad.initialize();

  boadApp.addView('.view-main', { domCache: true });
});

window.addEventListener('load', (/* event */) => {
  $$('html').css('display', 'block');
});
