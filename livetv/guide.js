define(['tvguide', 'events', 'datetime', 'imageLoader', 'backdrop'], function (tvguide, events, datetime, imageLoader, backdrop) {

    return function (view, params) {

        var self = this;
        var guideInstance;

        var guideItemDetailsElement = view.querySelector('.guideItemDetails');
        var guideImageElement = view.querySelector('.guideImage');

        view.addEventListener('viewshow', function (e) {

            Emby.Page.setTitle(Globalize.translate('Guide'));
            backdrop.clear();

            if (!e.detail.isRestored) {
                initGuide();
            }
        });

        view.addEventListener('viewdestroy', function () {
            if (guideInstance) {
                guideInstance.destroy();
                guideInstance = null;
            }
        });

        function onGuideFocus(e, detail) {

            Emby.Models.item(detail.item.Id).then(setSelectedInfo);
            backdrop.setBackdrops([detail.item]);
        }

        function getTime(date) {
            
            return datetime.getDisplayTime(date).toLowerCase();
        }

        function setSelectedInfo(item) {

            var html = '';

            html += '<div style="display:flex;align-items:center;">';
            html += '<h2>' + item.Name + '</h2>';

            if (item.IsHD) {
                html += '<iron-icon icon="hd"></iron-icon>';
           }
            if (item.IsMovie) {
                 html += '<div style="display:flex;align-items:center;">';
            html += '<h2>' "Movie"'</h2>';
           }


            if (item.SeriesTimerId) {
                html += '<iron-icon class="seriesTimerIcon" icon="fiber-smart-record"></iron-icon>';
            }
            else if (item.TimerId) {
                html += '<iron-icon class="timerIcon" icon="fiber-manual-record"></iron-icon>';
            }

            html += '</div>';

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
                }
                catch (e) {
                    console.log("Error parsing date: " + item.PremiereDate);
                }
            }
            if (item.EndDate) {

                try {
                    date += ' - ' + getTime(datetime.parseISO8601Date(item.EndDate));
                }
                catch (e) {
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
    }

});
