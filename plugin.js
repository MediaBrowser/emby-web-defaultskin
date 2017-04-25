define(['playbackManager', 'pluginManager', 'browser', 'connectionManager', 'events', 'datetime', 'mouseManager', 'dom', 'layoutManager'], function (playbackManager, pluginManager, browser, connectionManager, events, datetime, mouseManager, dom, layoutManager) {
    'use strict';

    function updateClock() {

        var date = new Date();
        var time = datetime.getDisplayTime(date).toLowerCase();

        var clock = document.querySelector('.headerClock');

        if (clock) {
            clock.innerHTML = time;
        }
    }

    return function () {

        var self = this;

        self.name = 'Default Skin';
        self.type = 'skin';
        self.id = 'defaultskin';

        var dependencyPrefix = self.id;
        var settingsObjectName = dependencyPrefix + '/skinsettings';

        self.getHeaderTemplate = function () {
            return pluginManager.mapPath(self, 'header.html');
        };

        self.getDependencies = function () {

            var list = [
                // Used for the mpaa rating
                'css!' + pluginManager.mapPath(self, 'css/style'),
                'css!' + pluginManager.mapPath(self, 'css/colors.dark'),
                'flexStyles'
            ];

            if (browser.android) {
                // on android we can't just use Roboto by name, it has to be sans-serif, which we don't want on other platforms
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts'));
            } else if (browser.tv && !browser.chrome) {
                console.log("Using system fonts with explicit sizes");
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.sized'));
            } else if (browser.tv) {
                // Designed to use system default fonts
                console.log("Using system fonts");
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.device'));
            } else {
                console.log("Using default fonts");
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts'));
            }

            if (browser.noFlex || browser.operaTv) {
                list.push('css!' + pluginManager.mapPath(self, 'css/noflex'));
            }

            if (browser.operaTv) {
                list.push('css!' + pluginManager.mapPath(self, 'css/operatv'));
            }

            // Needed by the header
            list.push('paper-icon-button-light');

            // Needed by the header
            list.push('material-icons');

            return list;
        };

        self.getTranslations = function () {

            var files = [];

            var languages = ['cs', 'de', 'en-GB', 'en-US', 'fr', 'hr', 'it', 'lt-LT', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ru', 'sv', 'zh-CN'];

            return languages.map(function (i) {
                return {
                    lang: i,
                    path: pluginManager.mapPath(self, 'strings/' + i + '.json')
                };
            });
        };

        self.getRoutes = function () {

            var routes = [];

            var icons = 'material-icons';

            routes.push({
                path: 'home/home.html',
                transition: 'slide',
                type: 'home',
                controller: self.id + '/home/home',
                dependencies: [
                    'cardStyle',
                    icons
                ],
                autoFocus: false
            });

            routes.push({
                path: 'home_horiz/home.html',
                transition: 'slide',
                type: 'home',
                controller: self.id + '/home_horiz/home',
                dependencies: [
                    'cardStyle',
                    'css!' + pluginManager.mapPath(self, 'home_horiz/home.css'),
                    icons
                ]
            });

            routes.push({
                path: 'item/item.html',
                transition: 'slide',
                dependencies: [
                    'cardStyle',
                    'css!' + pluginManager.mapPath(self, 'item/item.css'),
                    'emby-button',
                    icons
                ],
                controller: self.id + '/item/item'
            });

            routes.push({
                path: 'list/list.html',
                transition: 'slide',
                controller: self.id + '/list/list',
                dependencies: [
                    'cardStyle',
                    'emby-button',
                    icons
                ]
            });

            routes.push({
                path: 'music/music.html',
                transition: 'slide',
                controller: self.id + '/music/music',
                autoFocus: false
            });

            routes.push({
                path: 'movies/movies.html',
                transition: 'slide',
                controller: self.id + '/movies/movies',
                autoFocus: false
            });

            routes.push({
                path: 'livetv/livetv.html',
                transition: 'slide',
                controller: self.id + '/livetv/livetv',
                dependencies: [],
                autoFocus: false
            });

            routes.push({
                path: 'livetv/livetvitems.html',
                transition: 'slide',
                controller: self.id + '/livetv/livetvitems',
                dependencies: [],
                autoFocus: false
            });

            routes.push({
                path: 'livetv/guide.html',
                transition: 'slide',
                controller: self.id + '/livetv/guide',
                dependencies: [
                    'css!' + pluginManager.mapPath(self, 'livetv/guide.css'),
                    icons
                ]
            });

            routes.push({
                path: 'tv/tv.html',
                transition: 'slide',
                controller: self.id + '/tv/tv',
                autoFocus: false
            });

            routes.push({
                path: 'search/search.html',
                transition: 'slide',
                controller: self.id + '/search/search',
                dependencies: [
                    'css!' + pluginManager.mapPath(self, 'search/search.css'),
                    'emby-input',
                    icons
                ]
            });

            routes.push({
                path: 'nowplaying/nowplaying.html',
                transition: 'slide',
                controller: self.id + '/nowplaying/nowplaying',
                dependencies: [
                    'css!' + pluginManager.mapPath(self, 'nowplaying/nowplaying.css'),
                    'emby-slider',
                    'paper-icon-button-light',
                    icons
                ],
                supportsThemeMedia: true
            });

            routes.push({
                path: 'nowplaying/playlist.html',
                transition: 'slide',
                controller: self.id + '/nowplaying/playlist',
                dependencies: [
                    'css!' + pluginManager.mapPath(self, 'item/item.css')
                ],
                supportsThemeMedia: true
            });

            routes.push({
                path: 'nowplaying/videoosd.html',
                transition: 'fade',
                controller: self.id + '/nowplaying/videoosd',
                dependencies: [
                    'css!' + pluginManager.mapPath(self, 'nowplaying/videoosd.css'),
                    'emby-slider',
                    'paper-icon-button-light',
                    icons
                ],
                type: 'video-osd',
                supportsThemeMedia: true
            });

            routes.push({
                path: 'settings/settings.html',
                transition: 'slide',
                controller: self.id + '/settings/settings',
                dependencies: [
                    'emby-checkbox'
                ],
                type: 'settings',
                category: 'Display',
                thumbImage: '',
                title: self.name
            });

            return routes;
        };

        var clockInterval;
        self.load = function () {

            if (!layoutManager.mobile) {
                document.querySelector('.headerClock').classList.remove('hide');
                updateClock();
                setInterval(updateClock, 50000);
            }

            bindEvents();
        };

        self.unload = function () {

            return new Promise(function (resolve, reject) {

                unbindEvents();

                if (clockInterval) {
                    clearInterval(clockInterval);
                    clockInterval = null;
                }

                require([settingsObjectName], function (skinSettings) {

                    skinSettings.unload();
                    resolve();
                });
            });
        };

        self.getHomeRoute = function () {

            if (!layoutManager.tv) {
                return 'home/home.html';
            }

            if (browser.operaTv || browser.web0s || browser.tizen) {
                return 'home_horiz/home.html';
            }

            return 'home_horiz/home.html';
            //return 'home/home.html';
        };

        self.getRouteUrl = function (item, options) {

            options = options || {};
            var url;

            if (item.Type === 'Genre') {

                url = pluginManager.mapRoute(self, 'list/list.html') + '?genreId=' + item.Id + '&serverId=' + item.ServerId;
                if (options.parentId) {
                    url += '&parentId=' + options.parentId;
                }
                return url;
            }
            if (item.Type === 'GameGenre') {
                url = pluginManager.mapRoute(self, 'list/list.html') + '?gameGenreId=' + item.Id + '&serverId=' + item.ServerId;
                if (options.parentId) {
                    url += '&parentId=' + options.parentId;
                }
                return url;
            }
            if (item.Type === 'MusicGenre') {
                url = pluginManager.mapRoute(self, 'list/list.html') + '?musicGenreId=' + item.Id + '&serverId=' + item.ServerId;
                if (options.parentId) {
                    url += '&parentId=' + options.parentId;
                }
                return url;
            }
            if (item.Type === 'Studio') {
                url = pluginManager.mapRoute(self, 'list/list.html') + '?studioId=' + item.Id + '&serverId=' + item.ServerId;
                if (options.parentId) {
                    url += '&parentId=' + options.parentId;
                }
                return url;
            }
            if (options.context !== 'folders') {
                if (item.CollectionType === 'movies') {
                    url = pluginManager.mapRoute(self, 'movies/movies.html') + '?serverId=' + item.ServerId + '&parentId=' + item.Id;
                    if (options.parentId) {
                        url += '&parentId=' + options.parentId;
                    }
                    return url;
                }
                if (item.CollectionType === 'tvshows') {
                    url = pluginManager.mapRoute(self, 'tv/tv.html') + '?serverId=' + item.ServerId + '&parentId=' + item.Id;
                    if (options.parentId) {
                        url += '&parentId=' + options.parentId;
                    }
                    return url;
                }
                if (item.CollectionType === 'music') {
                    url = pluginManager.mapRoute(self, 'music/music.html') + '?serverId=' + item.ServerId + '&parentId=' + item.Id;
                    if (options.parentId) {
                        url += '&parentId=' + options.parentId;
                    }
                    return url;
                }
            }
            if (item.CollectionType === 'livetv') {
                url = pluginManager.mapRoute(self, 'livetv/livetv.html') + '?serverId=' + item.ServerId;
                return url;
            }

            var showList;

            if (item.IsFolder) {

                if (item.Type !== 'Series' && item.Type !== 'Season' && item.Type !== 'MusicAlbum' && item.Type !== 'MusicArtist' && item.Type !== 'Playlist' && item.Type !== 'BoxSet') {
                    showList = true;
                }
            }

            if (showList) {
                return pluginManager.mapRoute(self, 'list/list.html') + '?parentId=' + item.Id + '&serverId=' + item.ServerId;
            }
            else if (item.Type === 'SeriesTimer') {
                return pluginManager.mapRoute(self, 'item/item.html') + '?seriesTimerId=' + item.Id + '&serverId=' + item.ServerId;
            } else {
                return pluginManager.mapRoute(self, 'item/item.html') + '?id=' + item.Id + '&serverId=' + item.ServerId;
            }
        };

        self.showItem = function (item, options) {

            options = options || {};
            var url;

            if (item.Type === 'Genre') {

                url = pluginManager.mapRoute(self, 'list/list.html') + '?genreId=' + item.Id + '&serverId=' + item.ServerId;
                if (options.parentId) {
                    url += '&parentId=' + options.parentId;
                }
                Emby.Page.show(url, { item: item });
                return;
            }
            if (item.Type === 'GameGenre') {
                url = pluginManager.mapRoute(self, 'list/list.html') + '?gameGenreId=' + item.Id + '&serverId=' + item.ServerId;
                if (options.parentId) {
                    url += '&parentId=' + options.parentId;
                }
                Emby.Page.show(url, { item: item });
                return;
            }
            if (item.Type === 'MusicGenre') {
                url = pluginManager.mapRoute(self, 'list/list.html') + '?musicGenreId=' + item.Id + '&serverId=' + item.ServerId;
                if (options.parentId) {
                    url += '&parentId=' + options.parentId;
                }
                Emby.Page.show(url, { item: item });
                return;
            }
            if (item.Type === 'Studio') {
                url = pluginManager.mapRoute(self, 'list/list.html') + '?studioId=' + item.Id + '&serverId=' + item.ServerId;
                if (options.parentId) {
                    url += '&parentId=' + options.parentId;
                }
                Emby.Page.show(url, { item: item });
                return;
            }
            if (options.context !== 'folders') {
                if (item.CollectionType === 'movies') {
                    url = pluginManager.mapRoute(self, 'movies/movies.html') + '?serverId=' + item.ServerId + '&parentId=' + item.Id;
                    if (options.parentId) {
                        url += '&parentId=' + options.parentId;
                    }
                    Emby.Page.show(url, { item: item });
                    return;
                }
                if (item.CollectionType === 'tvshows') {
                    url = pluginManager.mapRoute(self, 'tv/tv.html') + '?serverId=' + item.ServerId + '&parentId=' + item.Id;
                    if (options.parentId) {
                        url += '&parentId=' + options.parentId;
                    }
                    Emby.Page.show(url, { item: item });
                    return;
                }
                if (item.CollectionType === 'music') {
                    url = pluginManager.mapRoute(self, 'music/music.html') + '?serverId=' + item.ServerId + '&parentId=' + item.Id;
                    if (options.parentId) {
                        url += '&parentId=' + options.parentId;
                    }
                    Emby.Page.show(url, { item: item });
                    return;
                }
            }
            if (item.CollectionType === 'livetv') {
                url = pluginManager.mapRoute(self, 'livetv/livetv.html') + '?serverId=' + item.ServerId;
                Emby.Page.show(url, { item: item });
                return;
            }

            var showList;

            if (item.IsFolder) {

                if (item.Type !== 'Series' && item.Type !== 'Season' && item.Type !== 'MusicAlbum' && item.Type !== 'MusicArtist' && item.Type !== 'Playlist' && item.Type !== 'BoxSet') {
                    showList = true;
                }
            }

            if (showList) {
                Emby.Page.show(pluginManager.mapRoute(self, 'list/list.html') + '?parentId=' + item.Id + '&serverId=' + item.ServerId, { item: item });
            }
            else if (item.Type === 'SeriesTimer') {
                Emby.Page.show(pluginManager.mapRoute(self, 'item/item.html') + '?seriesTimerId=' + item.Id + '&serverId=' + item.ServerId, { item: item });
            } else {
                Emby.Page.show(pluginManager.mapRoute(self, 'item/item.html') + '?id=' + item.Id + '&serverId=' + item.ServerId, { item: item });
            }
        };

        self.showGenre = function (options) {
            Emby.Page.show(pluginManager.mapRoute(self.id, 'list/list.html') + '?parentId=' + options.ParentId + '&genreId=' + options.Id);
        };

        self.setTitle = function (title) {

            if (title !== null) {
                document.querySelector('.headerLogo').classList.remove('hide');
            } else {
                document.querySelector('.headerLogo').classList.add('hide');
            }

            title = title || '&nbsp;';

            var pageTitle = document.querySelector('.pageTitle');
            pageTitle.classList.remove('pageTitleWithLogo');
            pageTitle.style.backgroundImage = null;
            pageTitle.innerHTML = title;
        };

        self.search = function () {

            Emby.Page.show(pluginManager.mapRoute(self, 'search/search.html'));
        };

        self.showLiveTV = function () {
            Emby.Page.show(pluginManager.mapRoute(self, 'livetv/guide.html'));
        };

        self.showGuide = function () {
            Emby.Page.show(pluginManager.mapRoute(self, 'livetv/guide.html'));
        };

        self.showNowPlaying = function () {
            Emby.Page.show(pluginManager.mapRoute(self, 'nowplaying/nowplaying.html'));
        };

        self.showUserMenu = function () {

            // For now just go cheap and re-use the back menu
            showBackMenuInternal(true);
        };

        self.showBackMenu = function () {

            return showBackMenuInternal(false);
        };

        function showBackMenuInternal(showHome) {

            return new Promise(function (resolve, reject) {

                require(['backMenu'], function (showBackMenu) {
                    showBackMenu({
                        showHome: showHome
                    }).then(resolve);
                });
            });
        }

        var headerBackButton;

        function getBackButton() {

            if (!headerBackButton) {
                headerBackButton = document.querySelector('.headerBackButton');
            }
            return headerBackButton;
        }

        function onMouseActive() {

            getBackButton().classList.remove('hide-mouse-idle');
        }

        function onMouseIdle() {
            getBackButton().classList.add('hide-mouse-idle');
        }

        function bindEvents() {

            document.querySelector('.headerBackButton').addEventListener('click', function () {
                Emby.Page.back();
            });

            document.querySelector('.headerSearchButton').addEventListener('click', function () {
                self.search();
            });

            document.querySelector('.headerAudioPlayerButton').addEventListener('click', function () {
                self.showNowPlaying();
            });

            document.querySelector('.headerUserButton').addEventListener('click', function () {
                self.showUserMenu();
            });

            events.on(connectionManager, 'localusersignedin', onLocalUserSignedIn);
            events.on(connectionManager, 'localusersignedout', onLocalUserSignedOut);
            document.addEventListener('viewshow', onViewShow);

            events.on(playbackManager, 'playbackstart', onPlaybackStart);
            events.on(playbackManager, 'playbackstop', onPlaybackStop);
            events.on(mouseManager, 'mouseactive', onMouseActive);
            events.on(mouseManager, 'mouseidle', onMouseIdle);
        }

        function unbindEvents() {

            events.off(connectionManager, 'localusersignedin', onLocalUserSignedIn);
            events.off(connectionManager, 'localusersignedout', onLocalUserSignedOut);
            document.removeEventListener('viewshow', onViewShow);

            events.off(mouseManager, 'mouseactive', onMouseActive);
            events.off(mouseManager, 'mouseidle', onMouseIdle);
            events.off(playbackManager, 'playbackstart', onPlaybackStart);
            events.off(playbackManager, 'playbackstop', onPlaybackStop);
        }

        function onPlaybackStart(e, player, state) {

            if (playbackManager.isPlayingAudio()) {
                document.querySelector('.headerAudioPlayerButton').classList.remove('hide');

                if (state.IsFirstItem && state.IsFullscreen) {
                    self.showNowPlaying();
                }

            } else {
                document.querySelector('.headerAudioPlayerButton').classList.add('hide');
            }
        }

        function onPlaybackStop(e, stopInfo) {

            if (stopInfo.nextMediaType !== 'Audio') {
                document.querySelector('.headerAudioPlayerButton').classList.add('hide');
            }
        }

        function userImageUrl(user, options) {

            options = options || {};
            options.type = "Primary";

            if (user.PrimaryImageTag) {

                options.tag = user.PrimaryImageTag;
                return connectionManager.getApiClient(user.ServerId).getUserImageUrl(user.Id, options);
            }

            return null;
        }

        function onLocalUserSignedIn(e, user) {

            document.querySelector('.headerLogo').classList.add('hide');

            if (!browser.operaTv && !browser.web0s) {
                document.querySelector('.headerSearchButton').classList.remove('hide');
            }

            var headerUserButton = document.querySelector('.headerUserButton');

            if (user.PrimaryImageTag) {

                headerUserButton.innerHTML = '<img src="' + userImageUrl(user, {
                    height: 38
                }) + '" />';

            } else {
                headerUserButton.innerHTML = '<i class="md-icon">&#xE7FD;</i>';
            }

            document.querySelector('.headerUserButton').classList.remove('hide');

            require([settingsObjectName], function (skinSettings) {

                skinSettings.apply();
            });
        }

        function onLocalUserSignedOut(e) {

            require([settingsObjectName], function (skinSettings) {

                skinSettings.unload();
            });

            // Put the logo back in the page title
            document.querySelector('.headerLogo').classList.remove('hide');

            document.querySelector('.headerSearchButton').classList.add('hide');
            document.querySelector('.headerUserButton').classList.add('hide');
        }

        function viewSupportsHeadroom(e) {

            var path = e.detail.state.path;

            return path.indexOf('tv.html') !== -1 ||
                path.indexOf('movies.html') !== -1 ||
                path.indexOf('livetv.html') !== -1 ||
                path.indexOf('music.html') !== -1 ||
                path.indexOf('list.html') !== -1 ||
                path.indexOf('livetvitems.html') !== -1;
        }

        function onViewShow(e) {

            if (Emby.Page.canGoBack()) {
                getBackButton().classList.remove('hide');
            } else {
                getBackButton().classList.add('hide');
            }

            var skinHeader = document.querySelector('.skinHeader');
            skinHeader.classList.remove('headroom--unpinned');

            if (viewSupportsHeadroom(e)) {
                skinHeader.classList.add('skinHeader-withBackground');
            } else {
                skinHeader.classList.remove('skinHeader-withBackground');
            }
        }
    };
});
