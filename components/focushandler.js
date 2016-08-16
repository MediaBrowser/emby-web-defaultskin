define(['imageLoader', 'itemHelper', 'backdrop', 'mediaInfo', 'focusManager', 'scrollHelper', 'browser', 'layoutManager'],
    function (imageLoader, itemHelper, backdrop, mediaInfo, focusManager, scrollHelper, browser, layoutManager) {

        return function (options) {

            var self = this;

            var parent = options.parent;
            var focusedElement;
            var zoomElement;
            var currentAnimation;
            var isHorizontal = options.scroller ? options.scroller.options.horizontal : options.horizontal;
            var zoomScale = options.zoomScale || (isHorizontal ? '1.16' : '1.12');
            var zoomInEase = 'ease-out';
            var zoomOutEase = 'ease-in';
            var zoomDuration = 200;
            var lastFocus = 0;
            var requireFocusForZoom = true;

            if (layoutManager.tv) {
                parent.addEventListener('focus', onFocusIn, true);
                parent.addEventListener('blur', onFocusOut, true);
            } else if (layoutManager.desktop) {
                parent.addEventListener('mouseenter', onFocusIn, true);
                parent.addEventListener('mouseleave', onFocusOut, true);
                //requireFocusForZoom = false;
            }

            var selectedItemInfoInner = options.selectedItemInfoInner;
            var selectedIndexElement = options.selectedIndexElement;
            var selectedItemPanel;

            var enableAnimations = function () {

                if (browser.animate || browser.edge) {
                    return true;
                }

                return false;
            }();

            function onFocusIn(e) {
                var focused = focusManager.focusableParent(e.target);
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
                clearSelectedItemInfo();

                var focused = focusedElement;
                focusedElement = null;

                var zoomed = zoomElement;
                zoomElement = null;

                if (zoomed) {
                    zoomOut(zoomed);
                }

                if (currentAnimation) {
                    currentAnimation.cancel();
                    currentAnimation = null;
                }
            }

            var zoomTimeout;
            var selectedMediaInfoTimeout;
            function startZoomTimer() {

                if (zoomTimeout) {
                    clearTimeout(zoomTimeout);
                }
                zoomTimeout = setTimeout(onZoomTimeout, 50);
                if (selectedMediaInfoTimeout) {
                    clearTimeout(selectedMediaInfoTimeout);
                }
                var delay = 1000;
                selectedMediaInfoTimeout = setTimeout(onSelectedMediaInfoTimeout, delay);
            }

            function onZoomTimeout() {
                var focused = focusedElement
                if (focused && (!requireFocusForZoom || document.activeElement == focused)) {
                    zoomIn(focused);
                }
            }

            function onSelectedMediaInfoTimeout() {
                var focused = focusedElement
                if (focused && (!requireFocusForZoom || document.activeElement == focused)) {
                    setSelectedItemInfo(focused);
                }
            }

            function zoomIn(elem) {

                if (!enableAnimations) {
                    return;
                }

                if (elem.classList.contains('noScale')) {
                    return;
                }

                var card = elem;

                if (requireFocusForZoom && document.activeElement != card) {
                    return;
                }

                var cardBox = card.querySelector('.cardBox');

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

                var id = card.getAttribute('data-id');

                if (!id) {
                    return;
                }

                if (options.enableBackdrops !== false || selectedItemInfoInner) {
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

            function setSelectedInfo(card, item) {

                if (!selectedItemInfoInner) {
                    return;
                }

                var html = '';

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

                var logoImageUrl = Emby.Models.logoImageUrl(item, {
                });

                if (logoImageUrl) {
                    selectedItemInfoInner.classList.add('selectedItemInfoInnerWithLogo');

                    html += '<div class="selectedItemInfoLogo" style="background-image:url(\'' + logoImageUrl + '\');"></div>';

                } else {
                    selectedItemInfoInner.classList.remove('selectedItemInfoInnerWithLogo');
                }

                selectedItemInfoInner.innerHTML = html;

                var rect = card.getBoundingClientRect();
                selectedItemInfoInner.parentNode.style.left = (Math.max(rect.left, 70)) + 'px';

                if (html && enableAnimations) {
                    fadeIn(selectedItemInfoInner, 1);
                }
            }

            function clearSelectedItemInfo() {

                if (selectedItemInfoInner) {
                    selectedItemInfoInner.innerHTML = '';
                }
            }

            function zoomOut(elem) {

                var keyframes = [
                { transform: 'scale(' + zoomScale + ')  ', offset: 0 },
                { transform: 'scale(1)', offset: 1 }
                ];

                if (elem.animate) {
                    var timing = { duration: zoomDuration, iterations: 1, fill: 'both', easing: zoomOutEase };
                    elem.animate(keyframes, timing);
                }
            }

            function fadeIn(elem, iterations) {

                var keyframes = [
                  { opacity: '0', offset: 0 },
                  { opacity: '1', offset: 1 }];
                var timing = { duration: 300, iterations: iterations };
                return elem.animate(keyframes, timing);
            }

            self.destroy = function () {

                parent.removeEventListener('mouseenter', onFocusIn, true);
                parent.removeEventListener('mouseleave', onFocusOut, true);
                parent.removeEventListener('focus', onFocusIn, true);
                parent.removeEventListener('blur', onFocusOut, true);
            };
        }
    });