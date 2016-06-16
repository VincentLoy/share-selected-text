/**
 * Created by vincent on 6/15/16.
 */
'use strict';

(function (exports) {
    'use strict';

    var TOOLTIP_HEIGHT = 50;
    var FACTOR = 1.33;
    var TWITTER_LIMIT_LENGTH = 140;
    var TWITTER_URL_LENGTH_COUNT = 24;
    var TWITTER_COMMAS = 2;
    var TWITTER_DOTS = 3;

    var REAL_TWITTER_LIMIT = TWITTER_LIMIT_LENGTH - TWITTER_URL_LENGTH_COUNT - TWITTER_COMMAS - TWITTER_DOTS;

    var tooltip = undefined;
    var parameters = undefined;

    var extend = function extend(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i += 1) {
            if (arguments[i]) {
                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key)) {
                        out[key] = arguments[i][key];
                    }
                }
            }
        }
        return out;
    };

    var sanitizeTweet = function sanitizeTweet(text) {
        if (text.length > REAL_TWITTER_LIMIT) {
            return text.substring(0, REAL_TWITTER_LIMIT) + '...';
        }
        return text.substring(0, REAL_TWITTER_LIMIT + TWITTER_DOTS);
    };

    var generateTwitterUrl = function generateTwitterUrl(url, text) {
        if (parameters.sanitize) {
            text = sanitizeTweet(text);
        }
        return 'https://twitter.com/intent/tweet?url=' + url + '&text="' + text + '"';
    };

    var generateBufferUrl = function generateBufferUrl(url, text) {
        if (parameters.sanitize) {
            text = sanitizeTweet(text);
        }
        return 'https://buffer.com/add?text=' + text + '&url=' + url;
    };

    var hideTooltip = function hideTooltip() {
        tooltip.classList.remove('active');
    };

    var showTooltip = function showTooltip() {
        tooltip.classList.add('active');
    };

    var updateTooltip = function updateTooltip(rect, selected) {
        var actualPosition = document.documentElement.scrollTop || document.body.scrollTop;
        var body = document.querySelector('body');

        tooltip.style.top = actualPosition + rect.top - TOOLTIP_HEIGHT * FACTOR + 'px';
        tooltip.style.left = rect.left + rect.width / 2 - body.getBoundingClientRect().width / 2 + 'px';

        tooltip.querySelector('.share-selected-text-btn-twitter').href = generateTwitterUrl(window.location.href, selected.text);

        tooltip.querySelector('.share-selected-text-btn-buffer').href = generateBufferUrl(window.location.href, selected.text);

        window.setTimeout(function () {
            showTooltip();
        }, 250);
    };

    var generateTooltip = function generateTooltip() {
        var body = document.querySelector('body');
        var mainDiv = document.createElement('DIV');
        var btnContainer = document.createElement('DIV');
        var twitterBtn = document.createElement('A');
        var bufferBtn = document.createElement('A');
        var twitterIcon = document.createElement('i');
        var bufferIcon = document.createElement('i');

        mainDiv.classList.add('share-selected-text-main-container');
        btnContainer.classList.add('share-selected-text-inner');

        twitterIcon.classList.add('fa', 'fa-twitter');
        bufferIcon.classList.add('fa', 'fa-buffer');

        twitterBtn.classList.add('share-selected-text-btn', 'share-selected-text-btn-twitter');
        twitterBtn.href = '#';
        bufferBtn.classList.add('share-selected-text-btn', 'share-selected-text-btn-buffer');
        bufferBtn.href = '#';

        twitterBtn.appendChild(twitterIcon);
        bufferBtn.appendChild(bufferIcon);

        mainDiv.style.height = TOOLTIP_HEIGHT + 'px';
        mainDiv.style.top = 0;
        mainDiv.style.left = 0;

        btnContainer.appendChild(twitterBtn);
        btnContainer.appendChild(bufferBtn);
        mainDiv.appendChild(btnContainer);

        body.appendChild(mainDiv);

        return mainDiv;
    };

    var getSelectedText = function getSelectedText() {
        var text = '',
            selection = undefined;

        if (window.getSelection) {
            selection = window.getSelection();
            text = selection.toString();
        } else if (document.selection && document.selection.type !== 'Control') {
            selection = document.selection.createRange();
            text = selection.text;
        }

        return {
            selection: selection,
            text: text
        };
    };

    var shareTooltip = function shareTooltip() {
        var selected = getSelectedText();

        if (selected.text.length) {
            var oRange = selected.selection.getRangeAt(0);
            var oRect = oRange.getBoundingClientRect();
            console.log(oRect);
            console.log(selected);
            updateTooltip(oRect, selected);
        } else {
            hideTooltip();
        }
    };

    var shareSelectedText = function shareSelectedText(element, args) {
        var elt = document.querySelectorAll(element);

        parameters = extend({
            tooltipClass: 'share-selected',
            sanitize: true,
            twitterEnabled: true,
            twitterVia: 'PastaWS'
        }, args);

        tooltip = generateTooltip();

        Array.prototype.forEach.call(elt, function (el) {
            el.addEventListener('mouseup', function () {
                shareTooltip();
            });
        });
    };

    exports.shareSelectedText = shareSelectedText;
})(window);

shareSelectedText('.blog-post-content');

/*global jQuery, shareSelectedText*/
if (window.jQuery) {
    (function ($, shareSelected) {
        'use strict';

        var shareSelectedify = function shareSelectedify(el, options) {
            shareSelected(el, options);
        };

        $.fn.shareSelectedText = function (options) {
            return shareSelectedify(this.selector, options);
        };
    })(jQuery, shareSelectedText);
}