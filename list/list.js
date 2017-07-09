define(['loading', 'scroller', 'playbackManager', 'alphaPicker', './../components/verticallist', 'focusManager', 'pluginManager', 'connectionManager', 'imageLoader', './../skininfo', 'emby-itemscontainer'], function (loading, scroller, playbackManager, alphaPicker, horizontalList, focusManager, pluginManager, connectionManager, imageLoader, skinInfo) {
    'use strict';

    var apiClient = connectionManager.currentApiClient();
    var viewParent = null;

    function parentWithClass(elem, className) {

        while (!elem.classList || !elem.classList.contains(className)) {
            elem = elem.parentNode;

            if (!elem) {
                return null;
            }
        }

        return elem;
    }

    function createHorizontalScroller(instance, view, item, loading) {

        var scrollFrame = view.querySelector('.scrollFrame');

        scrollFrame.style.display = 'block';

        var options = {
            horizontal: 0,
            itemNav: 0,
            mouseDragging: 1,
            touchDragging: 1,
            slidee: view.querySelector('.viewContentArea'),
            itemSelector: '.card',
            smart: true,
            releaseSwing: true,
            scrollBar: view.querySelector('.scrollbar'),
            scrollBy: 200,
            speed: 270,
            elasticBounds: 1,
            dragHandle: 1,
            dynamicHandle: 1,
            clickBar: 1,
            //centerOffset: window.innerWidth * .05,
            scrollWidth: 500000
        };

        instance.scroller = new scroller(scrollFrame, options);
        instance.scroller.init();
        loadChildren(instance, view, item, loading);

        viewParent = view;
        view.addEventListener('focus', libraryItemFocus, true);

        view.addEventListener('click', function (e) {
          var elem = parentWithClass(e.target, 'itemAction');
          if (elem) {
            var viewId = elem.getAttribute('data-id');
            var viewType = elem.getAttribute('data-type');

            if(viewType == 'Folder' || viewType == 'UserView') {
              Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'list/list.html?parentid=' + viewId + '&serverId=' + apiClient.serverId()));
            }
            else {
              Emby.Page.show(pluginManager.mapRoute(skinInfo.id, 'item/item.html?id=' + viewId + '&serverId=' + apiClient.serverId()));
            }
          }
        });
    }

    function getItems(params, item, startIndex, limit) {

        if (params.type === 'collections') {

            return Emby.Models.collections({
                ParentId: item.Id,
                EnableImageTypes: "Primary,Backdrop,Thumb",
                StartIndex: startIndex,
                Limit: limit,
                SortBy: 'SortName'
            });
        }

        if (params.type === 'favoritemovies') {

            return Emby.Models.items({
                ParentId: item.Id,
                EnableImageTypes: "Primary,Backdrop,Thumb",
                StartIndex: startIndex,
                Limit: limit,
                SortBy: 'SortName',
                IncludeItemTypes: 'Movie',
                Recursive: true,
                Filters: "IsFavorite"
            });
        }

        if (params.genreId) {

            return Emby.Models.items({
                StartIndex: startIndex,
                Limit: limit,
                SortBy: 'SortName',
                Recursive: true,
                GenreIds: params.genreId,
                ParentId: item.Id,
                IncludeItemTypes: item.CollectionType === 'tvshows' ? 'Series' : (item.CollectionType === 'movies' ? 'Movie' : 'MusicAlbum')
            });

        }
        return Emby.Models.children(item, {
            StartIndex: startIndex,
            Limit: limit,
            Fields: 'SortName'
        });
    }

    function loadChildren(instance, view, item, loading) {

        if(instance.params.type === 'collections') {
          view.querySelector('.libraryContainer.list').classList.add('collections');
        }

        instance.listController = new horizontalList({

            itemsContainer: view.querySelector('.viewContentArea'),
            getItemsMethod: function (startIndex, limit) {

                return getItems(instance.params, item, startIndex, limit);
            },
            listCountElement: view.querySelector('.listCount'),
            listNumbersElement: view.querySelector('.listNumbers'),
            selectedItemInfoElement: view.querySelector('.selectedItemInfo'),
            selectedIndexElement: view.querySelector('.selectedIndex'),
            scroller: instance.scroller,
            cardOptions: {
                coverImage: true,
                rows: {
                    portrait: 1,
                    square: 1,
                    backdrop: 1
                },
                scalable: false
            }
        });

        instance.listController.render();
    }

    function libraryItemFocus(e) {
        var oldSelectedItem = document.querySelector('.selectedItemId')
        var oldSelectedItemId = '';
        if(oldSelectedItem) {
            oldSelectedItemId = oldSelectedItem.getAttribute('data-selected-id');
        }

        // Build Item Info Pane
        var itemInfoElement = viewParent.querySelector('.itemInfo');
        var selectedIndexElement = viewParent.querySelector('.selectedIndex');
        var focused = focusManager.focusableParent(e.target);

        var itemId = focused.getAttribute('data-id');

        if(itemId === oldSelectedItemId) return;

        Emby.Models.item(itemId).then(function (item) {
            console.log('itemResult', item);

            var imageUrlPrimary = apiClient.getImageUrl(item.Id, {
                type: "Primary",
                maxHeight: 400,
                maxWidth: 300,
                tag: item.ImageTags.Primary
            });

            var imageUrlBackdrop = apiClient.getImageUrl(item.Id, {
                type: "Backdrop",
                maxHeight: 1920,
                maxWidth: 1080,
                tag: item.BackDropImageTags
            });

            var html = '';
            html += '<div class="selectedItemId hide" data-selected-id="' + itemId + '"></div>'
            html += '<div class="primary lazy" data-src="' + imageUrlPrimary + '"></div>';
            html += '<div class="backdrop lazy" data-src="' + imageUrlBackdrop + '"></div>';

            html += '<div class="textInfo">';
            html += '<h1 class="name">' + item.Name + '</h1>';

            if(item.ProductionYear){
                html += '<h1 class="year">' + item.ProductionYear + '</h1>';
            }
            if(item.Genres.length > 0){
                html += '<h2 class="genres">' + item.Genres.join(' / ') + '</h2>';
            }

            if(item.Overview){
                html += '<p class="overview">' + item.Overview + '</p>';
            }
            html += '</div>';
            if(item.CommunityRating) {
                html += '<div class="communityRating"><span class="rating">' + item.CommunityRating + '</span><span divider>/</span>10</div>';
            }

            if(item.RunTimeTicks)
            {
                var runTime = Math.ceil((item.RunTimeTicks / 10000) / 60000);
                html += '<div class="runTime">' + runTime + ' minutes</div>';
            }

            // var videoStream = (item.MediaStreams || []).filter(function (i) {
            //     return i.Type == 'Video';
            // })[0] || {};
            // var audioStream = (item.MediaStreams || []).filter(function (i) {
            //     return i.Type == 'Audio';
            // })[0] || {};
            //
            // console.log('videoStream', videoStream);
            // console.log('audioStream', audioStream);
            //
            // if(videoStream) {
            //     html += '';
            // }

            if(item.MediaSources && item.MediaSources.length > 0) {
              html += '<div class="mediaInfoPrimary">';
              var mediaSource = item.MediaSources[0];

              var videoStream = (mediaSource.MediaStreams || []).filter(function (i) {
                  return i.Type == 'Video';
              })[0] || {};
              var audioStream = (mediaSource.MediaStreams || []).filter(function (i) {
                  return i.Type == 'Audio';
              })[0] || {};

              var resolutionText = getResolutionText(item);
              if (resolutionText) {
                  html += '<div class="mediaInfoIcon mediaInfoText">' + resolutionText + '</div>';
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

              html += '</div>';

              html += '<div class="mediaInfo">';

              if (mediaSource.Container) {
                  html += '<div class="mediaInfoIcon mediaInfoText">' + mediaSource.Container + '</div>';
              }

              if (videoStream.Codec) {
                  html += '<div class="mediaInfoIcon mediaInfoText">' + videoStream.Codec + '</div>';
              }

              if (audioStream.Codec == 'dca' && audioStream.Profile) {
                  html += '<div class="mediaInfoIcon mediaInfoText">' + audioStream.Profile + '</div>';
              } else if (audioStream.Codec) {
                  html += '<div class="mediaInfoIcon mediaInfoText">' + audioStream.Codec + '</div>';
              }

              if (videoStream.AspectRatio) {
                  html += '<div class="mediaInfoIcon mediaInfoText">' + videoStream.AspectRatio + '</div>';
              }

              html += '</div>';
            }

            itemInfoElement.innerHTML = html;

            imageLoader.lazyChildren(itemInfoElement);


            var index = focused.getAttribute('data-index');
            if (index) {
                selectedIndexElement.innerHTML = 1 + parseInt(index);
            }

            var overviewElement = itemInfoElement.querySelector('.overview');

            if(overviewElement) {
              var overviewHeight = overviewElement.scrollHeight;
              console.log('overviewElement.clientHeight', overviewElement.clientHeight);
              console.log('overviewElement.scrollHeight', overviewElement.scrollHeight);

              var scrollTime = 5000;

              //initOverviewScroll(overviewElement, overviewHeight, scrollTime);

              setTimeout(function () {
                scrollOverview(overviewElement);
              }, 3000);
            }



            // // Selected Menu
            // var selectedMenu = document.querySelector('.selectedMenu');
            //
            // var html = '';
            // if(item.UserData.PlaybackPositionTicks > 0)
            // {
            //     // Convert ticks to hours and minutes
            //     var positionTime = Math.ceil((item.UserData.PlaybackPositionTicks / 10000) / 60000);
            //
            //     html += '<button class="playbackResume" data-item-id="' + itemId + '">Resume from ' + positionTime + ' minutes</button>';
            // }
            //
            // html += '<button class="playbackPlay" data-item-id="' + itemId + '">Play</button>';
            //
            // html += '<button class="moreInfo" data-item-id="' + itemId + '">More info</button>';
            //
            // if(item.LocalTrailerCount > 0)
            // {
            //     html += '<button class="playbackTrailer" data-item-id="' + itemId + '">Trailer</button>';
            // }
            //
            // html += '<button>Mark as watched</button>';
            //
            // selectedMenu.innerHTML = html;
            //
            // bindSelectedMenuEvents(selectedMenu);
        });
    }

    function scrollOverview(overviewElement)
    {
        var currentPosition = overviewElement.scrollTop;
        var elementScrollHeight = overviewElement.scrollHeight;
        var elementClientHeight = overviewElement.clientHeight;

        if(currentPosition >= (elementScrollHeight - elementClientHeight) - 1) {
            setTimeout(function() {
                overviewElement.scrollTop = 0;
                setTimeout(function () {
                    scrollOverview(overviewElement);
                }, 3000);
            }, 4000);
            return;
        }

        overviewElement.scrollTop += 1;

        setTimeout(function() {
            scrollOverview(overviewElement);
        }, 75);
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

    return function (view, params) {

        var self = this;
        self.params = params;
        var currentItem;

        var contentScrollSlider = view.querySelector('.viewContentArea');

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            if (!isRestored) {
                loading.show();
            }

            Emby.Models.item(params.parentid).then(function (item) {

                if (!params.genreId) {
                    setTitle(item);
                }
                currentItem = item;

                if (!isRestored) {
                    createHorizontalScroller(self, view, item, loading);

                    if (item.Type !== 'PhotoAlbum') {
                        initAlphaPicker();
                    }
                }

                if (!params.genreId) {
                    view.querySelector('.listPageButtons').classList.add('hide');
                }
            });

            if (params.genreId) {
                Emby.Models.item(params.genreId).then(function (item) {

                    currentItem = item;
                    Emby.Page.setTitle(item.Name);

                    if (item.Type === 'MusicGenre') {
                        view.querySelector('.listPageButtons').classList.remove('hide');
                    } else {
                        view.querySelector('.listPageButtons').classList.add('hide');
                    }

                    if (playbackManager.canQueue(item)) {
                        view.querySelector('.btnQueue').classList.remove('hide');
                    } else {
                        view.querySelector('.btnQueue').classList.add('hide');
                    }
                });
            }

            if (!isRestored) {
                view.querySelector('.btnPlay').addEventListener('click', play);
                view.querySelector('.btnQueue').addEventListener('click', queue);
                view.querySelector('.btnInstantMix').addEventListener('click', instantMix);
                view.querySelector('.btnShuffle').addEventListener('click', shuffle);
            }

        });

        function initAlphaPicker() {
            // self.alphaPicker = new alphaPicker({
            //     element: view.querySelector('.alphaPicker'),
            //     itemsContainer: view.querySelector('.scrollSlider'),
            //     itemClass: 'card'
            // });
            //
            // self.alphaPicker.on('alphavaluechanged', onAlphaPickerValueChanged);
        }

        function onAlphaPickerValueChanged() {

            var value = self.alphaPicker.value();

            trySelectValue(value);
        }

        function trySelectValue(value) {

            var card;

            // If it's the symbol just pick the first card
            if (value === '#') {

                card = contentScrollSlider.querySelector('.card');

                if (card) {
                    self.scroller.toCenter(card, false);
                    return;
                }
            }

            card = contentScrollSlider.querySelector('.card[data-prefix^=\'' + value + '\']');

            if (card) {
                self.scroller.toCenter(card, false);
                return;
            }

            // go to the previous letter
            var values = self.alphaPicker.values();
            var index = values.indexOf(value);

            if (index < values.length - 2) {
                trySelectValue(values[index + 1]);
            } else {
                var all = contentScrollSlider.querySelectorAll('.card');
                card = all.length ? all[all.length - 1] : null;

                if (card) {
                    self.scroller.toCenter(card, false);
                }
            }
        }

        function setTitle(item) {

            if (params.type === 'collections') {
                Emby.Page.setTitle(Globalize.translate('Collections'));
            } else if (params.type === 'favoritemovies') {
                Emby.Page.setTitle(Globalize.translate('FavoriteMovies'));
            } else {
                Emby.Page.setTitle(item.Name);
            }
        }

        function play() {

            playbackManager.play({
                items: [currentItem]
            });
        }

        function queue() {

            playbackManager.queue({
                items: [currentItem]
            });
        }

        function instantMix() {
            playbackManager.instantMix(currentItem.Id);
        }

        function shuffle() {
            playbackManager.shuffle(currentItem.Id);
        }

        view.addEventListener('viewdestroy', function () {

            if (self.scroller) {
                self.scroller.destroy();
            }
            if (self.listController) {
                self.listController.destroy();
            }
            if (self.alphaPicker) {
                self.alphaPicker.off('alphavaluechanged', onAlphaPickerValueChanged);
                self.alphaPicker.destroy();
            }
        });
    };

});
