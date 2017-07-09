define(['./spotlight', 'scroller', './../components/focushandler', 'focusManager', 'pluginManager', 'cardBuilder', './../components/tile', './../skininfo', 'emby-itemscontainer'], function (spotlight, scroller, focusHandler, focusManager, pluginManager, cardBuilder, tile, skinInfo) {
    'use strict';

    function loadResume(element, parentId) {

        var options = {

            Limit: 6,
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.resumable(options).then(function (result) {

            var section = element.querySelector('.resumeSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdrop',
                rows: 1,
                preferThumb: true,
                scalable: false
            });
        });
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

    function loadNextUp(element, parentId, apiClient) {

        var options = {

            Fields: "PrimaryImageAspectRatio",
            ImageTypeLimit: 1,
            Limit: 18,
            ParentId: parentId,
            UserId: apiClient.getCurrentUserId()
        };

        return apiClient.getNextUpEpisodes(options).then(function (result) {

            var section = element.querySelector('.nextUpSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdrop',
                rows: 1,
                preferThumb: true,
                scalable: false
            });
        });
    }

    function loadLatest(element, parentId) {

        var options = {

            IncludeItemTypes: "Episode",
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
                shape: 'backdrop',
                rows: 1,
                preferThumb: true,
                showGroupCount: true,
                scalable: false
            });
        });
    }

    // function loadSpotlight(instance, element, parentId) {
    //
    //     var options = {
    //
    //         SortBy: "Random",
    //         IncludeItemTypes: "Series",
    //         Limit: 20,
    //         Recursive: true,
    //         ParentId: parentId,
    //         EnableImageTypes: "Backdrop",
    //         ImageTypes: "Backdrop"
    //     };
    //
    //     return Emby.Models.items(options).then(function (result) {
    //
    //         var card = element.querySelector('.wideSpotlightCard');
    //
    //         instance.spotlight = new spotlight(card, result.Items, 767);
    //     });
    // }

    function loadImages(element, parentId) {

        var options = {

            SortBy: "IsFavoriteOrLiked,Random",
            IncludeItemTypes: "Series",
            Limit: 3,
            Recursive: true,
            ParentId: parentId,
            EnableImageTypes: "Backdrop",
            ImageTypes: "Backdrop"
        };

        return Emby.Models.items(options).then(function (result) {

            var items = result.Items;
            var imgOptions = {
                maxWidth: 600
            };

            // if (items.length > 0) {
            //     element.querySelector('.tvFavoritesCard .cardImage').style.backgroundImage = "url('" + Emby.Models.backdropImageUrl(items[0], imgOptions) + "')";
            // }
            //
            // if (items.length > 1) {
            //     element.querySelector('.allSeriesCard .cardImage').style.backgroundImage = "url('" + Emby.Models.backdropImageUrl(items[1], imgOptions) + "')";
            // }
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


      // Resume scroller
      var scrollFrame = document.querySelector('.resumeSection');
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
      self.resumeScroller = new scroller(scrollFrame, options);
      self.resumeScroller.init();
      initFocusHandler(document, slidee, self.resumeScroller);

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

      // Next Up scroller
      var scrollFrame = document.querySelector('.nextUpSection');
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
      self.nextUpScroller = new scroller(scrollFrame, options);
      self.nextUpScroller.init();
      initFocusHandler(document, slidee, self.nextUpScroller);
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
        document.querySelector('.resumeSection').style = 'overflow: visible !important';
        document.querySelector('.latestSection').style = 'overflow: visible !important';
        document.querySelector('.nextUpSection').style = 'overflow: visible !important';
    }

    function view(element, apiClient, parentId, autoFocus) {

        var self = this;

        if (autoFocus) {
            focusManager.autoFocus(element);
        }

        self.loadData = function () {
          var tileOptions = {
            target: ".tilesContainer",
            items: [
              {
                title: Globalize.translate('Genres'),
                link: 'tv/tv.html?tab=genres&parentid=' + parentId + '&serverId=' + apiClient.serverId(),
                // icon: '&#xE064;'
                icon: '&#xE8C9;'
              },
              {
                title: Globalize.translate('AllSeries'),
                link: 'tv/tv.html?tab=series&parentid=' + parentId + '&serverId=' + apiClient.serverId(),
                icon: '&#xE8D0;'
              },
              {
                title: 'Upcoming',
                link: 'tv/tv.html?tab=upcoming&parentid=' + parentId + '&serverId=' + apiClient.serverId(),
                icon: '&#xE8D0;'
              },
              {
                title: Globalize.translate('Favorites'),
                link: 'tv/tv.html?tab=favorites&parentid=' + parentId + '&serverId=' + apiClient.serverId(),
                icon: '&#xE89A;'
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

            return Promise.all([
            loadResume(element, parentId),
            loadNextUp(element, parentId, apiClient),
            loadLatest(element, parentId)
            ]);
        };

        // loadSpotlight(self, element, parentId);
        loadImages(element, parentId);

        initialiseScrollers();

        var serverId = apiClient.serverId();

        // element.querySelector('.allSeriesCard').addEventListener('click', function () {
        //     Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'tv/tv.html?parentid=' + parentId + "&serverId=" + serverId));
        // });
        //
        // element.querySelector('.tvUpcomingCard').addEventListener('click', function () {
        //     Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'tv/tv.html?tab=upcoming&parentid=' + parentId + "&serverId=" + serverId));
        // });
        //
        // element.querySelector('.tvFavoritesCard').addEventListener('click', function () {
        //     Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'tv/tv.html?tab=favorites&parentid=' + parentId + "&serverId=" + serverId));
        // });

        self.destroy = function () {
            if (self.spotlight) {
                self.spotlight.destroy();
                self.spotlight = null;
            }
        };
    }

    return view;

});
