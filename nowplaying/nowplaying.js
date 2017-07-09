define(['playbackManager', 'datetime', 'backdrop', 'userdataButtons', 'cardBuilder', 'pluginManager', './../skininfo', 'events', 'connectionManager', 'apphost'], function (playbackManager, datetime, backdrop, userdataButtons, cardBuilder, pluginManager, skinInfo, events, connectionManager, appHost) {
    'use strict';

    return function (view, params) {

        var self = this;
        var currentPlayer;
        var currentPlayerSupportedCommands = [];
        var currentRuntimeTicks = 0;
        var lastUpdateTime = 0;
        var lastPlayerState = {};
        var isEnabled;

        var nowPlayingVolumeSlider = view.querySelector('.nowPlayingVolumeSlider');
        var nowPlayingVolumeSliderContainer = view.querySelector('.nowPlayingVolumeSliderContainer');

        var nowPlayingPositionSlider = view.querySelector('.nowPlayingPositionSlider');

        var nowPlayingPositionText = view.querySelector('.nowPlayingPositionText');
        var nowPlayingDurationText = view.querySelector('.nowPlayingDurationText');

        var btnRepeat = view.querySelector('.btnRepeat');

        var currentImgUrl;
        function updateNowPlayingInfo(state) {

            var item = state.NowPlayingItem;

            if (!item) {
                view.querySelector('.nowPlayingCardContainer').innerHTML = '';
                view.querySelector('.nowPlayingMetadata').innerHTML = '&nbsp;<br/>&nbsp;<br/>&nbsp;';
                view.querySelector('.userDataIcons').innerHTML = '';

                backdrop.setBackdrops([]);
                return;
            }

            setTitle(item);
            backdrop.setBackdrops([item]);

            cardBuilder.buildCards([item], {
                shape: 'square',
                width: 640,
                itemsContainer: view.querySelector('.nowPlayingCardContainer'),
                scalable: true
            });

            userdataButtons.fill({
                element: view.querySelector('.userDataIcons'),
                iconCssClass: 'xlargePaperIconButton',
                item: item,
                includePlayed: false
            });

            var names = [];

            names.push(item.Name);

            if (item.ArtistItems && item.ArtistItems[0]) {
                names.push(item.ArtistItems[0].Name);
            }

            if (item.Album) {
                names.push(item.Album);
            }

            view.querySelector('.nowPlayingMetadata').innerHTML = names.join('<br/>');
        }

        function setTitle(item) {

            if (item.LogoImageTag) {

                var pageTitle = document.querySelector('.pageTitle');

                var url = connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.LogoItemId, {
                    type: 'Logo',
                    tag: item.LogoImageTag
                });

                pageTitle.style.backgroundImage = "url('" + url + "')";
                pageTitle.classList.add('pageTitleWithLogo');
                pageTitle.innerHTML = '';
                document.querySelector('.headerLogo').classList.add('hide');
            } else {
                Emby.Page.setTitle('');
            }
        }

        function onPlayerChange() {
            bindToPlayer(playbackManager.getCurrentPlayer());
        }

        function onStateChanged(event, state) {

            //console.log('nowplaying event: ' + e.type);
            var player = this;

            if (!state.NowPlayingItem) {
                return;
            }

            isEnabled = true;

            updatePlayerStateInternal(event, state);
            updatePlaylist();
        }

        function onPlayPauseStateChanged(e) {

            if (!isEnabled) {
                return;
            }

            var player = this;
            updatePlayPauseState(player.paused());
        }

        function onVolumeChanged(e) {

            if (!isEnabled) {
                return;
            }

            var player = this;

            updatePlayerVolumeState(player.isMuted(), player.getVolume());
        }

        function onPlaybackStart(e, state) {

            console.log('nowplaying event: ' + e.type);

            var player = this;

            onStateChanged.call(player, e, state);
        }

        function onPlaybackStopped(e, state) {

            console.log('nowplaying event: ' + e.type);
            var player = this;

            if (state.nextMediaType !== 'Audio') {
                Emby.Page.back();
            }
        }

        function bindToPlayer(player) {

            if (player === currentPlayer) {
                return;
            }

            releaseCurrentPlayer();

            currentPlayer = player;

            if (!player) {
                return;
            }

            playbackManager.getPlayerState(player).then(function (state) {

                onStateChanged.call(player, { type: 'init' }, state);
            });

            events.on(player, 'playbackstart', onPlaybackStart);
            events.on(player, 'playbackstop', onPlaybackStopped);
            events.on(player, 'volumechange', onVolumeChanged);
            events.on(player, 'pause', onPlayPauseStateChanged);
            events.on(player, 'playing', onPlayPauseStateChanged);
            events.on(player, 'timeupdate', onTimeUpdate);
        }

        function releaseCurrentPlayer() {

            var player = currentPlayer;

            if (player) {

                events.off(player, 'playbackstart', onPlaybackStart);
                events.off(player, 'playbackstop', onPlaybackStopped);
                events.off(player, 'volumechange', onVolumeChanged);
                events.off(player, 'pause', onPlayPauseStateChanged);
                events.off(player, 'playing', onPlayPauseStateChanged);
                events.off(player, 'timeupdate', onTimeUpdate);

                currentPlayer = null;
            }
        }

        function onTimeUpdate(e) {

            if (!isEnabled) {
                return;
            }

            // Try to avoid hammering the document with changes
            var now = new Date().getTime();
            if ((now - lastUpdateTime) < 700) {

                return;
            }
            lastUpdateTime = now;

            var player = this;
            var state = lastPlayerState;
            var nowPlayingItem = state.NowPlayingItem || {};
            currentRuntimeTicks = playbackManager.duration(player);
            updateTimeDisplay(playbackManager.currentTime(player), currentRuntimeTicks);
        }

        function updatePlaylist() {

            var items = playbackManager.playlist();

            if (items.length > 1) {
                view.querySelector('.btnPlaylist').disabled = false;
            } else {
                view.querySelector('.btnPlaylist').disabled = true;
            }

            var index = playbackManager.currentPlaylistIndex();

            if (index === 0) {
                view.querySelector('.btnPreviousTrack').disabled = true;
            } else {
                view.querySelector('.btnPreviousTrack').disabled = false;
            }

            if (index >= items.length - 1) {
                view.querySelector('.btnNextTrack').disabled = true;
            } else {
                view.querySelector('.btnNextTrack').disabled = false;
            }
        }

        function updatePlayPauseState(isPaused) {

            if (isPaused) {
                view.querySelector('.btnPause i').innerHTML = '&#xE037;';
            } else {
                view.querySelector('.btnPause i').innerHTML = '&#xE034;';
            }
        }

        function updatePlayerStateInternal(event, state) {

            lastPlayerState = state;

            var playerInfo = playbackManager.getPlayerInfo();

            var playState = state.PlayState || {};

            updatePlayPauseState(playState.IsPaused);

            var supportedCommands = playerInfo.supportedCommands;
            currentPlayerSupportedCommands = supportedCommands;

            //if (supportedCommands.indexOf('SetRepeatMode') == -1) {
            //    toggleRepeatButton.classList.add('hide');
            //} else {
            //    toggleRepeatButton.classList.remove('hide');
            //}

            //if (playState.RepeatMode == 'RepeatAll') {
            //    toggleRepeatButtonIcon.innerHTML = "repeat";
            //    toggleRepeatButton.classList.add('repeatActive');
            //}
            //else if (playState.RepeatMode == 'RepeatOne') {
            //    toggleRepeatButtonIcon.innerHTML = "repeat_one";
            //    toggleRepeatButton.classList.add('repeatActive');
            //} else {
            //    toggleRepeatButtonIcon.innerHTML = "repeat";
            //    toggleRepeatButton.classList.remove('repeatActive');
            //}

            updatePlayerVolumeState(playState.IsMuted, playState.VolumeLevel);

            if (nowPlayingPositionSlider && !nowPlayingPositionSlider.dragging) {
                nowPlayingPositionSlider.disabled = !playState.CanSeek;
            }

            var nowPlayingItem = state.NowPlayingItem || {};
            updateTimeDisplay(playState.PositionTicks, nowPlayingItem.RunTimeTicks);

            updateNowPlayingInfo(state);
        }

        function updateTimeDisplay(positionTicks, runtimeTicks) {

            if (nowPlayingPositionSlider && !nowPlayingPositionSlider.dragging) {
                if (runtimeTicks) {

                    var pct = positionTicks / runtimeTicks;
                    pct *= 100;

                    nowPlayingPositionSlider.value = pct;

                } else {

                    nowPlayingPositionSlider.value = 0;
                }
            }

            updateTimeText(nowPlayingPositionText, positionTicks);
            updateTimeText(nowPlayingDurationText, runtimeTicks, true);
        }

        function updateTimeText(elem, ticks, divider) {

            if (ticks == null) {
                elem.innerHTML = '';
                return;
            }

            var html = datetime.getDisplayRunningTime(ticks);

            if (divider) {
                html = '&nbsp;/&nbsp;' + html;
            }

            elem.innerHTML = html;
        }

        function updatePlayerVolumeState(isMuted, volumeLevel) {

            var supportedCommands = currentPlayerSupportedCommands;

            var showMuteButton = true;
            var showVolumeSlider = true;

            if (supportedCommands.indexOf('Mute') === -1) {
                showMuteButton = false;
            }

            if (supportedCommands.indexOf('SetVolume') === -1) {
                showVolumeSlider = false;
            }

            if (currentPlayer.isLocalPlayer && appHost.supports('physicalvolumecontrol')) {
                showMuteButton = false;
                showVolumeSlider = false;
            }

            if (isMuted) {
                view.querySelector('.buttonMute i').innerHTML = '&#xE04F;';
            } else {
                view.querySelector('.buttonMute i').innerHTML = '&#xE050;';
            }

            if (showMuteButton) {
                view.querySelector('.buttonMute').classList.remove('hide');
            } else {
                view.querySelector('.buttonMute').classList.add('hide');
            }

            // See bindEvents for why this is necessary
            if (nowPlayingVolumeSlider) {

                if (showVolumeSlider) {
                    nowPlayingVolumeSliderContainer.classList.remove('hide');
                } else {
                    nowPlayingVolumeSliderContainer.classList.add('hide');
                }

                if (!nowPlayingVolumeSlider.dragging) {
                    nowPlayingVolumeSlider.value = volumeLevel || 0;
                }
            }
        }

        function getHeaderElement() {
            return document.querySelector('.skinHeader');
        }

        view.addEventListener('viewshow', function (e) {

            getHeaderElement().classList.add('nowPlayingHeader');

            Emby.Page.setTitle('');

            events.on(playbackManager, 'playerchange', onPlayerChange);
            bindToPlayer(playbackManager.getCurrentPlayer());
        });

        view.addEventListener('viewhide', function () {

            getHeaderElement().classList.remove('nowPlayingHeader');

            events.off(playbackManager, 'playerchange', onPlayerChange);
            releaseCurrentPlayer();
        });

        view.querySelector('.buttonMute').addEventListener('click', function () {

            playbackManager.toggleMute(currentPlayer);
        });

        nowPlayingVolumeSlider.addEventListener('change', function () {

            playbackManager.setVolume(this.value, currentPlayer);
        });

        nowPlayingPositionSlider.addEventListener('change', function () {

            if (currentPlayer) {

                playbackManager.seekPercent(newPercent, currentPlayer);
            }
        });

        view.querySelector('.btnPreviousTrack').addEventListener('click', function () {

            playbackManager.previousTrack(currentPlayer);
        });

        view.querySelector('.btnPause').addEventListener('click', function () {

            playbackManager.playPause(currentPlayer);
        });

        view.querySelector('.btnStop').addEventListener('click', function () {

            playbackManager.stop(currentPlayer);
        });

        view.querySelector('.btnNextTrack').addEventListener('click', function () {

            playbackManager.nextTrack(currentPlayer);
        });

        view.querySelector('.btnPlaylist').addEventListener('click', function () {

            Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'nowplaying/playlist.html'));
        });

        btnRepeat.addEventListener('click', function () {

            switch (playbackManager.getRepeatMode()) {
                case 'RepeatAll':
                    playbackManager.setRepeatMode('RepeatOne', currentPlayer);
                    break;
                case 'RepeatOne':
                    playbackManager.setRepeatMode('RepeatNone', currentPlayer);
                    break;
                default:
                    playbackManager.setRepeatMode('RepeatAll', currentPlayer);
                    break;
            }
        });

        nowPlayingPositionSlider.getBubbleText = function (value) {

            var state = lastPlayerState;

            if (!state || !state.NowPlayingItem || !currentRuntimeTicks) {
                return '--:--';
            }

            var ticks = currentRuntimeTicks;
            ticks /= 100;
            ticks *= value;

            return datetime.getDisplayRunningTime(ticks);
        };
    };

});