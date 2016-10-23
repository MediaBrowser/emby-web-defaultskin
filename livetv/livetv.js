define(['loading', 'alphaPicker', './../components/horizontallist', './../components/tabbedpage', 'backdrop', 'connectionManager', 'emby-itemscontainer'], function (loading, alphaPicker, horizontalList, tabbedPage, backdrop, connectionManager) {
    'use strict';

    function renderTabs(view, initialTabId, pageInstance, params) {

        var tabs = [
        {
            Name: Globalize.translate('Channels'),
            Id: "channels"
        },
        {
            Name: Globalize.translate('Recordings'),
            Id: "recordings"
        }
        //,
        //{
        //    Name: Globalize.translate('Scheduled'),
        //    Id: "scheduled"
        //}
        ];

        var tabbedPageInstance = new tabbedPage(view);
        tabbedPageInstance.loadViewContent = loadViewContent;
        tabbedPageInstance.params = params;
        tabbedPageInstance.renderTabs(tabs, initialTabId);
        pageInstance.tabbedPage = tabbedPageInstance;
    }

    function loadViewContent(page, id, type) {

        var tabbedPage = this;

        return new Promise(function (resolve, reject) {

            if (self.listController) {
                self.listController.destroy();
            }

            var pageParams = tabbedPage.params;

            var autoFocus = false;

            if (!tabbedPage.hasLoaded) {
                autoFocus = true;
                tabbedPage.hasLoaded = true;
            }

            switch (id) {

                case 'channels':
                    renderChannels(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                    break;
                case 'recordings':
                    renderRecordings(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);
                    break;
                case 'scheduled':
                    break;
                default:
                    break;
            }
        });
    }

    function renderChannels(page, pageParams, autoFocus, scroller, resolve) {

        self.listController = new horizontalList({

            itemsContainer: page.querySelector('.contentScrollSlider'),
            getItemsMethod: function (startIndex, limit) {

                var apiClient = connectionManager.getApiClient(pageParams.serverId);
                return apiClient.getLiveTvChannels({
                    StartIndex: startIndex,
                    Limit: limit,
                    SortBy: "DateCreated,SortName",
                    SortOrder: "Descending",
                    UserId: apiClient.getCurrentUserId(),
                    Fields: "PrimaryImageAspectRatio",
                    ImageTypeLimit: 1
                });
            },
            listCountElement: page.querySelector('.listCount'),
            listNumbersElement: page.querySelector('.listNumbers'),
            autoFocus: autoFocus,
            selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
            selectedIndexElement: page.querySelector('.selectedIndex'),
            scroller: scroller,
            onRender: function () {
                if (resolve) {
                    resolve();
                    resolve = null;
                }
            },
            cardOptions: {
                action: 'play',
                rows: {
                    portait: 2,
                    square: 3,
                    backdrop: 3
                },
                scalable: false,
                overlayText: true,
                showTitle: false,
                cardLayout: false,
                showCurrentProgram: false
            }
        });

        self.listController.render();
    }

    function renderRecordings(page, pageParams, autoFocus, scroller, resolve) {

        self.listController = new horizontalList({

            itemsContainer: page.querySelector('.contentScrollSlider'),
            getItemsMethod: function (startIndex, limit) {
                return Emby.Models.recordings({
                    StartIndex: startIndex,
                    Limit: limit,
                    SortBy: "DateCreated,SortName",
                    SortOrder: "Descending"
                });
            },
            listCountElement: page.querySelector('.listCount'),
            listNumbersElement: page.querySelector('.listNumbers'),
            autoFocus: autoFocus,
            selectedItemInfoElement: page.querySelector('.selectedItemInfo'),
            selectedIndexElement: page.querySelector('.selectedIndex'),
            scroller: scroller,
            onRender: function () {
                if (resolve) {
                    resolve();
                    resolve = null;
                }
            },
            cardOptions: {
                rows: {
                    portrait: 2,
                    square: 3,
                    backdrop: 3
                },
                scalable: false,
                showParentTitleOrTitle: true,
                overlayText: true
            }
        });

        self.listController.render();
    }

    return function (view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            require(['loading'], function (loading) {

                if (!self.tabbedPage) {
                    loading.show();
                    renderTabs(view, params.tab, self, params);
                }

                Emby.Page.setTitle(Globalize.translate('LiveTV'));
                backdrop.clear();
            });
        });

        view.addEventListener('viewdestroy', function () {

            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
        });
    };

});