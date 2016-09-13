define(['focusManager', 'cardBuilder', 'pluginManager', './../skininfo', 'browser', 'emby-itemscontainer'], function (focusManager, cardBuilder, pluginManager, skinInfo,  browser) {

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
                showParentTitleOrTitle: true,
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
                shape: 'backdrop',
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

    function loadUpcomingPrograms(section, apiClient, options, shape) {

        options.ImageTypeLimit = 1;
        options.Fields = "PrimaryImageAspectRatio";
        options.UserId = apiClient.getCurrentUserId();

        return apiClient.getLiveTvRecommendedPrograms(options).then(function (result) {

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: shape || 'backdrop',
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

    function gotoTvView(tab, parentId, serverId) {

        Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'livetv/livetv.html?tab=' + tab + '&serverId=' + serverId));
    }

    function view(element, apiClient, parentId, autoFocus) {
        var self = this;

        // The guide currently depends on browser support for flex layouts
        if (!browser.noFlex) {
            element.querySelector('.guideCard').classList.remove('hide');
        }

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
                    limit: 10,
                    IsMovie: true

                }, 'portrait'),

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
            gotoTvView('recordings', parentId, apiClient.serverId());
        });

        element.querySelector('.scheduledLiveTvCard').addEventListener('click', function () {
            gotoTvView('scheduled', parentId, apiClient.serverId());
        });

        self.destroy = function () {

        };
    }

    return view;

});