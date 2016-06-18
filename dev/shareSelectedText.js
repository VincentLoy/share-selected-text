/**
 * Created by vincent on 6/15/16.
 */
(function (exports) {
    'use strict';

    // constants
    const TOOLTIP_HEIGHT = 50;
    const FACTOR = 1.33;
    const TWITTER_LIMIT_LENGTH = 140;
    const TWITTER_URL_LENGTH_COUNT = 24;
    const TWITTER_COMMAS = 2;
    const TWITTER_DOTS = 3;

    const REAL_TWITTER_LIMIT = TWITTER_LIMIT_LENGTH - TWITTER_URL_LENGTH_COUNT -
        TWITTER_COMMAS - TWITTER_DOTS;

    const SOCIAL = {
        twitter: 'twitter',
        buffer: 'buffer',
        digg: 'digg',
        linkedin: 'linkedin',
        stumbleupon: 'stumbleupon'
    };

    // globals
    let tooltip;
    let parameters;
    let pageUrl = window.location.href;
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

    let sanitizeForTweet = function (text) {
        if (!text) {
            return '';
        }

        if (text.length > REAL_TWITTER_LIMIT) {
            return text.substring(0, REAL_TWITTER_LIMIT) + '...';
        }

        return text.substring(0, REAL_TWITTER_LIMIT + TWITTER_DOTS);
    };

    let hideTooltip = function () {
        tooltip.classList.remove('active');
    };

    let showTooltip = function () {
        tooltip.classList.add('active');
    };

    let generateSocialUrl = function (socialType, text) {
        if (parameters.sanitize) {
            text = sanitizeForTweet(text);
        }

        let urls = {
            twitter: `https://twitter.com/intent/tweet?url=${pageUrl}&text="${text}"`,
            buffer: `https://buffer.com/add?text="${text}"&url=${pageUrl}`,
            digg: `http://digg.com/submit?url=${pageUrl}&title=${text}`,
            linkedin: `https://www.linkedin.com/shareArticle?url=${pageUrl}&title=${text}`,
            stumbleupon: `http://www.stumbleupon.com/submit?url=${pageUrl}&title=${text}`
        };

        return urls[socialType];
    };

    let updateTooltip = function (rect) {
        let actualPosition = document.documentElement.scrollTop || document.body.scrollTop;
        let body = document.querySelector('body');

        tooltip.style.top = actualPosition + rect.top - (TOOLTIP_HEIGHT * FACTOR) + 'px';
        tooltip.style.left = (rect.left + (rect.width / 2) - (body.getBoundingClientRect().width / 2)) + 'px';

        Array.prototype.forEach.call(parameters.buttons, function (btn) {
            tooltip.querySelector(`.share-selected-text-btn-${btn}`).href = generateSocialUrl(btn, selected.text);
        });

        window.setTimeout(function () {
            showTooltip();
        }, 250);
    };

    let generateAnchorTag = function (anchorType, customIconClass = null) {
        let anchorTag = document.createElement('A');
        let anchorIcon = document.createElement('i');

        if (parameters.anchorsClass) {
            anchorTag.classList.add(
                'share-selected-text-btn',
                `share-selected-text-btn-${anchorType}`,
                `${parameters.anchorsClass}`
            );
        } else {
            anchorTag.classList.add('share-selected-text-btn', `share-selected-text-btn-${anchorType}`);
        }

        if (customIconClass) {
            anchorIcon.classList.add(`${customIconClass}`);
        } else {
            anchorIcon.classList.add(`icon-${anchorType}`, 'fa', `fa-${anchorType}`);
        }

        anchorIcon.style.pointerEvents = 'none';
        anchorTag.addEventListener('click', function (e) {
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

        Array.prototype.forEach.call(parameters.buttons, function (btn) {
            let aTag = generateAnchorTag(btn);
                btnContainer.appendChild(aTag);
        });

        mainDiv.appendChild(btnContainer);
        body.appendChild(mainDiv);

        return mainDiv;
    };

    let getSelectedText = function () {
        let text = '',
            selection;

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
            twitterVia: 'PastaWS'
        }, args);

        tooltip = generateTooltip();

        Array.prototype.forEach.call(elt, el => {
            el.addEventListener('mouseup', function () {
                shareTooltip();
            });
        });
    };

    //exports.shareSelectedText = shareSelectedText;
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
