define(['loading', 'scroller', 'playbackManager', 'alphaPicker', './../components/horizontallist', 'emby-itemscontainer'], function (loading, scroller, playbackManager, alphaPicker, horizontalList) {
    'use strict';

    function createHorizontalScroller(instance, view, item, loading) {

        var scrollFrame = view.querySelector('.scrollFrame');

        scrollFrame.style.display = 'block';

        var options = {
            horizontal: 1,
            itemNav: 0,
            mouseDragging: 1,
            touchDragging: 1,
            slidee: view.querySelector('.scrollSlider'),
            itemSelector: '.card',
            smart: true,
            releaseSwing: true,
            scrollBar: view.querySelector('.scrollbar'),
            scrollBy: 200,
            speed: 270,
            elasticBounds: 1,
            dragHandle: 1,
            dynamicHandle: 1,
            clickBar: 1,
            //centerOffset: window.innerWidth * .05,
            scrollWidth: 500000
        };

        instance.scroller = new scroller(scrollFrame, options);
        instance.scroller.init();
        loadChildren(instance, view, item, loading);
    }

    function getItems(params, item, startIndex, limit) {

        if (params.type === 'collections') {

            return Emby.Models.collections({
                ParentId: item.Id,
                EnableImageTypes: "Primary,Backdrop,Thumb",
                StartIndex: startIndex,
                Limit: limit,
                SortBy: 'SortName'
            });
        }

        if (params.type === 'favoritemovies') {

            return Emby.Models.items({
                ParentId: item.Id,
                EnableImageTypes: "Primary,Backdrop,Thumb",
                StartIndex: startIndex,
                Limit: limit,
                SortBy: 'SortName',
                IncludeItemTypes: 'Movie',
                Recursive: true,
                Filters: "IsFavorite"
            });
        }

        if (params.genreId) {

            return Emby.Models.items({
                StartIndex: startIndex,
                Limit: limit,
                SortBy: 'SortName',
                Recursive: true,
                GenreIds: params.genreId,
                ParentId: item.Id,
                IncludeItemTypes: item.CollectionType === 'tvshows' ? 'Series' : (item.CollectionType === 'movies' ? 'Movie' : 'MusicAlbum')
            });

        }
        return Emby.Models.children(item, {
            StartIndex: startIndex,
            Limit: limit,
            Fields: 'SortName'
        });
    }

    function loadChildren(instance, view, item, loading) {

        instance.listController = new horizontalList({

            itemsContainer: view.querySelector('.scrollSlider'),
            getItemsMethod: function (startIndex, limit) {

                return getItems(instance.params, item, startIndex, limit);
            },
            listCountElement: view.querySelector('.listCount'),
            listNumbersElement: view.querySelector('.listNumbers'),
            selectedItemInfoElement: view.querySelector('.selectedItemInfo'),
            selectedIndexElement: view.querySelector('.selectedIndex'),
            scroller: instance.scroller,
            cardOptions: {
                coverImage: true,
                rows: {
                    portrait: 2,
                    square: 3,
                    backdrop: 3
                },
                scalable: false
            }
        });

        instance.listController.render();
    }

    return function (view, params) {

        var self = this;
        self.params = params;
        var currentItem;

        var contentScrollSlider = view.querySelector('.scrollSlider');

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            if (!isRestored) {
                loading.show();
            }

            Emby.Models.item(params.parentid).then(function (item) {

                if (!params.genreId) {
                    setTitle(item);
                }
                currentItem = item;

                if (!isRestored) {
                    createHorizontalScroller(self, view, item, loading);

                    if (item.Type !== 'PhotoAlbum') {
                        initAlphaPicker();
                    }
                }

                if (!params.genreId) {
                    view.querySelector('.listPageButtons').classList.add('hide');
                }
            });

            if (params.genreId) {
                Emby.Models.item(params.genreId).then(function (item) {

                    currentItem = item;
                    Emby.Page.setTitle(item.Name);

                    if (item.Type === 'MusicGenre') {
                        view.querySelector('.listPageButtons').classList.remove('hide');
                    } else {
                        view.querySelector('.listPageButtons').classList.add('hide');
                    }

                    if (playbackManager.canQueue(item)) {
                        view.querySelector('.btnQueue').classList.remove('hide');
                    } else {
                        view.querySelector('.btnQueue').classList.add('hide');
                    }
                });
            }

            if (!isRestored) {
                view.querySelector('.btnPlay').addEventListener('click', play);
                view.querySelector('.btnQueue').addEventListener('click', queue);
                view.querySelector('.btnInstantMix').addEventListener('click', instantMix);
                view.querySelector('.btnShuffle').addEventListener('click', shuffle);
            }

        });

        function initAlphaPicker() {
            self.alphaPicker = new alphaPicker({
                element: view.querySelector('.alphaPicker'),
                itemsContainer: view.querySelector('.scrollSlider'),
                itemClass: 'card'
            });

            self.alphaPicker.on('alphavaluechanged', onAlphaPickerValueChanged);
        }

        function onAlphaPickerValueChanged() {

            var value = self.alphaPicker.value();

            trySelectValue(value);
        }

        function trySelectValue(value) {

            var card;

            // If it's the symbol just pick the first card
            if (value === '#') {

                card = contentScrollSlider.querySelector('.card');

                if (card) {
                    self.scroller.toCenter(card, false);
                    return;
                }
            }

            card = contentScrollSlider.querySelector('.card[data-prefix^=\'' + value + '\']');

            if (card) {
                self.scroller.toCenter(card, false);
                return;
            }

            // go to the previous letter
            var values = self.alphaPicker.values();
            var index = values.indexOf(value);

            if (index < values.length - 2) {
                trySelectValue(values[index + 1]);
            } else {
                var all = contentScrollSlider.querySelectorAll('.card');
                card = all.length ? all[all.length - 1] : null;

                if (card) {
                    self.scroller.toCenter(card, false);
                }
            }
        }

        function setTitle(item) {

            if (params.type === 'collections') {
                Emby.Page.setTitle(Globalize.translate('Collections'));
            } else if (params.type === 'favoritemovies') {
                Emby.Page.setTitle(Globalize.translate('FavoriteMovies'));
            } else {
                Emby.Page.setTitle(item.Name);
            }
        }

        function play() {

            playbackManager.play({
                items: [currentItem]
            });
        }

        function queue() {

            playbackManager.queue({
                items: [currentItem]
            });
        }

        function instantMix() {
            playbackManager.instantMix(currentItem.Id);
        }

        function shuffle() {
            playbackManager.shuffle(currentItem.Id);
        }

        view.addEventListener('viewdestroy', function () {

            if (self.scroller) {
                self.scroller.destroy();
            }
            if (self.listController) {
                self.listController.destroy();
            }
            if (self.alphaPicker) {
                self.alphaPicker.off('alphavaluechanged', onAlphaPickerValueChanged);
                self.alphaPicker.destroy();
            }
        });
    };

});