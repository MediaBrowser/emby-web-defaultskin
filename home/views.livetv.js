define(['focusManager', 'cardBuilder', 'pluginManager', './../skininfo', 'emby-itemscontainer'], function (focusManager, cardBuilder, pluginManager, skinInfo) {

    function loadLatestRecordings(element, apiClient) {

        return apiClient.getLiveTvRecordings({

            Limit: 6,
            IsInProgress: false,
            UserId: apiClient.getCurrentUserId(),
            ImageTypeLimit: 1,
            Fields: "PrimaryImageAspectRatio"

        }).then(function (result) {

            var section = element.querySelector('.latestRecordingsSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                showParentTitle: true,
                coverImage: true,
                rows: {
                    portrait: 2,
                    square: 3,
                    backdrop: 3
                },
                scalable: false,
                overlayText: true
            });
        });
    }

    function loadNowPlaying(element, apiClient) {

        return apiClient.getLiveTvRecommendedPrograms({

            IsAiring: true,
            limit: 9,
            EnableImageTypes: "Primary",
            ImageTypeLimit: 1,
            Fields: "PrimaryImageAspectRatio",
            UserId: apiClient.getCurrentUserId()

        }).then(function (result) {

            var section = element.querySelector('.nowPlayingSection');

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                coverImage: true,
                rows: {
                    portrait: 2,
                    square: 3,
                    backdrop: 3
                },
                scalable: false
            });
        });
    }

    function loadUpcomingPrograms(section, apiClient, options) {

        options.ImageTypeLimit = 1;
        options.Fields = "PrimaryImageAspectRatio";
        options.UserId = apiClient.getCurrentUserId();

        return apiClient.getLiveTvRecommendedPrograms(options).then(function (result) {

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                coverImage: true,
                rows: {
                    portrait: 2,
                    square: 3,
                    backdrop: 3
                },
                scalable: false
            });
        });
    }

    function gotoTvView(tab, parentId) {

        Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'livetv/livetv.html?tab=' + tab));
    }

    function view(element, apiClient, parentId, autoFocus) {
        var self = this;

        if (autoFocus) {
            focusManager.autoFocus(element);
        }

        self.loadData = function () {

            return Promise.all([
                loadLatestRecordings(element, apiClient),
                loadNowPlaying(element, apiClient),

                loadUpcomingPrograms(element.querySelector('.upcomingProgramsSection'), apiClient, {

                    IsAiring: false,
                    HasAired: false,
                    limit: 9,
                    IsMovie: false,
                    IsSports: false,
                    IsKids: false,
                    IsSeries: true

                }),

                loadUpcomingPrograms(element.querySelector('.upcomingMoviesSection'), apiClient, {

                    IsAiring: false,
                    HasAired: false,
                    limit: 9,
                    IsMovie: true

                }),

                loadUpcomingPrograms(element.querySelector('.upcomingSportsSection'), apiClient, {

                    IsAiring: false,
                    HasAired: false,
                    limit: 9,
                    IsSports: true

                }),

                loadUpcomingPrograms(element.querySelector('.upcomingKidsSection'), apiClient, {

                    IsAiring: false,
                    HasAired: false,
                    limit: 9,
                    IsSports: false,
                    IsKids: true
                })
            ]);
        };

        element.querySelector('.guideCard').addEventListener('click', function () {
            Emby.Page.show(Emby.PluginManager.mapRoute(skinInfo.id, 'livetv/guide.html'));
        });

        element.querySelector('.recordingsCard').addEventListener('click', function () {
            gotoTvView('recordings', parentId);
        });

        element.querySelector('.scheduledLiveTvCard').addEventListener('click', function () {
            gotoTvView('scheduled', parentId);
        });

        self.destroy = function () {

        };
    }

    return view;

});