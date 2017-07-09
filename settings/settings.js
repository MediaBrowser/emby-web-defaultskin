define(['loading', './../skinsettings', 'emby-select', 'focusManager'], function (loading, skinSettings, embySelect, focusManager) {
    'use strict';

    return function (view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('SkinName'));

            loading.hide();

            if (!isRestored) {

                renderSettings();
            }
        });

        view.addEventListener('viewbeforehide', function (e) {

            // skinSettings.enableAntiSpoliers(view.querySelector('.chkEnableEpisodeAntiSpoliers').checked);
            // skinSettings.dimUnselectedPosters(view.querySelector('.chkDimPosters').checked);

            skinSettings.skinColor(view.querySelector('.selectSkinColor').value);

            skinSettings.apply();
        });

        view.querySelector('.selectSkinColor').addEventListener('change', function (e) {

            skinSettings.skinColor(view.querySelector('.selectSkinColor').value);

            skinSettings.apply();
        });

        function renderSettings() {

            focusManager.autoFocus(view);

            // view.querySelector('.chkEnableEpisodeAntiSpoliers').checked = skinSettings.enableAntiSpoliers();
            // view.querySelector('.chkDimPosters').checked = skinSettings.dimUnselectedPosters();

            view.querySelector('.selectSkinColor').value = skinSettings.skinColor();
        }
    };

});
