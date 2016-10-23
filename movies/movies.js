define(['loading', 'alphaPicker', './../components/horizontallist', './../components/tabbedpage', 'backdrop', 'emby-itemscontainer'], function (loading, alphaPicker, horizontalList, tabbedPage, backdrop) {
    'use strict';

    return function (view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            if (!self.tabbedPage) {
                loading.show();
                renderTabs(view, params.tab, self, params);
            }

            Emby.Page.setTitle('');
        });

        view.addEventListener('viewdestroy', function () {

            if (self.listController) {
                self.listController.destroy();
            }
            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
            if (self.alphaPicker) {
                self.alphaPicker.destroy();
            }
        });

        function renderTabs(view, initialTabId, pageInstance, params) {

            self.alphaPicker = new alphaPicker({
                element: view.querySelector('.alphaPicker'),
                itemsContainer: view.querySelector('.contentScrollSlider'),
                itemClass: 'card'
            });

            var tabs = [
                {
                    Name: Globalize.translate('Movies'),
                    Id: "movies"
                },
                {
                    Name: Globalize.translate('Unwatched'),
                    Id: "unwatched"
                },
                {
                    Name: Globalize.translate('Collections'),
                    Id: "collections"
                },
                {
                    Name: Globalize.translate('Genres'),
                    Id: "genres"
                },
                {
                    Name: Globalize.translate('Years'),
                    Id: "years"
                },
                {
                    Name: Globalize.translate('TopRated'),
                    Id: "toprated"
                },
                {
                    Name: Globalize.translate('Favorites'),
                    Id: "favorites"
                }
            ];

            var tabbedPageInstance = new tabbedPage(view, {
                alphaPicker: self.alphaPicker
            });

            tabbedPageInstance.loadViewContent = loadViewContent;
            tabbedPageInstance.params = params;
            tabbedPageInstance.renderTabs(tabs, initialTabId);
            pageInstance.tabbedPage = tabbedPageInstance;
        }

        function loadViewContent(page, id, type) {

            var tabbedPage = this;

            return new Promise(function (resolve, reject) {

                if (self.listController) {
                    self.listController.destroy();
                }

                var pageParams = tabbedPage.params;

                var autoFocus = false;

                if (!tabbedPage.hasLoaded) {
                    autoFocus = true;
                    tabbedPage.hasLoaded = true;
                }

                var showAlphaPicker = false;

                switch (id) {

                    case 'movies':
                        showAlphaPicker = true;
                        renderMovies(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'unwatched':
                        showAlphaPicker = true;
                        renderUnwatchedMovies(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'years':
                        renderYears(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'toprated':
                        renderTopRated(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'collections':
                        renderCollections(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'favorites':
                        renderFavorites(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'genres':
                        renderGenres(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    default:
                        break;
                }

                if (self.alphaPicker) {
                    self.alphaPicker.visible(showAlphaPicker);
                    self.alphaPicker.enabled(showAlphaPicker);
                }
            });
        }

        function renderGenres(page, pageParams, autoFocus, scroller, resolve) {

            Emby.Models.genres({
                ParentId: pageParams.parentid,
                SortBy: "SortName"

            }).then(function (genresResult) {

                self.listController = new horizontalList({
                    itemsContainer: page.querySelector('.contentScrollSlider'),
                    getItemsMethod: function (startIndex, limit) {
                        return Emby.Models.items({
                            StartIndex: startIndex,
                            Limit: limit,
                            ParentId: pageParams.parentid,
                            IncludeItemTypes: "Movie",
                            Recursive: true,
                            SortBy: "SortName",
                            Fields: "Genres"
                        });
                    },
                    listCountElement: page.querySelector('.listCount'),
                    listNumbersElement: page.querySelector('.listNumbers'),
                    autoFocus: autoFocus,
                    selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                    selectedIndexElement: page.querySelector('.selectedIndex'),
                    scroller: scroller,
                    onRender: function () {
                        if (resolve) {
                            resolve();
                            resolve = null;
                        }
                    },
                    cardOptions: {
                        indexBy: 'Genres',
                        genres: genresResult.Items,
                        indexLimit: 4,
                        parentId: pageParams.parentid,
                        rows: {
                            portrait: 2,
                            square: 3,
                            backdrop: 3
                        },
                        scalable: false
                    }
                });

                self.listController.render();
            });
        }

        function renderFavorites(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        Filters: "IsFavorite",
                        SortBy: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                },
                cardOptions: {
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                }
            });

            self.listController.render();
        }

        function renderMovies(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "SortName",
                        Fields: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                },
                cardOptions: {
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                }
            });

            self.listController.render();
        }

        function renderUnwatchedMovies(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "SortName",
                        Fields: "SortName",
                        IsPlayed: false
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                },
                cardOptions: {
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                }
            });

            self.listController.render();
        }

        function renderCollections(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.collections({
                        StartIndex: startIndex,
                        Limit: limit,
                        SortBy: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                },
                cardOptions: {
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                }
            });

            self.listController.render();
        }

        function renderYears(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "ProductionYear,SortName",
                        SortOrder: "Descending"
                    });
                },
                cardOptions: {
                    indexBy: 'ProductionYear',
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }

        function renderTopRated(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "CommunityRating,SortName",
                        SortOrder: "Descending"
                    });
                },
                cardOptions: {
                    indexBy: 'CommunityRating',
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }
    };

});