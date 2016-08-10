define(['playbackManager', 'datetime', 'backdrop', 'userdataButtons', 'cardBuilder', 'pluginManager', './../skininfo'], function (playbackManager, datetime, backdrop, userdataButtons, cardBuilder, pluginManager, skinInfo) {

	return function (view, params) {

        var self = this;
        var currentPlayer;

        var nowPlayingVolumeSlider = view.querySelector('.nowPlayingVolumeSlider');
        var nowPlayingPositionSlider = view.querySelector('.nowPlayingPositionSlider');

        var nowPlayingPositionText = view.querySelector('.nowPlayingPositionText');
        var nowPlayingDurationText = view.querySelector('.nowPlayingDurationText');

        var btnRepeat = view.querySelector('.btnRepeat');

        function setCurrentItem(item) {

            if (item) {
                setTitle(item);

                backdrop.setBackdrops([item]);

                cardBuilder.buildCards([item], {
                    shape: 'square',
                    width: 640,
                    itemsContainer: view.querySelector('.nowPlayingCardContainer'),
                    scalable: true
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

                userdataButtons.fill({
                    element: view.querySelector('.userDataIcons'),
                    iconCssClass: 'xlargePaperIconButton',
                    item: item,
                    includePlayed: false
                });

                nowPlayingVolumeSlider.disabled = false;
                nowPlayingPositionSlider.disabled = false;

            } else {


                view.querySelector('.nowPlayingCardContainer').innerHTML = '';
                view.querySelector('.nowPlayingMetadata').innerHTML = '&nbsp;<br/>&nbsp;<br/>&nbsp;';
                view.querySelector('.userDataIcons').innerHTML = '';

                nowPlayingVolumeSlider.disabled = true;
                nowPlayingPositionSlider.disabled = true;

                backdrop.setBackdrops([]);
            }

            updatePlaylist();
        }

        function setTitle(item) {

            var url = Emby.Models.logoImageUrl(item, {});

            if (url) {

                var pageTitle = document.querySelector('.pageTitle');
                pageTitle.style.backgroundImage = "url('" + url + "')";
                pageTitle.classList.add('pageTitleWithLogo');
                pageTitle.innerHTML = '';
                document.querySelector('.headerLogo').classList.add('hide');
            } else {
                Emby.Page.setTitle('');
            }
        }

        function onPlaybackStart(e, player) {

            bindToPlayer(player);
            setCurrentItem(playbackManager.currentItem(player));
        }

        function onPlaybackStop(e, stopInfo) {

            releasePlayer();

            if (stopInfo.nextMediaType != 'Audio') {
                setCurrentItem(null);
                Emby.Page.back();
            }
        }

        function bindToPlayer(player) {

            if (player != currentPlayer) {

                releasePlayer();

                Events.on(player, 'volumechange', onVolumeChange);
                Events.on(player, 'timeupdate', onTimeUpdate);
                Events.on(player, 'pause', onPlaystateChange);
                Events.on(player, 'playing', onPlaystateChange);
            }

            currentPlayer = player;
            updateVolume(player);
            updateTime(player);
            updatePlaystate(player);
            updatePlaylist();
        }

        function releasePlayer() {

            var player = currentPlayer;

            if (player) {
                Events.off(player, 'volumechange', onVolumeChange);
                Events.off(player, 'timeupdate', onTimeUpdate);
                Events.off(player, 'pause', onPlaystateChange);
                Events.off(player, 'playing', onPlaystateChange);
                currentPlayer = null;
            }
        }

        function onTimeUpdate(e) {
            updateTime(this);
        }

        function onVolumeChange(e) {
            updateVolume(this);
        }

        function onPlaystateChange(e) {
            updatePlaystate(this);
            updatePlaylist();
        }

        function updatePlaystate(player) {

            if (playbackManager.paused()) {
                view.querySelector('.btnPause i').innerHTML = '&#xE037;';
            } else {
                view.querySelector('.btnPause i').innerHTML = '&#xE034;';
            }

            var repeatMode = playbackManager.getRepeatMode();

            if (repeatMode == 'RepeatAll') {
                btnRepeat.querySelector('i').innerHTML = '&#xE040;';
                btnRepeat.classList.add('repeatActive');
            }
            else if (repeatMode == 'RepeatOne') {
                btnRepeat.querySelector('i').innerHTML = '&#xE041;';
                btnRepeat.classList.add('repeatActive');
            } else {
                btnRepeat.querySelector('i').innerHTML = '&#xE040;';
                btnRepeat.classList.remove('repeatActive');
            }
        }

        function onRepeatModeChanged() {
            updatePlaystate(currentPlayer);
        }

        function updateVolume(player) {

            if (!nowPlayingVolumeSlider.dragging) {
                nowPlayingVolumeSlider.value = playbackManager.volume();
            }

            if (playbackManager.isMuted()) {
                view.querySelector('.buttonMute i').innerHTML = '&#xE04F;';
            } else {
                view.querySelector('.buttonMute i').innerHTML = '&#xE050;';
            }
        }

        function updatePlaylist() {

            var items = playbackManager.playlist();

            if (items.length > 1) {
                view.querySelector('.btnPlaylist').disabled = false;
            } else {
                view.querySelector('.btnPlaylist').disabled = true;
            }

            var index = playbackManager.currentPlaylistIndex();

            if (index == 0) {
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

        function updateTime(player) {

            if (!nowPlayingPositionSlider.dragging) {

                var state = playbackManager.getPlayerState(player);
                var playState = state.PlayState || {};
                var nowPlayingItem = state.NowPlayingItem || {};

                if (nowPlayingItem.RunTimeTicks) {

                    var pct = playState.PositionTicks / nowPlayingItem.RunTimeTicks;
                    pct *= 100;

                    nowPlayingPositionSlider.value = pct;

                } else {

                    nowPlayingPositionSlider.value = 0;
                }

                updateTimeText(nowPlayingPositionText, playState.PositionTicks);
                updateTimeText(nowPlayingDurationText, nowPlayingItem.RunTimeTicks, true);

                nowPlayingPositionSlider.disabled = !playState.CanSeek;
            }
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

        function getHeaderElement() {
            return document.querySelector('.skinHeader');
        }

        view.addEventListener('viewshow', function (e) {

            getHeaderElement().classList.add('nowPlayingHeader');

            Emby.Page.setTitle('');
            Events.on(playbackManager, 'playbackstart', onPlaybackStart);
            Events.on(playbackManager, 'playbackstop', onPlaybackStop);
            Events.on(playbackManager, 'repeatmodechange', onRepeatModeChanged);

            onPlaybackStart(e, playbackManager.currentPlayer());
        });

        view.addEventListener('viewhide', function () {

            getHeaderElement().classList.remove('nowPlayingHeader');

            releasePlayer();
            Events.off(playbackManager, 'playbackstart', onPlaybackStart);
            Events.off(playbackManager, 'playbackstop', onPlaybackStop);
            Events.off(playbackManager, 'repeatmodechange', onRepeatModeChanged);
        });

        view.querySelector('.buttonMute').addEventListener('click', function () {

            playbackManager.toggleMute();
        });

        nowPlayingVolumeSlider.addEventListener('change', function () {

            playbackManager.volume(this.value);
        });

        nowPlayingPositionSlider.addEventListener('change', function () {

            playbackManager.seekPercent(parseFloat(this.value), currentPlayer);
        });

        view.querySelector('.btnPreviousTrack').addEventListener('click', function () {

            playbackManager.previousTrack();
        });

        view.querySelector('.btnPause').addEventListener('click', function () {

            playbackManager.playPause();
        });

        view.querySelector('.btnStop').addEventListener('click', function () {

            playbackManager.stop();
        });

        view.querySelector('.btnNextTrack').addEventListener('click', function () {

            playbackManager.nextTrack();
        });

        view.querySelector('.btnPlaylist').addEventListener('click', function () {

            Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'nowplaying/playlist.html'));
        });

        btnRepeat.addEventListener('click', function () {

            switch (playbackManager.getRepeatMode()) {
                case 'RepeatAll':
                    playbackManager.setRepeatMode('RepeatOne');
                    break;
                case 'RepeatOne':
                    playbackManager.setRepeatMode('RepeatNone');
                    break;
                default:
                    playbackManager.setRepeatMode('RepeatAll');
                    break;
            }
        });

        nowPlayingPositionSlider.getBubbleText = function (value) {

            var state = playbackManager.getPlayerState(currentPlayer);
            var playState = state.PlayState || {};
            var nowPlayingItem = state.NowPlayingItem || {};

            if (nowPlayingItem.RunTimeTicks) {

                var ticks = nowPlayingItem.RunTimeTicks;
                ticks /= 100;
                ticks *= value;

                return datetime.getDisplayRunningTime(ticks);
            }

            return '--:--';
        };
    }

});