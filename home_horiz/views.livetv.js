define(['focusManager', './../components/focushandler', 'scroller', 'cardBuilder', './../components/tile', 'pluginManager', './../skininfo', 'browser', 'emby-itemscontainer'], function (focusManager, focusHandler, scroller, cardBuilder, tile, pluginManager, skinInfo,  browser) {
    'use strict';

    function loadLatestRecordings(element, apiClient) {

        return apiClient.getLiveTvRecordings({

            Limit: 6,
            IsInProgress: false,
            UserId: apiClient.getCurrentUserId(),
            ImageTypeLimit: 1,
            Fields: "PrimaryImageAspectRatio"

        }).then(function (result) {

            var section = element.querySelector('.latestRecordingsSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                showParentTitleOrTitle: true,
                coverImage: true,
                rows: {
                    portrait: 1,
                    square: 1,
                    backdrop: 1
                },
                scalable: false,
                overlayText: true
            });
        });
    }

    function loadNowPlaying(element, apiClient) {

        return apiClient.getLiveTvRecommendedPrograms({

            IsAiring: true,
            limit: 9,
            EnableImageTypes: "Primary",
            ImageTypeLimit: 1,
            Fields: "PrimaryImageAspectRatio",
            UserId: apiClient.getCurrentUserId()

        }).then(function (result) {

            var section = element.querySelector('.nowPlayingSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdrop',
                coverImage: true,
                rows: {
                    portrait: 1,
                    square: 1,
                    backdrop: 1
                },
                scalable: false
            });
        });
    }

    function loadUpcomingPrograms(section, apiClient, options, shape) {

        options.ImageTypeLimit = 1;
        options.Fields = "PrimaryImageAspectRatio";
        options.UserId = apiClient.getCurrentUserId();

        return apiClient.getLiveTvRecommendedPrograms(options).then(function (result) {

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: shape || 'backdrop',
                coverImage: true,
                rows: {
                    portrait: 1,
                    square: 1,
                    backdrop: 1
                },
                scalable: false
            });
        });
    }

    function gotoTvView(tab, parentId, serverId) {

        Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'livetv/livetv.html?tab=' + tab + '&serverId=' + serverId));
    }

    function initialiseScrollers() {
      console.log('initialiseScrollers() running');
      // // Categories scroller
      // var scrollFrame = document.querySelector('.tilesSection');
      // var slidee = scrollFrame.querySelector('.tilesContainer');
      // var options = {
      //   horizontal: 1,
      //   itemNav: 0,
      //   mouseDragging: 1,
      //   touchDragging: 1,
      //   slidee: slidee,
      //   itemSelector: '.tile',
      //   smart: true,
      //   releaseSwing: true,
      //   scrollBy: 200,
      //   speed: 300,
      //   immediateSpeed: 1,
      //   elasticBounds: 1,
      //   dragHandle: 1,
      //   dynamicHandle: 1,
      //   clickBar: 1,
      //   scrollWidth: 500000
      // };
      // self.tilesScroller = new scroller(scrollFrame, options);
      // self.tilesScroller.init();
      // initFocusHandler(document, slidee, self.tilesScroller);


      // Latest recordings scroller
      var scrollFrame = document.querySelector('.latestRecordingsSection');
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

      // Now playing scroller
      var scrollFrame = document.querySelector('.nowPlayingSection');
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
      self.nowPlayingScroller = new scroller(scrollFrame, options);
      self.nowPlayingScroller.init();
      initFocusHandler(document, slidee, self.nowPlayingScroller);

      // Upcoming programs scroller
      var scrollFrame = document.querySelector('.upcomingProgramsSection');
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
      self.upcomingProgramsScroller = new scroller(scrollFrame, options);
      self.upcomingProgramsScroller.init();
      initFocusHandler(document, slidee, self.upcomingProgramsScroller);

      // Upcoming movies scroller
      var scrollFrame = document.querySelector('.upcomingMoviesSection');
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
      self.upcomingMoviesScroller = new scroller(scrollFrame, options);
      self.upcomingMoviesScroller.init();
      initFocusHandler(document, slidee, self.upcomingMoviesScroller);

      // Upcoming kids scroller
      var scrollFrame = document.querySelector('.upcomingKidsSection');
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
      self.upcomingKidsScroller = new scroller(scrollFrame, options);
      self.upcomingKidsScroller.init();
      initFocusHandler(document, slidee, self.upcomingKidsScroller);

      // Upcoming sports scroller
      var scrollFrame = document.querySelector('.upcomingSportsSection');
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
      self.upcomingSportsScroller = new scroller(scrollFrame, options);
      self.upcomingSportsScroller.init();
      initFocusHandler(document, slidee, self.upcomingSportsScroller);
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

        document.querySelector('.latestRecordingsSection').style = 'overflow: visible !important;';
        document.querySelector('.nowPlayingSection').style = 'overflow: visible !important;';
        document.querySelector('.upcomingProgramsSection').style = 'overflow: visible !important;';
        document.querySelector('.upcomingMoviesSection').style = 'overflow: visible !important;';
        document.querySelector('.upcomingKidsSection').style = 'overflow: visible !important;';
        document.querySelector('.upcomingSportsSection').style = 'overflow: visible !important;';
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
            focusManager.autoFocus(element);
        }

        self.loadData = function () {

          var tileOptions = {
            target: ".tilesContainer",
            items: [
              {
                title: Globalize.translate('Guide'),
                link: 'livetv/guide.html',
                // icon: '&#xE916;'
                icon: 'dvr'
              },
              {
                title: Globalize.translate('Recordings'),
                link: 'livetv/livetv.html?tab=recordings&parentid=' + parentId + '&serverId=' + apiClient.serverId(),
                // icon: '&#xE064;'
                icon: '&#xE63A;'
              },
              // {
              //   title: Globalize.translate('Scheduled'),
              //   link: 'livetv/livetv.html?tab=scheduled&parentid=' + parentId + '&serverId=' + apiClient.serverId(),
              //   // icon: '&#xE04A;'
              //   icon: 'schedule'
              // },
              {
                title: Globalize.translate('Channels'),
                link: 'livetv/livetv.html?tab=channels&parentid=' + parentId + '&serverId=' + apiClient.serverId(),
                // icon: '&#xE04A;'
                icon: 'schedule'
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
                loadLatestRecordings(element, apiClient),
                loadNowPlaying(element, apiClient),

                loadUpcomingPrograms(element.querySelector('.upcomingProgramsSection'), apiClient, {

                    IsAiring: false,
                    HasAired: false,
                    limit: 10,
                    IsMovie: false,
                    IsSports: false,
                    IsKids: false,
                    IsSeries: true

                }),

                loadUpcomingPrograms(element.querySelector('.upcomingMoviesSection'), apiClient, {

                    IsAiring: false,
                    HasAired: false,
                    limit: 10,
                    IsMovie: true

                }, 'portrait'),

                loadUpcomingPrograms(element.querySelector('.upcomingSportsSection'), apiClient, {

                    IsAiring: false,
                    HasAired: false,
                    limit: 10,
                    IsSports: true

                }),

                loadUpcomingPrograms(element.querySelector('.upcomingKidsSection'), apiClient, {

                    IsAiring: false,
                    HasAired: false,
                    limit: 10,
                    IsSports: false,
                    IsKids: true
                })
            ]);
        };

        initialiseScrollers();

        // element.querySelector('.guideCard').addEventListener('click', function () {
        //     Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'livetv/guide.html'));
        // });
        //
        // element.querySelector('.recordingsCard').addEventListener('click', function () {
        //     gotoTvView('recordings', parentId, apiClient.serverId());
        // });
        //
        // element.querySelector('.scheduledLiveTvCard').addEventListener('click', function () {
        //     gotoTvView('scheduled', parentId, apiClient.serverId());
        // });

        self.destroy = function () {

        };
    }

    return view;

});
