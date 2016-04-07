define(['playbackManager', 'inputmanager', 'datetime', 'itemHelper', 'mediaInfo', 'focusManager'], function (playbackManager, inputManager, datetime, itemHelper, mediaInfo, focusManager) {

    return function (view, params) {

        var self = this;
        var currentPlayer;

        var nowPlayingVolumeSlider = view.querySelector('.osdVolumeSlider');
        var nowPlayingPositionSlider = view.querySelector('.osdPositionSlider');

        var nowPlayingPositionText = view.querySelector('.osdPositionText');
        var nowPlayingDurationText = view.querySelector('.osdDurationText');
        var endTimeText = view.querySelector('.osdEndTimeText');
        var playlistPositionText = view.querySelector('.osdPlaylistPosition');

        function getHeaderElement() {
            return document.querySelector('.skinHeader');
        }

        function getOsdBottom() {
            return view.querySelector('.videoOsdBottom');
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

        function setCurrentItem(item, player) {

            setPoster(item);

            if (item) {
                setTitle(item);

                view.querySelector('.osdTitle').innerHTML = itemHelper.getDisplayName(item);
                view.querySelector('.osdMediaInfo').innerHTML = mediaInfo.getMediaInfoHtml(item, {
                    runtime: false,
                    subtitles: false,
                    tomatoes: false,
                    endsAt: false
                });

                nowPlayingVolumeSlider.disabled = false;
                nowPlayingPositionSlider.disabled = false;

                if (playbackManager.subtitleTracks(player).length) {
                    view.querySelector('.btnSubtitles').classList.remove('hide');
                } else {
                    view.querySelector('.btnSubtitles').classList.add('hide');
                }

                if (playbackManager.audioTracks(player).length > 1) {
                    view.querySelector('.btnAudio').classList.remove('hide');
                } else {
                    view.querySelector('.btnAudio').classList.add('hide');
                }

            } else {

                Emby.Page.setTitle('');
                nowPlayingVolumeSlider.disabled = true;
                nowPlayingPositionSlider.disabled = true;

                view.querySelector('.btnSubtitles').classList.add('hide');
                view.querySelector('.btnAudio').classList.add('hide');

                view.querySelector('.osdTitle').innerHTML = '';
                playlistPositionText.innerHTML = '';
                view.querySelector('.osdMediaInfo').innerHTML = '';
            }

            updatePlaylist();
        }

        function getEndTime(remainingTicks) {
            var itemMinutes = remainingTicks / 600000000;
            itemMinutes = itemMinutes || 1;

            var date = new Date();
            date.setMinutes(date.getMinutes() + itemMinutes);

            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;

            return hours + ':' + minutes + ' ' + ampm;
        }


        function setPoster(item) {

            var osdPoster = view.querySelector('.osdPoster');

            if (item) {

                var imgUrl = Emby.Models.seriesImageUrl(item, { type: 'Primary' }) ||
                    Emby.Models.seriesImageUrl(item, { type: 'Thumb' }) ||
                    Emby.Models.imageUrl(item, { type: 'Primary' });

                if (imgUrl) {
                    osdPoster.innerHTML = '<img src="' + imgUrl + '" />';
                    return;
                }
            }

            osdPoster.innerHTML = '';
        }

        var _osdOpen = true;
        function isOsdOpen() {
            return _osdOpen;
        }

        function showOsd() {

            slideDownToShow(getHeaderElement());
            slideUpToShow(getOsdBottom());
            startHideTimer();
        }

        function hideOsd() {

            slideUpToHide(getHeaderElement());
            slideDownToHide(getOsdBottom());
        }

        var hideTimeout;
        function startHideTimer() {
            stopHideTimer();
            hideTimeout = setTimeout(hideOsd, 4000);
        }
        function stopHideTimer() {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
        }

        function slideDownToShow(elem) {

            if (!elem.classList.contains('hide')) {
                return;
            }

            elem.classList.remove('hide');

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,-' + elem.offsetHeight + 'px,0)', opacity: '.3', offset: 0 },
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing);
            });
        }

        function slideUpToHide(elem) {

            if (elem.classList.contains('hide')) {
                return;
            }

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 0 },
                  { transform: 'translate3d(0,-' + elem.offsetHeight + 'px,0)', opacity: '.3', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing).onfinish = function () {
                    elem.classList.add('hide');
                };
            });
        }

        function slideUpToShow(elem) {

            if (!elem.classList.contains('hide')) {
                return;
            }

            _osdOpen = true;
            elem.classList.remove('hide');

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,' + elem.offsetHeight + 'px,0)', opacity: '.3', offset: 0 },
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing).onfinish = function () {
                    focusManager.focus(elem.querySelector('.btnPause'));
                };
            });
        }

        function slideDownToHide(elem) {

            if (elem.classList.contains('hide')) {
                return;
            }

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 0 },
                  { transform: 'translate3d(0,' + elem.offsetHeight + 'px,0)', opacity: '.3', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing).onfinish = function () {
                    elem.classList.add('hide');
                    _osdOpen = false;
                };
            });
        }

        var lastMouseMoveData;
        function onMouseMove(e) {

            var eventX = e.screenX || 0;
            var eventY = e.screenY || 0;

            var obj = lastMouseMoveData;
            if (!obj) {
                lastMouseMoveData = {
                    x: eventX,
                    y: eventY
                };
                return;
            }

            // if coord are same, it didn't move
            if (Math.abs(eventX - obj.x) < 10 && Math.abs(eventY - obj.y) < 10) {
                return;
            }

            obj.x = eventX;
            obj.y = eventY;

            showOsd();
        }

        function onInputCommand(e) {

            switch (e.detail.command) {

                case 'left':
                    if (!isOsdOpen()) {
                        playbackManager.previousChapter();
                    }
                    break;
                case 'right':
                    if (!isOsdOpen()) {
                        playbackManager.nextChapter();
                    }
                    break;
                //case 'up':
                //    {
                //        playbackManager.nextTrack();
                //        updatePlaylist();
                //        break;
                //    }
                //case 'down':
                //    {
                //        playbackManager.previousTrack();
                //        updatePlaylist();
                //        break;
                //    }
                case 'volumedown':
                case 'volumeup':
                case 'select':
                case 'menu':
                case 'info':
                case 'play':
                case 'playpause':
                case 'pause':
                case 'fastforward':
                case 'rewind':
                case 'fastforwardBig':
                case 'rewindBig':
                    showOsd();
                    break;
                default:
                    break;
            }
        }

        function onPlaybackStart(e, player) {

            if (player) {
                bindToPlayer(player);
                setCurrentItem(playbackManager.currentItem(player), player);
            } else {
                setCurrentItem(null);
            }

            enableStopOnBack(true);
        }

        function onPlaybackStop(e, stopInfo) {

            releasePlayer();
            setCurrentItem(null);

            if (stopInfo.nextMediaType != 'Video') {

                view.removeEventListener('viewbeforehide', onViewHideStopPlayback);

                Emby.Page.back();
            }
        }

        view.addEventListener('viewbeforeshow', function (e) {

            getHeaderElement().classList.add('osdHeader');
            // Make sure the UI is completely transparent
            Emby.Page.setTransparency('full');
        });

        view.addEventListener('viewshow', function (e) {

            Events.on(playbackManager, 'playbackstart', onPlaybackStart);
            Events.on(playbackManager, 'playbackstop', onPlaybackStop);

            onPlaybackStart(e, playbackManager.currentPlayer());
            document.addEventListener('mousemove', onMouseMove);

            showOsd();

            inputManager.on(window, onInputCommand);
        });

        view.addEventListener('viewbeforehide', function () {
            stopHideTimer();
            getHeaderElement().classList.remove('osdHeader');
            document.removeEventListener('mousemove', onMouseMove);
            Events.off(playbackManager, 'playbackstart', onPlaybackStart);
            Events.off(playbackManager, 'playbackstop', onPlaybackStop);

            inputManager.off(window, onInputCommand);
            releasePlayer();
        });

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
                view.querySelector('.btnPause').icon = 'play-arrow';
            } else {
                view.querySelector('.btnPause').icon = 'pause';
            }
        }

        function updateVolume(player) {

            if (!nowPlayingVolumeSlider.dragging) {
                nowPlayingVolumeSlider.value = playbackManager.volume();
            }

            if (playbackManager.isMuted()) {
                view.querySelector('.buttonMute').icon = 'volume-off';
            } else {
                view.querySelector('.buttonMute').icon = 'volume-up';
            }
        }

        function updatePlaylist() {

            var items = playbackManager.playlist();

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

            playlistPositionText.innerHTML = playbackManager.getPlaylistPositionText();
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

                var endTimeTextValue = getEndTime((nowPlayingItem.RunTimeTicks - playState.PositionTicks));
                endTimeText.innerHTML = '&nbsp;&nbsp;Ends: ' + endTimeTextValue;

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

        function showAudioTrackSelection() {

            var player = currentPlayer;

            var audioTracks = playbackManager.audioTracks(player);

            var currentIndex = playbackManager.getPlayerState(player).PlayState.AudioStreamIndex;

            var menuItems = audioTracks.map(function (stream) {

                var attributes = [];

                attributes.push(stream.Language || Globalize.translate('UnknownLanguage'));

                if (stream.Codec) {
                    attributes.push(stream.Codec);
                }
                if (stream.Profile) {
                    attributes.push(stream.Profile);
                }

                if (stream.BitRate) {
                    attributes.push((Math.floor(stream.BitRate / 1000)) + ' kbps');
                }

                if (stream.Channels) {
                    attributes.push(stream.Channels + ' ch');
                }

                var name = attributes.join(' - ');

                if (stream.IsDefault) {
                    name += ' (D)';
                }

                var opt = {
                    name: name,
                    id: stream.Index
                };

                if (stream.Index == currentIndex) {
                    opt.ironIcon = "check";
                    opt.selected = true;
                }

                return opt;
            });

            require(['actionsheet'], function (actionsheet) {

                actionsheet.show({
                    items: menuItems,
                    title: Globalize.translate('Audio')
                }).then(function (id) {
                    var index = parseInt(id);
                    if (index != currentIndex) {
                        playbackManager.setAudioStreamIndex(index);
                    }
                });
            });
        }

        function showSubtitleTrackSelection() {

            var player = currentPlayer;

            var streams = playbackManager.subtitleTracks(player);

            var currentIndex = playbackManager.getPlayerState(player).PlayState.SubtitleStreamIndex;
            if (currentIndex == null) {
                currentIndex = -1;
            }

            streams.unshift({
                Index: -1,
                Language: Globalize.translate('Off')
            });

            var menuItems = streams.map(function (stream) {

                var attributes = [];

                attributes.push(stream.Language || Globalize.translate('LabelUnknownLanguage'));

                if (stream.Codec) {
                    attributes.push(stream.Codec);
                }

                var name = attributes.join(' - ');

                if (stream.IsDefault) {
                    name += ' (D)';
                }
                if (stream.IsForced) {
                    name += ' (F)';
                }
                if (stream.External) {
                    name += ' (EXT)';
                }

                var opt = {
                    name: name,
                    id: stream.Index
                };

                if (stream.Index == currentIndex) {
                    opt.ironIcon = "check";
                    opt.selected = true;
                }

                return opt;
            });

            require(['actionsheet'], function (actionsheet) {

                actionsheet.show({
                    title: Globalize.translate('Subtitles'),
                    items: menuItems
                }).then(function (id) {
                    var index = parseInt(id);
                    if (index != currentIndex) {
                        playbackManager.setSubtitleStreamIndex(index);
                    }
                });

            });
        }

        view.addEventListener('viewhide', function () {

            getHeaderElement().classList.remove('hide');
        });

        window.addEventListener('keydown', function (e) {

            if (e.keyCode == 32) {
                playbackManager.playPause();
                showOsd();
            }
        });

        view.querySelector('.pageContainer').addEventListener('click', function () {

            playbackManager.playPause();
            showOsd();
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
            updatePlaylist();
        });

        view.querySelector('.btnPause').addEventListener('click', function () {

            playbackManager.playPause();
        });

        view.querySelector('.btnNextTrack').addEventListener('click', function () {

            playbackManager.nextTrack();
            updatePlaylist();
        });

        view.querySelector('.btnAudio').addEventListener('click', showAudioTrackSelection);
        view.querySelector('.btnSubtitles').addEventListener('click', showSubtitleTrackSelection);

        function onViewHideStopPlayback() {

            if (playbackManager.isPlayingVideo()) {

                // Unbind this event so that we don't go back twice
                Events.off(playbackManager, 'playbackstop', onPlaybackStop);
                view.removeEventListener('viewbeforehide', onViewHideStopPlayback);

                playbackManager.stop();

                // or 
                //Emby.Page.setTransparency(Emby.TransparencyLevel.Backdrop);
            }
        }

        function enableStopOnBack(enabled) {

            view.removeEventListener('viewbeforehide', onViewHideStopPlayback);

            if (enabled) {
                if (playbackManager.isPlayingVideo()) {
                    view.addEventListener('viewbeforehide', onViewHideStopPlayback);
                }
            }
        }

    }

});