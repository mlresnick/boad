'use strict';

let boadApp;
// TODO: Attach this to some object - either boadApp or another utility object
function _getLocalStorage(key, initialValue) {
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, JSON.stringify(initialValue));
  }

  return JSON.parse(localStorage.getItem(key));
}

document.addEventListener('DOMContentLoaded', (/* event */) => {
  const _SETTINGS = 'settings';

  const isAndroid = (Framework7.prototype.device.android === true);
  const isIos = (Framework7.prototype.device.ios === true);
  let platform = '';

  boadApp = new Framework7({ material: isAndroid });

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

  boadApp.boadSettings = _getLocalStorage(_SETTINGS, { history: { limit: 10 } });

  boadApp.addView('.view-main', { domCache: true });
});

window.addEventListener('load', (/* event */) => {
  const toolbarHeight = $('.toolbar.toolbar-bottom').css('height');
  // Tweak calculator keypad height.
  $('#calculator .page-content').css('padding-bottom', toolbarHeight);
  // Adjust the margin at the bottom of a list.
  $('#favorites .list-block, #history .list-block').css('margin-bottom', toolbarHeight);

  $('html').css('display', 'block');
});
