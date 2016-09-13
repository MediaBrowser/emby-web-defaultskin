define(['playbackManager', 'inputmanager', 'datetime', 'itemHelper', 'mediaInfo', 'focusManager', 'imageLoader', 'scrollHelper', 'events', 'connectionManager', 'scrollStyles'], function (playbackManager, inputManager, datetime, itemHelper, mediaInfo, focusManager, imageLoader, scrollHelper, events, connectionManager) {

    function seriesImageUrl(item, options) {

        if (item.Type != 'Episode') {
            return null;
        }

        options = options || {};
        options.type = options.type || "Primary";

        if (options.type == 'Primary') {

            if (item.SeriesPrimaryImageTag) {

                options.tag = item.SeriesPrimaryImageTag;

                return connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.SeriesId, options);
            }
        }

        if (options.type == 'Thumb') {

            if (item.SeriesThumbImageTag) {

                options.tag = item.SeriesThumbImageTag;

                return connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.SeriesId, options);
            }
            if (item.ParentThumbImageTag) {

                options.tag = item.ParentThumbImageTag;

                return connectionManager.getApiClient(item.ServerId).getScaledImageUrl(item.ParentThumbItemId, options);
            }
        }

        return null;
    }

    return function (view, params) {

        var self = this;
        var currentPlayer;
        var currentItem;
        var currentRuntimeTicks;

        var nowPlayingVolumeSlider = view.querySelector('.osdVolumeSlider');
        var nowPlayingPositionSlider = view.querySelector('.osdPositionSlider');

        var nowPlayingPositionText = view.querySelector('.osdPositionText');
        var nowPlayingDurationText = view.querySelector('.osdDurationText');
        var endsAtText = view.querySelector('.endsAtText');

        var scenePicker = view.querySelector('.scenePicker');
        var isScenePickerRendered;
        var btnRewind = view.querySelector('.btnRewind');
        var btnFastForward = view.querySelector('.btnFastForward');

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

            currentItem = item;
            setPoster(item);

            scenePicker.innerHTML = '';
            isScenePickerRendered = false;

            if (item) {
                setTitle(item);

                view.querySelector('.osdTitle').innerHTML = itemHelper.getDisplayName(item);
                view.querySelector('.osdMediaInfo').innerHTML = mediaInfo.getPrimaryMediaInfoHtml(item, {
                    runtime: false,
                    subtitles: false,
                    tomatoes: false,
                    endsAt: false
                });

                nowPlayingVolumeSlider.disabled = false;
                nowPlayingPositionSlider.disabled = false;
                btnFastForward.disabled = false;
                btnRewind.disabled = false;
                
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
                btnFastForward.disabled = true;
                btnRewind.disabled = true;

                view.querySelector('.btnSubtitles').classList.add('hide');
                view.querySelector('.btnAudio').classList.add('hide');

                view.querySelector('.osdTitle').innerHTML = '';
                view.querySelector('.osdMediaInfo').innerHTML = '';
            }

            updatePlaylist();
        }

        function setPoster(item) {

            var osdPoster = view.querySelector('.osdPoster');

            if (item) {

                var imgUrl = seriesImageUrl(item, { type: 'Primary' }) ||
                    seriesImageUrl(item, { type: 'Thumb' }) ||
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

            if (!elem.animate) {
                return;
            }

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,-100%,0)', opacity: '.3', offset: 0 },
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing);
            });
        }

        function slideUpToHide(elem) {

            if (elem.classList.contains('hide')) {
                return;
            }

            var afterAnimation = function () {
                elem.classList.add('hide');
            };

            if (!elem.animate) {
                afterAnimation();
                return;
            }

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 0 },
                  { transform: 'translate3d(0,-100%,0)', opacity: '.3', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing).onfinish = afterAnimation;
            });
        }

        function slideUpToShow(elem) {

            if (!elem.classList.contains('hide')) {
                return;
            }

            _osdOpen = true;
            elem.classList.remove('hide');

            focusManager.focus(elem.querySelector('.btnPause'));

            if (!elem.animate) {
                return;
            }

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,100%,0)', opacity: '.3', offset: 0 },
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing);
            });
        }

        function slideDownToHide(elem) {

            if (elem.classList.contains('hide')) {
                return;
            }

            var afterAnimation = function () {
                elem.classList.add('hide');
                _osdOpen = false;
            };

            if (!elem.animate) {
                afterAnimation();
                return;
            }

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 0 },
                  { transform: 'translate3d(0,100%,0)', opacity: '0', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing).onfinish = afterAnimation;
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
                    if (isOsdOpen()) {
                        showOsd();
                    } else {
                        e.preventDefault();
                        playbackManager.rewind();
                    }
                    break;
                case 'right':
                    if (isOsdOpen()) {
                        showOsd();
                    } else {
                        e.preventDefault();
                        playbackManager.fastForward();
                    }
                    break;
                case 'up':
                case 'down':
                case 'select':
                case 'menu':
                case 'info':
                case 'play':
                case 'playpause':
                case 'pause':
                case 'fastforward':
                case 'rewind':
                case 'next':
                case 'previous':
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

        function onPlaybackCancelled(e) {
            onPlaybackStop(e, {});
        }

        view.addEventListener('viewbeforeshow', function (e) {

            getHeaderElement().classList.add('osdHeader');
            // Make sure the UI is completely transparent
            Emby.Page.setTransparency('full');
        });

        view.addEventListener('viewshow', function (e) {

            events.on(playbackManager, 'playbackstart', onPlaybackStart);
            events.on(playbackManager, 'playbackstop', onPlaybackStop);
            events.on(playbackManager, 'playbackcancelled', onPlaybackCancelled);

            onPlaybackStart(e, playbackManager.currentPlayer());
            document.addEventListener('mousemove', onMouseMove);

            showOsd();

            inputManager.on(window, onInputCommand);
        });

        view.addEventListener('viewbeforehide', function () {
            stopHideTimer();
            getHeaderElement().classList.remove('osdHeader');
            document.removeEventListener('mousemove', onMouseMove);
            events.off(playbackManager, 'playbackstart', onPlaybackStart);
            events.off(playbackManager, 'playbackstop', onPlaybackStop);
            events.off(playbackManager, 'playbackcancelled', onPlaybackCancelled);

            inputManager.off(window, onInputCommand);
            releasePlayer();
        });

        function bindToPlayer(player) {

            if (player != currentPlayer) {

                releasePlayer();

                events.on(player, 'volumechange', onVolumeChange);
                events.on(player, 'timeupdate', onTimeUpdate);
                events.on(player, 'pause', onPlaystateChange);
                events.on(player, 'playing', onPlaystateChange);
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
                events.off(player, 'volumechange', onVolumeChange);
                events.off(player, 'timeupdate', onTimeUpdate);
                events.off(player, 'pause', onPlaystateChange);
                events.off(player, 'playing', onPlaystateChange);
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

            var index = playbackManager.currentPlaylistIndex();

            var previousEnabled = index > 0;
            var nextEnabled = (index < items.length - 1);

            var btnPreviousTrack = view.querySelector('.btnPreviousTrack');
            var btnNextTrack = view.querySelector('.btnNextTrack');

            if (!nextEnabled && !previousEnabled) {

                btnPreviousTrack.classList.add('hide');
                btnNextTrack.classList.add('hide');

            } else {

                btnPreviousTrack.classList.remove('hide');
                btnNextTrack.classList.remove('hide');

                btnNextTrack.disabled = !nextEnabled;
                btnPreviousTrack.disabled = !previousEnabled;
            }
        }

        function updateTime(player) {

            if (!nowPlayingPositionSlider.dragging) {

                var state = playbackManager.getPlayerState(player);
                var playState = state.PlayState || {};
                var nowPlayingItem = state.NowPlayingItem || {};

                if (nowPlayingItem.RunTimeTicks) {

                    currentRuntimeTicks = nowPlayingItem.RunTimeTicks;
                    var pct = playState.PositionTicks / nowPlayingItem.RunTimeTicks;
                    pct *= 100;

                    nowPlayingPositionSlider.value = pct;

                } else {

                    nowPlayingPositionSlider.value = 0;
                    currentRuntimeTicks = null;
                }

                updateTimeText(nowPlayingPositionText, playState.PositionTicks);
                updateTimeText(nowPlayingDurationText, nowPlayingItem.RunTimeTicks, true);

                nowPlayingPositionSlider.disabled = !playState.CanSeek;
                btnFastForward.disabled = !playState.CanSeek;
                btnRewind.disabled = !playState.CanSeek;

                if (nowPlayingItem.RunTimeTicks && playState.PositionTicks != null) {
                    endsAtText.innerHTML = '&nbsp;&nbsp;-&nbsp;&nbsp;' + mediaInfo.getEndsAtFromPosition(nowPlayingItem.RunTimeTicks, playState.PositionTicks, true);
                } else {
                    endsAtText.innerHTML = '';
                }
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
                    name: stream.DisplayTitle || name,
                    id: stream.Index
                };

                if (stream.Index == currentIndex) {
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
                    name: stream.DisplayTitle || name,
                    id: stream.Index
                };

                if (stream.Index == currentIndex) {
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

            if (e.keyCode == 32 && !isOsdOpen()) {
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

            stopScenePickerTimer();
            playbackManager.seekPercent(parseFloat(this.value), currentPlayer);
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

        view.querySelector('.btnPreviousTrack').addEventListener('click', function () {

            playbackManager.previousChapter();
        });

        view.querySelector('.btnPause').addEventListener('click', function () {

            playbackManager.playPause();
        });

        view.querySelector('.btnNextTrack').addEventListener('click', function () {

            playbackManager.nextChapter();
        });

        btnRewind.addEventListener('click', function () {

            playbackManager.rewind();
        });
        
        btnFastForward.addEventListener('click', function () {

            playbackManager.fastForward();
        });

        view.querySelector('.btnAudio').addEventListener('click', showAudioTrackSelection);
        view.querySelector('.btnSubtitles').addEventListener('click', showSubtitleTrackSelection);

        function getChapterHtml(item, chapter, index, maxWidth, apiClient) {

            var html = '';

            var src = getImgUrl(item, chapter, index, maxWidth, apiClient);

            if (src) {

                var pct = currentRuntimeTicks ? (chapter.StartPositionTicks / currentRuntimeTicks) : 0;
                pct *= 100;
                chapterPcts[index] = pct;

                html += '<img data-index="' + index + '" class="chapterThumb" src="' + src + '" />';
            }

            return html;
        }

        function getImgUrl(item, chapter, index, maxWidth, apiClient) {

            if (chapter.ImageTag) {

                return apiClient.getScaledImageUrl(item.Id, {

                    maxWidth: maxWidth,
                    tag: chapter.ImageTag,
                    type: "Chapter",
                    index: index
                });
            }

            return null;
        }

        function renderScenePicker(progressPct) {

            chapterPcts = [];
            var item = currentItem;
            if (!item) {
                return;
            }

            var chapters = item.Chapters || [];

            var currentIndex = -1;

            var apiClient = connectionManager.getApiClient(item.ServerId);

            scenePicker.innerHTML = chapters.map(function (chapter) {
                currentIndex++;
                return getChapterHtml(item, chapter, currentIndex, 400, apiClient);
            }).join('');

            imageLoader.lazyChildren(scenePicker);
            fadeIn(scenePicker, progressPct);
        }

        var hideScenePickerTimeout;
        var chapterPcts = [];
        function showScenePicker() {

            var progressPct = nowPlayingPositionSlider.value;

            if (!isScenePickerRendered) {
                isScenePickerRendered = true;
                renderScenePicker();
            } else {
                fadeIn(scenePicker, progressPct);
            }

            if (hideScenePickerTimeout) {
                clearTimeout(hideScenePickerTimeout);
            }
            hideScenePickerTimeout = setTimeout(hideScenePicker, 1600);
        }

        function hideScenePicker() {
            fadeOut(scenePicker);
        }

        var showScenePickerTimeout;
        function startScenePickerTimer() {
            if (!showScenePickerTimeout) {
                showScenePickerTimeout = setTimeout(showScenePicker, 100);
            }
        }

        function stopScenePickerTimer() {
            if (showScenePickerTimeout) {
                clearTimeout(showScenePickerTimeout);
                showScenePickerTimeout = null;
            }
        }

        nowPlayingPositionSlider.addEventListener('input', function () {

            if (scenePicker.classList.contains('hide')) {
                startScenePickerTimer();
            } else {
                showScenePicker();
            }
        });

        function onViewHideStopPlayback() {

            if (playbackManager.isPlayingVideo()) {

                // Unbind this event so that we don't go back twice
                events.off(playbackManager, 'playbackstop', onPlaybackStop);
                view.removeEventListener('viewbeforehide', onViewHideStopPlayback);

                playbackManager.stop();

                // or 
                //Emby.Page.setTransparency(Emby.TransparencyLevel.Backdrop);
            }
        }

        function fadeIn(elem, pct) {

            if (!elem.classList.contains('hide')) {
                selectChapterThumb(elem, pct);
                return;
            }

            elem.classList.remove('hide');

            var keyframes = [
              { opacity: '0', offset: 0 },
              { opacity: '1', offset: 1 }];
            var timing = { duration: 300, iterations: 1 };
            elem.animate(keyframes, timing).onfinish = function () {
                selectChapterThumb(elem, pct);
            };
        }

        function selectChapterThumb(elem, pct) {
            var index = -1;
            for (var i = 0, length = chapterPcts.length; i < length; i++) {

                if (pct >= chapterPcts[i]) {
                    index = i;
                }
            }

            if (index == -1) {
                index = 0;
            }

            var selected = elem.querySelector('.selectedChapterThumb');
            var newSelected = elem.querySelector('.chapterThumb[data-index="' + index + '"]');

            if (selected != newSelected) {
                if (selected) {
                    selected.classList.remove('selectedChapterThumb');
                }

                newSelected.classList.add('selectedChapterThumb');
                scrollHelper.toCenter(elem, newSelected, true);
            }
        }

        function fadeOut(elem) {

            if (elem.classList.contains('hide')) {
                return;
            }

            var keyframes = [
              { opacity: '1', offset: 0 },
              { opacity: '0', offset: 1 }];
            var timing = { duration: 300, iterations: 1 };
            elem.animate(keyframes, timing).onfinish = function () {
                elem.classList.add('hide');
            };
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