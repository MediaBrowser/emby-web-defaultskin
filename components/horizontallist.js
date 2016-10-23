define(['loading', './focushandler', 'focusManager', 'cardBuilder'], function (loading, focusHandler, focusManager, cardbuilder) {
    'use strict';

    function horizontalList(options) {

        var self = this;
        self.options = options;
    }

    horizontalList.prototype.render = function () {

        var self = this;
        var options = self.options;

        if (options.itemsContainer) {

            self.focusHandler = new focusHandler({
                parent: options.itemsContainer,
                selectedItemInfoElement: options.selectedItemInfoElement,
                selectedIndexElement: options.selectedIndexElement,
                scroller: options.scroller,
                selectedItemMode: options.selectedItemMode,
                enableBackdrops: true
            });
        }

        loading.show();

        options.getItemsMethod(0, 4000).then(self.onItemsResult.bind(self));
    };

    horizontalList.prototype.onItemsResult = function (result) {

        var self = this;
        var options = self.options;

        // Normalize between the different response types
        if (result.Items == null && result.TotalRecordCount == null) {

            result = {
                Items: result,
                TotalRecordCount: result.length
            };
        }

        self.items = result.Items;

        if (options.listCountElement) {
            options.listCountElement.innerHTML = result.TotalRecordCount;
            options.listNumbersElement.classList.remove('hide');
        }

        var cardOptions = options.cardOptions || {};
        cardOptions.itemsContainer = options.itemsContainer;

        cardbuilder.buildCards(result.Items, cardOptions);

        loading.hide();

        if (options.onRender) {
            options.onRender();
        }

        if (options.autoFocus !== false) {
            setTimeout(self.onAutoFocusTimeout.bind(self), 400);
        }
    };

    horizontalList.prototype.onAutoFocusTimeout = function () {

        var self = this;
        var options = self.options;

        var firstCard = options.itemsContainer.querySelector('.card');
        if (firstCard) {
            focusManager.focus(firstCard);
        }
    };

    horizontalList.prototype.destroy = function () {

        var self = this;

        if (self.focusHandler) {
            self.focusHandler.destroy();
            self.focusHandler = null;
        }

        self.options = null;
    };

    return horizontalList;
});