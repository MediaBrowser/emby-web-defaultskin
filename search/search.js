define(['loading', 'alphaPicker', 'scroller', './../components/focushandler', 'cardBuilder', 'connectionManager', 'emby-itemscontainer'], function (loading, alphaPicker, scroller, focusHandler, cardBuilder, connectionManager) {

    function createVerticalScroller(view, pageInstance) {

        var scrollFrame = view.querySelector('.scrollFrameY');

        var options = {
            horizontal: 0,
            itemNav: 0,
            mouseDragging: 1,
            touchDragging: 1,
            slidee: view.querySelector('.scrollSlider'),
            itemSelector: '.card',
            smart: true,
            scrollBy: 200,
            speed: 270,
            scrollWidth: 10000
        };

        pageInstance.verticalScroller = new scroller(scrollFrame, options);
        pageInstance.verticalScroller.init();
        initFocusHandler(view, pageInstance.verticalScroller);
    }

    function initFocusHandler(view, scroller) {

        var searchResults = view.querySelector('.searchResults');

        self.focusHandler = new focusHandler({
            parent: searchResults,
            scroller: scroller
        });
    }

    function isWhitespace(userText) {
        userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
        if (userText === '') {
            return true;
        } else {
            // text has real content, now free of leading/trailing whitespace
            return false;
        }
    }

    return function (view, params) {

        var self = this;

        function onAlphaValueClicked(e) {

            var value = e.detail.value;

            var txtSearch = view.querySelector('.txtSearch');

            if (value == 'backspace') {

                var val = txtSearch.value;
                txtSearch.value = val.length ? val.substring(0, val.length - 1) : '';

            } else {
                txtSearch.value += value;
            }

            search(txtSearch.value);
        }

        function search(value) {

            if (!value || isWhitespace(value)) {
                var emptyResult = {
                    SearchHints: []
                };
                populateResults(emptyResult, '.peopleResults');
                populateResults(emptyResult, '.movieResults');
                populateResults(emptyResult, '.artistResults');
                populateResults(emptyResult, '.albumResults');
                populateResults(emptyResult, '.songResults');
                return;
            }

            searchType(value, {

                searchTerm: value,
                IncludePeople: false,
                IncludeMedia: true,
                IncludeGenres: false,
                IncludeStudios: false,
                IncludeArtists: false,
                IncludeItemTypes: "Movie,Series"

            }, '.movieResults');

            searchType(value, {

                searchTerm: value,
                IncludePeople: true,
                IncludeMedia: false,
                IncludeGenres: false,
                IncludeStudios: false,
                IncludeArtists: false

            }, '.peopleResults', {

                coverImage: true,
                showTitle: true,
                overlayTitle: false
            });

            searchType(value, {

                searchTerm: value,
                IncludePeople: false,
                IncludeMedia: false,
                IncludeGenres: false,
                IncludeStudios: false,
                IncludeArtists: true

            }, '.artistResults', {

                coverImage: true,
                showTitle: true,
                overlayTitle: false
            });

            searchType(value, {

                searchTerm: value,
                IncludePeople: false,
                IncludeMedia: true,
                IncludeGenres: false,
                IncludeStudios: false,
                IncludeArtists: false,
                IncludeItemTypes: "MusicAlbum"

            }, '.albumResults');

            searchType(value, {

                searchTerm: value,
                IncludePeople: false,
                IncludeMedia: true,
                IncludeGenres: false,
                IncludeStudios: false,
                IncludeArtists: false,
                IncludeItemTypes: "Audio"

            }, '.songResults', {
                action: 'play'
            });
        }

        function getSearchResults(options) {

            var apiClient = connectionManager.currentApiClient();

            options.UserId = apiClient.getCurrentUserId();

            return apiClient.getSearchHints(options);
        }

        function searchType(value, query, section, cardOptions) {

            query.Limit = 6;

            getSearchResults(query).then(function (result) {

                populateResults(result, section, cardOptions);

            });
        }

        function populateResults(result, section, cardOptions) {

            section = view.querySelector(section);

            var items = result.SearchHints;

            if (items.length) {
                section.classList.remove('hide');
            } else {
                section.classList.add('hide');
            }

            cardOptions = cardOptions || {};
            cardOptions.itemsContainer = section.querySelector('.itemsContainer');
            cardOptions.shape = 'autoVertical';
            cardOptions.sectionTitleTagName = 'h2';
            cardOptions.scalable = true;
            cardOptions.overlayText = true;

            cardOptions.widths = {
                portrait: 340,
                thumb: 500,
                square: 340
            };

            cardBuilder.buildCards(items, cardOptions);
        }

        function initAlphaPicker(view) {

            var alphaPickerElement = view.querySelector('.alphaPicker');

            self.alphaPicker = new alphaPicker({
                element: alphaPickerElement,
                mode: 'keyboard'
            });

            self.alphaPicker.focus();
            alphaPickerElement.addEventListener('alphavalueclicked', onAlphaValueClicked);
        }

        var searchTimeout;
        function searchOnTimeout() {

            if (searchTimeout) {
                clearTimeout(searchTimeout);
                searchTimeout = null;
            }

            searchTimeout = setTimeout(onSearchTimeout, 300);
        }

        function onSearchTimeout() {
            search(view.querySelector('.txtSearch').value);
        }

        var lastKeyDownValue = '';
        function onSearchKeyPress(e) {

            var value = e.target.value;

            if (value != lastKeyDownValue) {
                lastKeyDownValue = value;
                searchOnTimeout();
            }
        }

        function getHeaderElement() {
            return document.querySelector('.skinHeader');
        }

        view.addEventListener('viewshow', function (e) {

            getHeaderElement().classList.add('searchHeader');

            Emby.Page.setTitle('');
            document.querySelector('.headerSearchButton').classList.add('hide');

            var isRestored = e.detail.isRestored;

            if (!isRestored) {
                initAlphaPicker(e.target);

                e.target.querySelector('.txtSearch').addEventListener('keyup', onSearchKeyPress);

                createVerticalScroller(e.target, self);
            }
        });

        view.addEventListener('viewhide', function () {

            getHeaderElement().classList.remove('searchHeader');

            document.querySelector('.headerSearchButton').classList.remove('hide');
        });

        view.addEventListener('viewdestroy', function () {

            if (self.focusHandler) {
                self.focusHandler.destroy();
                self.focusHandler = null
            }
            if (self.alphaPicker) {
                self.alphaPicker.destroy();
            }
            if (self.verticalScroller) {
                self.verticalScroller.destroy();
            }
        });
    }

});