define(['visibleinviewport', 'itemShortcuts', 'browser'], function (visibleinviewport, itemShortcuts, browser) {

    function loadItemIntoSpotlight(card, item, width) {

        if (!item.BackdropImageTags || !item.BackdropImageTags.length) {
            return;
        }

        card.dispatchEvent(new CustomEvent("focus"));
        var imgUrl = Emby.Models.backdropImageUrl(item, {
            maxWidth: width
        });

        var cardImageContainer = card.querySelector('.cardImage');

        var newCardImageContainer = document.createElement('div');
        newCardImageContainer.className = cardImageContainer.className;

        newCardImageContainer.style.backgroundImage = "url('" + imgUrl + "')";

        card.querySelector('.cardText').innerHTML = item.Taglines && item.Taglines.length ? item.Taglines[0] : item.Name;
        card.setAttribute('data-id', item.Id);
        card.setAttribute('data-serverid', item.ServerId);
        card.setAttribute('data-type', item.Type);
        card.setAttribute('data-isfolder', item.IsFolder.toString());
        card.setAttribute('data-action', 'link');
        card.classList.add('itemAction');

        cardImageContainer.parentNode.appendChild(newCardImageContainer);

        var onAnimationFinished = function () {

            var parentNode = cardImageContainer.parentNode;
            if (parentNode) {
                parentNode.removeChild(cardImageContainer);
            }
        };

        // Only use the fade animation if native support for WebAnimations is present
        if (browser.animate /*&& cardImageContainer.style.backgroundImage*/) {
            var keyframes = [
                    { opacity: '0', offset: 0 },
                    { opacity: '1', offset: 1 }];
            var timing = { duration: 900, iterations: 1 };
            newCardImageContainer.animate(keyframes, timing).onfinish = onAnimationFinished;
        } else {
            onAnimationFinished();
        }
    }

    function startSpotlight(self, card, items, width) {

        if (!items.length) {
            return;
        }

        loadItemIntoSpotlight(card, items[0], width);

        if (items.length == 1) {
            return;
        }

        var index = 1;
        // Use a higher interval for browsers that don't perform as well
        var intervalMs = browser.animate ? 10000 : 30000;

        self.interval = setInterval(function () {

            if (!document.body.contains(card)) {
                clearInterval(self.interval);
                return;
            }

            if (!visibleinviewport(card, false, 0)) {
                // If it's not visible on screen, skip it
                return;
            }

            if (index >= items.length) {
                index = 0;
            }

            loadItemIntoSpotlight(card, items[index], width);
            index++;

        }, intervalMs);
    }

    function spotlight(card, items, width) {

        var self = this;

        itemShortcuts.off(card);
        itemShortcuts.on(card);

        startSpotlight(self, card, items, width);
    }

    return spotlight;
});