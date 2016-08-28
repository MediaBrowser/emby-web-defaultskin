define(['playbackManager', 'pluginManager', 'browser', 'connectionManager', 'events', 'datetime'], function (playbackManager, pluginManager, browser, connectionManager, events, datetime) {

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

        self.name = 'mentasm';
        self.type = 'skin';
        self.id = 'mentasm';

        var dependencyPrefix = self.id;
        var settingsObjectName = dependencyPrefix + '/skinsettings';

        self.getHeaderTemplate = function () {
            return pluginManager.mapPath(self, 'header.html');
        };

        self.getDependencies = function () {

            var list = [
                // Used for the mpaa rating
                'css!' + pluginManager.mapPath(self, 'css/style'),
                'css!' + pluginManager.mapPath(self, 'css/colors.dark')
            ];

            if (browser.android) {
                // on android we can't just use Roboto by name, it has to be sans-serif, which we don't want on other platforms
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.android'));
            } else if (browser.tv && !browser.chrome) {
                console.log("Using system fonts with explicit sizes");
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.sized'));
            } else if (browser.tv) {
                // Designed to use system default fonts
                console.log("Using system fonts");
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.device'));
            } else if (browser.xboxOne) {
                // Xbox defines good default font sizes, so load a stylesheet that only applies the font family
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.xbox'));
            } else if (browser.edge) {
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.segoe'));
            } else {
                console.log("Using default fonts");
                list.push('opensansFont');
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts'));
            }

            // The samsung and lg tv browsers don't quite support all of the flex techniques being used, so add a stylehsheet to degrade
            if (browser.noFlex) {
                console.log("** Using noflex css");
                list.push('css!' + pluginManager.mapPath(self, 'css/noflex'));
            }

            // Needed by the header
            list.push('paper-icon-button-light');

            // Needed by the header
            list.push('material-icons');

            return list;
        };

        self.getTranslations = function () {

            var files = [];

            var languages = ['de', 'en-GB', 'en-US', 'fr', 'it', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ru', 'sv'];

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
                path: 'home.html',
                transition: 'slide',
                type: 'home',
                controller: self.id + '/home/home',
                dependencies: [
                    'cardStyle',
                    'css!' + pluginManager.mapPath(self, 'home/home.css'),
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
                    icons]
            });

            routes.push({
                path: 'music/music.html',
                transition: 'slide',
                controller: self.id + '/music/music'
            });

            routes.push({
                path: 'movies/movies.html',
                transition: 'slide',
                controller: self.id + '/movies/movies'
            });

            routes.push({
                path: 'livetv/livetv.html',
                transition: 'slide',
                controller: self.id + '/livetv/livetv',
                dependencies: [
                    'cardStyle',
                ]
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
                controller: self.id + '/tv/tv'
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

            // enable later after app approvals
            if (!browser.tv) {
                routes.push({
                    path: 'settings/settings.html',
                    transition: 'slide',
                    controller: self.id + '/settings/settings',
                    dependencies: [
                        'emby-select',
                        'emby-checkbox'
                    ],
                    type: 'settings',
                    category: 'Display',
                    thumbImage: '',
                    title: 'Default Skin'
                });
            }

            return routes;
        };

        function onUserDataChanged(e, apiClient, userData) {
            require(['cardBuilder'], function (cardBuilder) {
                cardBuilder.onUserDataChanged(userData);
            });
        }

        var clockInterval;
        self.load = function () {

            updateClock();
            setInterval(updateClock, 50000);
            bindEvents();

            require(['serverNotifications'], function (serverNotifications) {

                events.on(serverNotifications, 'UserDataChanged', onUserDataChanged);
            });
        };

        self.unload = function () {

            return new Promise(function (resolve, reject) {

                unbindEvents();

                if (clockInterval) {
                    clearInterval(clockInterval);
                    clockInterval = null;
                }

                require([settingsObjectName, 'serverNotifications'], function (skinSettings, serverNotifications) {

                    events.off(serverNotifications, 'UserDataChanged', onUserDataChanged);
                    skinSettings.unload();
                    resolve();
                });
            });
        };

        self.showItem = function (item) {

            var showList = false;

            if (item.IsFolder) {

                if (item.Type != 'Series' && item.Type != 'Season' && item.Type != 'MusicAlbum' && item.Type != 'MusicArtist' && item.Type != 'Playlist' && item.Type != 'BoxSet') {
                    showList = true;
                }
            }

            if (showList) {
                Emby.Page.show(pluginManager.mapRoute(self, 'list/list.html') + '?parentid=' + item.Id + '&serverId=' + item.ServerId, { item: item });
            } else {
                Emby.Page.show(pluginManager.mapRoute(self, 'item/item.html') + '?id=' + item.Id + '&serverId=' + item.ServerId, { item: item });
            }
        };

        self.showGenre = function(options) {
            Emby.Page.show(pluginManager.mapRoute(self.id, 'list/list.html') + '?parentid=' + options.ParentId + '&genreId=' + options.Id);
        };

        self.setTitle = function (title) {

            if (title == null) {
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

        function bindEvents() {

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
        }

        function unbindEvents() {

            events.off(connectionManager, 'localusersignedin', onLocalUserSignedIn);
            events.off(connectionManager, 'localusersignedout', onLocalUserSignedOut);
            document.removeEventListener('viewshow', onViewShow);

            events.off(playbackManager, 'playbackstart', onPlaybackStart);
            events.off(playbackManager, 'playbackstop', onPlaybackStop);
        }

        function onPlaybackStart(e) {

            if (playbackManager.isPlayingAudio()) {
                document.querySelector('.headerAudioPlayerButton').classList.remove('hide');
            } else {
                document.querySelector('.headerAudioPlayerButton').classList.add('hide');
            }
        }

        function onPlaybackStop(e, stopInfo) {

            if (stopInfo.nextMediaType != 'Audio') {
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

            if (!browser.tv) {
                document.querySelector('.headerSearchButton').classList.remove('hide');
            }

            var headerUserButton = document.querySelector('.headerUserButton');

            if (user.PrimaryImageTag) {

                headerUserButton.innerHTML = '<img src="' + userImageUrl(user, {
                    height: 38
                }) + '" />';

            } else {
                headerUserButton.innerHTML = '<i class="md-icon">person</i>';
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

        function onViewShow(e) {

            if (Emby.Page.canGoBack()) {
                document.querySelector('.headerBackButton').classList.remove('hide');
            } else {
                document.querySelector('.headerBackButton').classList.add('hide');
            }
            var path = e.detail.state.path;

            var isDetailBackdrop = path.indexOf('item.html') != -1 || -1 && path.indexOf('guide.html') != -1 || path.indexOf('nowplaying') != -1;
            var isStaticBackdrop = !isDetailBackdrop && (path.indexOf('login.html') != -1 || path.indexOf('selectserver.html') != -1);
            setBackdropStyle(isDetailBackdrop, isStaticBackdrop);
        }

        var backgroundContainer;
        function setBackdropStyle(isDetailBackdrop, isStaticBackdrop) {

            backgroundContainer = backgroundContainer || document.querySelector('.backgroundContainer');

            if (isDetailBackdrop) {

                backgroundContainer.classList.add('detailBackdrop');

            } else {
                backgroundContainer.classList.remove('detailBackdrop');
            }

            if (isStaticBackdrop) {

                backgroundContainer.classList.add('staticBackdrop');

            } else {
                backgroundContainer.classList.remove('staticBackdrop');
            }
        }
    }
});
