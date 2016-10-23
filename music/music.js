define(['loading', './../skininfo', 'alphaPicker', 'cardBuilder', './../components/horizontallist', './../components/focushandler', './../components/tabbedpage', 'backdrop', 'focusManager', 'emby-itemscontainer'], function (loading, skinInfo, alphaPicker, cardBuilder, horizontalList, focusHandler, tabbedPage, backdrop, focusManager) {
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

            if (self.focusHandler) {
                self.focusHandler.destroy();
            }
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

            self.alphaPicker.visible(false);

            var tabs = [
                {
                    Name: Globalize.translate('Albums'),
                    Id: "albums"
                },
                {
                    Name: Globalize.translate('AlbumArtists'),
                    Id: "albumartists"
                },
                {
                    Name: Globalize.translate('Artists'),
                    Id: "artists"
                },
                {
                    Name: Globalize.translate('Genres'),
                    Id: "genres"
                },
                {
                    Name: Globalize.translate('Playlists'),
                    Id: "playlists"
                },
                {
                    Name: Globalize.translate('Favorites'),
                    Id: "favorites"
                }
            ];

            //tabs.push({
            //    Name: Globalize.translate('Songs'),
            //    Id: "songs"
            //});

            var tabbedPageInstance = new tabbedPage(view, {
                alphaPicker: self.alphaPicker
            });
            tabbedPageInstance.loadViewContent = loadViewContent;
            tabbedPageInstance.params = params;
            tabbedPageInstance.renderTabs(tabs, initialTabId);
            pageInstance.tabbedPage = tabbedPageInstance;
        }

        function loadViewContent(page, id) {

            var tabbedPage = this;

            return new Promise(function (resolve, reject) {

                if (self.listController) {
                    self.listController.destroy();
                }
                if (self.focusHandler) {
                    self.focusHandler.destroy();
                }

                var pageParams = tabbedPage.params;

                var autoFocus = false;

                if (!tabbedPage.hasLoaded) {
                    autoFocus = true;
                    tabbedPage.hasLoaded = true;
                }

                var showAlphaPicker = false;

                var contentScrollSlider = page.querySelector('.contentScrollSlider');
                contentScrollSlider.removeEventListener('click', onMusicGenresContainerClick);

                switch (id) {

                    case 'albumartists':
                        showAlphaPicker = true;
                        renderAlbumArtists(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'artists':
                        showAlphaPicker = true;
                        renderArtists(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'albums':
                        showAlphaPicker = true;
                        renderAlbums(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'playlists':
                        renderPlaylists(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'songs':
                        renderSongs(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'genres':
                        contentScrollSlider.addEventListener('click', onMusicGenresContainerClick);
                        renderGenres(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                        break;
                    case 'favorites':
                        renderFavorites(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
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

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.genres({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks"
                    });
                },
                cardOptions: {
                    shape: 'auto',
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    action: 'none',
                    scalable: false,
                    showTitle: true,
                    overlayText: true
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

        function parentWithClass(elem, className) {

            while (!elem.classList || !elem.classList.contains(className)) {
                elem = elem.parentNode;

                if (!elem) {
                    return null;
                }
            }

            return elem;
        }

        function onMusicGenresContainerClick(e) {

            var card = parentWithClass(e.target, 'card');

            if (card) {

                var value = card.getAttribute('data-id');
                var parentid = params.parentid;

                e.preventDefault();
                e.stopPropagation();

                Emby.Page.show(Emby.PluginManager.mapRoute(skinInfo.id, 'list/list.html') + '?parentid=' + parentid + '&genreId=' + value);

                return false;
            }
        }

        function renderPlaylists(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.playlists({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks"
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
                    overlayText: true,
                    showTitle: true,
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

        function renderAlbums(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "MusicAlbum",
                        Recursive: true,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks,SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                cardOptions: {
                    coverImage: true,
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                },
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

        function renderSongs(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Audio",
                        Recursive: true,
                        SortBy: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                cardOptions: {
                    coverImage: true,
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                },
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

        function renderArtists(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.artists({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks,SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                cardOptions: {
                    coverImage: true,
                    overlayText: true,
                    showTitle: true,
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                },
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

        function renderAlbumArtists(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({
                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.albumArtists({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks,SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                cardOptions: {
                    coverImage: true,
                    overlayText: true,
                    showTitle: true,
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                },
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

        function renderFavorites(page, pageParams, autoFocus, scroller, resolve) {

            require(['text!' + Emby.PluginManager.mapPath(skinInfo.id, 'music/views.favorites.html')], function (html) {
                var parent = page.querySelector('.contentScrollSlider');
                parent.innerHTML = Globalize.translateDocument(html, skinInfo.id);
                loadFavoriteArtists(parent, pageParams, autoFocus, resolve);
                loadFavoriteAlbums(parent, pageParams);
            });

            self.focusHandler = new focusHandler({
                parent: page.querySelector('.contentScrollSlider'),
                scroller: scroller,
                selectedItemInfoElement: page.querySelector('.selectedItemInfo')
            });
        }

        function loadFavoriteArtists(parent, pageParams, autoFocus, resolve) {

            Emby.Models.artists({
                ParentId: pageParams.parentid,
                Recursive: true,
                Filters: "IsFavorite",
                SortBy: "SortName"

            }).then(function (result) {

                var section = parent.querySelector('.favoriteArtistsSection');

                if (result.Items.length) {
                    section.classList.remove('hide');
                } else {
                    section.classList.add('hide');
                }

                cardBuilder.buildCards(result.Items, {
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'auto',
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                });

                if (autoFocus) {
                    setTimeout(function () {
                        var firstCard = section.querySelector('.card');
                        if (firstCard) {
                            focusManager.focus(firstCard);
                        }
                    }, 400);
                }
                resolve();
            });
        }

        function loadFavoriteAlbums(parent, pageParams) {

            Emby.Models.items({
                ParentId: pageParams.parentid,
                IncludeItemTypes: "MusicAlbum",
                Recursive: true,
                Filters: "IsFavorite",
                SortBy: "SortName"

            }).then(function (result) {

                var section = parent.querySelector('.favoriteAlbumsSection');

                if (result.Items.length) {
                    section.classList.remove('hide');
                } else {
                    section.classList.add('hide');
                }

                cardBuilder.buildCards(result.Items, {
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'auto',
                    rows: {
                        portrait: 2,
                        square: 3,
                        backdrop: 3
                    },
                    scalable: false
                });
            });
        }
    };

});