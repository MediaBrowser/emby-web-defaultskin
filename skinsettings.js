define(['userSettings', './skininfo'], function (userSettings, skininfo) {
    'use strict';

    var settingsPrefix = skininfo.id + '-';
    var obj = function () {

        var self = this;

        self.set = function (name, value) {

            userSettings.set(settingsPrefix + name, value);
        };

        self.get = function (name) {

            return userSettings.get(settingsPrefix + name);
        };

        self.enableAntiSpoliers = function (val) {

            if (val != null) {
                self.set('antispoilers', val.toString());
            }

            return self.get('antispoilers') !== 'false';
        };

        self.dimUnselectedPosters = function (val) {

            if (val != null) {
                self.set('dimunselectedposters', val.toString());
            }

            return self.get('dimunselectedposters') === 'true';
        };

        self.enableMovieDetailScenes = function (val) {

            if (val != null) {
                self.set('moviedetailscenes', val.toString());
            }

            return self.get('moviedetailscenes') === 'true';
        };

        self.enableEpisodeDetailScenes = function (val) {

            if (val != null) {
                self.set('episodedetailscenes', val.toString());
            }

            return self.get('episodedetailscenes') === 'true';
        };

        self.enableOtherDetailScenes = function (val) {

            if (val != null) {
                self.set('otherdetailscenes', val.toString());
            }

            return self.get('otherdetailscenes') === 'true';
        };


        self.skinColor = function (val) {

            if (val != null) {
                self.set('skincolor', val.toString());
            }

            return self.get('skincolor');
        };

        self.apply = function () {
            // if (self.dimUnselectedPosters()) {
            //     document.body.classList.add('dimunselected');
            // } else {
            //     document.body.classList.remove('dimunselected');
            // }

            if (self.skinColor()) {
              document.body.classList.remove('theme-default');
              document.body.classList.remove('theme-brown');
              document.body.classList.remove('theme-charcoal');
              document.body.classList.remove('theme-chartreuse');
              document.body.classList.remove('theme-concrete');
              document.body.classList.remove('theme-gold');
              document.body.classList.remove('theme-green');
              document.body.classList.remove('theme-maroon');
              document.body.classList.remove('theme-midnight');
              document.body.classList.remove('theme-orange');
              document.body.classList.remove('theme-pink');
              document.body.classList.remove('theme-rose');
              document.body.classList.remove('theme-teal');
              document.body.classList.remove('theme-violet');

              document.body.classList.add(self.skinColor());
            }
        };

        self.unload = function () {
            document.body.classList.remove('dimunselected');
        };
    };

    return new obj();
});
