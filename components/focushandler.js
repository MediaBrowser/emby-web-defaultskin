define(['imageLoader', 'itemHelper', 'backdrop', 'mediaInfo', 'focusManager', 'scrollHelper', 'browser', 'layoutManager'],
    function (imageLoader, itemHelper, backdrop, mediaInfo, focusManager, scrollHelper, browser, layoutManager) {

        var enableAnimations = browser.animate || browser.edge;
        var zoomInEase = 'ease-out';
        var zoomOutEase = 'ease-in';
        var zoomDuration = 200;

        function zoomOut(elem, scaleSize) {

            var keyframes = [
            { transform: 'scale(' + scaleSize + ')  ', offset: 0 },
            { transform: 'scale(1)', offset: 1 }
            ];

            if (elem.animate) {
                var timing = { duration: zoomDuration, iterations: 1, fill: 'both', easing: zoomOutEase };
                elem.animate(keyframes, timing);
            }
        }

        function fadeIn(elem) {

            var keyframes = [
              { opacity: '0', offset: 0 },
              { opacity: '1', offset: 1 }];
            var timing = { duration: 140, iterations: 1, easing: 'ease-out' };
            return elem.animate(keyframes, timing);
        }

        function focusHandler(options) {

            var self = this;

            var parent = options.parent;
            var focusedElement;
            var zoomElement;
            var currentAnimation;
            var isHorizontal = options.scroller ? options.scroller.options.horizontal : options.horizontal;
            var zoomScale = options.zoomScale || (isHorizontal ? '1.16' : '1.12');
            var lastFocus = 0;

            if (layoutManager.tv) {
                parent.addEventListener('focus', onFocusIn, true);
                parent.addEventListener('blur', onFocusOut, true);
            }

            var selectedItemInfoElement = options.selectedItemInfoElement;
            var selectedIndexElement = options.selectedIndexElement;
            var selectedItemPanel;

            function onFocusIn(e) {

                var focused = e.target;
                focusedElement = focused;

                if (focused) {

                    if (selectedIndexElement) {
                        var index = focused.getAttribute('data-index');
                        if (index) {
                            selectedIndexElement.innerHTML = 1 + parseInt(index);
                        }
                    }

                    if (layoutManager.tv) {
                        if (options.scroller) {
                            var now = new Date().getTime();

                            var animate = (now - lastFocus) > 50;
                            options.scroller.toCenter(focused, !animate);
                            lastFocus = now;
                        } else if (options.scrollElement) {
                            scrollHelper.toCenter(options.scrollElement, focused, options.horizontal);
                        }
                    }
                    startZoomTimer();
                }
            }

            function onFocusOut(e) {

                clearZoomTimer();
                clearSelectedInfoTimer();

                if (selectedItemInfoElement && selectedItemInfoElementHasContent) {
                    requestAnimationFrame(clearSelectedItemInfo);
                }

                var focused = focusedElement;
                focusedElement = null;

                var zoomed = zoomElement;
                zoomElement = null;

                if (zoomed) {
                    zoomOut(zoomed, zoomScale);
                }

                if (currentAnimation) {
                    currentAnimation.cancel();
                    currentAnimation = null;
                }
            }

            var zoomTimeout;
            var selectedItemInfoTimeout;
            function clearZoomTimer() {
                if (zoomTimeout) {
                    clearTimeout(zoomTimeout);
                }
            }
            function clearSelectedInfoTimer() {
                if (selectedItemInfoTimeout) {
                    clearTimeout(selectedItemInfoTimeout);
                }
            }
            function startZoomTimer() {

                clearZoomTimer();
                zoomTimeout = setTimeout(onZoomTimeout, 50);

                if (selectedItemInfoElement) {
                    clearSelectedInfoTimer();
                    selectedItemInfoTimeout = setTimeout(onSelectedInfoTimeout, 500);
                }
            }

            function onZoomTimeout() {
                var focused = focusedElement
                if (focused) {
                    zoomIn(focused);
                }
            }

            function onSelectedInfoTimeout() {
                var focused = focusedElement
                if (focused) {
                    setSelectedItemInfo(focused);
                }
            }

            function zoomIn(elem) {

                if (!enableAnimations) {
                    return;
                }

                var card = elem;

                var cardBox = card.querySelector('.cardBox-focustransform');

                if (!cardBox) {
                    return;
                }

                elem = cardBox;

                var keyframes = [
                    { transform: 'scale(1)  ', offset: 0 },
                  { transform: 'scale(' + zoomScale + ')', offset: 1 }
                ];

                if (currentAnimation) {
                    //currentAnimation.cancel();
                }

                var onAnimationFinished = function () {
                    currentAnimation = null;

                    zoomElement = elem;
                };

                if (elem.animate) {
                    var timing = { duration: zoomDuration, iterations: 1, fill: 'both', easing: zoomInEase };
                    var animation = elem.animate(keyframes, timing);

                    animation.onfinish = onAnimationFinished;
                    currentAnimation = animation;
                } else {
                    onAnimationFinished();
                }
            }

            function setSelectedItemInfo(card) {

                if (options.enableBackdrops !== false || selectedItemInfoElement) {

                    var id = card.getAttribute('data-id');

                    if (!id) {
                        return;
                    }

                    Emby.Models.item(id).then(function (item) {

                        if (options.enableBackdrops) {
                            if (!browser.slow && !browser.xboxOne) {
                                //backdrop.setBackdrop(item);
                            }
                        }
                        setSelectedInfo(card, item);
                    });
                }
            }

            var selectedItemInfoElementHasContent;
            function setSelectedInfo(card, item) {

                if (!selectedItemInfoElement) {
                    return;
                }

                var html = '';

                var logoImageUrl = Emby.Models.logoImageUrl(item, {
                });

                if (logoImageUrl) {

                    html += '<div class="selectedItemInfoLogo" style="background-image:url(\'' + logoImageUrl + '\');"></div>';
                }

                var mediaInfoHtml = mediaInfo.getPrimaryMediaInfoHtml(item);

                html += '<div>';
                html += '<div>';

                if (item.AlbumArtist) {
                    html += item.AlbumArtist + " - ";
                }

                html += itemHelper.getDisplayName(item);
                html += '</div>';
                if (mediaInfoHtml) {
                    html += '<div class="selectedItemMediaInfo">';
                    html += mediaInfoHtml;
                    html += '</div>';
                }
                html += '</div>';

                //if (item.Overview && item.Type != 'MusicAlbum' && item.Type != 'MusicArtist') {
                //    html += '<div class="overview">';
                //    html += item.Overview;
                //    html += '</div>';
                //}

                selectedItemInfoElement.innerHTML = html;
                selectedItemInfoElementHasContent = true;

                var rect = card.getBoundingClientRect();
                selectedItemInfoElement.style.left = (Math.max(rect.left, 70)) + 'px';

                if (html && enableAnimations) {
                    fadeIn(selectedItemInfoElement, 1);
                }
            }

            function clearSelectedItemInfo() {

                selectedItemInfoElement.innerHTML = '';
                selectedItemInfoElementHasContent = false;
            }

            self.destroy = function () {

                parent.removeEventListener('focus', onFocusIn, true);
                parent.removeEventListener('blur', onFocusOut, true);

                if (selectedItemInfoElement) {
                    selectedItemInfoElement.innerHTML = '';
                }
            };
        }

        return focusHandler;
    });