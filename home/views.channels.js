define(['cardBuilder', 'emby-itemscontainer'], function (cardBuilder) {
    'use strict';

    function loadChannels(element, parentId, apiClient, autoFocus) {

        return apiClient.getChannels({

            UserId: apiClient.getCurrentUserId(),
            Fields: "PrimaryImageAspectRatio",
            ImageTypeLimit: 1

        }).then(function (result) {

            var section = element.querySelector('.channelsSection');

            // Needed in case the view has been destroyed
            if (!section) {
                return;
            }

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdrop',
                rows: 3,
                preferThumb: true,
                autoFocus: autoFocus,
                scalable: false
            });

            var latestContainer = element.querySelector('.latestContainer');

            latestContainer.innerHTML = '';

            return Promise.all(result.Items.map(function (i) {
                return loadLatest(latestContainer, i, apiClient);
            }));
        });
    }

    function loadLatest(element, channel, apiClient) {

        var html = '<div class="sectionTitle">'+ Globalize.translate('LatestFromValue', channel.Name) + '</div><div is="emby-itemscontainer" class="itemsContainer"></div>';

        var section = document.createElement('div');
        section.classList.add('hide');
        section.classList.add('horizontalSection');

        section.innerHTML = html;
        element.appendChild(section);

        var options = {
            Limit: 6,
            ChannelIds: channel.Id,
            UserId: apiClient.getCurrentUserId(),
            Filters: "IsUnplayed",
            Fields: "PrimaryImageAspectRatio",
            ImageTypeLimit: 1
        };

        return apiClient.getLatestChannelItems(options).then(function (result) {

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                showTitle: false,
                rows: {
                    portrait: 2,
                    square: 3,
                    backdrop: 3
                },
                scalable: false
            });
        });
    }

    function view(element, apiClient, parentId, autoFocus) {

        var self = this;

        self.loadData = function () {
            return loadChannels(element, parentId, apiClient, autoFocus);
        };

        self.destroy = function () {

        };
    }

    return view;
});