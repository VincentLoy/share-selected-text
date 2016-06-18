/**
 * Created by vincent on 6/15/16.
 */
'use strict';

(function (exports) {
    'use strict';

    // constants
    var TOOLTIP_HEIGHT = 50;
    var FACTOR = 1.33;
    var TWITTER_LIMIT_LENGTH = 140;
    var TWITTER_URL_LENGTH_COUNT = 24;
    var TWITTER_COMMAS = 2;
    var TWITTER_DOTS = 3;

    var REAL_TWITTER_LIMIT = TWITTER_LIMIT_LENGTH - TWITTER_URL_LENGTH_COUNT - TWITTER_COMMAS - TWITTER_DOTS;

    var SOCIAL = {
        twitter: 'twitter',
        buffer: 'buffer',
        digg: 'digg',
        linkedin: 'linkedin',
        stumbleupon: 'stumbleupon'
    };

    // globals
    var tooltip = undefined;
    var parameters = undefined;
    var pageUrl = window.location.href;
    var selected = {};

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

    var sanitizeForTweet = function sanitizeForTweet(text) {
        if (!text) {
            return '';
        }

        if (text.length > REAL_TWITTER_LIMIT) {
            return text.substring(0, REAL_TWITTER_LIMIT) + '...';
        }

        return text.substring(0, REAL_TWITTER_LIMIT + TWITTER_DOTS);
    };

    var hideTooltip = function hideTooltip() {
        tooltip.classList.remove('active');
    };

    var showTooltip = function showTooltip() {
        tooltip.classList.add('active');
    };

    var generateSocialUrl = function generateSocialUrl(socialType, text) {
        if (parameters.sanitize) {
            text = sanitizeForTweet(text);
        }

        var urls = {
            twitter: 'https://twitter.com/intent/tweet?url=' + pageUrl + '&text="' + text + '"',
            buffer: 'https://buffer.com/add?text="' + text + '"&url=' + pageUrl,
            digg: 'http://digg.com/submit?url=' + pageUrl + '&title=' + text,
            linkedin: 'https://www.linkedin.com/shareArticle?url=' + pageUrl + '&title=' + text,
            stumbleupon: 'http://www.stumbleupon.com/submit?url=' + pageUrl + '&title=' + text
        };

        return urls[socialType];
    };

    var updateTooltip = function updateTooltip(rect) {
        var actualPosition = document.documentElement.scrollTop || document.body.scrollTop;
        var body = document.querySelector('body');

        tooltip.style.top = actualPosition + rect.top - TOOLTIP_HEIGHT * FACTOR + 'px';
        tooltip.style.left = rect.left + rect.width / 2 - body.getBoundingClientRect().width / 2 + 'px';

        Array.prototype.forEach.call(parameters.buttons, function (btn) {
            tooltip.querySelector('.share-selected-text-btn-' + btn).href = generateSocialUrl(btn, selected.text);
        });

        window.setTimeout(function () {
            showTooltip();
        }, 250);
    };

    var generateAnchorTag = function generateAnchorTag(anchorType) {
        var customIconClass = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        var anchorTag = document.createElement('A');
        var anchorIcon = document.createElement('i');

        if (parameters.anchorsClass) {
            anchorTag.classList.add('share-selected-text-btn', 'share-selected-text-btn-' + anchorType, '' + parameters.anchorsClass);
        } else {
            anchorTag.classList.add('share-selected-text-btn', 'share-selected-text-btn-' + anchorType);
        }

        if (customIconClass) {
            anchorIcon.classList.add('' + customIconClass);
        } else {
            anchorIcon.classList.add('icon-' + anchorType, 'fa', 'fa-' + anchorType);
        }

        anchorIcon.style.pointerEvents = 'none';
        anchorTag.addEventListener('click', function (e) {
            e.preventDefault();
            var windowFeatures = 'status=no,menubar=no,location=no,scrollbars=no,width=720,height=540';
            var url = e.target.href;
            window.open(url, 'Share this post', windowFeatures);
        });

        anchorTag.href = generateSocialUrl(anchorType, selected.text ? selected.text : '');
        anchorTag.appendChild(anchorIcon);
        return anchorTag;
    };

    var generateTooltip = function generateTooltip() {
        var body = document.querySelector('body');
        var mainDiv = document.createElement('DIV');
        var btnContainer = document.createElement('DIV');

        mainDiv.classList.add('share-selected-text-main-container');
        btnContainer.classList.add('share-selected-text-inner');

        if (parameters.tooltipClass) {
            btnContainer.classList.add(parameters.tooltipClass);
        }

        mainDiv.style.height = TOOLTIP_HEIGHT + 'px';
        mainDiv.style.top = 0;
        mainDiv.style.left = 0;

        Array.prototype.forEach.call(parameters.buttons, function (btn) {
            var aTag = generateAnchorTag(btn);
            btnContainer.appendChild(aTag);
        });

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
        selected = getSelectedText();

        if (selected.text.length) {
            var oRange = selected.selection.getRangeAt(0);
            var oRect = oRange.getBoundingClientRect();
            updateTooltip(oRect);
        } else {
            hideTooltip();
        }
    };

    exports.shareSelectedText = function (element, args) {
        var elt = document.querySelectorAll(element);

        parameters = extend({
            tooltipClass: '',
            sanitize: true,
            buttons: [SOCIAL.twitter, SOCIAL.buffer],
            anchorsClass: '',
            twitterVia: 'PastaWS'
        }, args);

        tooltip = generateTooltip();

        Array.prototype.forEach.call(elt, function (el) {
            el.addEventListener('mouseup', function () {
                shareTooltip();
            });
        });
    };

    //exports.shareSelectedText = shareSelectedText;
})(window);

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