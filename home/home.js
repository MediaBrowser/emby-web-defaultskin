define(['connectionManager', 'loading', './../components/tabbedpage', 'backdrop', 'focusManager', 'playbackManager', 'pluginManager', './../skininfo', 'events'], function (connectionManager, loading, tabbedPage, backdrop, focusManager, playbackManager, pluginManager, skinInfo, events) {
    'use strict';

    function loadViewHtml(page, parentId, html, viewName, autoFocus, self) {

        var homeScrollContent = page.querySelector('.contentScrollSlider');

        html = html;
        homeScrollContent.innerHTML = Globalize.translateDocument(html, skinInfo.id);

        require([skinInfo.id + '/home/views.' + viewName], function (viewBuilder) {

            var homePanel = homeScrollContent;
            var apiClient = connectionManager.currentApiClient();
            var tabView = new viewBuilder(homePanel, apiClient, parentId, autoFocus);
            tabView.element = homePanel;
            tabView.loadData();
            self.tabView = tabView;
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

    return function (view, params) {

        var self = this;
        var needsRefresh;

        function reloadTabData(tabView) {

            if (!needsRefresh) {
                return;
            }

            // view.activeElement gets set by viewManager during viewhide, so that it can be restored later
            var activeElement = view.activeElement;

            var card = activeElement ? parentWithClass(activeElement, 'card') : null;
            var itemId = card ? card.getAttribute('data-id') : null;

            var parentItemsContainer = activeElement ? parentWithClass(activeElement, 'itemsContainer') : null;

            return tabView.loadData(true).then(function () {

                return Promise.resolve({
                    activeElement: activeElement,
                    itemId: itemId,
                    parentItemsContainer: parentItemsContainer,
                    tabView: tabView
                });
            });
        }

        function onTabReloaded(tabInfo) {

            var activeElement = tabInfo.activeElement;
            var tabView = tabInfo.tabView;
            var itemId = tabInfo.itemId;

            var parentItemsContainer = tabInfo.parentItemsContainer;

            if (activeElement && document.body.contains(activeElement) && focusManager.isCurrentlyFocusable(activeElement)) {
                console.log('re-focusing activeElement');
                focusManager.focus(activeElement);
            } else {

                // need to re-focus
                // see if there's a card with the same library item
                if (itemId) {
                    console.log('focusing by itemId');
                    var card = tabView.element.querySelector('*[data-id=\'' + itemId + '\']');

                    if (card && document.body.contains(card) && focusManager.isCurrentlyFocusable(card)) {

                        console.log('focusing card by itemId');
                        focusManager.focus(card);
                        return;
                    }
                }

                if (parentItemsContainer && document.body.contains(parentItemsContainer)) {
                    console.log('focusing parentItemsContainer');
                    if (focusManager.autoFocus(parentItemsContainer)) {
                        console.log('focus parentItemsContainer succeeded');
                        return;
                    }
                }

                console.log('focusing tabview');
                focusManager.autoFocus(tabView.element);
            }
        }

        function onPlaybackStopped() {
            needsRefresh = true;
        }

        events.on(playbackManager, 'playbackstop', onPlaybackStopped);

        view.addEventListener('viewbeforeshow', function (e) {

            self.reloadPromise = null;

            var isRestored = e.detail.isRestored;

            if (isRestored) {
                if (self.tabView) {
                    self.reloadPromise = reloadTabData(self.tabView);
                }
            }
        });

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle('');

            if (isRestored) {
                if (self.reloadPromise) {
                    self.reloadPromise.then(onTabReloaded);
                }
            } else {
                loading.show();

                renderTabs(view, self);
            }
        });

        view.addEventListener('viewhide', function () {

            needsRefresh = false;
        });

        view.addEventListener('viewdestroy', function () {

            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
            if (self.tabView) {
                self.tabView.destroy();
            }

            events.off(playbackManager, 'playbackstop', onPlaybackStopped);
        });

        function renderTabs(view, pageInstance) {

            var apiClient = connectionManager.currentApiClient();
            apiClient.getUserViews({}, apiClient.getCurrentUserId()).then(function (result) {

                var tabbedPageInstance = new tabbedPage(view, {
                    handleFocus: true
                });
                tabbedPageInstance.loadViewContent = loadViewContent;
                tabbedPageInstance.renderTabs(result.Items);
                pageInstance.tabbedPage = tabbedPageInstance;
            });
        }

        var autoFocusTabContent = true;

        function loadViewContent(page, id, type) {

            return new Promise(function (resolve, reject) {

                type = (type || '').toLowerCase();

                var viewName = '';

                switch (type) {
                    case 'tvshows':
                        viewName = 'tv';
                        break;
                    case 'movies':
                        viewName = 'movies';
                        break;
                    case 'channels':
                        viewName = 'channels';
                        break;
                    case 'music':
                        viewName = 'music';
                        break;
                    case 'playlists':
                        viewName = 'playlists';
                        break;
                    case 'boxsets':
                        viewName = 'collections';
                        break;
                    case 'livetv':
                        viewName = 'livetv';
                        break;
                    default:
                        viewName = 'generic';
                        break;
                }

                require(['text!' + pluginManager.mapPath(skinInfo.id, 'home/views.' + viewName + '.html')], function (html) {

                    if (!autoFocusTabContent) {
                        var activeElement = document.activeElement;
                        if (!activeElement || activeElement.tagName === 'BODY' || !document.body.contains(activeElement)) {
                            autoFocusTabContent = true;
                        }
                    }

                    loadViewHtml(page, id, html, viewName, autoFocusTabContent, self);
                    autoFocusTabContent = false;
                    resolve();
                });
            });
        }
    };

});
