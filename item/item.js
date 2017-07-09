define(['itemContextMenu', 'scroller', 'loading', './../skininfo', 'datetime', 'scrollHelper', 'playbackManager', 'connectionManager', 'imageLoader', 'userdataButtons', 'itemHelper', './../components/focushandler', 'backdrop', 'listView', 'mediaInfo', 'inputManager', 'focusManager', './../skinsettings', 'cardBuilder', 'indicators', 'layoutManager', 'browser', 'serverNotifications', 'events', 'dom', 'apphost', 'globalize', 'itemShortcuts', 'emby-itemscontainer'],
    function (itemContextMenu, scroller, loading, skinInfo, datetime, scrollHelper, playbackManager, connectionManager, imageLoader, userdataButtons, itemHelper, focusHandler, backdrop, listView, mediaInfo, inputManager, focusManager, skinSettings, cardBuilder, indicators, layoutManager, browser, serverNotifications, events, dom, appHost, globalize, itemShortcuts) {
        'use strict';

        function focusMainSection() {

            var btns = this.querySelectorAll('.emby-button.raised');

            for (var i = 0, length = btns.length; i < length; i++) {
                var btn = btns[i];

                if (focusManager.isCurrentlyFocusable(btn)) {
                    try {
                        btn.focus();
                        return;
                    } catch (err) {

                    }
                }
            }

            focusManager.autoFocus(this);
        }

        function setTitle(item) {

            var url = Emby.Models.logoImageUrl(item, {});

            if (item.Type === 'BoxSet') {
                Emby.Page.setTitle('');
            }
            else if (url) {

                //var pageTitle = document.querySelector('.pageTitle');
                //pageTitle.style.backgroundImage = "url('" + url + "')";
                //pageTitle.classList.add('pageTitleWithLogo');
                //pageTitle.innerHTML = '';
                //document.querySelector('.headerLogo').classList.add('hide');
                Emby.Page.setTitle('');
            } else {
                Emby.Page.setTitle('');
            }
        }

        function createVerticalScroller(view, pageInstance) {

            if (pageInstance.verticalScroller) {
                return;
            }

            require(['scroller'], function (scroller) {

                var scrollFrame = view.querySelector('.scrollFrame');

                var options = {
                    horizontal: 0,
                    slidee: view.querySelector('.scrollSlider'),
                    scrollBy: 200,
                    speed: 270,
                    scrollWidth: 50000,
                    immediateSpeed: 160
                };

                pageInstance.verticalScroller = new scroller(scrollFrame, options);
                pageInstance.verticalScroller.init();
                initFocusHandler(view, pageInstance.verticalScroller);
            });
        }

        function initFocusHandler(view, verticalScroller) {

            self.focusHandler = new focusHandler({
                parent: view.querySelector('.scrollSlider'),
                scroller: verticalScroller,
                zoomScale: '1.10',
                enableBackdrops: false
            });
        }

        function renderName(view, item) {

            var itemTitle = view.querySelector('.itemTitle');

            itemTitle.classList.remove('hide');
            itemTitle.innerHTML = itemHelper.getDisplayName(item, {
                includeParentInfo: false
            });

            if (enableTrackList(item) || item.Type === 'MusicArtist') {
                itemTitle.classList.add('albumTitle');
            } else {
                itemTitle.classList.remove('albumTitle');
            }
        }

        function logoImageUrl(item, apiClient, options) {

            options = options || {};
            options.type = "Logo";

            if (item.ImageTags && item.ImageTags.Logo) {

                options.tag = item.ImageTags.Logo;
                return apiClient.getScaledImageUrl(item.Id, options);
            }

            if (item.ParentLogoImageTag) {
                options.tag = item.ParentLogoImageTag;
                return apiClient.getScaledImageUrl(item.ParentLogoItemId, options);
            }

            return null;
        }

        function renderLogo(view, item, apiClient) {

            var url = logoImageUrl(item, apiClient, {
                maxWidth: 300
            });

            var detailLogo = view.querySelector('.detailLogo');

            if (url) {
                detailLogo.classList.remove('hide');
                detailLogo.classList.add('lazy');
                detailLogo.setAttribute('data-src', url);
                imageLoader.lazyImage(detailLogo);

                //if (detailLogo.animate) {
                //    setTimeout(function() {
                //        bounceIn(detailLogo);
                //    }, 100);
                //}

            } else {
                detailLogo.classList.add('hide');
            }
        }

        function getDetailImageContainer(view, item) {

            var detailImage = enableTrackList(item) || item.Type === 'MusicArtist' ? view.querySelector('.leftFixedDetailImageContainer') : view.querySelector('.detailImageContainer');
            return detailImage;
        }

        function renderImage(view, item) {

            var apiClient = connectionManager.getApiClient(item.ServerId);

            var imageTags = item.ImageTags || {};
            var imageWidth = 800;
            var url;

            if (imageTags.Primary) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Primary",
                    width: imageWidth,
                    tag: item.ImageTags.Primary
                });
            }
            else if (imageTags.Thumb) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Thumb",
                    width: imageWidth,
                    tag: item.ImageTags.Thumb
                });
            }
            else if (imageTags.Disc) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Disc",
                    width: imageWidth,
                    tag: item.ImageTags.Disc
                });
            }
            else if (item.AlbumId && item.AlbumPrimaryImageTag) {

                url = apiClient.getScaledImageUrl(item.AlbumId, {
                    type: "Primary",
                    width: imageWidth,
                    tag: item.AlbumPrimaryImageTag
                });
            }
            else if (item.BackdropImageTags && item.BackdropImageTags.length) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Backdrop",
                    width: imageWidth,
                    tag: item.BackdropImageTags[0]
                });
            }
            else if (item.SeriesId && item.SeriesPrimaryImageTag) {

                url = apiClient.getScaledImageUrl(item.SeriesId, {
                    type: "Primary",
                    width: imageWidth,
                    tag: item.SeriesPrimaryImageTag
                });
            }
            else if (item.ParentPrimaryImageItemId && item.ParentPrimaryImageTag) {

                url = apiClient.getScaledImageUrl(item.ParentPrimaryImageItemId, {
                    type: "Primary",
                    width: imageWidth,
                    tag: item.ParentPrimaryImageTag
                });
            }

            var detailImage = getDetailImageContainer(view, item);

            if (url && item.Type !== "Season") {
                detailImage.classList.remove('hide');
                detailImage.innerHTML = '<img class="detailImage" src="' + url + '" />' + indicators.getProgressBarHtml(item);
            } else {
                detailImage.classList.add('hide');
                detailImage.innerHTML = '';
            }
        }

        function enableTrackList(item) {
            return item.Type === "MusicAlbum" || item.Type === "Playlist";
        }

        function renderMediaInfoIcons(view, item) {

            if (renderDynamicMediaIcons(view, item)) {
                view.querySelector('.mediaInfoIcons').classList.remove('hide');
            } else {
                view.querySelector('.mediaInfoIcons').classList.add('hide');
            }
        }

        function renderDynamicMediaIcons(view, item) {

            var html = mediaInfo.getMediaInfoStats(item).map(function (mediaInfoItem) {

                var text = mediaInfoItem.text;

                if (mediaInfoItem.type === 'added') {
                    return '<div class="mediaInfoText">' + text + '</div>';
                }

                return '<div class="mediaInfoText mediaInfoText-upper">' + text + '</div>';

            }).join('');

            view.querySelector('.mediaInfoIcons').innerHTML = html;

            return html;
        }

        function getContextMenuOptions(item, user, button) {

            var options = {
                item: item,
                open: false,
                play: false,
                queue: false,
                playAllFromHere: false,
                queueAllFromHere: false,
                positionTo: button,
                cancelTimer: false,
                record: false,
                //editImages: false,
                deleteItem: item.IsFolder === true,
                user: user
            };

            if (appHost.supports('sync')) {
                // Will be displayed via button
                options.syncLocal = false;
            }

            return options;
        }

        function hasTrailer(item) {
            return item.LocalTrailerCount || (item.RemoteTrailers || []).length;
        }

        function renderDetails(instance, view, item, user) {

            var mainSection = view.querySelector('.mainSection');

            if (item.Type === "Person") {
                mainSection.classList.add('smallBottomMargin');
            }
            else if (item.Type !== "Season" && item.Type !== "MusicArtist" && item.Type !== "MusicAlbum" && item.Type !== "Playlist") {
                mainSection.classList.remove('smallBottomMargin');
            } else {
                mainSection.classList.remove('smallBottomMargin');
            }

            if (item.Type === "Season") {
                mainSection.classList.add('seasonMainSection');
            }
            else if (item.Type === "MusicArtist" || enableTrackList(item)) {
                mainSection.classList.add('albumMainSection');
            }

            var taglineElem = view.querySelector('.tagline');
            if (item.Taglines && item.Taglines.length) {
                taglineElem.classList.remove('hide');
                taglineElem.innerHTML = item.Taglines[0];
            } else {
                taglineElem.classList.add('hide');
            }

            var overviewElem = view.querySelector('.overview');
            if (item.Overview && item.Type !== 'MusicArtist' && item.Type !== 'MusicAlbum' && item.Type !== 'Season') {
                overviewElem.classList.remove('hide');
                overviewElem.innerHTML = item.Overview;
            } else {
                overviewElem.classList.add('hide');
            }

            if (hasTrailer(item)) {
                view.querySelector('.btnTrailer').classList.remove('hide');
            } else {
                view.querySelector('.btnTrailer').classList.add('hide');
            }

            reloadPlayButtons(view, item);

            if (item.CanDelete && !item.IsFolder) {
                view.querySelector('.btnDeleteItem').classList.remove('hide');
            } else {
                view.querySelector('.btnDeleteItem').classList.add('hide');
            }

            if (enableTrackList(item) || item.Type === 'MusicArtist') {
                view.querySelector('.itemPageFixedLeft .itemPageButtons').classList.remove('hide');
                view.querySelector('.mainSection .itemPageButtons').classList.add('hide');
            } else {
                view.querySelector('.itemPageFixedLeft .itemPageButtons').classList.add('hide');
                view.querySelector('.mainSection .itemPageButtons').classList.remove('hide');
            }

            if (item.Type === 'Program' && user.Policy.EnableLiveTvManagement) {
                renderRecordingFields(instance, view.querySelector('.recordingFields'), item);
            } else {
                view.querySelector('.recordingFields').classList.add('hide');
            }

            var commands = itemContextMenu.getCommands(getContextMenuOptions(item, user));

            if (commands.length && !browser.tv) {
                view.querySelector('.mainSection .btnMore').classList.remove('hide');
            } else {
                view.querySelector('.mainSection .btnMore').classList.add('hide');
            }

            if (view.querySelector('.mainSection .itemPageButtons button:not(.hide)')) {
                view.querySelector('.mainSection .itemPageButtonsContainer').classList.remove('hide');
            } else {
                view.querySelector('.mainSection .itemPageButtonsContainer').classList.add('hide');
            }

            var mediaInfoElem = view.querySelector('.mediaInfoPrimary');
            if (item.Type === 'Season') {
                mediaInfoElem.classList.add('hide');
            } else {
                mediaInfoElem.classList.remove('hide');
                mediaInfo.fillPrimaryMediaInfo(mediaInfoElem, item, {
                    interactive: true,
                    episodeTitle: false
                });
            }

            mediaInfoElem = view.querySelector('.mediaInfoSecondary');
            mediaInfo.fillSecondaryMediaInfo(mediaInfoElem, item, {
                interactive: true
            });
            if (mediaInfoElem.innerHTML) {
                mediaInfoElem.classList.remove('hide');
            } else {
                mediaInfoElem.classList.add('hide');
            }

            var genres = item.Genres || [];
            var genresHtml = genres.map(function (i) {

                return i;

            }).join('<span class="bulletSeparator">&bull;</span>');

            var genresElem = view.querySelector('.genres');

            if (!genresHtml) {
                genresElem.classList.add('hide');
            } else {
                genresElem.classList.remove('hide');
                genresElem.innerHTML = genresHtml;
            }

            if (item.IsFolder) {
                // view.querySelector('.itemPageContainer').classList.add('list');

                view.querySelector('.itemPageFixedLeft .btnPlayText').innerHTML = globalize.translate("PlayAll");
                view.querySelector('.mainSection .btnPlayText').innerHTML = globalize.translate("PlayAll");
                view.querySelector('.itemPageFixedLeft .btnShuffle').classList.remove('hide');
                view.querySelector('.mainSection .btnShuffle').classList.remove('hide');

            } else {
                view.querySelector('.itemPageFixedLeft .btnPlayText').innerHTML = globalize.translate("Play");
                view.querySelector('.mainSection .btnPlayText').innerHTML = globalize.translate("Play");
                view.querySelector('.itemPageFixedLeft .btnShuffle').classList.add('hide');
                view.querySelector('.mainSection .btnShuffle').classList.add('hide');
            }

            if (item.Type === "MusicArtist" || item.Type === "MusicAlbum" || item.Type === "MusicGenre" || item.Type === "Playlist" || item.MediaType === "Audio") {
                view.querySelector('.btnInstantMix').classList.remove('hide');
            } else {
                view.querySelector('.btnInstantMix').classList.add('hide');
            }

            var birthDateElem = view.querySelector('.birthDate');
            if (item.PremiereDate && item.Type === 'Person') {
                birthDateElem.classList.remove('hide');

                var dateString = datetime.parseISO8601Date(item.PremiereDate).toDateString();
                birthDateElem.innerHTML = globalize.translate('BornValue', dateString);
            } else {
                birthDateElem.classList.add('hide');
            }

            var birthPlaceElem = view.querySelector('.birthPlace');
            if (item.Type === "Person" && item.ProductionLocations && item.ProductionLocations.length) {
                birthPlaceElem.classList.remove('hide');
                birthPlaceElem.innerHTML = globalize.translate('BirthPlaceValue').replace('{0}', item.ProductionLocations[0]);
            } else {
                birthPlaceElem.classList.add('hide');
            }
        }

        function reloadPlayButtons(view, item) {

            if (playbackManager.canPlay(item)) {
                view.querySelector('.itemPageFixedLeft .btnPlay').classList.remove('hide');

                var btnPlay = view.querySelector('.mainSection .btnPlay');
                btnPlay.classList.remove('hide');

                var btnResume = view.querySelector('.btnResume');

                if (item.UserData && item.UserData.PlaybackPositionTicks > 0) {
                    btnResume.classList.remove('hide');
                } else {

                    var isFocused = document.activeElement === btnResume;
                    btnResume.classList.add('hide');

                    if (isFocused) {
                        focusManager.focus(btnPlay);
                    }
                }

            } else {
                view.querySelector('.itemPageFixedLeft .btnPlay').classList.add('hide');
                view.querySelector('.mainSection .btnPlay').classList.add('hide');
            }
        }

        function renderRecordingFields(instance, recordingFieldsElement, item) {

            if (instance.currentRecordingFields) {
                instance.currentRecordingFields.refresh();
                return;
            }

            require(['recordingFields'], function (recordingFields) {

                instance.currentRecordingFields = new recordingFields({
                    parent: recordingFieldsElement,
                    programId: item.Id,
                    serverId: item.ServerId
                });
                recordingFieldsElement.classList.remove('hide');
            });
        }

        function extendVerticalCardOptions(options) {
            options.widths = {
                portrait: 340,
                thumb: 500,
                square: 340
            };
            return options;
        }

        function nextUp(seriesItem, options) {

            var apiClient = connectionManager.getApiClient(seriesItem.ServerId);

            options.UserId = apiClient.getCurrentUserId();

            return apiClient.getNextUpEpisodes(options);
        }

        function renderNextUp(view, item) {

            var section = view.querySelector('.itemNextUpSection');

            var focusedItemIsNextUp = dom.parentWithClass(document.activeElement, 'itemNextUpSection') != null;

            if (item.Type !== 'Series') {
                section.classList.add('hide');

                if (focusedItemIsNextUp) {
                    // Need to re-focus
                    focusManager.autoFocus(view);
                }
                return;
            }

            nextUp(item, {

                SeriesId: item.Id,
                Fields: "PrimaryImageAspectRatio",
                ImageTypeLimit: 1

            }).then(function (result) {

                if (!result.Items.length && focusedItemIsNextUp) {
                    // Need to re-focus
                    focusManager.autoFocus(view);
                }

                cardBuilder.buildCards(result.Items, extendVerticalCardOptions({
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'autoVertical',
                    showTitle: true,
                    overlayText: true,
                    scalable: true,
                    autoFocus: focusedItemIsNextUp,
                    sectionTitleTagName: 'h1'
                }));
            });
        }

        function renderTrackList(view, item) {

            var section = view.querySelector('.trackList');

            if (!enableTrackList(item)) {
                section.classList.add('hide');
                return;
            }

            if (!item.ChildCount) {
                section.classList.add('hide');
                return;
            }

            var onItemsResult = function (result) {
                if (!result.Items.length) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                if (item.Type === 'Playlist') {

                    if (!layoutManager.tv) {
                        section.enableDragReordering(true);
                    }
                }

                section.innerHTML = listView.getListViewHtml({
                    items: result.Items,
                    showIndexNumber: item.Type === 'MusicAlbum',
                    action: 'playallfromhere',
                    showParentTitle: true,
                    dragHandle: item.Type === 'Playlist' && !layoutManager.tv,
                    playlistId: item.Type === 'Playlist' ? item.Id : null,
                    image: item.Type === 'Playlist',
                    artist: item.Type === 'Playlist',
                    addToListButton: true
                });

                imageLoader.lazyChildren(section);
            };

            if (item.Type === 'MusicAlbum' || item.Type === 'Playlist') {

                // Songs by album
                Emby.Models.children(item, {
                    SortBy: 'SortName'

                }).then(onItemsResult);
            } else {

                // Songs by artist
                Emby.Models.items(item, {

                    SortBy: 'SortName',
                    MediaTypes: 'Audio',
                    ArtistIds: item.Id

                }).then(onItemsResult);
            }
        }

        function getProgramScheduleHtml(items, options) {

            options = options || {};

            var html = '';
            html += '<div is="emby-itemscontainer" class="itemsContainer vertical-list" data-contextmenu="false">';
            html += listView.getListViewHtml({
                items: items,
                enableUserDataButtons: false,
                image: false,
                showProgramDateTime: true,
                showChannel: true,
                mediaInfo: false,
                action: 'none',
                moreButton: false,
                recordButton: false
            });

            html += '</div>';

            return html;
        }

        function renderSeriesTimerSchedule(page, seriesTimerId, apiClient) {

            apiClient.getLiveTvTimers({
                UserId: apiClient.getCurrentUserId(),
                ImageTypeLimit: 1,
                EnableImageTypes: "Primary,Backdrop,Thumb",
                SortBy: "StartDate",
                EnableTotalRecordCount: false,
                EnableUserData: false,
                SeriesTimerId: seriesTimerId,
                Fields: "ChannelInfo"

            }).then(function (result) {

                if (result.Items.length && result.Items[0].SeriesTimerId !== seriesTimerId) {
                    result.Items = [];
                }

                var html = getProgramScheduleHtml(result.Items);

                var scheduleTab = page.querySelector('.seriesTimerSchedule');
                scheduleTab.innerHTML = html;

                imageLoader.lazyChildren(scheduleTab);
            });
        }

        function renderSeriesTimerEditor(view, item, user, apiClient) {

            if (item.Type !== 'SeriesTimer') {
                return;
            }

            if (!user.Policy.EnableLiveTvManagement) {
                view.querySelector('.seriesTimerScheduleSection').classList.add('hide');
                view.querySelector('.btnCancelSeriesTimer').classList.add('hide');
                return;
            }

            require(['seriesRecordingEditor'], function (seriesRecordingEditor) {
                seriesRecordingEditor.embed(item, apiClient.serverId(), {
                    context: view.querySelector('.seriesRecordingEditor')
                });
            });

            view.querySelector('.seriesTimerScheduleSection').classList.remove('hide');
            view.querySelector('.btnCancelSeriesTimer').classList.remove('hide');

            renderSeriesTimerSchedule(view, item.Id, apiClient);
        }

        function renderPeopleItems(view, item, apiClient) {

            var section = view.querySelector('.peopleItems');

            if (item.Type !== "Person") {
                section.classList.add('hide');
                return;
            }
            section.classList.remove('hide');

            var sections = [];

            if (item.MovieCount) {

                sections.push({
                    name: globalize.translate('Movies'),
                    type: 'Movie'
                });
            }

            if (item.SeriesCount) {

                sections.push({
                    name: globalize.translate('Shows'),
                    type: 'Series'
                });
            }

            if (item.EpisodeCount) {

                sections.push({
                    name: globalize.translate('Episodes'),
                    type: 'Episode'
                });
            }

            if (item.TrailerCount) {

                sections.push({
                    name: globalize.translate('Trailers'),
                    type: 'Trailer'
                });
            }

            if (item.GameCount) {

                sections.push({
                    name: globalize.translate('Games'),
                    type: 'Game'
                });
            }

            if (item.AlbumCount) {

                sections.push({
                    name: globalize.translate('Albums'),
                    type: 'MusicAlbum'
                });
            }

            if (item.SongCount) {

                sections.push({
                    name: globalize.translate('Songs'),
                    type: 'Audio'
                });
            }

            if (item.MusicVideoCount) {

                sections.push({
                    name: globalize.translate('MusicVideos'),
                    type: 'MusicVideo'
                });
            }

            section.innerHTML = sections.map(function (section) {

                var html = '';

                html += '<div class="verticalSection personSection" data-type="' + section.type + '">';

                html += '<h2 class="sectionTitle padded-left">';
                html += section.name;
                html += '</h2>';

                html += '<div is="emby-itemscontainer" class="itemsContainer vertical-wrap padded-left padded-right">';
                html += '</div>';

                html += '</div>';

                return html;

            }).join('');

            var sectionElems = section.querySelectorAll('.personSection');
            for (var i = 0, length = sectionElems.length; i < length; i++) {
                renderPersonSection(view, item, sectionElems[i], sectionElems[i].getAttribute('data-type'), apiClient);
            }
        }

        function renderPersonSection(view, item, element, type, apiClient) {

            switch (type) {

                case 'Movie':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "Movie",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical",
                        sectionTitleTagName: 'h2'
                    }), apiClient);
                    break;

                case 'MusicVideo':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "MusicVideo",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical",
                        sectionTitleTagName: 'h2',
                        showTitle: true
                    }));
                    break;

                case 'Game':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "Game",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical",
                        sectionTitleTagName: 'h2'
                    }), apiClient);
                    break;

                case 'Trailer':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "Trailer",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical",
                        sectionTitleTagName: 'h2'
                    }), apiClient);
                    break;

                case 'Series':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "Series",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical",
                        sectionTitleTagName: 'h2'
                    }), apiClient);
                    break;

                case 'MusicAlbum':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "MusicAlbum",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical",
                        sectionTitleTagName: 'h2',
                        playFromHere: true
                    }), apiClient);
                    break;

                case 'Episode':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "Episode",
                        PersonTypes: "",
                        ArtistIds: "",
                        Limit: 50
                    }, extendVerticalCardOptions({
                        shape: "autoVertical",
                        sectionTitleTagName: 'h2',
                        showTitle: true,
                        showParentTitle: true
                    }), apiClient);
                    break;

                default:
                    break;
            }
        }

        function loadPeopleItems(element, item, type, query, listOptions, apiClient) {

            query.SortBy = "SortName";
            query.SortOrder = "Ascending";
            query.Recursive = true;
            query.CollapseBoxSetItems = false;
            query.Fields = "PrimaryImageAspectRatio";
            query.PersonIds = item.Id;
            query.ImageTypeLimit = 1;

            apiClient.getItems(apiClient.getCurrentUserId(), query).then(function (result) {

                cardBuilder.buildCards(result.Items, {
                    parentContainer: element,
                    itemsContainer: element.querySelector('.itemsContainer'),
                    shape: listOptions.shape,
                    scalable: true,
                    showTitle: listOptions.showTitle,
                    showParentTitle: listOptions.showParentTitle,
                    overlayText: true
                });
            });
        }

        function renderEpisodes(view, item) {

            var section = view.querySelector('.episodes');

            if (item.Type !== "Season") {
                section.classList.add('hide');
                return;
            }

            view.querySelector('.itemPageContainer').classList.add('episodeList');

            var options = {
                Fields: "Overview"
            };

            Emby.Models.children(item, options).then(function (result) {

                if (!result.Items.length) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                if (skinSettings.enableAntiSpoliers()) {

                    var isFirstUnseen = true;
                    result.Items.forEach(function (item) {

                        if (item.UserData && !item.UserData.Played) {

                            if (!isFirstUnseen) {
                                item.Overview = null;
                            }
                            isFirstUnseen = false;
                        }
                    });
                }

                section.innerHTML = listView.getListViewHtml({
                    items: result.Items,
                    showIndexNumber: item.Type === 'MusicAlbum',
                    enableOverview: true,
                    imageSize: 'large',
                    enableSideMediaInfo: false
                });

                imageLoader.lazyChildren(section);

                // Sometimes this doesn't work without some delay after setting innerHTMl
                setTimeout(function () {
                    focusFirstUnWatched(result.Items, section);
                }, 100);
            });
        }

        function focusFirstUnWatched(items, element) {

            var focusItem = items.filter(function (i) {

                return !i.UserData.Played;

            })[0];

            // If none then focus the first
            if (!focusItem) {
                focusItem = items[0];
            }

            if (focusItem) {

                var itemElement = element.querySelector('*[data-id=\'' + focusItem.Id + '\']');

                focusManager.focus(itemElement);
            }
        }

        function renderChildren(view, item, apiClient) {

            renderTrackList(view, item);
            renderEpisodes(view, item);
            renderPeopleItems(view, item, apiClient);

            var section = view.querySelector('.childrenSection');

            if (item.Type !== 'MusicArtist') {
                if ((!item.ChildCount && item.Type !== 'Episode') || enableTrackList(item)) {
                    section.classList.add('hide');
                    return;
                }
            }

            var headerText = section.querySelector('h2');

            if (item.Type === "Series") {
                headerText.innerHTML = globalize.translate('Seasons');
                headerText.classList.remove('hide');
                view.querySelector('.itemPageContainer').classList.add('seasons');

            } else if (item.Type === "MusicArtist") {
                headerText.innerHTML = globalize.translate('Albums');
                headerText.classList.remove('hide');

            } else if (item.Type === "MusicAlbum") {
                headerText.classList.add('hide');

            } else if (item.Type === "BoxSet") {
                headerText.innerHTML = globalize.translate('Items');
                view.querySelector('.itemPageContainer').classList.add('boxset');
                headerText.classList.remove('hide');

            } else if (item.Type === "Episode" && item.SeriesId && item.SeasonId) {
                headerText.innerHTML = globalize.translate('MoreFrom', item.SeasonName);
                headerText.classList.remove('hide');
                view.querySelector('.itemPageContainer').classList.add('episode');

            } else {
                section.classList.add('hide');
                return;
            }

            var promise;
            var userId = apiClient.getCurrentUserId();
            var fields = "ItemCounts,PrimaryImageAspectRatio,BasicSyncInfo,CanDelete";
            var itemsContainer = section.querySelector('.itemsContainer');
            var scrollX = item.Type === 'BoxSet' ? true : false;

            var cardOptions = extendVerticalCardOptions({
                parentContainer: section,
                itemsContainer: itemsContainer,
                shape: 'autoVertical',
                sectionTitleTagName: 'h2',
                showTitle: false,
                scalable: true,
                collectionId: item.Type === 'BoxSet' ? item.Id : null
            });

            if (item.Type === 'MusicArtist') {

                promise = Emby.Models.items({
                    IncludeItemTypes: 'MusicAlbum',
                    Recursive: true,
                    ArtistIds: item.Id
                });
            }

            else if (item.Type === "Series") {

                promise = apiClient.getSeasons(item.Id, {

                    UserId: userId,
                    Fields: fields
                });
            }
            else if (item.Type === "Season") {

                // Use dedicated episodes endpoint
                promise = apiClient.getEpisodes(item.SeriesId, {

                    SeasonId: item.Id,
                    UserId: userId,
                    Fields: fields
                });

                cardOptions.overlayText = true;
                cardOptions.showTitle = true;
                cardOptions.includeParentInfoInTitle = false;
            }
            else if (item.Type === "Episode" && item.SeriesId && item.SeasonId) {

                // Use dedicated episodes endpoint
                promise = apiClient.getEpisodes(item.SeriesId, {

                    SeasonId: item.SeasonId,
                    UserId: userId,
                    Fields: fields
                });

                cardOptions.overlayText = true;
                cardOptions.showTitle = true;
                cardOptions.includeParentInfoInTitle = false;
                scrollX = true;

            } else {
                promise = Emby.Models.children(item, {});
            }

            promise.then(function (result) {

                if (!result.Items.length) {
                    section.classList.add('hide');
                    return;
                }

                if (item.Type === "Episode" && result.Items.length < 2) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                if (scrollX) {
                    itemsContainer.classList.add('smoothScrollX');
                    itemsContainer.classList.remove('vertical-wrap');
                    itemsContainer.classList.remove('vertical-list');
                } else {
                    itemsContainer.classList.remove('hiddenScrollX');
                    itemsContainer.classList.remove('smoothScrollX');
                }

                cardBuilder.buildCards(result.Items, cardOptions);

                if (item.Type === 'Episode') {

                    var card = itemsContainer.querySelector('.card[data-id="' + item.Id + '"]');
                    if (card) {
                        scrollHelper.toStart(itemsContainer, card.previousSibling || card, true);
                    }
                }

                focusManager.autoFocus(section, true);
            });
        }

        function renderPeople(view, item) {

            var section = view.querySelector('.peopleSection');

            var people = item.People || [];

            people.length = Math.min(people.length, 32);

            if (!people.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            require(['peoplecardbuilder'], function (peoplecardbuilder) {

                peoplecardbuilder.buildPeopleCards(people, {
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    coverImage: true,
                    serverId: item.ServerId,
                    width: Math.round((section.offsetWidth / 7)),
                    shape: 'portrait'
                });
            });

            // People scroller
            var scrollFrame = document.querySelector('.peopleSection');
            var slidee = scrollFrame.querySelector('.itemsContainer');
            var options = {
              horizontal: 1,
              itemNav: 0,
              mouseDragging: 1,
              touchDragging: 1,
              slidee: slidee,
              itemSelector: '.card',
              smart: true,
              releaseSwing: true,
              scrollBy: 200,
              speed: 300,
              immediateSpeed: 1,
              elasticBounds: 1,
              dragHandle: 1,
              dynamicHandle: 1,
              clickBar: 1,
              scrollWidth: 500000
            };
            self.peopleScroller = new scroller(scrollFrame, options);
            self.peopleScroller.init();
            initFocusHandler(document, slidee, self.peopleScroller);
        }

        function initFocusHandler(view, slidee, scroller) {

            //if (pageOptions.handleFocus) {

                var scrollSlider = slidee;

                // var selectedItemInfoElement = view.querySelector('.selectedItemInfo');
                // var selectedIndexElement = view.querySelector('.selectedIndex');

                self.focusHandler = new focusHandler({
                    parent: scrollSlider,
                    // selectedItemInfoElement: selectedItemInfoElement,
                    // selectedIndexElement: selectedIndexElement,
                    // animateFocus: pageOptions.animateFocus,
                    animateFocus: null,
                    scroller: scroller,
                    enableBackdrops: true,
                    zoomScale: 1.1
                });
            //}
        }

        function renderExtras(view, item, apiClient) {

            var section = view.querySelector('.extrasSection');

            if (!item.SpecialFeatureCount) {
                section.classList.add('hide');
                return;
            }

            apiClient.getSpecialFeatures(apiClient.getCurrentUserId(), item.Id).then(function (items) {

                if (!items.length) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                cardBuilder.buildCards(items, extendVerticalCardOptions({
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'autoVertical',
                    sectionTitleTagName: 'h2',
                    scalable: true,
                    showTitle: true,
                    action: 'playallfromhere'
                }));
            });
        }

        function renderScenes(view, item) {

            var section = view.querySelector('.scenesSection');

            var chapters = item.Chapters || [];

            // If there are no chapter images, don't show a bunch of empty tiles
            if (chapters.length && !chapters[0].ImageTag) {
                chapters = [];
            }

            if (!chapters.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            require(['chaptercardbuilder'], function (chaptercardbuilder) {

                chaptercardbuilder.buildChapterCards(item, chapters, {
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    width: Math.round((section.offsetWidth / 4))
                });
            });
        }

        function renderMoreFrom(view, item, apiClient) {

            var section = view.querySelector('.moreFromSection');
            if (item.Type !== 'MusicAlbum' || !item.AlbumArtists || !item.AlbumArtists.length) {
                section.classList.add('hide');
                return;
            }

            apiClient.getItems(apiClient.getCurrentUserId(), {

                IncludeItemTypes: "MusicAlbum",
                ArtistIds: item.AlbumArtists[0].Id,
                Recursive: true,
                ExcludeItemIds: item.Id

            }).then(function (result) {

                if (!result.Items.length) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                section.querySelector('h2').innerHTML = globalize.translate('MoreFrom', item.AlbumArtists[0].Name);

                cardBuilder.buildCards(result.Items, extendVerticalCardOptions({
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'autoVertical',
                    sectionTitleTagName: 'h2',
                    scalable: true,
                    coverImage: item.Type === 'MusicArtist' || item.Type === 'MusicAlbum'
                }));
            });
        }

        function renderSimilar(view, item, apiClient) {

            var options = {
                Limit: 12,
                UserId: apiClient.getCurrentUserId(),
                ImageTypeLimit: 1,
                Fields: "PrimaryImageAspectRatio"
            };

            if (item.Type === 'MusicAlbum' && item.AlbumArtists && item.AlbumArtists.length) {
                options.ExcludeArtistIds = item.AlbumArtists[0].Id;
            }

            apiClient.getSimilarItems(item.Id, options).then(function (result) {

                var section = view.querySelector('.similarSection');

                if (!result.Items.length) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                cardBuilder.buildCards(result.Items, extendVerticalCardOptions({
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'autoVertical',
                    sectionTitleTagName: 'h2',
                    scalable: true,
                    coverImage: item.Type === 'MusicArtist' || item.Type === 'MusicAlbum'
                }));
            });
        }

        function getHeadingText(text) {
            return '<h1 style="margin:0;">' + text + '</h1>';
        }

        function getTextActionButton(item, text) {

            if (!text) {
                text = itemHelper.getDisplayName(item);
            }

            //return text;
            var html = '<button style="margin:0;padding:0;text-transform:none;font-weight:300;" ' + itemShortcuts.getShortcutAttributesHtml(item) + ' type="button" is="emby-button" class="itemAction button-flat" data-action="link">';
            html += getHeadingText(text);
            html += '</button>';

            return html;
        }

        function renderParentName(view, item) {

            var parentNameElem = view.querySelector('.parentName');

            var html = [];

            if (item.AlbumArtists) {
                //html.push(LibraryBrowser.getArtistLinksHtml(item.AlbumArtists, "detailPageParentLink"));
            } else if (item.ArtistItems && item.ArtistItems.length && item.Type === "MusicVideo") {
                //html.push(LibraryBrowser.getArtistLinksHtml(item.ArtistItems, "detailPageParentLink"));
            } else if (item.SeriesName && item.Type === "Episode") {

                html.push(getTextActionButton({

                    Id: item.SeriesId,
                    ServerId: item.ServerId,
                    Name: item.SeriesName,
                    Type: 'Series',
                    IsFolder: true

                }, item.SeriesName));
            }

            if (item.SeriesName && item.Type === "Season") {

                html.push(getTextActionButton({

                    Id: item.SeriesId,
                    ServerId: item.ServerId,
                    Name: item.SeriesName,
                    Type: 'Series',
                    IsFolder: true

                }, item.SeriesName));

            } else if (item.ParentIndexNumber != null && item.Type === "Episode") {

                html.push(getTextActionButton({

                    Id: item.SeasonId,
                    ServerId: item.ServerId,
                    Name: item.SeasonName,
                    Type: 'Season',
                    IsFolder: true

                }, item.SeasonName));

            } else if (item.Album && item.Type === "Audio" && (item.AlbumId || item.ParentId)) {
                //html.push('<a class="detailPageParentLink" href="itemdetails.html?id=' + (item.AlbumId || item.ParentId) + '">' + item.Album + '</a>');

            } else if (item.Album && item.Type === "MusicVideo" && item.AlbumId) {
                //html.push('<a class="detailPageParentLink" href="itemdetails.html?id=' + item.AlbumId + '">' + item.Album + '</a>');

            } else if (item.Album) {
                //html.push(item.Album);
            } else if (item.IsSeries || item.EpisodeTitle) {
                html.push(getHeadingText(item.Name));
            }

            if (html.length) {
                parentNameElem.classList.remove('hide');
                parentNameElem.innerHTML = html.join('<span class="parentNameDivider"> - </span>');
            } else {
                parentNameElem.classList.add('hide');
            }
        }

        return function (view, params) {

            var self = this;
            var currentItem;
            var currentRecordingFields;
            var dataPromises;
            var syncToggleInstance;

            function onSynced() {
                reloadItem(true);
            }

            function renderSyncLocalContainer(user, item) {

                if (syncToggleInstance) {
                    syncToggleInstance.refresh(item);
                    return;
                }

                require(['syncToggle'], function (syncToggle) {

                    syncToggleInstance = new syncToggle({
                        user: user,
                        item: item,
                        container: view.querySelector('.syncLocalContainer')
                    });

                    events.on(syncToggleInstance, 'sync', onSynced);
                });
            }

            function onUserDataChanged(e, apiClient, userData) {

                var item = currentItem;
                if (!item || item.Id !== userData.ItemId) {
                    return;
                }

                console.log('updating progress bar');
                if (currentItem.MediaType === 'Video') {
                    var detailImageContainer = getDetailImageContainer(view, item);

                    var itemProgressBar = detailImageContainer.querySelector('.itemProgressBar');
                    if (itemProgressBar) {
                        itemProgressBar.parentNode.removeChild(itemProgressBar);
                    }

                    var progressBarHtml = indicators.getProgressBarHtml(item, {
                        userData: userData
                    });
                    if (progressBarHtml) {
                        console.log(progressBarHtml);
                        detailImageContainer.insertAdjacentHTML('beforeend', progressBarHtml);
                    }

                    currentItem.UserData = userData;

                    reloadPlayButtons(view, currentItem);
                }
            }

            function onRecordCommand() {

                var item = currentItem;
                var type = item.Type;
                var id = item.Id;
                var timerId = item.TimerId;
                var seriesTimerId = item.SeriesTimerId;

                if (type === 'Program' || timerId || seriesTimerId) {

                    require(['recordingHelper'], function (recordingHelper) {
                        var programId = type === 'Program' ? id : null;
                        recordingHelper.toggle(serverId, programId, timerId, seriesTimerId).then(function () {
                            if (self.currentRecordingFields) {
                                self.currentRecordingFields.refresh();
                            }
                        });
                    });
                }
            }

            function onInputCommand(e) {

                switch (e.detail.command) {

                    case 'play':
                        play();
                        break;
                    case 'record':
                        onRecordCommand();
                        break;
                    default:
                        return;
                }

                e.preventDefault();
                e.stopPropagation();
            }

            function getItemPromise(apiClient) {

                if (params.seriesTimerId) {
                    return apiClient.getLiveTvSeriesTimer(params.seriesTimerId);
                }

                return apiClient.getItem(apiClient.getCurrentUserId(), params.id);
            }

            function startDataLoad() {

                var apiClient = connectionManager.getApiClient(params.serverId);

                dataPromises = [getItemPromise(apiClient), apiClient.getCurrentUser()];
            }

            function renderUserDataIcons(view, item) {

                var userDataIconsSelector = enableTrackList(item) || item.Type === 'MusicArtist' ? '.itemPageFixedLeft .itemPageUserDataIcons' : '.mainSection .itemPageUserDataIcons';

                var elem = view.querySelector(userDataIconsSelector);

                if (item.Type === 'Program' || item.Type === 'SeriesTimer') {

                    elem.classList.add('hide');

                } else {

                    elem.classList.remove('hide');

                    userdataButtons.fill({
                        element: elem,
                        item: item,
                        style: 'fab-mini'
                    });
                }
            }

            function reloadItem(reloadAllData, restartDataLoad) {

                if (reloadAllData) {
                    if (restartDataLoad !== false) {
                        startDataLoad();
                    }
                    loading.show();
                }

                Promise.all(dataPromises).then(function (responses) {

                    var item = responses[0];
                    var user = responses[1];

                    currentItem = item;

                    // If it's a person, leave the backdrop image from wherever we came from
                    if (item.Type !== 'Person') {
                        backdrop.setBackdrops([item]);
                        setTitle(item);
                    }

                    var apiClient = connectionManager.getApiClient(item.ServerId);

                    if (reloadAllData) {
                        renderName(view, item);
                        renderParentName(view, item);
                        renderImage(view, item);
                        renderLogo(view, item, apiClient);
                        renderChildren(view, item, apiClient);
                        renderSeriesTimerEditor(view, item, user, apiClient);
                        renderDetails(self, view, item, user);
                        renderMediaInfoIcons(view, item);
                        renderPeople(view, item);
                        renderScenes(view, item);
                        renderExtras(view, item, apiClient);
                        renderSimilar(view, item, apiClient);
                        renderMoreFrom(view, item, apiClient);
                        // createVerticalScroller(view, self);
                        renderSyncLocalContainer(user, item);

                        var mainSection = view.querySelector('.mainSection');
                        var itemScrollFrame = view.querySelector('.itemScrollFrame');

                        if (enableTrackList(item) || item.Type === 'MusicArtist') {
                            view.querySelector('.itemPageContainer').classList.add('music');
                            mainSection.classList.remove('focusable');
                            itemScrollFrame.classList.add('clippedLeft');
                            view.querySelector('.itemPageFixedLeft').classList.remove('hide');
                        } else {
                            mainSection.classList.add('focusable');
                            itemScrollFrame.classList.remove('clippedLeft');
                            view.querySelector('.itemPageFixedLeft').classList.add('hide');
                            mainSection.focus = focusMainSection;
                        }

                        if (item.Type === 'Person') {
                            mainSection.classList.add('miniMainSection');
                        } else {
                            mainSection.classList.remove('miniMainSection');
                        }

                        if (enableTrackList(item) || item.Type === 'MusicArtist') {
                            focusManager.autoFocus(view, true);
                        } else {
                            focusMainSection.call(mainSection);
                        }
                    }

                    renderUserDataIcons(view, item);

                    // Always refresh this
                    renderNextUp(view, item);

                    if (playbackManager.canQueue(item)) {
                        view.querySelector('.itemPageFixedLeft .btnQueue').classList.remove('hide');
                    } else {
                        view.querySelector('.itemPageFixedLeft .btnQueue').classList.add('hide');
                    }

                    loading.hide();
                });
            }

            itemShortcuts.on(view.querySelector('.parentName'));

            view.addEventListener('viewbeforeshow', function (e) {

                startDataLoad();
            });

            view.addEventListener('viewshow', function (e) {

                document.body.querySelector('.backgroundContainer').classList.add('detailBackgroundContainer');

                inputManager.on(view, onInputCommand);

                var isRestored = e.detail.isRestored;

                reloadItem(!isRestored, false);

                if (!isRestored) {

                    view.querySelector('.itemPageFixedLeft .btnPlay').addEventListener('click', onPlayClick);
                    view.querySelector('.mainSection .btnPlay').addEventListener('click', onPlayClick);
                    view.querySelector('.mainSection .btnCancelSeriesTimer').addEventListener('click', onCancelSeriesTimerClick);
                    view.querySelector('.mainSection .btnResume').addEventListener('click', onPlayClick);
                    view.querySelector('.mainSection .btnMore').addEventListener('click', showMoreMenu);
                    view.querySelector('.btnDeleteItem').addEventListener('click', deleteItem);

                    view.querySelector('.itemPageFixedLeft .btnQueue').addEventListener('click', queue);

                    view.querySelector('.btnTrailer').addEventListener('click', playTrailer);
                    view.querySelector('.btnInstantMix').addEventListener('click', instantMix);

                    view.querySelector('.itemPageFixedLeft .btnShuffle').addEventListener('click', shuffle);
                    view.querySelector('.mainSection .btnShuffle').addEventListener('click', shuffle);

                    events.on(serverNotifications, 'UserDataChanged', onUserDataChanged);
                }
            });

            view.querySelector('.trackList').addEventListener('needsrefresh', function () {
                reloadItem(true);
            });

            view.querySelector('.childrenItemsContainer').addEventListener('needsrefresh', function () {
                reloadItem(true);
            });

            view.addEventListener('viewbeforehide', function () {

                document.body.querySelector('.backgroundContainer').classList.remove('detailBackgroundContainer');

                inputManager.off(view, onInputCommand);
            });

            view.addEventListener('viewdestroy', function () {

                events.off(serverNotifications, 'UserDataChanged', onUserDataChanged);

                if (syncToggleInstance) {
                    events.off(syncToggleInstance, 'sync', onSynced);
                    syncToggleInstance.destroy();
                    syncToggleInstance = null;
                }

                if (self.currentRecordingFields) {
                    self.currentRecordingFields.destroy();
                    self.currentRecordingFields = null;
                }
                if (self.focusHandler) {
                    self.focusHandler.destroy();
                    self.focusHandler = null;
                }
                if (self.verticalScroller) {
                    self.verticalScroller.destroy();
                }
            });

            function playTrailer() {
                playbackManager.playTrailers(currentItem);
            }

            function play(mode) {

                var item = currentItem;

                playbackManager.play({
                    items: [item],
                    startPositionTicks: item.UserData && mode === 'resume' && item.UserData ? item.UserData.PlaybackPositionTicks : 0
                });
            }

            function onPlayClick() {
                var mode = this.getAttribute('data-mode');
                play(mode);
            }

            function onCancelSeriesTimerClick() {

                require(['recordingHelper', 'pluginManager'], function (recordingHelper, pluginManager) {

                    recordingHelper.cancelSeriesTimerWithConfirmation(currentItem.Id, currentItem.ServerId).then(function () {
                        Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'livetv/livetv.html?tab=5&serverId=' + serverId));
                    });
                });
            }

            function deleteItem() {
                require(['deleteHelper'], function (deleteHelper) {

                    deleteHelper.deleteItem({
                        item: currentItem,
                        navigate: true
                    });
                });
            }

            function showMoreMenu() {

                var button = this;

                connectionManager.getApiClient(currentItem.ServerId).getCurrentUser().then(function(user) {
                    itemContextMenu.show(getContextMenuOptions(currentItem, user, button)).then(function (result) {

                        if (result.deleted) {
                            Emby.Page.goHome();

                        } else if (result.updated) {
                            reloadItem(true);
                        }
                    });
                });
            }

            function queue() {

                playbackManager.queue({
                    items: [currentItem]
                });
            }

            function instantMix() {
                playbackManager.instantMix(currentItem);
            }

            function shuffle() {
                playbackManager.shuffle(currentItem);
            }
        };
    });
