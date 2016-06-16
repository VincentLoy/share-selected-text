/**
 * Created by vincent on 6/15/16.
 */
(function (exports) {
    'use strict';

    const TOOLTIP_HEIGHT = 50;
    const FACTOR = 1.33;
    const TWITTER_LIMIT_LENGTH = 140;
    const TWITTER_URL_LENGTH_COUNT = 24;
    const TWITTER_COMMAS = 2;
    const TWITTER_DOTS = 3;

    const REAL_TWITTER_LIMIT = TWITTER_LIMIT_LENGTH - TWITTER_URL_LENGTH_COUNT -
        TWITTER_COMMAS - TWITTER_DOTS;

    let tooltip;
    let parameters;

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

    let sanitizeTweet = function (text) {
        if (text.length > REAL_TWITTER_LIMIT) {
            return text.substring(0, REAL_TWITTER_LIMIT) + '...';
        }
        return text.substring(0, REAL_TWITTER_LIMIT + TWITTER_DOTS);
    };

    let generateTwitterUrl = function (url, text) {
        if (parameters.sanitize) {
            text = sanitizeTweet(text);
        }
        return `https://twitter.com/intent/tweet?url=${url}&text="${text}"`;
    };

    let generateBufferUrl = function (url, text) {
        if (parameters.sanitize) {
            text = sanitizeTweet(text);
        }
        return `https://buffer.com/add?text=${text}&url=${url}`;
    };

    let hideTooltip = function () {
        tooltip.classList.remove('active');
    };

    let showTooltip = function () {
        tooltip.classList.add('active');
    };

    let updateTooltip = function (rect, selected) {
        let actualPosition = document.documentElement.scrollTop || document.body.scrollTop;
        let body = document.querySelector('body');

        tooltip.style.top = actualPosition + rect.top - (TOOLTIP_HEIGHT * FACTOR) + 'px';
        tooltip.style.left = (rect.left + (rect.width / 2) - (body.getBoundingClientRect().width / 2)) + 'px';

        tooltip.querySelector('.share-selected-text-btn-twitter').href =
            generateTwitterUrl(window.location.href, selected.text);

        tooltip.querySelector('.share-selected-text-btn-buffer').href =
            generateBufferUrl(window.location.href, selected.text);

        window.setTimeout(function () {
            showTooltip();
        }, 250);
    };

    let generateTooltip = function () {
        let body = document.querySelector('body');
        let mainDiv = document.createElement('DIV');
        let btnContainer = document.createElement('DIV');
        let twitterBtn = document.createElement('A');
        let bufferBtn = document.createElement('A');
        let twitterIcon = document.createElement('i');
        let bufferIcon = document.createElement('i');

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
        let selected = getSelectedText();

        if (selected.text.length) {
            let oRange = selected.selection.getRangeAt(0);
            let oRect = oRange.getBoundingClientRect();
            console.log(oRect);
            console.log(selected);
            updateTooltip(oRect, selected);
        } else {
            hideTooltip();
        }
    };

    let shareSelectedText = function (element, args) {
        let elt = document.querySelectorAll(element);

        parameters = extend({
            tooltipClass: 'share-selected',
            sanitize: true,
            twitterEnabled: true,
            twitterVia: 'PastaWS'
        }, args);

        tooltip = generateTooltip();

        Array.prototype.forEach.call(elt, el => {
            el.addEventListener('mouseup', function () {
                shareTooltip();
            });
        });
    };

    exports.shareSelectedText = shareSelectedText;
}(window));

shareSelectedText('.blog-post-content');

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
