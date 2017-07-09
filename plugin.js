define(['playbackManager', 'pluginManager', 'browser', 'connectionManager', 'events', 'datetime', 'mouseManager', 'dom', 'layoutManager', 'itemHelper', 'apphost'], function (playbackManager, pluginManager, browser, connectionManager, events, datetime, mouseManager, dom, layoutManager, itemHelper, appHost) {
    'use strict';

    function updateClock() {

        var date = new Date();
        var time = datetime.getDisplayTime(date).toLowerCase();

        var clock = document.querySelector('.headerClock');

        if (clock) {
            clock.innerHTML = time;
        }
    }

    function DefaultSkin() {

        var self = this;

        self.name = 'Smoothie';
        self.type = 'skin';
        self.id = 'smoothie';

        var settingsObjectName = self.id + '/skinsettings';

        var clockInterval;
        self.load = function () {

            if (!layoutManager.mobile) {
                document.querySelector('.headerClock').classList.remove('hide');
                updateClock();
                clockInterval = setInterval(updateClock, 50000);
            }

            bindEvents();

            setRemoteControlVisibility();
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

        function onCastButtonClick() {
            var btn = this;

            require(['playerSelectionMenu'], function (playerSelectionMenu) {
                playerSelectionMenu.show(btn);
            });
        }

        function updateCastIcon() {

            var context = document;

            var btnCast = context.querySelector('.headerCastButton');

            if (!btnCast) {
                return;
            }

            var info = playbackManager.getPlayerInfo();

            if (info && !info.isLocalPlayer) {

                btnCast.querySelector('i').innerHTML = '&#xE308;';
                btnCast.classList.add('active');
                context.querySelector('.headerSelectedPlayer').innerHTML = info.deviceName || info.name;

            } else {
                btnCast.querySelector('i').innerHTML = '&#xE307;';
                btnCast.classList.remove('active');

                context.querySelector('.headerSelectedPlayer').innerHTML = '';
            }
        }

        function setRemoteControlVisibility() {

            if (appHost.supports('remotecontrol') && !layoutManager.tv) {
                document.querySelector('.headerCastButton').classList.remove('hide');
                document.querySelector('.headerSelectedPlayer').classList.remove('hide');
            } else {
                document.querySelector('.headerCastButton').classList.add('hide');
                document.querySelector('.headerSelectedPlayer').classList.add('hide');
            }
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

            document.querySelector('.headerCastButton').addEventListener('click', onCastButtonClick);

            document.querySelector('.headerUserButton').addEventListener('click', function () {
                self.showUserMenu();
            });

            events.on(connectionManager, 'localusersignedin', onLocalUserSignedIn);
            events.on(connectionManager, 'localusersignedout', onLocalUserSignedOut);
            document.addEventListener('viewshow', onViewShow);

            events.on(playbackManager, 'playerchange', updateCastIcon);
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
            events.off(playbackManager, 'playerchange', updateCastIcon);
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
    }

    function showBackMenuInternal(showHome) {

        return new Promise(function (resolve, reject) {

            require(['backMenu'], function (showBackMenu) {
                showBackMenu({
                    showHome: showHome
                }).then(resolve);
            });
        });
    }

    DefaultSkin.prototype.getRouteUrl = function (item, options) {

        options = options || {};
        var url;

        if (typeof (item) === 'string') {
            if (item === 'nextup') {
                return pluginManager.mapRoute(this, 'list/list.html') + '?type=nextup&serverId=' + options.serverId;
            }
            if (item === 'recordedtv') {

                return pluginManager.mapRoute(this, 'livetv/livetv.html') + '?tab=3&serverId=' + options.serverId;
            }
            if (item === 'livetv') {

                if (options.section === 'guide') {
                    return pluginManager.mapRoute(this, 'livetv/guide.html') + '?serverId=' + options.serverId;
                }
                if (options.section === 'dvrschedule') {
                    return pluginManager.mapRoute(this, 'livetv/livetv.html') + '?tab=4&serverId=' + options.serverId;
                }
                if (options.section === 'onnow') {
                    return pluginManager.mapRoute(this, 'livetv/livetvitems.html') + '?type=Programs&IsAiring=true&serverId=' + options.serverId;
                }
                return pluginManager.mapRoute(this, 'livetv/livetv.html') + '?serverId=' + options.serverId;
            }
        }

        if (item.Type === 'Genre') {

            url = pluginManager.mapRoute(this, 'list/list.html') + '?genreId=' + item.Id + '&serverId=' + item.ServerId;
            if (options.parentId) {
                url += '&parentId=' + options.parentId;
            }
            return url;
        }
        if (item.Type === 'GameGenre') {
            url = pluginManager.mapRoute(this, 'list/list.html') + '?gameGenreId=' + item.Id + '&serverId=' + item.ServerId;
            if (options.parentId) {
                url += '&parentId=' + options.parentId;
            }
            return url;
        }
        if (item.Type === 'MusicGenre') {
            url = pluginManager.mapRoute(this, 'list/list.html') + '?musicGenreId=' + item.Id + '&serverId=' + item.ServerId;
            if (options.parentId) {
                url += '&parentId=' + options.parentId;
            }
            return url;
        }
        if (item.Type === 'Studio') {
            url = pluginManager.mapRoute(this, 'list/list.html') + '?studioId=' + item.Id + '&serverId=' + item.ServerId;
            if (options.parentId) {
                url += '&parentId=' + options.parentId;
            }
            return url;
        }
        if (options.context !== 'folders' && !itemHelper.isLocalItem(item)) {
            if (item.CollectionType === 'movies') {
                url = pluginManager.mapRoute(this, 'movies/movies.html') + '?serverId=' + item.ServerId + '&parentId=' + item.Id;

                if (options.section === 'latest') {
                    url += '&tab=1';
                }
                return url;
            }
            if (item.CollectionType === 'tvshows') {
                url = pluginManager.mapRoute(this, 'tv/tv.html') + '?serverId=' + item.ServerId + '&parentId=' + item.Id;

                if (options.section === 'latest') {
                    url += '&tab=2';
                }
                return url;
            }
            if (item.CollectionType === 'music') {
                url = pluginManager.mapRoute(this, 'music/music.html') + '?serverId=' + item.ServerId + '&parentId=' + item.Id;
                if (options.parentId) {
                    url += '&parentId=' + options.parentId;
                }
                return url;
            }
        }
        if (item.CollectionType === 'livetv') {
            url = pluginManager.mapRoute(this, 'livetv/livetv.html') + '?serverId=' + item.ServerId;
            return url;
        }

        var showList;

        if (item.IsFolder) {

            if (item.Type !== 'Series' && item.Type !== 'Season' && item.Type !== 'MusicAlbum' && item.Type !== 'MusicArtist' && item.Type !== 'Playlist' && item.Type !== 'BoxSet') {
                showList = true;
            }
        }

        if (showList) {
            return pluginManager.mapRoute(this, 'list/list.html') + '?parentId=' + item.Id + '&serverId=' + item.ServerId;
        }
        else if (item.Type === 'SeriesTimer') {
            return pluginManager.mapRoute(this, 'item/item.html') + '?seriesTimerId=' + item.Id + '&serverId=' + item.ServerId;
        } else {
            return pluginManager.mapRoute(this, 'item/item.html') + '?id=' + item.Id + '&serverId=' + item.ServerId;
        }
    };

    DefaultSkin.prototype.getHeaderTemplate = function () {
        return pluginManager.mapPath(this, 'header.html');
    };

    DefaultSkin.prototype.getDependencies = function () {

        var list = [
            // Used for the mpaa rating
            'css!' + pluginManager.mapPath(this, 'css/style'),
            'css!' + pluginManager.mapPath(this, 'css/colors.dark'),
            'flexStyles'
        ];

        if (browser.android) {
            // on android we can't just use Roboto by name, it has to be sans-serif, which we don't want on other platforms
            list.push('css!' + pluginManager.mapPath(this, 'css/fonts'));
        } else if (browser.tv && !browser.chrome) {
            console.log("Using system fonts with explicit sizes");
            list.push('css!' + pluginManager.mapPath(this, 'css/fonts.sized'));
        } else if (browser.tv) {
            // Designed to use system default fonts
            console.log("Using system fonts");
            list.push('css!' + pluginManager.mapPath(this, 'css/fonts.device'));
        } else {
            console.log("Using default fonts");
            list.push('css!' + pluginManager.mapPath(this, 'css/fonts'));
        }

        if (browser.noFlex || browser.operaTv) {
            list.push('css!' + pluginManager.mapPath(this, 'css/noflex'));
        }

        if (browser.operaTv) {
            list.push('css!' + pluginManager.mapPath(this, 'css/operatv'));
        }

        // Needed by the header
        list.push('paper-icon-button-light');

        // Needed by the header
        list.push('material-icons');

        return list;
    };

    DefaultSkin.prototype.getHomeRoute = function () {

        if (!layoutManager.tv) {
            return 'home/home.html';
        }

        if (browser.operaTv || browser.web0s || browser.tizen) {
            return 'home_horiz/home.html';
        }

        return 'home_horiz/home.html';
        //return 'home/home.html';
    };

    DefaultSkin.prototype.getTranslations = function () {

        var files = [];

        var languages = ['cs', 'de', 'en-GB', 'en-US', 'fr', 'hr', 'it', 'lt-LT', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ru', 'sv', 'zh-CN'];

        var self = this;

        return languages.map(function (i) {
            return {
                lang: i,
                path: pluginManager.mapPath(self, 'strings/' + i + '.json')
            };
        });
    };

    DefaultSkin.prototype.getRoutes = function () {

        var routes = [];

        var icons = 'material-icons';

        routes.push({
            path: 'home/home.html',
            transition: 'slide',
            type: 'home',
            controller: this.id + '/home/home',
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
            controller: this.id + '/home_horiz/home',
            dependencies: [
                'cardStyle',
                'css!' + pluginManager.mapPath(this, 'home_horiz/home.css'),
                icons
            ]
        });

        routes.push({
            path: 'item/item.html',
            transition: 'slide',
            dependencies: [
                'cardStyle',
                'css!' + pluginManager.mapPath(this, 'item/item.css'),
                'emby-button',
                icons
            ],
            controller: this.id + '/item/item'
        });

        routes.push({
            path: 'list/list.html',
            transition: 'slide',
            controller: this.id + '/list/list',
            dependencies: [
                'cardStyle',
                'emby-button',
                icons
            ]
        });

        routes.push({
            path: 'music/music.html',
            transition: 'slide',
            controller: this.id + '/music/music',
            autoFocus: false
        });

        routes.push({
            path: 'movies/movies.html',
            transition: 'slide',
            controller: this.id + '/movies/movies',
            autoFocus: false
        });

        routes.push({
            path: 'livetv/livetv.html',
            transition: 'slide',
            controller: this.id + '/livetv/livetv',
            dependencies: [],
            autoFocus: false
        });

        routes.push({
            path: 'livetv/livetvitems.html',
            transition: 'slide',
            controller: this.id + '/livetv/livetvitems',
            dependencies: [],
            autoFocus: false
        });

        routes.push({
            path: 'livetv/guide.html',
            transition: 'slide',
            controller: this.id + '/livetv/guide',
            dependencies: [
                'css!' + pluginManager.mapPath(this, 'livetv/guide.css'),
                icons
            ]
        });

        routes.push({
            path: 'tv/tv.html',
            transition: 'slide',
            controller: this.id + '/tv/tv',
            autoFocus: false
        });

        routes.push({
            path: 'search/search.html',
            transition: 'slide',
            controller: this.id + '/search/search',
            dependencies: [
                'css!' + pluginManager.mapPath(this, 'search/search.css'),
                'emby-input',
                icons
            ]
        });

        routes.push({
            path: 'nowplaying/nowplaying.html',
            transition: 'slide',
            controller: this.id + '/nowplaying/nowplaying',
            dependencies: [
                'css!' + pluginManager.mapPath(this, 'nowplaying/nowplaying.css'),
                'emby-slider',
                'paper-icon-button-light',
                icons
            ],
            supportsThemeMedia: true,
            enableMediaControl: false
        });

        routes.push({
            path: 'nowplaying/playlist.html',
            transition: 'slide',
            controller: this.id + '/nowplaying/playlist',
            dependencies: [
                'css!' + pluginManager.mapPath(this, 'item/item.css')
            ],
            supportsThemeMedia: true,
            enableMediaControl: false
        });

        routes.push({
            path: 'nowplaying/videoosd.html',
            transition: 'fade',
            controller: this.id + '/nowplaying/videoosd',
            dependencies: [
                'css!' + pluginManager.mapPath(this, 'nowplaying/videoosd.css'),
                'emby-slider',
                'paper-icon-button-light',
                icons
            ],
            type: 'video-osd',
            supportsThemeMedia: true,
            enableMediaControl: false
        });

        routes.push({
            path: 'settings/settings.html',
            transition: 'slide',
            controller: this.id + '/settings/settings',
            dependencies: [
                'emby-checkbox'
            ],
            type: 'settings',
            category: 'Display',
            thumbImage: '',
            title: this.name
        });

        return routes;
    };

    DefaultSkin.prototype.showGenre = function (options) {
        Emby.Page.show(pluginManager.mapRoute(this.id, 'list/list.html') + '?parentId=' + options.ParentId + '&genreId=' + options.Id);
    };

    DefaultSkin.prototype.setTitle = function (title) {

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

    DefaultSkin.prototype.search = function () {
        Emby.Page.show(pluginManager.mapRoute(this, 'search/search.html'));
    };

    DefaultSkin.prototype.showLiveTV = function () {
        Emby.Page.show(pluginManager.mapRoute(this, 'livetv/guide.html'));
    };

    DefaultSkin.prototype.showGuide = function () {
        Emby.Page.show(pluginManager.mapRoute(this, 'livetv/guide.html'));
    };

    DefaultSkin.prototype.showNowPlaying = function () {
        Emby.Page.show(pluginManager.mapRoute(this, 'nowplaying/nowplaying.html'));
    };

    DefaultSkin.prototype.showUserMenu = function () {

        // For now just go cheap and re-use the back menu
        showBackMenuInternal(true);
    };

    DefaultSkin.prototype.showBackMenu = function () {

        return showBackMenuInternal(false);
    };

    return DefaultSkin;
});
