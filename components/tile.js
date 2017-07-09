define(['loading', 'scroller', './focushandler', 'focusManager', 'scrollHelper', 'browser', 'emby-button', 'scrollStyles'], function (loading, scroller, focusHandler, focusManager, scrollHelper, browser) {
    'use strict';

    function tile(options) {
      console.log('tile component - options', options);

      var tilesHtml = '';
      for(var i in options.items) {
        tilesHtml += '<button class="tile tile-focustransform" data-link="' + options.items[i].link + '">';
        tilesHtml += '<div><i class="md-icon">' + options.items[i].icon + '</i></div>';
        tilesHtml += '<div><span class="title">' + options.items[i].title + '</span></div>';
        tilesHtml += '</button>';
      }

      document.querySelector(options.target).innerHTML = tilesHtml;
    }

    return tile;
});
