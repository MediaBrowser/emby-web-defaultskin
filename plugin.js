define(['playbackManager', 'pluginManager', 'browser', 'connectionManager'], function (playbackManager, pluginManager, browser, connectionManager) {

    function updateClock() {

        var date = new Date();
        var time = date.toLocaleTimeString().toLowerCase();

        if (time.indexOf('am') != -1 || time.indexOf('pm') != -1) {

            var hour = date.getHours() % 12;
            var suffix = date.getHours() > 11 ? 'pm' : 'am';
            if (!hour) {
                hour = 12;
            }
            var minutes = date.getMinutes();

            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            time = hour + ':' + minutes + suffix;
        }

        var clock = document.querySelector('.headerClock');

        if (clock) {
            clock.innerHTML = time;
        }
    }

    return function () {

        var self = this;

        self.name = 'Kid Friendly Default Skin';
        self.type = 'skin';
        self.id = 'kidfriendlydefaultskin';

        var dependencyPrefix = self.id;
        var settingsObjectName = dependencyPrefix + '/skinsettings';

        self.getHeaderTemplate = function () {
            return pluginManager.mapPath(self, 'header.html');
        };

        self.getDependencies = function () {

            var list = [
                // Used for the mpaa rating
                'css!' + pluginManager.mapPath(self, 'css/style'),
                'css!' + pluginManager.mapPath(self, 'cards/card'),
                'css!' + pluginManager.mapPath(self, 'css/colors.dark'),
                'css!' + pluginManager.mapPath(self, 'css/paperstyles'),
                'css!' + pluginManager.mapPath(self, 'css/papericonbutton')
            ];

            if (browser.android) {
                // on android we can't just use Roboto by name, it has to be sans-serif, which we don't want on other platforms
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.android'));
            } else if (browser.tv && (!browser.chrome || browser.web0s)) {
                // Need to set our own font sizes on web0s
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.sized'));
            } else if (browser.tv && browser.chrome) {
                // Designed to use system default fonts
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.device'));
            } else if (browser.xboxOne) {
                // Xbox defines good default font sizes, so load a stylesheet that only applies the font family
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts.xbox'));
            } else {
                list.push('opensansFont');
                list.push('css!' + pluginManager.mapPath(self, 'css/fonts'));
            }

            // The samsung and lg tv browsers don't quite support all of the flex techniques being used, so add a stylehsheet to degrade
            if (browser.tv && !browser.chrome) {
                list.push('css!' + pluginManager.mapPath(self, 'css/smarttv'));
            }

            //list.push('css!' + pluginManager.mapPath(self, 'css/smarttv'));

            // Needed by the header
            list.push('paper-icon-button');

            // Needed by the header
            list.push('html!' + pluginManager.mapPath(self, 'icons.html'));

            return list;
        };

        self.getTranslations = function () {

            var files = [];

            var languages = ['en-US', 'de', 'fr', 'nl', 'pt-BR', 'pt-PT', 'ru', 'sv'];

            return languages.map(function (i) {
                return {
                    lang: i,
                    path: pluginManager.mapPath(self, 'strings/' + i + '.json')
                };
            });
        };

        self.getRoutes = function () {

            var routes = [];

            var icons = 'html!' + pluginManager.mapPath(self, 'icons.html');

            routes.push({
                path: 'home.html',
                transition: 'slide',
                type: 'home',
                controller: self.id + '/home/home',
                dependencies: [
                    'css!' + pluginManager.mapPath(self, 'home/home.css'),
                    icons
                ]
            });

            routes.push({
                path: 'item/item.html',
                transition: 'slide',
                dependencies: [
                    'css!' + pluginManager.mapPath(self, 'item/item.css'),
                    'paper-button',
                    icons
                ],
                controller: self.id + '/item/item'
            });

            routes.push({
                path: 'list/list.html',
                transition: 'slide',
                controller: self.id + '/list/list',
                dependencies: ['paper-button', icons]
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
                dependencies: []
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

            //routes.push({
            //    path: 'search/search.html',
            //    transition: 'slide',
            //    controller: self.id + '/search/search',
            //    dependencies: [
            //        'css!' + pluginManager.mapPath(self, 'search/search.css'),
			//		'paper-input',
            //        icons
            //    ]
            //});

            routes.push({
                path: 'nowplaying/nowplaying.html',
                transition: 'slide',
                controller: self.id + '/nowplaying/nowplaying',
                dependencies: [
                    'css!' + pluginManager.mapPath(self, 'nowplaying/nowplaying.css'),
                    'paper-slider',
                    'paper-icon-button',
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
                    'paper-slider',
                    'paper-icon-button',
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
                    'emby-dropdown-menu'
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

            updateClock();
            setInterval(updateClock, 50000);
            bindEvents();
        };

        self.unload = function () {

            unbindEvents();

            if (clockInterval) {
                clearInterval(clockInterval);
                clockInterval = null;
            }

            return new Promise(function (resolve, reject) {

                require([settingsObjectName], function (skinSettings) {

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
                Emby.Page.show(pluginManager.mapRoute(self, 'list/list.html') + '?parentid=' + item.Id, { item: item });
            } else {
                Emby.Page.show(pluginManager.mapRoute(self, 'item/item.html') + '?id=' + item.Id, { item: item });
            }
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

            //document.querySelector('.headerSearchButton').addEventListener('click', function () {
            //    self.search();
            //});

            document.querySelector('.headerAudioPlayerButton').addEventListener('click', function () {
                self.showNowPlaying();
            });

            //document.querySelector('.headerUserButton').addEventListener('click', function () {
            //    self.showUserMenu();
            //});

            Events.on(connectionManager, 'localusersignedin', onLocalUserSignedIn);
            Events.on(connectionManager, 'localusersignedout', onLocalUserSignedOut);
            document.addEventListener('viewshow', onViewShow);

            Events.on(playbackManager, 'playbackstart', onPlaybackStart);
            Events.on(playbackManager, 'playbackstop', onPlaybackStop);
        }

        function unbindEvents() {

            Events.off(connectionManager, 'localusersignedin', onLocalUserSignedIn);
            Events.off(connectionManager, 'localusersignedout', onLocalUserSignedOut);
            document.removeEventListener('viewshow', onViewShow);

            Events.off(playbackManager, 'playbackstart', onPlaybackStart);
            Events.off(playbackManager, 'playbackstop', onPlaybackStop);
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

        function onLocalUserSignedIn(e, user) {

            document.querySelector('.headerLogo').classList.add('hide');

            //document.querySelector('.headerSearchButton').classList.remove('hide');

            //var headerUserButton = document.querySelector('.headerUserButton');

            //if (user.PrimaryImageTag) {

            //    headerUserButton.icon = null;
            //    headerUserButton.src = Emby.Models.userImageUrl(user, {
            //        height: 44
            //    });

            //} else {
            //    headerUserButton.src = null;
            //    headerUserButton.icon = 'person';
            //}

            //document.querySelector('.headerUserButton').classList.remove('hide');

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

            //document.querySelector('.headerSearchButton').classList.add('hide');
            //document.querySelector('.headerUserButton').classList.add('hide');
        }

        function onViewShow(e) {

            if (Emby.Page.canGoBack()) {
                document.querySelector('.headerBackButton').classList.remove('hide');
            } else {
                document.querySelector('.headerBackButton').classList.add('hide');
            }
            var path = e.detail.state.path;

            var enableSubduedBackdrop = path.indexOf('item.html') == -1 && path.indexOf('guide.html') == -1 && path.indexOf('nowplaying') == -1;
            setSubduedBackdrop(enableSubduedBackdrop);
        }

        function setSubduedBackdrop(isSubdued) {
            var elem = document.querySelector('.skinContainer');
            if (isSubdued) {

                elem.classList.remove('detailBackdrop');

            } else {
                elem.classList.add('detailBackdrop');
            }
        }
    }
});