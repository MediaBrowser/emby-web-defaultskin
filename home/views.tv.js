define(['./spotlight', 'focusManager', 'cardBuilder', './../skininfo', 'emby-itemscontainer'], function (spotlight, focusManager, cardBuilder, skinInfo) {

    function loadResume(element, parentId) {

        var options = {

            Limit: 6,
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.resumable(options).then(function (result) {

            var section = element.querySelector('.resumeSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdrop',
                rows: 3,
                preferThumb: true,
                scalable: false
            });
        });
    }

    function parentWithClass(elem, className) {

        while (!elem.classList || !elem.classList.contains(className)) {
            elem = elem.parentNode;

            if (!elem) {
                return null;
            }
        }

        return elem;
    }

    function loadNextUp(element, parentId) {

        var options = {

            Limit: 9,
            ParentId: parentId
        };

        return Emby.Models.nextUp(options).then(function (result) {

            var section = element.querySelector('.nextUpSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdrop',
                rows: 3,
                preferThumb: true,
                scalable: false
            });
        });
    }

    function loadLatest(element, parentId) {

        var options = {

            IncludeItemTypes: "Episode",
            Limit: 9,
            Fields: "PrimaryImageAspectRatio",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        return Emby.Models.latestItems(options).then(function (result) {

            var section = element.querySelector('.latestSection');

            cardBuilder.buildCards(result, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdrop',
                rows: 3,
                preferThumb: true,
                showGroupCount: true,
                scalable: false
            });
        });
    }

    function loadSpotlight(element, parentId) {

        var options = {

            SortBy: "DateCreated",
            SortOrder: "Descending",
            Filters: "isUnplayed"
            IncludeItemTypes: "Series",
            Limit: 9,
            Recursive: true,
            ParentId: parentId,
            EnableImageTypes: "Backdrop",
            ImageTypes: "Backdrop"
        };

        return Emby.Models.items(options).then(function (result) {

            var card = element.querySelector('.wideSpotlightCard');

            new spotlight(card, result.Items, 767);
        });
    }

    function loadImages(element, parentId) {

        var options = {

            SortBy: "IsFavoriteOrLiked,Random",
            IncludeItemTypes: "Series",
            Limit: 3,
            Recursive: true,
            ParentId: parentId,
            EnableImageTypes: "Backdrop",
            ImageTypes: "Backdrop"
        };

        return Emby.Models.items(options).then(function (result) {

            var items = result.Items;
            var imgOptions = {
                maxWidth: 600
            };

            if (items.length > 0) {
                element.querySelector('.tvFavoritesCard .cardImage').style.backgroundImage = "url('" + Emby.Models.backdropImageUrl(items[0], imgOptions) + "')";
            }

            if (items.length > 1) {
                element.querySelector('.allSeriesCard .cardImage').style.backgroundImage = "url('" + Emby.Models.backdropImageUrl(items[1], imgOptions) + "')";
            }
        });
    }

    function view(element, apiClient, parentId, autoFocus) {

        var self = this;

        if (autoFocus) {
            focusManager.autoFocus(element);
        }

        self.loadData = function () {

            return Promise.all([
            loadResume(element, parentId),
            loadNextUp(element, parentId),
            loadLatest(element, parentId)
            ]);
        };

        loadSpotlight(element, parentId);
        loadImages(element, parentId);

        var serverId = apiClient.serverId();

        element.querySelector('.allSeriesCard').addEventListener('click', function () {
            Emby.Page.show(Emby.PluginManager.mapRoute(skinInfo.id, 'tv/tv.html?parentid=' + parentId + "&serverId=" + serverId));
        });

        element.querySelector('.tvUpcomingCard').addEventListener('click', function () {
            Emby.Page.show(Emby.PluginManager.mapRoute(skinInfo.id, 'tv/tv.html?tab=upcoming&parentid=' + parentId + "&serverId=" + serverId));
        });

        element.querySelector('.tvFavoritesCard').addEventListener('click', function () {
            Emby.Page.show(Emby.PluginManager.mapRoute(skinInfo.id, 'tv/tv.html?tab=favorites&parentid=' + parentId + "&serverId=" + serverId));
        });

        self.destroy = function () {

        };
    }

    return view;

});
