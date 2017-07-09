define(['tvguide', 'events', 'datetime', 'imageLoader', 'backdrop', 'mediaInfo'], function (tvguide, events, datetime, imageLoader, backdrop, mediaInfo) {
    'use strict';

    return function (view, params) {

        var self = this;
        var guideInstance;

        var guideItemDetailsElement = view.querySelector('.guideItemDetails');
        var guideImageElement = view.querySelector('.guideImage');

        var hideTime = 0;

        view.addEventListener('viewshow', function (e) {

            Emby.Page.setTitle(Globalize.translate('Guide'));
            backdrop.clear();

            if (e.detail.isRestored) {
                if (guideInstance) {
                    var refreshGuideData = false;
                    if ((new Date().getTime() - hideTime) > 60000) {
                        refreshGuideData = true;
                    }
                    guideInstance.resume(refreshGuideData);
                }
            } else {
                initGuide();
            }
        });

        view.addEventListener('viewhide', function () {
            hideTime = new Date().getTime();
            if (guideInstance) {
                guideInstance.pause();
            }
        });

        view.addEventListener('viewdestroy', function () {
            if (guideInstance) {
                guideInstance.destroy();
                guideInstance = null;
            }
        });

        var focusTimeout;
        var currentItemId;

        function clearFocusTimeout() {
            if (focusTimeout) {
                clearTimeout(focusTimeout);
            }
        }

        function onFocusTimeout() {

            Emby.Models.item(currentItemId).then(function (item) {

                setSelectedInfo(item);
                backdrop.setBackdrop(item);
            });
        }

        function onGuideFocus(e, detail) {

            clearFocusTimeout();
            currentItemId = detail.item.Id;
            focusTimeout = setTimeout(onFocusTimeout, 500);
        }

        function getTime(date) {

            return datetime.getDisplayTime(date).toLowerCase();
        }

        function setSelectedInfo(item) {

            var html = '';

            html += '<div style="display:flex;align-items:center;">';
            html += '<h2>' + item.Name + '</h2>';

            if (item.IsHD) {
                html += '<i class="md-icon" style="font-size:1.3em;margin:0 .5em 0 1em;">hd</i>';
            }

            if (item.SeriesTimerId) {
                html += '<i class="seriesTimerIcon md-icon">fiber_smart_record</i>';
            } else if (item.TimerId) {
                html += '<i class="timerIcon md-icon">fiber_manual_record</i>';
            }

            html += '</div>';

            var secondaryMediaInfoHtml = mediaInfo.getPrimaryMediaInfoHtml(item);
            if (secondaryMediaInfoHtml) {
                html += '<div class="dim" style="margin-top:.15em;display:flex;align-items:center;">';
                html += secondaryMediaInfoHtml;
                html += '</div>';
            }

            var overview = item.ShortOverview || item.Overview;

            if (overview) {
                html += '<div class="guideOverview dim" style="margin-top:.15em;">';
                html += overview;
                html += '</div>';
            }

            var date = '';
            if (item.StartDate) {

                try {
                    date += getTime(datetime.parseISO8601Date(item.StartDate));
                } catch (e) {
                    console.log("Error parsing date: " + item.PremiereDate);
                }
            }
            if (item.EndDate) {

                try {
                    date += ' - ' + getTime(datetime.parseISO8601Date(item.EndDate));
                } catch (e) {
                    console.log("Error parsing date: " + item.EndDate);
                }
            }

            if (date) {
                html += '<div class="dim" style="margin-top:.15em;">';
                html += date;
                html += '</div>';
            }

            guideItemDetailsElement.innerHTML = html;

            var imgUrl = Emby.Models.imageUrl(item);
            if (imgUrl) {
                imageLoader.lazyImage(guideImageElement, imgUrl);
            } else {
                guideImageElement.style.backgroundImage = '';
            }
        }

        function initGuide() {

            guideInstance = new tvguide({
                element: view.querySelector('.guidePageContainer')
            });

            events.on(guideInstance, 'focus', onGuideFocus);
        }
    };

});