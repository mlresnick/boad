'use strict';

const Util = require('./util.js');
require('./calculator.js').getInstance();

document.addEventListener('DOMContentLoaded', () => {
  const _util = Util.getInstance();
  const platform = _util.boadApp.device.ios ? 'ios' : 'material';
  const meta = {
    ios: '<meta name="apple-mobile-web-app-status-bar-style" content="black">',
    material: '<meta name="theme-color" content="#2196f3">',
  };

  $('head').append(
    `<link rel="stylesheet" href="./lib/css/framework7.${platform}.css">`
  );
  $('head').append(
    `<link rel="stylesheet" href="./lib/css/framework7.${platform}.colors.css">`
  );
  $('head').append(meta[platform]);
});

window.addEventListener('load', () => {
  const toolbarHeight = $('.toolbar.toolbar-bottom').css('height');
  // Tweak calculator height.
  $('#calculator .page-content').css('padding-bottom', toolbarHeight);
  // Adjust the margin at the bottom of a list.
  $('#favorites .list-block, #history .list-block')
    .css('margin-bottom', toolbarHeight);


  $('html').css('display', 'block');
});
