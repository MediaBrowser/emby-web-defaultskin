define(['cardBuilder', 'scroller', './../components/focushandler', 'pluginManager', './../components/tile', './../skininfo', 'emby-itemscontainer'], function (cardBuilder, scroller, focusHandler, pluginManager, tile, skinInfo) {
    'use strict';

	function loadLatest(element, parentId) {

        var options = {

            IncludeItemTypes: "Audio",
            Limit: 30,
            Fields: "PrimaryImageAspectRatio",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.latestItems(options).then(function (result) {

            var section = element.querySelector('.latestSection');

            cardBuilder.buildCards(result, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                rows: {
                    portrait: 1,
                    square: 1,
                    backdrop: 1
                },
                scalable: false
            });
        });
    }

    function loadPlaylists(element, parentId) {

        var options = {

            SortBy: "SortName",
            SortOrder: "Ascending",
            IncludeItemTypes: "Playlist",
            Recursive: true,
            ParentId: parentId,
            Fields: "PrimaryImageAspectRatio,SortName,CumulativeRunTimeTicks,CanDelete",
            StartIndex: 0,
            Limit: 30
        };

        return Emby.Models.playlists(options).then(function (result) {

            var section = element.querySelector('.playlistsSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                showTitle: true,
                overlayText: true,
                rows: {
                    portrait: 1,
                    square: 1,
                    backdrop: 1
                },
                scalable: false
            });
        });
    }

    function loadRecentlyPlayed(element, parentId) {

        var options = {

            SortBy: "DatePlayed",
            SortOrder: "Descending",
            IncludeItemTypes: "Audio",
            Limit: 30,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsPlayed",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.items(options).then(function (result) {

            var section = element.querySelector('.recentlyPlayedSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                action: 'instantmix',
                rows: {
                    portrait: 1,
                    square: 1,
                    backdrop: 1
                },
                scalable: false
            });
        });
    }

    function loadFrequentlyPlayed(element, parentId) {

        var options = {

            SortBy: "PlayCount",
            SortOrder: "Descending",
            IncludeItemTypes: "Audio",
            Limit: 30,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsPlayed",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.items(options).then(function (result) {

            var section = element.querySelector('.frequentlyPlayedSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                action: 'instantmix',
                rows: {
                    portrait: 1,
                    square: 1,
                    backdrop: 1
                },
                scalable: false
            });
        });
    }

    function initialiseScrollers() {
      // Categories scroller
      var scrollFrame = document.querySelector('.tilesSection');
      var slidee = scrollFrame.querySelector('.tilesContainer');
      var options = {
        horizontal: 1,
        itemNav: 0,
        mouseDragging: 1,
        touchDragging: 1,
        slidee: slidee,
        itemSelector: '.tile',
        smart: true,
        releaseSwing: true,
        scrollBy: 200,
        speed: 300,
        immediateSpeed: 1,
        elasticBounds: 1,
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,
        scrollWidth: 500000
      };
      self.tilesScroller = new scroller(scrollFrame, options);
      self.tilesScroller.init();
      initFocusHandler(document, slidee, self.tilesScroller);

      // Latest scroller
      var scrollFrame = document.querySelector('.latestSection');
      var slidee = scrollFrame.querySelector('.itemsContainer');
      var options = {
        horizontal: 1,
        itemNav: 0,
        mouseDragging: 1,
        touchDragging: 1,
        slidee: slidee,
        itemSelector: '.card',
        smart: true,
        releaseSwing: true,
        scrollBy: 200,
        speed: 300,
        immediateSpeed: 1,
        elasticBounds: 1,
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,
        scrollWidth: 500000
      };
      self.latestScroller = new scroller(scrollFrame, options);
      self.latestScroller.init();
      initFocusHandler(document, slidee, self.latestScroller);

      // Playlists scroller
      var scrollFrame = document.querySelector('.playlistsSection');
      var slidee = scrollFrame.querySelector('.itemsContainer');
      var options = {
        horizontal: 1,
        itemNav: 0,
        mouseDragging: 1,
        touchDragging: 1,
        slidee: slidee,
        itemSelector: '.card',
        smart: true,
        releaseSwing: true,
        scrollBy: 200,
        speed: 300,
        immediateSpeed: 1,
        elasticBounds: 1,
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,
        scrollWidth: 500000
      };
      self.playlistsScroller = new scroller(scrollFrame, options);
      self.playlistsScroller.init();
      initFocusHandler(document, slidee, self.playlistsScroller);

      // Recently played scroller
      var scrollFrame = document.querySelector('.recentlyPlayedSection');
      var slidee = scrollFrame.querySelector('.itemsContainer');
      var options = {
        horizontal: 1,
        itemNav: 0,
        mouseDragging: 1,
        touchDragging: 1,
        slidee: slidee,
        itemSelector: '.card',
        smart: true,
        releaseSwing: true,
        scrollBy: 200,
        speed: 300,
        immediateSpeed: 1,
        elasticBounds: 1,
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,
        scrollWidth: 500000
      };
      self.recentlyPlayedScroller = new scroller(scrollFrame, options);
      self.recentlyPlayedScroller.init();
      initFocusHandler(document, slidee, self.recentlyPlayedScroller);

      // Frequently played scroller
      var scrollFrame = document.querySelector('.frequentlyPlayedSection');
      var slidee = scrollFrame.querySelector('.itemsContainer');
      var options = {
        horizontal: 1,
        itemNav: 0,
        mouseDragging: 1,
        touchDragging: 1,
        slidee: slidee,
        itemSelector: '.card',
        smart: true,
        releaseSwing: true,
        scrollBy: 200,
        speed: 300,
        immediateSpeed: 1,
        elasticBounds: 1,
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,
        scrollWidth: 500000
      };
      self.frequentlyPlayedScroller = new scroller(scrollFrame, options);
      self.frequentlyPlayedScroller.init();
      initFocusHandler(document, slidee, self.frequentlyPlayedScroller);
    }

    function initFocusHandler(view, slidee, scroller) {
        //if (pageOptions.handleFocus) {
            var scrollSlider = slidee;

            var selectedItemInfoElement = view.querySelector('.selectedItemInfo');
            var selectedIndexElement = view.querySelector('.selectedIndex');

            self.focusHandler = new focusHandler({
                parent: scrollSlider,
                selectedItemInfoElement: selectedItemInfoElement,
                selectedIndexElement: selectedIndexElement,
                // animateFocus: pageOptions.animateFocus,
                animateFocus: null,
                scroller: scroller,
                enableBackdrops: true,
                zoomScale: 1.1
            });
        //}

        document.querySelector('.tilesSection').style = 'overflow: visible !important';
        document.querySelector('.latestSection').style = 'overflow: visible !important';
        document.querySelector('.playlistsSection').style = 'overflow: visible !important';
        document.querySelector('.recentlyPlayedSection').style = 'overflow: visible !important';
        document.querySelector('.frequentlyPlayedSection').style = 'overflow: visible !important';
    }

    function parentWithClass(elem, className) {
        while (!elem.classList || !elem.classList.contains(className)) {
            elem = elem.parentNode;
            if (!elem) {
                return null;
            }
        }

        return elem;
    }

    function view(element, apiClient, parentId, autoFocus) {
        var self = this;

        if (autoFocus) {
            Emby.FocusManager.autoFocus(element, true);
        }

        self.loadData = function (isRefresh) {
            var tileOptions = {
              target: ".tilesContainer",
              items: [
                {
                  title: Globalize.translate('Artists'),
                  link: 'music/music.html?tab=artists&parentid=' + parentId,
                  icon: '&#xE405;'
                },
                {
                  title: Globalize.translate('AlbumArtists'),
                  link: 'music/music.html?tab=albumartists&parentid=' + parentId,
                  icon: '&#xE405;'
                },
                {
                  title: Globalize.translate('Albums'),
                  link: 'music/music.html?tab=albums&parentid=' + parentId,
                  icon: 'album'
                },
                {
                  title: Globalize.translate('Genres'),
                  link: 'music/music.html?tab=genres&parentid=' + parentId,
                  icon: '&#xE405;'
                },
                {
                  title: Globalize.translate('Playlists'),
                  link: 'music/music.html?tab=playlists&parentid=' + parentId,
                  icon: ''
                },
                {
                  title: Globalize.translate('Favorites'),
                  link: 'music/music.html?tab=favorites&parentid=' + parentId,
                  icon: '&#xE030;'
                }
              ]
            };

            tile(tileOptions);

            var tileElems = document.querySelectorAll('.tile');

            for(var tileEl of tileElems) {
              tileEl.addEventListener('click', function (e) {
                var el = parentWithClass(e.target, 'tile');
                Emby.Page.show(pluginManager.mapRoute(skinInfo.id, el.getAttribute('data-link')));
              });
            }

            if (isRefresh) {
                return Promise.resolve();
            }

            return Promise.all([
                loadLatest(element, parentId),
                loadPlaylists(element, parentId),
                loadRecentlyPlayed(element, parentId),
                loadFrequentlyPlayed(element, parentId),
            ]);
        };

        initialiseScrollers();

        self.destroy = function () {

        };
    }

    return view;

});
