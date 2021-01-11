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
(function (exports) {
    'use strict';

    let getPageUrl = function () {
        if (document.querySelector('meta[property="og:url"]') && document.querySelector('meta[property="og:url"]')
                .getAttribute('content')) {
            return document.querySelector('meta[property="og:url"]').getAttribute('content');
        }

        return encodeURIComponent(window.location.href);
    };

    // constants
    const TOOLTIP_HEIGHT = 50;
    const FACTOR = 1.33;
    const TWITTER_LIMIT_LENGTH = 140;
    const TWITTER_URL_LENGTH_COUNT = 24;
    const TWITTER_QUOTES = 2;
    const TWITTER_DOTS = 3;
    const TOOLTIP_TIMEOUT = 250;
    const FACEBOOK_DISPLAY_MODES = {
        popup: 'popup',
        page: 'page'
    };

    const REAL_TWITTER_LIMIT = TWITTER_LIMIT_LENGTH - TWITTER_URL_LENGTH_COUNT -
        TWITTER_QUOTES - TWITTER_DOTS;

    const SOCIAL = {
        twitter: 'twitter',
        buffer: 'buffer',
        digg: 'digg',
        linkedin: 'linkedin',
        stumbleupon: 'stumbleupon',
        reddit: 'reddit',
        tumblr: 'tumblr',
        facebook: 'facebook'
    };

    const NO_START_WITH = /[ .,!?/\\\+\-=*£$€:~§%^µ)(|@"{}&#><_]/g;
    const NO_ENDS_WITH = /[ ,/\\\+\-=*£$€:~§%^µ)(|@"{}&#><_]/g;

    // globals
    let tooltip;
    let parameters;
    let selected = {};

    let extend = function (out) {
        out = out || {};

        for (let i = 1; i < arguments.length; i += 1) {
            if (arguments[i]) {
                for (let key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key)) {
                        out[key] = arguments[i][key];
                    }
                }
            }
        }
        return out;
    };

    let hideTooltip = function () {
        tooltip.classList.remove('active');
    };

    let showTooltip = function () {
        tooltip.classList.add('active');
    };

    let smartSanitize = function (text) {
        while (text.length && text[0].match(NO_START_WITH)) {
            text = text.substring(1, text.length);
        }

        while (text.length && text[text.length - 1].match(NO_ENDS_WITH)) {
            text = text.substring(0, text.length - 1);
        }

        return text;
    };

    let sanitizeText = function (text, sociaType = '') {
        let author = '';
        let tweetLimit = REAL_TWITTER_LIMIT;

        if (!text) {
            return '';
        }

        if (parameters.twitterUsername && sociaType === SOCIAL.twitter) {
            author = ` via @${parameters.twitterUsername}`;
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

    let generateSocialUrl = function (socialType, text) {
        if (parameters.sanitize) {
            text = sanitizeText(text, socialType);
        } else {
            text = smartSanitize(text);
        }

        let twitterUrl = `https://twitter.com/intent/tweet?url=${getPageUrl()}&text="${text}"`;

        if (parameters.twitterUsername && parameters.twitterUsername.length) {
            twitterUrl += `&via=${parameters.twitterUsername}`;
        }

        let facebookUrl = `https://facebook.com/dialog/share?display=${parameters.facebookDisplayMode}&href=${getPageUrl()}&quote=${text}`;

        if (document.querySelector('meta[property="fb:app_id"]') &&
            document.querySelector('meta[property="fb:app_id"]').getAttribute('content')) {
            let content = document.querySelector('meta[property="fb:app_id"]');
            facebookUrl += `&app_id=${content}`;
        } else if (parameters.facebookAppID && parameters.facebookAppID.length) {
            facebookUrl += `&app_id=${parameters.facebookAppID}`;
        } else {
            let idx = parameters.buttons.indexOf('facebook');
            if (idx > -1) {
                parameters.buttons.splice(idx, 1);
            }
        }

        let urls = {
            twitter: twitterUrl,
            buffer: `https://buffer.com/add?text="${text}"&url=${getPageUrl()}`,
            digg: `http://digg.com/submit?url=${getPageUrl()}&title=${text}`,
            linkedin: `https://www.linkedin.com/shareArticle?url=${getPageUrl()}&title=${text}`,
            stumbleupon: `http://www.stumbleupon.com/submit?url=${getPageUrl()}&title=${text}`,
            reddit: `https://reddit.com/submit?url=${getPageUrl()}&title=${text}`,
            tumblr: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${getPageUrl()}&caption=${text}`,
            facebook: facebookUrl
        };

        if (urls.hasOwnProperty(socialType)) {
            return urls[socialType];
        }

        return '';
    };

    let updateTooltip = function (rect) {
        let actualPosition = document.documentElement.scrollTop || document.body.scrollTop;
        let body = document.querySelector('body');

        tooltip.style.top = actualPosition + rect.top - (TOOLTIP_HEIGHT * FACTOR) + 'px';
        tooltip.style.left = (rect.left + (rect.width / 2) - (body.getBoundingClientRect().width / 2)) + 'px';

        Array.prototype.forEach.call(parameters.buttons, (btn) => {
            tooltip.querySelector(`.share-selected-text-btn-${btn}`).href = generateSocialUrl(btn, selected.text);
        });

        window.setTimeout(function () {
            showTooltip();
        }, parameters.tooltipTimeout);
    };

    let generateAnchorTag = function (anchorType, customIconClass = null) {
        let anchorTag = document.createElement('A');
        let anchorIcon = document.createElement('i');

        if (parameters.anchorsClass) {
            [
                'share-selected-text-btn',
                `share-selected-text-btn-${anchorType}`,
                `${parameters.anchorsClass}`,
            ].map((item) => anchorTag.classList.add(item));
        } else {
            [
                'share-selected-text-btn',
                `share-selected-text-btn-${anchorType}`
            ].map((item) => anchorTag.classList.add(item));
        }

        if (customIconClass) {
            anchorIcon.classList.add(`${customIconClass}`);
        } else {
            [
                `icon-sst-${anchorType}`,
                'fa',
                `fa-${anchorType}`
            ].map((item) => anchorIcon.classList.add(item));
        }

        anchorIcon.style.pointerEvents = 'none';
        anchorTag.addEventListener('click', (e) => {
            e.preventDefault();
            let windowFeatures = 'status=no,menubar=no,location=no,scrollbars=no,width=720,height=540';
            let url = e.target.href;
            window.open(url, 'Share this post', windowFeatures);
        });

        anchorTag.href = generateSocialUrl(anchorType, selected.text ? selected.text : '');
        anchorTag.appendChild(anchorIcon);
        return anchorTag;
    };

    let generateTooltip = function () {
        let body = document.querySelector('body');
        let mainDiv = document.createElement('DIV');
        let btnContainer = document.createElement('DIV');

        mainDiv.classList.add('share-selected-text-main-container');
        btnContainer.classList.add('share-selected-text-inner');

        if (parameters.tooltipClass) {
            btnContainer.classList.add(parameters.tooltipClass);
        }

        mainDiv.style.height = TOOLTIP_HEIGHT + 'px';
        mainDiv.style.top = 0;
        mainDiv.style.left = 0;

        Array.prototype.forEach.call(parameters.buttons, (btn) => {
            let aTag = generateAnchorTag(btn);
            btnContainer.appendChild(aTag);
        });

        mainDiv.appendChild(btnContainer);
        body.appendChild(mainDiv);

        return mainDiv;
    };

    let getSelectedText = function () {
        let text = '';
        let selection;

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

    let shareTooltip = function () {
        selected = getSelectedText();

        if (selected.text.length) {
            let oRange = selected.selection.getRangeAt(0);
            let oRect = oRange.getBoundingClientRect();
            updateTooltip(oRect);
        } else {
            hideTooltip();
        }
    };

    exports.shareSelectedText = function (element, args) {
        let elt = document.querySelectorAll(element);

        parameters = extend({
            tooltipClass: '',
            sanitize: true,
            buttons: [
                SOCIAL.twitter,
                SOCIAL.buffer
            ],
            anchorsClass: '',
            twitterUsername: '',
            facebookAppID: '',
            facebookDisplayMode: FACEBOOK_DISPLAY_MODES.popup,
            tooltipTimeout: TOOLTIP_TIMEOUT
        }, args);

        tooltip = generateTooltip();

        Array.prototype.forEach.call(elt, el => {
            el.addEventListener('mouseup', function () {
                shareTooltip();
            });
        });
    };
}(window));

/*global jQuery, shareSelectedText*/
if (window.jQuery) {
    (function ($, shareSelected) {
        'use strict';

        let shareSelectedify = function (el, options) {
            shareSelected(el, options);
        };

        $.fn.shareSelectedText = function (options) {
            return shareSelectedify(this.selector, options);
        };
    }(jQuery, shareSelectedText));
}
