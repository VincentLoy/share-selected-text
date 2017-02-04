/*!
 * Share Selected Text
 * version: 1.1.1
 * license: MIT
 * url: https://github.com/VincentLoy/share-selected-text
 * author: Vincent Loy <vincent.loy1@gmail.com>
 * contributors:
 *  - Wendy Beth <wendybeth010@gmail.com>
 *  - Dmitry Motorin <dmitry.mot@gmail.com>
 *  - Dustin Armstrong
 */
'use strict';

(function (exports) {
    'use strict';

    var getPageUrl = function getPageUrl() {
        if (document.querySelector('meta[property="og:url"]') && document.querySelector('meta[property="og:url"]').getAttribute('content')) {
            return document.querySelector('meta[property="og:url"]').getAttribute('content');
        }

        return window.location.href;
    };

    // constants
    var TOOLTIP_HEIGHT = 50;
    var FACTOR = 1.33;
    var TWITTER_LIMIT_LENGTH = 140;
    var TWITTER_URL_LENGTH_COUNT = 24;
    var TWITTER_QUOTES = 2;
    var TWITTER_DOTS = 3;
    var TOOLTIP_TIMEOUT = 250;
    var FACEBOOK_DISPLAY_MODES = {
        popup: 'popup',
        page: 'page'
    };

    var REAL_TWITTER_LIMIT = TWITTER_LIMIT_LENGTH - TWITTER_URL_LENGTH_COUNT - TWITTER_QUOTES - TWITTER_DOTS;

    var SOCIAL = {
        twitter: 'twitter',
        buffer: 'buffer',
        digg: 'digg',
        linkedin: 'linkedin',
        stumbleupon: 'stumbleupon',
        reddit: 'reddit',
        tumblr: 'tumblr',
        facebook: 'facebook'
    };

    var NO_START_WITH = /[ .,!?/\\\+\-=*£$€:~§%^µ)(|@"{}&#><_]/g;
    var NO_ENDS_WITH = /[ ,/\\\+\-=*£$€:~§%^µ)(|@"{}&#><_]/g;
    var PAGE_URL = getPageUrl();

    // globals
    var tooltip = undefined;
    var parameters = undefined;
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

    var hideTooltip = function hideTooltip() {
        tooltip.classList.remove('active');
    };

    var showTooltip = function showTooltip() {
        tooltip.classList.add('active');
    };

    var smartSanitize = function smartSanitize(text) {
        while (text.length && text[0].match(NO_START_WITH)) {
            text = text.substring(1, text.length);
        }

        while (text.length && text[text.length - 1].match(NO_ENDS_WITH)) {
            text = text.substring(0, text.length - 1);
        }

        return text;
    };

    var sanitizeText = function sanitizeText(text) {
        var sociaType = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        var author = '';
        var tweetLimit = REAL_TWITTER_LIMIT;

        if (!text) {
            return '';
        }

        if (parameters.twitterUsername && sociaType === SOCIAL.twitter) {
            author = ' via @' + parameters.twitterUsername;
            tweetLimit = REAL_TWITTER_LIMIT - author.length;
        }

        if (text.length > REAL_TWITTER_LIMIT) {
            text = text.substring(0, tweetLimit);
            text = text.substring(0, text.lastIndexOf(' ')) + '...';
        } else {
            text = text.substring(0, tweetLimit + TWITTER_DOTS);
        }

        return smartSanitize(text);
    };

    var generateSocialUrl = function generateSocialUrl(socialType, text) {
        if (parameters.sanitize) {
            text = sanitizeText(text, socialType);
        } else {
            text = smartSanitize(text);
        }

        var twitterUrl = 'https://twitter.com/intent/tweet?url=' + PAGE_URL + '&text="' + text + '"';

        if (parameters.twitterUsername && parameters.twitterUsername.length) {
            twitterUrl += '&via=' + parameters.twitterUsername;
        }

        var facebookUrl = 'https://facebook.com/dialog/share?display=' + parameters.facebookDisplayMode + '&href=' + PAGE_URL;

        if (document.querySelector('meta[property="fb:app_id"]') && document.querySelector('meta[property="fb:app_id"]').getAttribute('content')) {
            var content = document.querySelector('meta[property="fb:app_id"]');
            facebookUrl += '&app_id=' + content;
        } else if (parameters.facebookAppID && parameters.facebookAppID.length) {
            facebookUrl += '&app_id=' + parameters.facebookAppID;
        } else {
            var idx = parameters.buttons.indexOf('facebook');
            if (idx > -1) {
                parameters.buttons.splice(idx, 1);
            }
        }

        var urls = {
            twitter: twitterUrl,
            buffer: 'https://buffer.com/add?text="' + text + '"&url=' + PAGE_URL,
            digg: 'http://digg.com/submit?url=' + PAGE_URL + '&title=' + text,
            linkedin: 'https://www.linkedin.com/shareArticle?url=' + PAGE_URL + '&title=' + text,
            stumbleupon: 'http://www.stumbleupon.com/submit?url=' + PAGE_URL + '&title=' + text,
            reddit: 'https://reddit.com/submit?url=' + PAGE_URL + '&title=' + text,
            tumblr: 'https://www.tumblr.com/widgets/share/tool?canonicalUrl=' + PAGE_URL + '&caption=' + text,
            facebook: facebookUrl
        };

        if (urls.hasOwnProperty(socialType)) {
            return urls[socialType];
        }

        return '';
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
        }, parameters.tooltipTimeout);
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
            anchorIcon.classList.add('icon-sst-' + anchorType, 'fa', 'fa-' + anchorType);
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
        var text = '';
        var selection = undefined;

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
            twitterUsername: '',
            facebookAppID: '',
            facebookDisplayMode: FACEBOOK_DISPLAY_MODES.popup,
            tooltipTimeout: TOOLTIP_TIMEOUT
        }, args);

        tooltip = generateTooltip();

        Array.prototype.forEach.call(elt, function (el) {
            el.addEventListener('mouseup', function () {
                shareTooltip();
            });
        });
    };
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