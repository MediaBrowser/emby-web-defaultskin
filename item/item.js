define(['loading', './../skininfo', 'datetime', 'playbackManager', 'imageLoader', 'userdataButtons', 'itemHelper', './../components/focushandler', 'backdrop', './../components/listview', 'mediaInfo', 'itemShortcuts', 'focusManager', './../skinsettings', './../cards/cardbuilder', 'indicators'],
    function (loading, skinInfo, datetime, playbackManager, imageLoader, userdataButtons, itemHelper, focusHandler, backdrop, listview, mediaInfo, itemShortcuts, focusManager, skinSettings, cardBuilder, indicators) {

        function focusMainSection() {

            focusManager.autoFocus(this);
        }

        function setTitle(item) {

            var url = Emby.Models.logoImageUrl(item, {});

            if (item.Type == 'BoxSet') {
                Emby.Page.setTitle(item.Name);
            }
            else if (url) {

                var pageTitle = document.querySelector('.pageTitle');
                pageTitle.style.backgroundImage = "url('" + url + "')";
                pageTitle.classList.add('pageTitleWithLogo');
                pageTitle.innerHTML = '';
                document.querySelector('.headerLogo').classList.add('hide');
            } else {
                Emby.Page.setTitle('');
            }
        }

        function createVerticalScroller(view, pageInstance) {

            require(['scroller'], function (scroller) {

                var scrollFrame = view.querySelector('.scrollFrame');

                var options = {
                    horizontal: 0,
                    slidee: view.querySelector('.scrollSlider'),
                    scrollBy: 200,
                    speed: 270,
                    scrollWidth: 50000,
                    immediateSpeed: 100
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

            if (item.Type == 'BoxSet') {
                itemTitle.classList.add('hide');
            } else {
                itemTitle.classList.remove('hide');
                itemTitle.innerHTML = itemHelper.getDisplayName(item);
            }

            if (enableTrackList(item) || item.Type == 'MusicArtist') {
                itemTitle.classList.add('albumTitle');
            } else {
                itemTitle.classList.remove('albumTitle');
            }
        }

        function renderImage(view, item) {

            require(['connectionManager'], function (connectionManager) {

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

                var detailImage = enableTrackList(item) || item.Type == 'MusicArtist' ? view.querySelector('.leftFixedDetailImageContainer') : view.querySelector('.detailImageContainer');

                if (url && item.Type != "Season" && item.Type != "BoxSet") {
                    detailImage.classList.remove('hide');
                    detailImage.innerHTML = '<img class="detailImage" src="' + url + '" />' + indicators.getProgressBarHtml(item);
                } else {
                    detailImage.classList.add('hide');
                    detailImage.innerHTML = '';
                }
            });
        }

        function enableTrackList(item) {
            return item.Type == "MusicAlbum" || item.Type == "Playlist";
        }

        function renderMediaInfoIcons(view, item) {

            var showMediaInfoIcons = false;

            if (renderDynamicMediaIcons(view, item)) {
                showMediaInfoIcons = true;
            }

            if (showMediaInfoIcons) {
                view.querySelector('.mediaInfoIcons').classList.remove('hide');
            } else {
                view.querySelector('.mediaInfoIcons').classList.add('hide');
            }
        }

        function renderDynamicMediaIcons(view, item) {

            var html = '';

            if (!item.MediaSources) {
                return html;
            }

            var mediaSource = item.MediaSources[0];
            if (!mediaSource) {
                return html;
            }

            var videoStream = (mediaSource.MediaStreams || []).filter(function (i) {
                return i.Type == 'Video';
            })[0] || {};
            var audioStream = (mediaSource.MediaStreams || []).filter(function (i) {
                return i.Type == 'Audio';
            })[0] || {};

            if (item.VideoType == 'Dvd') {
                html += '<img class="mediaInfoIcon mediaInfoImageIcon" src="' + Emby.PluginManager.mapPath(skinInfo.id, 'css/mediaicons/S_Media_DVD_white.png') + '" />';
            }

            if (item.VideoType == 'BluRay') {
                html += '<img class="mediaInfoIcon mediaInfoImageIcon" src="' + Emby.PluginManager.mapPath(skinInfo.id, 'css/mediaicons/S_Media_BlueRay_white.png') + '" />';
            }

            //if (mediaSource.Container) {
            //    html += '<div class="mediaInfoIcon mediaInfoText">' + mediaSource.Container + '</div>';
            //}

            var resolutionText = getResolutionText(item);
            if (resolutionText) {
                html += '<div class="mediaInfoIcon mediaInfoText">' + resolutionText + '</div>';
            }

            if (videoStream.Codec) {
                html += '<div class="mediaInfoIcon mediaInfoText">' + videoStream.Codec + '</div>';
            }

            var channels = getChannels(item);
            var channelText;

            if (channels == 8) {

                channelText = '7.1';

            } else if (channels == 7) {

                channelText = '6.1';

            } else if (channels == 6) {

                channelText = '5.1';

            } else if (channels == 2) {

                channelText = '2.0';
            }

            if (channelText) {
                html += '<div class="mediaInfoIcon mediaInfoText">' + channelText + '</div>';
            }

            if (audioStream.Codec == 'dca' && audioStream.Profile) {
                html += '<div class="mediaInfoIcon mediaInfoText">' + audioStream.Profile + '</div>';
            } else if (audioStream.Codec) {
                html += '<div class="mediaInfoIcon mediaInfoText">' + audioStream.Codec + '</div>';
            }

            view.querySelector('.dynamicMediaInfoIcons').innerHTML = html;

            return html;
        }

        function getResolutionText(item) {

            if (!item.MediaSources || !item.MediaSources.length) {
                return null;
            }

            return item.MediaSources[0].MediaStreams.filter(function (i) {

                return i.Type == 'Video';

            }).map(function (i) {

                if (i.Height) {

                    if (i.Width >= 4000) {
                        return '4K';
                    }
                    if (i.Width >= 2500) {
                        return '1440P';
                    }
                    if (i.Width >= 1900) {
                        return '1080P';
                    }
                    if (i.Width >= 1260) {
                        return '720P';
                    }
                    if (i.Width >= 700) {
                        return '480P';
                    }

                }
                return null;
            })[0];

        }

        function getChannels(item) {

            if (!item.MediaSources || !item.MediaSources.length) {
                return 0;
            }

            return item.MediaSources[0].MediaStreams.filter(function (i) {

                return i.Type == 'Audio';

            }).map(function (i) {
                return i.Channels;
            })[0];

        }

        function hasCodec(mediaSource, streamType, codec) {

            return (mediaSource.MediaStreams || []).filter(function (i) {

                return i.Type == streamType && ((i.Codec || '').indexOf(codec) != -1 || (i.Profile || '').indexOf(codec) != -1);

            }).length > 0;

        }

        function renderDetails(view, item) {

            var mainSection = view.querySelector('.mainSection');

            if (item.Type == "Person") {
                mainSection.classList.add('smallBottomMargin');
            }
            else if (item.Type != "Season" && item.Type != "MusicArtist" && item.Type != "MusicAlbum" && item.Type != "BoxSet" && item.Type != "Playlist") {
                mainSection.classList.remove('smallBottomMargin');
            } else {
                mainSection.classList.remove('smallBottomMargin');
            }

            if (item.Type == "Season" || item.Type == "BoxSet") {
                mainSection.classList.add('seasonMainSection');
            }
            else if (item.Type == "MusicArtist" || enableTrackList(item)) {
                mainSection.classList.add('albumMainSection');
            }

            var taglineElem = view.querySelector('.tagline')
            if (item.Taglines && item.Taglines.length) {
                taglineElem.classList.remove('hide');
                taglineElem.innerHTML = item.Taglines[0];
            } else {
                taglineElem.classList.add('hide');
            }

            var overviewElem = view.querySelector('.overview')
            if (item.Overview && item.Type != 'MusicArtist' && item.Type != 'MusicAlbum' && item.Type != 'Season' && item.Type != 'BoxSet') {
                overviewElem.classList.remove('hide');
                overviewElem.innerHTML = item.Overview;
            } else {
                overviewElem.classList.add('hide');
            }

            if (item.LocalTrailerCount) {
                view.querySelector('.btnTrailer').classList.remove('hide');
            } else {
                view.querySelector('.btnTrailer').classList.add('hide');
            }

            if (playbackManager.canPlay(item)) {
                view.querySelector('.itemPageFixedLeft .btnPlay').classList.remove('hide');
                view.querySelector('.mainSection .btnPlay').classList.remove('hide');
            } else {
                view.querySelector('.itemPageFixedLeft .btnPlay').classList.add('hide');
                view.querySelector('.mainSection .btnPlay').classList.add('hide');
            }

            if (enableTrackList(item) || item.Type == 'MusicArtist') {
                view.querySelector('.itemPageFixedLeft .itemPageButtons').classList.remove('hide');
                view.querySelector('.mainSection .itemPageButtons').classList.add('hide');
            } else {
                view.querySelector('.itemPageFixedLeft .itemPageButtons').classList.add('hide');
                view.querySelector('.mainSection .itemPageButtons').classList.remove('hide');
            }

            var mediaInfoHtml = item.Type == 'Season' || item.Type == 'BoxSet' ? '' : mediaInfo.getMediaInfoHtml(item);
            var mediaInfoElem = view.querySelector('.mediaInfo');

            if (!mediaInfoHtml) {
                mediaInfoElem.classList.add('hide');
            } else {
                mediaInfoElem.classList.remove('hide');
                mediaInfoElem.innerHTML = mediaInfoHtml;
            }

            var genres = item.Genres || [];
            var genresHtml = genres.map(function (i) {

                return i;

            }).join('<span class="bulletSeparator"> &bull; </span>');

            var genresElem = view.querySelector('.genres')

            if (!genresHtml) {
                genresElem.classList.add('hide');
            } else {
                genresElem.classList.remove('hide');
                genresElem.innerHTML = genresHtml;
            }

            if (item.IsFolder) {

                view.querySelector('.itemPageFixedLeft .btnPlayText').innerHTML = Globalize.translate("PlayAll");
                view.querySelector('.mainSection .btnPlayText').innerHTML = Globalize.translate("PlayAll");
                view.querySelector('.itemPageFixedLeft .btnShuffle').classList.remove('hide');
                view.querySelector('.mainSection .btnShuffle').classList.remove('hide');

            } else {
                view.querySelector('.itemPageFixedLeft .btnPlayText').innerHTML = Globalize.translate("Play");
                view.querySelector('.mainSection .btnPlayText').innerHTML = Globalize.translate("Play");
                view.querySelector('.itemPageFixedLeft .btnShuffle').classList.add('hide');
                view.querySelector('.mainSection .btnShuffle').classList.add('hide');
            }

            if (item.Type == "MusicArtist" || item.Type == "MusicAlbum" || item.Type == "MusicGenre" || item.Type == "Playlist" || item.MediaType == "Audio") {
                view.querySelector('.btnInstantMix').classList.remove('hide');
            } else {
                view.querySelector('.btnInstantMix').classList.add('hide');
            }

            var birthDateElem = view.querySelector('.birthDate');
            if (item.PremiereDate && item.Type == 'Person') {
                birthDateElem.classList.remove('hide');

                var dateString = datetime.parseISO8601Date(item.PremiereDate).toDateString();
                birthDateElem.innerHTML = Globalize.translate('BornValue', dateString);
            } else {
                birthDateElem.classList.add('hide');
            }

            var birthPlaceElem = view.querySelector('.birthPlace');
            if (item.Type == "Person" && item.ProductionLocations && item.ProductionLocations.length) {
                birthPlaceElem.classList.remove('hide');
                birthPlaceElem.innerHTML = Globalize.translate('BirthPlaceValue').replace('{0}', item.ProductionLocations[0]);
            } else {
                birthPlaceElem.classList.add('hide');
            }
        }

        function extendVerticalCardOptions(options) {
            options.portraitWidth = 340;
            options.squareWidth = 340;
            options.thumbWidth = 500;
            return options;
        }

        function renderNextUp(view, item) {

            var section = view.querySelector('.nextUpSection');

            var userData = item.UserData || {};

            var focusedItemIsNextUp = parentWithClass(document.activeElement, 'nextUpSection') != null;

            if (item.Type != 'Series' || !userData.PlayedPercentage) {
                section.classList.add('hide');

                if (focusedItemIsNextUp) {
                    // Need to re-focus
                    focusManager.autoFocus(view);
                }
                return;
            }

            Emby.Models.nextUp({

                SeriesId: item.Id

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
                    scalable: true,
                    autoFocus: focusedItemIsNextUp
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

                section.innerHTML = listview.getListViewHtml(result.Items, {
                    showIndexNumber: item.Type == 'MusicAlbum',
                    action: 'playallfromhere',
                    showParentTitle: true,
                    enableSideMediaInfo: true
                });

                itemShortcuts.off(section);
                itemShortcuts.on(section);

                imageLoader.lazyChildren(section);
            };

            if (item.Type == 'MusicAlbum' || item.Type == 'Playlist') {

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

        function renderPeopleItems(view, item) {

            var section = view.querySelector('.peopleItems');

            if (item.Type != "Person") {
                section.classList.add('hide');
                return;
            }
            section.classList.remove('hide');

            var sections = [];

            if (item.MovieCount) {

                sections.push({
                    name: Globalize.translate('Movies'),
                    type: 'Movie'
                });
            }

            if (item.SeriesCount) {

                sections.push({
                    name: Globalize.translate('Series'),
                    type: 'Series'
                });
            }

            if (item.EpisodeCount) {

                sections.push({
                    name: Globalize.translate('Episodes'),
                    type: 'Episode'
                });
            }

            if (item.TrailerCount) {

                sections.push({
                    name: Globalize.translate('Trailers'),
                    type: 'Trailer'
                });
            }

            if (item.GameCount) {

                sections.push({
                    name: Globalize.translate('Games'),
                    type: 'Game'
                });
            }

            if (item.AlbumCount) {

                sections.push({
                    name: Globalize.translate('Albums'),
                    type: 'MusicAlbum'
                });
            }

            if (item.SongCount) {

                sections.push({
                    name: Globalize.translate('Songs'),
                    type: 'Audio'
                });
            }

            if (item.MusicVideoCount) {

                sections.push({
                    name: Globalize.translate('MusicVideos'),
                    type: 'MusicVideo'
                });
            }

            section.innerHTML = sections.map(function (section) {

                var html = '';

                html += '<div class="verticalSection personSection" data-type="' + section.type + '">';

                html += '<h2>';
                html += section.name;
                html += '</h2>';

                html += '<div class="itemsContainer verticalItemsContainer">';
                html += '</div>';

                html += '</div>';

                return html;

            }).join('');

            var sectionElems = section.querySelectorAll('.personSection');
            for (var i = 0, length = sectionElems.length; i < length; i++) {
                renderPersonSection(view, item, sectionElems[i], sectionElems[i].getAttribute('data-type'));
            }
        }

        function renderPersonSection(view, item, element, type) {

            switch (type) {

                case 'Movie':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "Movie",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical"
                    }));
                    break;

                case 'MusicVideo':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "MusicVideo",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical",
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
                        shape: "autoVertical"
                    }));
                    break;

                case 'Trailer':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "Trailer",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical"
                    }));
                    break;

                case 'Series':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "Series",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical"
                    }));
                    break;

                case 'MusicAlbum':
                    loadPeopleItems(element, item, type, {
                        MediaTypes: "",
                        IncludeItemTypes: "MusicAlbum",
                        PersonTypes: "",
                        ArtistIds: ""
                    }, extendVerticalCardOptions({
                        shape: "autoVertical",
                        playFromHere: true
                    }));
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
                        showTitle: true,
                        showParentTitle: true
                    }));
                    break;

                default:
                    break;
            }
        }

        function loadPeopleItems(element, item, type, query, listOptions) {

            query.SortBy = "SortName";
            query.SortOrder = "Ascending";
            query.Recursive = true;
            query.CollapseBoxSetItems = false;

            query.PersonIds = item.Id;

            Emby.Models.items(query).then(function (result) {

                cardBuilder.buildCards(result.Items, {
                    parentContainer: element,
                    itemsContainer: element.querySelector('.itemsContainer'),
                    shape: listOptions.shape,
                    scalable: true,
                    showTitle: listOptions.showTitle,
                    showParentTitle: listOptions.showParentTitle
                });
            });
        }

        function renderEpisodes(view, item) {

            var section = view.querySelector('.episodes');

            if (item.Type != "Season") {
                section.classList.add('hide');
                return;
            }

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

                section.innerHTML = listview.getListViewHtml(result.Items, {
                    showIndexNumber: item.Type == 'MusicAlbum',
                    enableOverview: true,
                    imageSize: 'large'
                });

                imageLoader.lazyChildren(section);

                itemShortcuts.off(section);
                itemShortcuts.on(section);

                // Sometimes this doesn't work without some delay after setting innerHTMl
                setTimeout(function () {
                    focusFirstUnWatched(result.Items, section);
                }, 100);
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

        function renderChildren(view, item) {

            renderTrackList(view, item);
            renderEpisodes(view, item);
            renderPeopleItems(view, item);

            var section = view.querySelector('.childrenSection');

            if (item.Type != 'MusicArtist') {
                if (!item.ChildCount || enableTrackList(item)) {
                    section.classList.add('hide');
                    return;
                }
            }

            var headerText = section.querySelector('h2');
            var showTitle = false;

            if (item.Type == "Series") {
                headerText.innerHTML = Globalize.translate('Seasons');
                headerText.classList.remove('hide');

            } else if (item.Type == "MusicArtist") {
                headerText.innerHTML = Globalize.translate('Albums');
                headerText.classList.remove('hide');

            } else if (item.Type == "MusicAlbum") {
                headerText.classList.add('hide');

            } else if (item.Type == "BoxSet") {
                headerText.classList.add('hide');

            } else {
                section.classList.add('hide');
                return;
            }

            var promise = item.Type == 'MusicArtist' ?
                Emby.Models.items({
                    IncludeItemTypes: 'MusicAlbum',
                    Recursive: true,
                    ArtistIds: item.Id
                }) :
                Emby.Models.children(item, {});

            promise.then(function (result) {

                if (!result.Items.length) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                cardBuilder.buildCards(result.Items, extendVerticalCardOptions({
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'autoVertical',
                    showTitle: showTitle,
                    scalable: true
                }));
            });
        }

        function renderPeople(view, item) {

            var section = view.querySelector('.peopleSection');

            Emby.Models.itemPeople(item, {

                limit: 32,
                images: [
                {
                    type: 'Primary',
                    width: Math.round((section.offsetWidth / 7))
                }]

            }).then(function (people) {

                if (!people.length) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                require(['peoplecardbuilder'], function (peoplecardbuilder) {

                    peoplecardbuilder.buildPeopleCards(people, {
                        parentContainer: section,
                        itemsContainer: section.querySelector('.itemsContainer'),
                        coverImage: true
                    });
                });
            });
        }

        function renderExtras(view, item) {

            var section = view.querySelector('.extrasSection');

            if (!item.SpecialFeatureCount) {
                section.classList.add('hide');
                return;
            }

            Emby.Models.extras(item.Id).then(function (items) {

                if (!items.length) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                cardBuilder.buildCards(items, extendVerticalCardOptions({
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'autoVertical',
                    scalable: true,
                    showTitle: true,
                    action: 'playallfromhere'
                }));
            });
        }

        function renderScenes(view, item) {

            var section = view.querySelector('.scenesSection');

            Emby.Models.chapters(item, {
                images: [
                {
                    type: 'Primary',
                    width: Math.round((section.offsetWidth / 4))
                }]

            }).then(function (chapters) {

                if (!chapters.length) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                require(['chaptercardbuilder'], function (chaptercardbuilder) {

                    chaptercardbuilder.buildChapterCards(item, chapters, {
                        parentContainer: section,
                        itemsContainer: section.querySelector('.itemsContainer'),
                        coverImage: true
                    });
                });
            });
        }

        function renderSimilar(view, item) {

            Emby.Models.similar(item, {

                Limit: 12

            }).then(function (result) {

                var section = view.querySelector('.similarSection');

                if (!result.Items.length) {
                    section.classList.add('hide');
                    return;
                }

                section.classList.remove('hide');

                section.querySelector('h2').innerHTML = Globalize.translate('SimilarTo', item.Name);

                cardBuilder.buildCards(result.Items, extendVerticalCardOptions({
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'autoVertical',
                    scalable: true,
                    coverImage: item.Type == 'MusicArtist' || item.Type == 'MusicAlbum'
                }));
            });
        }

        return function (view, params) {

            var self = this;
            var currentItem;

            view.addEventListener('viewshow', function (e) {

                var isRestored = e.detail.isRestored;

                if (!isRestored) {
                    loading.show();
                }

                Emby.Models.item(params.id).then(function (item) {

                    currentItem = item;

                    // If it's a person, leave the backdrop image from wherever we came from
                    if (item.Type != 'Person') {
                        backdrop.setBackdrops([item]);
                        setTitle(item);
                    }

                    var userDataIconsSelector = enableTrackList(item) || item.Type == 'MusicArtist' ? '.itemPageFixedLeft .itemPageUserDataIcons' : '.mainSection .itemPageUserDataIcons';

                    userdataButtons.fill({
                        element: view.querySelector(userDataIconsSelector),
                        buttonClass: 'mediumSizeIcon',
                        item: item
                    });

                    if (!isRestored) {
                    if (item.Type == "Series") {
                        renderName(view, item);
                        //renderImage(view, item);
                        renderChildren(view, item);
                        renderDetails(view, item);
                        //renderMediaInfoIcons(view, item);
                        //renderPeople(view, item);
                        //renderScenes(view, item);
                        //renderSimilar(view, item);
                        createVerticalScroller(view, self);
                    }
                    else {
                        renderName(view, item);
                        renderImage(view, item);
                        renderChildren(view, item);
                        renderDetails(view, item);
                        renderMediaInfoIcons(view, item);
                        //renderPeople(view, item);
                        //renderScenes(view, item);
                        //renderSimilar(view, item);
                        createVerticalScroller(view, self);
                    }

                        var mainSection = view.querySelector('.mainSection');
                        var itemScrollFrame = view.querySelector('.itemScrollFrame');

                        if (enableTrackList(item) || item.Type == 'MusicArtist') {
                            mainSection.classList.remove('focusable');
                            itemScrollFrame.classList.add('clippedLeft');
                            view.querySelector('.itemPageFixedLeft').classList.remove('hide');
                        } else {
                            mainSection.classList.add('focusable');
                            itemScrollFrame.classList.remove('clippedLeft');
                            view.querySelector('.itemPageFixedLeft').classList.add('hide');
                            mainSection.focus = focusMainSection;
                        }

                        if (item.Type == 'Person') {
                            mainSection.classList.add('miniMainSection');
                        } else {
                            mainSection.classList.remove('miniMainSection');
                        }

                        if (enableTrackList(item) || item.Type == 'MusicArtist') {
                            focusManager.autoFocus(view, true);
                        } else {
                            focusMainSection.call(mainSection);
                        }
                    }

                    // Always refresh this
                    //renderNextUp(view, item);

                    if (playbackManager.canQueue(item)) {
                        view.querySelector('.itemPageFixedLeft .btnQueue').classList.remove('hide');
                    } else {
                        view.querySelector('.itemPageFixedLeft .btnQueue').classList.add('hide');
                    }

                    loading.hide();
                });

                if (!isRestored) {

                    view.querySelector('.itemPageFixedLeft .btnPlay').addEventListener('click', play);
                    view.querySelector('.mainSection .btnPlay').addEventListener('click', play);

                    view.querySelector('.itemPageFixedLeft .btnQueue').addEventListener('click', queue);

                    view.querySelector('.btnTrailer').addEventListener('click', playTrailer);
                    view.querySelector('.btnInstantMix').addEventListener('click', instantMix);

                    view.querySelector('.itemPageFixedLeft .btnShuffle').addEventListener('click', shuffle);
                    view.querySelector('.mainSection .btnShuffle').addEventListener('click', shuffle);
                }
            });

            view.addEventListener('viewdestroy', function () {

                if (self.focusHandler) {
                    self.focusHandler.destroy();
                    self.focusHandler = null
                }
                if (self.verticalScroller) {
                    self.verticalScroller.destroy();
                }
            });

            function playTrailer() {
                playbackManager.playTrailer(currentItem);
            }

            function play() {

                if (currentItem.IsFolder) {
                    playbackManager.play({
                        items: [currentItem]
                    });
                } else {
                    require(['playmenu'], function (playmenu) {
                        playmenu.show(currentItem);
                    });
                }
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
        }
    });