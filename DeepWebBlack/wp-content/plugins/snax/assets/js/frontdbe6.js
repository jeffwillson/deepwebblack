/* global document */
/* global jQuery */
/* global snax */
/* global alert */
/* global confirm */
/* global console */
/* global grecaptcha */

// globa namespace
if ( typeof window.snax === 'undefined' ) {
    window.snax = {};
}

/********
 *
 * Core
 *
 *******/

(function ($, ctx) {

    'use strict';

    /** VARS *************************/

    ctx.config = $.parseJSON(window.snax_front_config);

    if (!ctx.config) {
        throw 'Snax Error: Global config is not defined!';
    }

    /** FUNCTIONS ********************/

    ctx.log = function(msg) {
        if (typeof console !== 'undefined') {
            console.log(msg);
        }
    };

    ctx.inDebugMode = function() {
        return (typeof ctx.config.debug_mode !== 'undefined' && ctx.config.debug_mode);
    };

    ctx.isTouchDevice = function () {
        return ('ontouchstart' in window) || navigator.msMaxTouchPoints;
    };

    ctx.createCookie =  function (name, value, hours) {
        var expires;

        if (hours) {
            var date = new Date();
            date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        else {
            expires = '';
        }

        document.cookie = name.concat('=', value, expires, '; path=/');
    };

    ctx.readCookie = function (name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');

        for(var i = 0; i < ca.length; i += 1) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1,c.length);
            }

            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length,c.length);
            }
        }

        return null;
    };

    ctx.deleteCookie = function (name) {
        ctx.createCookie(name, '', -1);
    };

    ctx.getUrlParameter = function (param) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === param) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
    }
};

})(jQuery, snax);


/***********
 *
 * Helpers
 *
 ***********/

(function ($, ctx) {

    /* Media Item Class (image, audio, video) */

    ctx.MediaItem = function (data) {
        // Public scope.
        var instance = {};

        // Constructor.
        function init() {
            data = data || {};

            data = $.extend({
                'type':         'image',
                'title':        '',
                'source':       '',
                'refLink':      '',
                'description':  '',
                'mediaId':      '',
                'postId':       0,
                'authorId':     '',
                'status':       '',
                'parentFormat': 'list',
                'origin':       'post',
                'legal':        false,
                'memeTemplate': ''
            }, data);

            return instance;
        }

        instance.save = function(callback) {
            callback = callback || function() {};

            var ajaxData = {
                'action':               'snax_add_media_item',
                'security':             $('input[name=snax-add-media-item-nonce]').val(),
                'snax_title':           data.title,
                'snax_source':          data.source,
                'snax_ref_link':        data.refLink,
                'snax_description':     data.description,
                'snax_media_id':        data.mediaId,
                'snax_post_id':         data.postId,
                'snax_author_id':       data.authorId,
                'snax_status':          data.status,
                'snax_parent_format':   data.parentFormat,
                'snax_origin':          data.origin,
                'snax_legal':           data.legal ? 'accepted' : '',
                'snax_type':            data.type,
                'snax_meme_template':   data.memeTemplate
            };

            if (typeof ctx.saveItemImageDataFilter === 'function') {
                ajaxData = ctx.saveItemImageDataFilter(ajaxData, data);
            }

            var xhr = $.ajax({
                'type': 'POST',
                'url': ctx.config.ajax_url,
                'dataType': 'json',
                'data': ajaxData
            });

            xhr.done(function (res) {
                 callback(res);
            });
        };

        return init();
    };

    /* Embed Item Class */

    ctx.EmbedItem = function (data) {
        // Public scope.
        var instance = {};

        // Constructor.
        function init() {
            data = data || {};

            data = $.extend({
                'type':         'embed',
                'title':        '',
                'source':       '',
                'refLink':      '',
                'description':  '',
                'embedCode':    '',
                'postId':       0,
                'authorId':     '',
                'status':       '',
                'parentFormat': 'list',
                'origin':       'post',
                'legal':        false
            }, data);

            return instance;
        }

        instance.save = function(callback) {
            callback = callback || function() {};

            var ajaxData = {
                'action':               'snax_add_embed_item',
                'security':             $('input[name=snax-add-embed-item-nonce]').val(),
                'snax_title':           data.title,
                'snax_source':          data.source,
                'snax_ref_link':        data.refLink,
                'snax_embed_code':      data.embedCode,
                'snax_description':     data.description,
                'snax_post_id':         data.postId,
                'snax_author_id':       data.authorId,
                'snax_status':          data.status,
                'snax_parent_format':   data.parentFormat,
                'snax_origin':          data.origin,
                'snax_legal':           data.legal ? 'accepted' : ''
            };

            if (typeof ctx.saveItemEmbedDataFilter === 'function') {
                ajaxData = ctx.saveItemEmbedDataFilter(ajaxData, data);
            }

            var xhr = $.ajax({
                'type': 'POST',
                'url': ctx.config.ajax_url,
                'dataType': 'json',
                'data': ajaxData
            });

            xhr.done(function (res) {
                callback(res);
            });
        };

        return init();
    };

    /* Embed Item Class */

    ctx.TextItem = function (data) {
        // Public scope.
        var instance = {};

        // Constructor.
        function init() {
            data = data || {};

            data = $.extend({
                'type':         'text',
                'title':        '',
                'refLink':      '',
                'description':  '',
                'postId':       0,
                'authorId':     '',
                'status':       '',
                'parentFormat': 'list',
                'origin':       'post',
                'legal':        false
            }, data);

            return instance;
        }

        instance.save = function(callback) {
            callback = callback || function() {};

            var ajaxData = {
                'action':               'snax_add_text_item',
                'security':             $('input[name=snax-add-text-item-nonce]').val(),
                'snax_title':           data.title,
                'snax_ref_link':        data.refLink,
                'snax_description':     data.description,
                'snax_post_id':         data.postId,
                'snax_author_id':       data.authorId,
                'snax_status':          data.status,
                'snax_parent_format':   data.parentFormat,
                'snax_origin':          data.origin,
                'snax_legal':           data.legal ? 'accepted' : ''
            };

            if (typeof ctx.saveItemTextDataFilter === 'function') {
                ajaxData = ctx.saveItemTextDataFilter(ajaxData, data);
            }

            var xhr = $.ajax({
                'type': 'POST',
                'url': ctx.config.ajax_url,
                'dataType': 'json',
                'data': ajaxData
            });

            xhr.done(function (res) {
                callback(res);
            });
        };

        return init();
    };

    ctx.deleteItem = function($link, callback) {
        callback = callback || function() {};

        var nonce       = $.trim($link.attr('data-snax-nonce'));
        var itemId      = parseInt($link.attr('data-snax-item-id'), 10);
        var userId      = snax.currentUserId;

        var xhr = $.ajax({
            'type': 'POST',
            'url': ctx.config.ajax_url,
            'dataType': 'json',
            'data': {
                'action':               'snax_delete_item',
                'security':             nonce,
                'snax_item_id':         itemId,
                'snax_user_id':         userId
            }
        });

        xhr.done(function (res) {
            callback(res);
        });
    };

    ctx.setItemAsFeatured = function($link, callback) {
        callback = callback || function() {};

        var nonce       = $.trim($link.attr('data-snax-nonce'));
        var itemId      = parseInt($link.attr('data-snax-item-id'), 10);
        var userId      = snax.currentUserId;

        var xhr = $.ajax({
            'type': 'POST',
            'url': ctx.config.ajax_url,
            'dataType': 'json',
            'data': {
                'action':               'snax_set_item_as_featured',
                'security':             nonce,
                'snax_item_id':         itemId,
                'snax_user_id':         userId
            }
        });

        xhr.done(function (res) {
            callback(res);
        });
    };

    ctx.updateItems = function(items, callback) {
        callback = callback || function() {};

        var xhr = $.ajax({
            'type': 'POST',
            'url': ctx.config.ajax_url,
            'dataType': 'json',
            'data': {
                'action':           'snax_update_items',
                'security':         $('input[name=snax-frontend-submission-nonce]').val(),
                'snax_items':       items
            }
        });

        xhr.done(function (res) {
            callback(res);
        });
    };

    ctx.loginRequired = function(blocked) {
        $('body').trigger('snaxLoginRequired', [blocked]);
    };

    ctx.getMediaHtmlTag = function(data, callback) {
        var xhr = $.ajax({
            'type': 'GET',
            'url': ctx.config.ajax_url,
            'dataType': 'json',
            'data': {
                'action':           'snax_load_media_tpl',
                'snax_media_id':    data.mediaId,
                'snax_post_id':     data.postId,
                'snax_type':        data.type
            }
        });

        xhr.done(function (res) {
            callback(res);
        });
    };

    ctx.deleteMedia = function(data, callback) {
        callback = callback || function() {};

        var xhr = $.ajax({
            'type': 'POST',
            'url': ctx.config.ajax_url,
            'dataType': 'json',
            'data': {
                'action':           'snax_delete_media',
                'security':         $('input[name=snax-delete-media-nonce]').val(),
                'snax_media_id':    data.mediaId,
                'snax_author_id':   data.authorId
            }
        });

        xhr.done(function (res) {
            callback(res);
        });
    };

    ctx.updateMediaMetadata = function(data, callback) {
        callback = callback || function() {};

        var xhr = $.ajax({
            'type': 'POST',
            'url': ctx.config.ajax_url,
            'dataType': 'json',
            'data': {
                'action':               'snax_update_media_meta',
                // @todo - use separate nonce or use generic one.
                'security':             $('input[name=snax-delete-media-nonce]').val(),
                'snax_media_id':        data.mediaId,
                'snax_parent_format':   data.parentFormat
            }
        });

        xhr.done(function (res) {
            callback(res);
        });
    };

    ctx.getEmbedPreview = function(embed_code, callback) {
        var xhr = $.ajax({
            'type': 'POST',
            'url': ctx.config.ajax_url,
            'dataType': 'json',
            'data': {
                'action':           'snax_load_embed_tpl',
                'snax_embed_code':  embed_code
            }
        });

        xhr.done(function (res) {
            callback(res);
        });
    };

    ctx.displayFeedback = function(type) {
        var feedbackTypeClass = 'snax-feedback-' + type;

        // Try to get type specific feedback first.
        var $feedback = $('.' + feedbackTypeClass);

        if ($feedback.length === 0) {
            return;
        }

        ctx.hideFeedback();

        // Activate.
        $feedback.toggleClass('snax-feedback-off snax-feedback-on');

        // Show.
        $('body').addClass('snax-show-feedback');
    };

    ctx.hideFeedback = function() {
        // Deactivate all.
        $('.snax-feedback-on').toggleClass('snax-feedback-on snax-feedback-off');

        // Hide all.
        $('body').removeClass('snax-show-feedback');
    };

    ctx.isValidUrl = function(url) {
        return url.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/);
    };

})(jQuery, snax);


/*********
 *
 * Common
 *
 *********/

(function ($, ctx) {

    'use strict';

    var selectors = {
        'feedbackCloseButton':  '.snax-close-button'
    };

    // fire
    $(document).ready(function () {

        /*
         * Close feedback button.
         */
        $(selectors.feedbackCloseButton).on('click', function(e) {
            e.preventDefault();

            snax.hideFeedback();
        });
    });

})(jQuery, snax);


/****************
 *
 * Facebook SDK
 *
 ****************/

(function ($, ctx) {

    'use strict';

    ctx.resetFacebookSDK = function () {
        $('script#facebook-jssdk').remove();
        $('#fb-root').remove();
        if (window.FB) {
            delete window.FB;
        }
    };

    $('body').on( 'snaxBeforeNewContentReady', function ( e, $newContent ) {
        if ($newContent.find('.fb-video')) {
            ctx.resetFacebookSDK();
        }
    } );

})(jQuery, snax);

/****************************
 *
 * Module: Media upload form
 *
 ***************************/

(function ($, ctx) {

    'use strict';

    var selectors = {
        'form':                 '.snax-media-upload-form',
        'pluploadForm':          '.snax-plupload-upload-ui',
        'loadFormButton':       '.snax-load-form-button'
    };

    ctx.mediaUploadForm = function () {
        if (typeof snaxPlupload === 'undefined') {
            return;
        }

        $(selectors.form).each(function() {
            snaxPlupload.initUploader($(this));
        });

        $(selectors.loadFormButton).on('click',function() {
            var $link = $(this);
            var $form = $link.parents(selectors.form);
            var formClass = $link.attr('data-snax-rel-class');

            $form.find('.' + formClass).toggle();

            var $pluploadForm = $form.find(selectors.pluploadForm);

            $pluploadForm.toggle();

            if ($pluploadForm.is(':visible')) {
                $form.removeClass('snax-custom-form');
            } else {
                $form.addClass('snax-custom-form');
            }
        });
    };

    // fire
    $(document).ready(function () {
        ctx.mediaUploadForm();
    });

})(jQuery, snax);


/*************************
 *
 * Module: Date > Time ago
 *
 *************************/

(function ($, ctx) {

    'use strict';

    var selectors = {
        'wrapper':      '.snax-time-left',
        'dateWrapper':  '> .snax-date-wrapper',
        'date':         '> .snax-date',
        'timeWrapper':  '> .snax-time-wrapper',
        'time':         '> .snax-time'
    };

    ctx.timeagoSelectors = selectors;

    ctx.dateConstans = {
        'day_ms':   1000 * 60 * 60 * 24,
        'month_ms': 1000 * 60 * 60 * 24 * 30,
        'year_ms':  1000 * 60 * 60 * 24 * 356
    };

    ctx.dateToTimeago = function () {
        if (!$.fn.timeago) {
            return;
        }

        // store current settings, thanks to $.extend we have a copy without reference to original object
        var origSettings = $.extend(true, {} , $.timeago.settings);

        // override
        $.extend($.timeago.settings, {
            cutoff: ctx.dateConstans.year_ms,
            allowFuture: true
        });

        $.extend($.timeago.settings.strings, {
            suffixFromNow: ''
        });

        // apply
        $(selectors.wrapper).each(function () {
            var $wrapper        = $(this);
            var $dateWrapper    = $wrapper.find(selectors.dateWrapper);
            var $date           = $dateWrapper.find(selectors.date);
            var $timeWrapper    = $wrapper.find(selectors.timeWrapper);
            var $time           = $timeWrapper.find(selectors.time);

            var timeLeftText = $.timeago($date.text());

            $time.text(timeLeftText);

            $dateWrapper.removeClass( '.snax-date-wrapper-unfriendly' );
            $timeWrapper.removeClass( 'snax-time-wrapper-unfriendly' );
        });

        // restore
        $.timeago.settings = origSettings;
    };

    // fire
    $(document).ready(function () {
        ctx.dateToTimeago();
    });

})(jQuery, snax);


/**************************
 *
 * Module: Upvote/Downvote
 *
 *************************/

(function ($, ctx) {

    'use strict';

    var locked = false;

    var selectors = {
        'wrapper':      '.snax-voting',
        'upvoteLink':   '.snax-voting-upvote',
        'downvoteLink': '.snax-voting-downvote',
        'guestVoting':  '.snax-guest-voting',
        'voted':        '.snax-user-voted',
        'scoreWrapper': '.snax-voting-score',
        'scoreValue':   '.snax-voting-score strong'
    };

    var classes = {
        'voted':        'snax-user-voted'
    };

    ctx.votesSelectors  = selectors;
    ctx.votesClasses    = classes;

    ctx.votes = function () {
        // Catch event on wrapper to keep it working after box content reloading
        $('body').on('click', selectors.upvoteLink + ', ' + selectors.downvoteLink, function (e) {
            e.preventDefault();

            if (locked) {
                return;
            }

            locked = true;

            var $link       = $(e.target);
            var voteType    = $link.is(selectors.upvoteLink) ? 'upvote' : 'downvote';
            var $wrapper    = $link.parents(selectors.wrapper);
            var nonce       = $.trim($link.attr('data-snax-nonce'));
            var itemId      = parseInt($link.attr('data-snax-item-id'), 10);
            var authorId    = parseInt($link.attr('data-snax-author-id'), 10);

            ctx.vote({
                'itemId':   itemId,
                'authorId': authorId,
                'type':     voteType
            }, nonce, $wrapper);
        });

        // Iterate over all voting boxes and update them based on cookie states.
        $(selectors.wrapper).each(function () {
            var $this   = $(this);
            var id      = parseInt($this.attr('data-snax-item-id'), 10);

            if (id <= 0) {
                return;
            }

            var typeCookie  = 'snax_vote_type_' + id;
            var scoreCookie = 'snax_vote_score_' + id;

            var type  = ctx.readCookie(typeCookie);
            var score = ctx.readCookie(scoreCookie);

            if (!type && !score) {
                return;
            }

            if (score) {
                ctx.updateVoteScore($this.find(selectors.scoreWrapper), score);
            }

            if (type) {
                var $upVoteLink     = $this.find(selectors.upvoteLink);
                var $downVoteLink   = $this.find(selectors.downvoteLink);

                if ('upvote' === type) {
                    $upVoteLink.addClass(classes.voted);
                    $downVoteLink.removeClass(classes.voted);
                } else {
                    $downVoteLink.addClass(classes.voted);
                    $upVoteLink.removeClass(classes.voted);
                }
            }
        });
    };

    ctx.vote = function (data, nonce, $box) {
        var config = $.parseJSON(window.snax_front_config);
        if ( $box.find('.snax-login-required').length > 0 ){
            return;
        }

        if (!config) {
            ctx.log('Item voting failed. Global config is not defined!');
            return;
        }

        /*
         * Apply new voting box state before ajax response.
         */
        var $userVoted      = $box.find('.snax-user-voted');
        var userUpvoted     = $userVoted.length > 0 && $userVoted.is('.snax-voting-upvote');
        var userDownvoted   = $userVoted.length > 0 && $userVoted.is('.snax-voting-downvote');
        var $score          = $box.find('.snax-voting-score > strong');
        var score           = parseInt($score.text(), 10);
        var diff            = 'upvote' === data.type ? 1 : -1;

        // Remove all bubbles.
        $box.find('.snax-voting-bubble').remove();

        // User reverted his vote.
        if (userUpvoted && 'upvote' === data.type || userDownvoted && 'downvote' === data.type) {
            diff *= -1;

            $box.find('.snax-user-voted').removeClass('snax-user-voted');

            if ( 'upvote' === data.type ) {
                $box.find('.snax-voting-upvote').append('<span class="snax-voting-bubble snax-voting-bubble-minus-back">-1</span>');
            } else {
                $box.find('.snax-voting-downvote').append('<span class="snax-voting-bubble snax-voting-bubble-plus-back">+1</span>');
            }

        // User voted opposite.
        } else if (userUpvoted && 'downvote' === data.type || userDownvoted && 'upvote' === data.type) {
            diff *= 2;

            $box.find('.snax-user-voted').removeClass('snax-user-voted');
            $box.find('.snax-voting-' + data.type).addClass('snax-user-voted');

            if ( 'upvote' === data.type ) {
                $box.find('.snax-voting-upvote').append('<span class="snax-voting-bubble snax-voting-bubble-plus">+2</span>');
            } else {
                $box.find('.snax-voting-downvote').append('<span class="snax-voting-bubble snax-voting-bubble-minus">-2</span>');
            }
        // User added new vote.
        } else {
            if ( 'upvote' === data.type ) {
                $box.find('.snax-voting-upvote').addClass('snax-user-voted').append('<span class="snax-voting-bubble snax-voting-bubble-plus">+1</span>');
            } else {
                $box.find('.snax-voting-downvote').addClass('snax-user-voted').append('<span class="snax-voting-bubble snax-voting-bubble-minus">-1</span>');
            }
        }

        // Update score.
        ctx.updateVoteScore($box.find(selectors.scoreWrapper), score + diff);

        // Send ajax.
        var xhr = $.ajax({
            'type': 'POST',
            'url': config.ajax_url,
            'dataType': 'json',
            'data': {
                'action':           'snax_vote_item',
                'security':         nonce,
                'snax_item_id':     data.itemId,
                'snax_author_id':   data.authorId,
                'snax_vote_type':   data.type,
                'snax_user_voted':  ctx.readCookie( 'snax_vote_type_' + data.itemId )
            }
        });

        // Update state immediately after sending ajax. Don't wait for response.
        ctx.updateVoteState(data.itemId, data.type, $box);

        xhr.done(function (res) {
            locked = false;
        });
    };

    ctx.updateVoteState = function(itemId, type, $box) {
        var typeCookie  = 'snax_vote_type_' + itemId;
        var scoreCookie = 'snax_vote_score_' + itemId;

        var currentValue = ctx.readCookie(typeCookie);

        // Cookie can't be read immediately so we need to update CSS classes manually.
        $box.find(selectors.voted).removeClass(classes.voted);

        // User voted and now he wants to remove the vote.
        if (currentValue === type) {
            ctx.deleteCookie(typeCookie);
        } else {
            ctx.createCookie(typeCookie, type, 1);

            // Cookie can't be read immediately so we need to update CSS classes manually.
            $box.find('.snax-voting-' + type).addClass(classes.voted);
        }

        // Update score.
        var score = parseInt($box.find(selectors.scoreValue).text(), 10);

        ctx.createCookie(scoreCookie, score, 1);
    };

    ctx.updateVoteScore = function($wrapper, score) {
        var scoreHtml = '';
        var $container = $wrapper.parents('.snax-voting');

        // Singular?
        if (1 === Math.abs(score)) {
            scoreHtml = ctx.config.i18n.points_singular_tpl.replace('%d', score);
        } else {
            scoreHtml = ctx.config.i18n.points_plural_tpl.replace('%d', score);
        }

        // Remove all score related classes.
        $container.removeClass('snax-voting-0 snax-voting-negative snax-voting-positive');

        // Add score related classes.
        if (0 < score) {
            $container.addClass( 'snax-voting-positive' );
        } else if (0 > score) {
            $container.addClass( 'snax-voting-negative' );
        } else {
            $container.addClass( 'snax-voting-0' );
        }

        $wrapper.html(scoreHtml);
    };

    // fire
    $(document).ready(function () {
        ctx.votes();
    });

})(jQuery, snax);

/*********************
 *
 * Module: Login form
 *
 ********************/

(function ($, ctx) {

    'use strict';

    var selectors = {
        'loginTab':             '.snax-login-tab',
        'loginFormWrapper':     '.snax-login-form',
        'loginForm':            '.snax-login-form #loginform-in-popup',
        'forgotTab':            '.snax-forgot-pass-tab',
        'forgotFormWrapper':    '.snax-forgot-pass-form',
        'forgotForm':           '.snax-forgot-pass-form #lostpasswordform',
        'gdprTab':              '.snax-gdpr-tab',
        'backToLoginTab':       '.snax-back-to-login-tab',
        'loginErrorMessage':    '.snax-login-form .snax-login-error-message',
        'forgotErrorMessage':   '.snax-forgot-pass-form .snax-forgot-pass-error-message',
        'forgotSuccessMessage': '.snax-forgot-pass-form .snax-forgot-pass-success-message',
        'user': {
            'loginInput':       '#user_login',
            'emailInput':       '#user_email',
            'passwordInput':    '#user_pass'
        },
        'forgotPasswordLink':   '#snax-popup-content .snax-link-forgot-pass',
        'passwordWrapper':      '#snax-popup-content .login-password',
        'connectWithLabel':     '#snax-popup-content .wp-social-login-connect-with',
        'resetTab':             '.snax-reset-tab'
    };

    ctx.loginFormSelectors = selectors;

    var useReCaptcha;
    var reCaptchaToken;
    var urlAction = ctx.getUrlParameter(ctx.config.login_popup_url_var);

    ctx.loginForm = function () {
        useReCaptcha = ctx.config.use_login_recaptcha;

        // Add input placeholders.
        $.each(selectors.user, function (id, selector) {
            var $input = $(selector);
            var $label = $input.prev('label');

            if ($label.length > 0) {
                $input.attr('placeholder', $label.text());
            }
        });

        // Move forgot link after password field.
        $(selectors.passwordWrapper + ' input').after( $(selectors.forgotPasswordLink) );

        // Wrap label with <h4> tag.
        $(selectors.connectWithLabel).wrapInner( '<h4>' );

        $('.wp-social-login-provider').on('click', function(e) {
            var $that = $(this);
            if ($('.snax-wpsl-gdpr-consent input').length > 0) {
                console.log($('.snax-wpsl-gdpr-consent input').is(':checked'));
                if (!$('.snax-wpsl-gdpr-consent input').is(':checked')) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    handleLoginGDPR($that);
                }
            }
        });

        handleLoginAction();
        handleForgotPassAction();
        handleTabsSwitch();

        if (urlAction==='reset_password'){
            $(selectors.loginTab).removeClass('snax-tab-active').addClass('snax-tab-inactive');
            $(selectors.resetTab).removeClass('snax-tab-inactive').addClass('snax-tab-active');
        }

        if (urlAction==='forgot_password'){
            $(selectors.loginTab).removeClass('snax-tab-active').addClass('snax-tab-inactive');
            $(selectors.forgotTab).removeClass('snax-tab-inactive').addClass('snax-tab-active');
        }

        $('body').on('snaxPopupOpened', function(e, action) {
            if (useReCaptcha && 'login' === action) {
                loadReCaptcha();
            }
        });
    };

    var handleLoginGDPR = function($clickedProvider) {
        $(selectors.loginTab).removeClass('snax-tab-active').addClass('snax-tab-inactive');
        $(selectors.gdprTab).removeClass('snax-tab-inactive').addClass('snax-tab-active');
        $('.snax-login-gdpr-accept').on('click', function() {
            $('.snax-wpsl-gdpr-consent input').prop('checked', true);
            $(selectors.gdprTab).removeClass('snax-tab-active').addClass('snax-tab-inactive');
            $(selectors.loginTab).removeClass('snax-tab-inactive').addClass('snax-tab-active');
            var redirectTo = $clickedProvider.attr('href');
            window.location.href = redirectTo;
        });
    };

    var handleLoginAction = function() {
        $(selectors.loginForm).on('submit', function(e) {
            e.preventDefault();

            var $form = $(this);
            var $errorMessage = $(selectors.loginErrorMessage);

            var requestData = {
                'action':   'snax_login'
            };

            $.each($form.serializeArray(), function(i, field) {
                requestData[field.name] = field.value;
            });

            // Read config directly, DO NOT use any reference. We change the value while auto logging.
            if (ctx.config.use_login_recaptcha) {
                if (!reCaptchaToken) {
                    $errorMessage.html( '<p class="snax-validation-tip">' + ctx.config.i18n.recaptcha_invalid + '</p>');
                    return;
                }
            }

            // Clear error message.
            $errorMessage.html('<p>' + ctx.config.i18n.user_is_logging + '</p>');

            var xhr = $.ajax({
                'type':     'POST',
                'url':      ctx.config.ajax_url,
                'dataType': 'json',
                'data':     requestData
            });

            xhr.done(function (res) {
                if ('success' === res.status) {
                    var redirectTo = res.args.redirect_url;

                    if (!redirectTo) {
                        redirectTo = window.location.href;
                    }

                    if (redirectTo.indexOf('?') > 0){
                        redirectTo += '&' + ctx.config.login_success_var + '=true';
                    }else{
                        redirectTo += '?' + ctx.config.login_success_var + '=true';
                    }

                    window.location.href = redirectTo;
                } else {
                    if (res.message) {
                        $errorMessage.html( '<p class="snax-validation-tip">' + res.message + '</p>');
                    }

                    if (useReCaptcha) {
                        grecaptcha.reset();
                    }
                }
            });

            // Reload page if failed.
            xhr.fail(function() {
                var reloadUrl = window.location.href;

                if (reloadUrl.indexOf('?') > 0){
                    reloadUrl += '&' + ctx.config.login_success_var + '=false';
                }else{
                    reloadUrl += '?' + ctx.config.login_success_var + '=false';
                }

                window.location.href = reloadUrl;
            });
        });
    };

    var handleForgotPassAction = function() {
        $(selectors.forgotForm).on('submit', function(e) {
            e.preventDefault();

            var $form = $(this);
            var $errorMessage = $(selectors.forgotErrorMessage);
            var $successMessage = $(selectors.forgotSuccessMessage);

            var requestData = {
                'action':   'snax_forgot_pass'
            };

            $.each($form.serializeArray(), function(i, field) {
                requestData[field.name] = field.value;
            });

            // Clear messages.
            $errorMessage.text('');
            $successMessage.text('');

            var xhr = $.ajax({
                'type':     'POST',
                'url':      ctx.config.ajax_url,
                'dataType': 'json',
                'data':     requestData
            });

            xhr.done(function (res) {
                if ('success' === res.status) {
                    if (res.message) {
                        $successMessage.html( '<p class="snax-validation-tip">' + res.message + '</p>');
                    }
                } else {
                    if (res.message) {
                        $errorMessage.html( '<p class="snax-validation-tip">' + res.message + '</p>');
                    }
                }
            });
        });
    };

    var handleTabsSwitch = function() {
        $(selectors.forgotPasswordLink).on('click', function(e) {
            e.preventDefault();

            $(selectors.loginTab).removeClass('snax-tab-active').addClass('snax-tab-inactive');
            $(selectors.forgotTab).removeClass('snax-tab-inactive').addClass('snax-tab-active');
        });

        $(selectors.backToLoginTab).on('click', function(e) {
            e.preventDefault();

            $(selectors.resetTab).removeClass('snax-tab-active').addClass('snax-tab-inactive');
            $(selectors.forgotTab).removeClass('snax-tab-active').addClass('snax-tab-inactive');
            $(selectors.loginTab).removeClass('snax-tab-inactive').addClass('snax-tab-active');
        });
    };

    var loadReCaptcha = function() {
        var apiUrl  = ctx.config.recaptcha_api_url;
        var ver     = ctx.config.recaptcha_version;
        var siteKey = ctx.config.recaptcha_site_key;

        if (!siteKey || !apiUrl) {
            return;
        }

        var renderLoginReCaptcha = function() {
            if ('30' === ver) {
                grecaptcha.execute(
                    siteKey,
                    { action: 'login' }
                ).then( function( token ) {
                    $('#snax-login-recaptcha').html('<input type="hidden" name="g-recaptcha-response" value="'+ token +'">');
                    reCaptchaEnteredCorrectly(token);
                } );
            } else {
                grecaptcha.render('snax-login-recaptcha', {
                    'sitekey' : siteKey,
                    'callback': reCaptchaEnteredCorrectly
                });
            }
        };

        // Google reCaptcha API loaded.
        if (typeof grecaptcha !== 'undefined') {
            renderLoginReCaptcha();
        } else {
            // API not loaded. Register callback and load script.
            window.snaxReCaptchaOnloadCallback = function() {
                renderLoginReCaptcha();
            };

            if ('30' === ver) {
                $('head').append('<script src="' + apiUrl + '?onload=snaxReCaptchaOnloadCallback&render='+siteKey+'" async defer>');
            } else {
                $('head').append('<script src="' + apiUrl + '?onload=snaxReCaptchaOnloadCallback&render=explicit" async defer>');
            }
        }
    };

    var reCaptchaEnteredCorrectly = function(response) {
        reCaptchaToken = response;
    };

    // Fire.
    $(document).ready(function () {
        ctx.loginForm();
    });

})(jQuery, snax);

/****************
 *
 * Module: Popup
 *
 ****************/

(function ($, ctx) {

    'use strict';

    var selectors = {
        'popupContent':     '#snax-popup-content',
        'loginRequired':    '.snax-login-required',
        'usernameField':    '#user_login'
    };

    ctx.popupSelectors = selectors;

    ctx.popup = function () {
        if (!$.fn.magnificPopup) {
            return;
        }

        $(selectors.loginRequired).click(function (e) {
            e.preventDefault();

            var $content = $(selectors.popupContent);

            ctx.openPopup($content, {}, 'login');

            // Delay till popup opens.
            setTimeout(function() {
                $content.find(selectors.usernameField).focus();
            }, 100);
        });

        $('body').on('snaxLoginRequired', function(e, blocked) {
            blocked = blocked || false;

            var $content = $(selectors.popupContent);

            ctx.openPopup($content, {
                'closeOnBgClick': blocked
            }, 'login');

            // Delay till popup opens.
            setTimeout(function() {
                $content.find(selectors.usernameField).focus();
            }, 100);

            // Prevent default close action to not show page under the overlay when redirecting.
            if (blocked) {
                $.magnificPopup.instance.close = function() {
                    window.location.href = ctx.config.site_url;
                };
            }
        });
    };

    ctx.openPopup = function ($content, args, action) {
        if (!$.fn.magnificPopup) {
            return;
        }

        args = args || {};

        args.items = {
            src: $content,
            type: 'inline'
        };

        args.callbacks = {
            'open': function () {
                $('body').trigger('snaxPopupOpened', [ action ]);
            }
        };

        $.magnificPopup.open(args);
    };

    ctx.closePopup = function () {
        if (!$.fn.magnificPopup) {
            return;
        }

        $.magnificPopup.close();
    };

    ctx.redirectToLogin = function () {
        $(selectors.loginRequired).click(function (e) {
            window.location.href = ctx.config.login_url;
        });

        if (ctx.forceLoginPopup) {
            window.location.href = ctx.config.login_url;
        }

        $('body').on('snaxLoginRequired', function(e) {
            window.location.href = ctx.config.login_url;
        });

        if (ctx.getUrlParameter(ctx.config.login_popup_url_var)){
            window.location.href = ctx.config.login_url;
        }
    };

    // fire
    $(document).ready(function () {
        if (ctx.config.enable_login_popup) {
            ctx.popup();

            if (ctx.getUrlParameter(ctx.config.login_popup_url_var) && !ctx.config.logged_in){
                ctx.loginRequired();
            }

            if (ctx.forceLoginPopup) {
                ctx.loginRequired(ctx.forceLoginPopup.blocked);
            }
        } else {
            ctx.redirectToLogin();
        }
    });

})(jQuery, snax);


/*************************
 *
 * Module: Actions Menu
 *
 ************************/

(function ($, ctx) {

    'use strict';

    var selectors = {
        'actions' :         '.snax-actions',
        'actionsToggle':    '.snax-actions-toggle',
        'actionsExpanded':  '.snax-actions-expanded'
    };

    var classes = {
        'expanded': 'snax-actions-expanded'
    };

    ctx.actionsMenuSelectors = selectors;
    ctx.actionsMenuClasses = classes;

    ctx.actionsMenu = function () {
        var $body = $('body');

        $('body').on('click', selectors.actionsToggle, function(e) {
            e.preventDefault();

            var $toggle = $(e.target);

            $toggle.parents(selectors.actions).toggleClass(classes.expanded);
        });

        // Hide on focus out.
        $body.on('click touchstart', function (e) {
            var $activeMenu = $(e.target).parents(selectors.actions);

            // Collapse all expanded menus except active one.
            $(selectors.actionsExpanded).not($activeMenu).removeClass(classes.expanded);
        });
    };

    // Fire.
    $(document).ready(function () {
        ctx.actionsMenu();
    });

})(jQuery, snax);


/*************************
 *
 * Module: Item Share
 *
 ************************/

(function ($, ctx) {

    'use strict';

    var selectors = {
        'wrapper' :         '.snax-item-share',
        'toggle':           '.snax-item-share-toggle',
        'expandedState':    '.snax-item-share-expanded'
    };

    var classes = {
        'expanded': 'snax-item-share-expanded'
    };

    ctx.itemShareSelectors = selectors;
    ctx.itemShareClasses   = classes;

    ctx.itemShare = function () {
        // On none touchable devices, shares visibility is handled via css :hover.
        // On touch devices there is no "hover", so we emulate hover via CSS class toggle on click.
        $(selectors.toggle).on('click  touchstart', function (e) {
            e.preventDefault();

            $(this).parents(selectors.wrapper).addClass(classes.expanded);
        });

        // Hide shares on focus out.
        $('body').on('click touchstart', function (e) {
            var $activeElem = $(e.target).parents(selectors.expandedState);

            // Collapse all expanded micro shares except active one.
            $(selectors.expandedState).not($activeElem).removeClass(classes.expanded);
        });

        $('.snax-share-twitter').on('click', function (e) {
            e.preventDefault();
            window.open($(this).attr('href'), 'Google', 'width=500,height=300');
        });
        $('.snax-share-pinterest').on('click', function (e) {
            e.preventDefault();
            window.open($(this).attr('href'), 'Google', 'width=700,height=670');
        });
    };

    // Fire.
    $(document).ready(function () {
        if (ctx.isTouchDevice()) {
            $('body').removeClass('snax-hoverable');

        }

        ctx.itemShare();
    });

})(jQuery, snax);


/*************************
 *
 * Module: Delete Item
 *
 ************************/

(function ($, ctx) {

    'use strict';

    /** CONFIG *******************************************/

        // Register new component.
    ctx.deleteItemModule = {};

    // Component namespace shortcut.
    var c = ctx.deleteItemModule;

    // CSS selectors.
    var selectors = {
        'deleteLink':   '.snax-delete-item'
    };

    var i18n = {
        'confirm':      'Are you sure?'
    };

    // Allow accessing
    c.selectors = selectors;
    c.i18n      = i18n;

    /** INIT *******************************************/

    c.init = function () {
        c.attachEventHandlers();
    };

    /** EVENTS *****************************************/

    c.attachEventHandlers = function() {

        /* Delete item */

        $(selectors.deleteLink).on('click', function (e) {
            e.preventDefault();

            if (!confirm(i18n.confirm)) {
                return;
            }

            ctx.deleteItem($(this), function(res) {
                if (res.status === 'success') {
                    location.href = res.args.redirect_url;
                } else {
                    alert(res.message);
                }
            });
        });
    };

    // Fire.
    $(document).ready(function () {
        c.init();
    });

})(jQuery, snax);


/*******************************
 *
 * Module: Set Item as Featured
 *
 ******************************/

(function ($, ctx) {

    'use strict';

    /** CONFIG *******************************************/

    // Register new component.
    ctx.setItemAsFeaturedModule = {};

    // Component namespace shortcut.
    var c = ctx.setItemAsFeaturedModule;

    // CSS selectors.
    var selectors = {
        'link':   '.snax-set-item-as-featured'
    };

    // Allow accessing
    c.selectors = selectors;

    /** INIT *******************************************/

    c.init = function () {
        c.attachEventHandlers();
    };

    /** EVENTS *****************************************/

    c.attachEventHandlers = function() {

        /* Delete item */

        $(selectors.link).on('click', function (e) {
            e.preventDefault();

            ctx.setItemAsFeatured($(this), function(res) {
                if (res.status === 'success') {
                    location.reload();
                } else {
                    alert(res.message);
                }
            });
        });
    };

    // Fire.
    $(document).ready(function () {
        c.init();
    });

})(jQuery, snax);

/*******************************
 *
 * Module: Froala for items
 *
 ******************************/

(function ($, ctx) {

    'use strict';

    /** CONFIG *******************************************/

    // Register new component.
    ctx.froalaSimple = {};

    // Component namespace shortcut.
    var c = ctx.froalaSimple;

    // CSS selectors.
    var selectors = {
        'froalaEditor':   '.froala-editor-simple'
    };

    // Allow accessing
    c.selectors = selectors;

    /** INIT *******************************************/

    c.init = function () {
        c.attachEventHandlers();
        c.applyFroala();
    };

    /** EVENTS *****************************************/

    c.attachEventHandlers = function() {
        $( 'body' ).on( 'snaxNewCardAdded', function($card) {
            c.applyFroala();
        });
    };

    c.renderFroala = function() {
        var $textarea = $(this);
        var config = {
            'key':              'CMFIZJNKLDXIREJI==',
            'language':         c.getFroalaEditorConfig('language'),
            'heightMin':        200,
            // Toolbar buttons on large devices (≥ 1200px).
            'toolbarButtons':   ['bold', 'italic', 'insertLink', '|', 'undo', 'redo'],
            // On medium devices (≥ 992px).
            toolbarButtonsMD:   ['bold', 'italic', 'insertLink', '|', 'undo', 'redo'],
            // On small devices (≥ 768px).
            toolbarButtonsSM:   ['bold', 'italic', 'insertLink', '|', 'undo', 'redo'],
            // On extra small devices (< 768px).
            toolbarButtonsXS:   ['bold', 'italic', 'insertLink', '|', 'undo', 'redo'],
            charCounterMax:     c.getFroalaEditorMaxCharacters($textarea)
        };
        // Override Froala's config using this filter function.
        if (typeof c.froalaEditorConfig === 'function') {
            config = c.froalaEditorConfig(config);
        }
        if (snax.inDebugMode()) {
            snax.log(config);
        }
        // Init.
        $textarea.froalaEditor(config);
    };

    c.getFroalaEditorConfig = function(id) {
        var config = c.config.froala;

        if (typeof config[id] !== 'undefined') {
            return config[id];
        }

        return null;
    };

    c.getFroalaEditorMaxCharacters = function($editor) {
        var maxCharacters = parseInt($editor.attr('maxlength'), 10);

        return maxCharacters > 0 ? maxCharacters : -1;
    };

    c.applyFroala = function () {

        // Check if Froals script is loaded.
        if (!$.fn.froalaEditor) {
            return;
        }
        $(selectors.froalaEditor).each(c.renderFroala);
    };

    // Fire.
    $(document).ready(function () {
        if (snax.frontendSubmission) {
            c.config = snax.frontendSubmission.config;
        }
        if (snax.post) {
            c.config = snax.post.config;
        }
        if (typeof c.config === 'undefined') {
            return;
        }
        c.init();
    });

})(jQuery, snax);

/*******************************
 *
 * Module: Single item comments
 *
 ******************************/

(function ($, ctx) {

    'use strict';

    /** CONFIG *******************************************/

    // Register new component.
    ctx.singleItemComments = {};

    // Component namespace shortcut.
    var c = ctx.singleItemComments;

    var seeMoreHtml = '<a class="snax-see-all-replies">' + ctx.config.i18n.see_all_replies + '</a>';

    // CSS selectors.
    var selectors = {
        'section':              '.snax-item-comments',
        'topLevelComment':      '.snax-item-comments .depth-1',
        'moreCommentsLink':     '.snax-item-comments-more-link',
        'allRepliesLink':       '.snax-see-all-replies',
        'list':                 '.comment-list',
        'commentForm':          '.snax-item-comments .comment-form',
        'textarea':             '.snax-item-comments .comment-form textarea',
        'submitButton':         '.submit',
        'cancelReply':          '#cancel-comment-reply-link',
        'respondSection':       '#respond',
        'replyLogin':           '.comment-reply-login',
        'respondLogin':         '.snax-comment-login',
        'authorFields':         '.snax-item-comment-autor',
    };

     var $spinner = $('<div class="snax-upload-icon"></div>');

    // Allow accessing
    c.selectors = selectors;

    /** INIT *******************************************/

    c.init = function () {
        $(selectors.submitButton, selectors.commentForm).attr('disabled', true);
        c.renderSeeMore();
        c.attachEventHandlers();
    };

    /** EVENTS *****************************************/

    c.renderSeeMore = function() {
        $(selectors.topLevelComment).each(function( index ) {
            if($('.children li', this).length>1 && $(this).attr('appendedSeeMoreLink')!== 'true'){
               $(this).append(seeMoreHtml);
               $(this).attr('appendedSeeMoreLink','true');
            }
        });
        $(selectors.allRepliesLink).on('click', function (e) {
            var $parent         = $(this).closest(selectors.topLevelComment);
            $('.children', $parent).addClass('children-visible');
            $(this).remove();
        });
    };

    //overrides core comment-reply.js to handle multiple forms
    c.overrideDefaultHandler = function() {
        if (typeof addComment === 'undefined') {
            return;
        }
        addComment = {
            moveForm: function( commId, parentId, respondId, postId ) {
                var div, element, style, cssHidden,
                    t           = this,
                    comm        = t.I( commId ),
                    respond     = t.I( respondId ),
                    cancel      = respond.querySelector( '#cancel-comment-reply-link' ),
                    parent      = respond.querySelector( '#comment_parent' ),
                    post        = respond.querySelector( '#comment_post_ID' ),
                    commentForm = respond.getElementsByTagName( 'form' )[0];

                if ( ! comm || ! respond || ! cancel || ! parent || ! commentForm ) {
                    return;
                }

                t.respondId = respondId;
                postId = postId || false;

                if ( ! t.I( 'wp-temp-form-div' ) ) {
                    div = document.createElement( 'div' );
                    div.id = 'wp-temp-form-div';
                    div.style.display = 'none';
                    respond.parentNode.insertBefore( div, respond );
                }

                comm.parentNode.insertBefore( respond, comm.nextSibling );
                if ( post && postId ) {
                    post.value = postId;
                }
                parent.value = parentId;
                cancel.style.display = '';

                cancel.onclick = function() {
                    var t       = addComment,
                        temp    = t.I( 'wp-temp-form-div' ),
                        respond = t.I( t.respondId );

                    if ( ! temp || ! respond ) {
                        return;
                    }

                    parent.value = '0';
                    temp.parentNode.insertBefore( respond, temp );
                    temp.parentNode.removeChild( temp );
                    this.style.display = 'none';
                    this.onclick = null;
                    return false;
                };

                /*
                * Set initial focus to the first form focusable element.
                * Try/catch used just to avoid errors in IE 7- which return visibility
                * 'inherit' when the visibility value is inherited from an ancestor.
                */
                try {
                    for ( var i = 0; i < commentForm.elements.length; i++ ) {
                        element = commentForm.elements[i];
                        cssHidden = false;

                        // Modern browsers.
                        if ( 'getComputedStyle' in window ) {
                            style = window.getComputedStyle( element );
                        // IE 8.
                        } else if ( document.documentElement.currentStyle ) {
                            style = element.currentStyle;
                        }

                        /*
                        * For display none, do the same thing jQuery does. For visibility,
                        * check the element computed style since browsers are already doing
                        * the job for us. In fact, the visibility computed style is the actual
                        * computed value and already takes into account the element ancestors.
                        */
                        if ( ( element.offsetWidth <= 0 && element.offsetHeight <= 0 ) || style.visibility === 'hidden' ) {
                            cssHidden = true;
                        }

                        // Skip form elements that are hidden or disabled.
                        if ( 'hidden' === element.type || element.disabled || cssHidden ) {
                            continue;
                        }

                        element.focus();
                        // Stop after the first focusable element.
                        break;
                    }

                } catch( er ) {}

                return false;
            },

            I: function( id ) {
                return document.getElementById( id );
            }
        };
    };

    c.attachEventHandlers = function() {

        var loadMoreComments = function($section) {
            var $that           = $(selectors.moreCommentsLink, $section);
            var postId          = $section.attr('data-snax-post-id');
            var loadedPages     = parseInt($section.attr('data-snax-loaded-pages'),10);
            var $list    = $(selectors.list, $section);
            var requestData     = {
                'action':           'snax_load_more_item_comments',
                'snax_item_id':     postId,
                'loaded_pages':     loadedPages
            };

            $spinner.appendTo($list);

            var xhr = $.ajax({
                'type':     'POST',
                'url':      ctx.config.ajax_url,
                'dataType': 'json',
                'data':     requestData
            });

            xhr.done(function (res) {
                if ('success' === res.status) {
                    $spinner.remove();
                    if (res.args.html) {
                        $list.append(res.args.html);
                        removeDuplicateComments($list);
                        maybeRemoveSeeMoreLink($list,$that);
                        c.renderSeeMore();
                        $section.attr('data-snax-loaded-pages',loadedPages + 1);
                    }
                }
            });
        };

        var removeDuplicateComments = function($list){
            var seen = {};
            $(selectors.topLevelComment, $list).each(function( index ) {
                    var id = $(this).attr('id');
                    if (seen[id]) {
                        $(this).remove();
                    } else {
                         seen[id] = true;
                    }
            });
        };

        var maybeRemoveSeeMoreLink = function($list,$link){
            var topLevels = $('.depth-1', $list).length;
            var topLevelComments = parseInt( $list.attr('data-snax-top-level-comments'), 10 );
            if (topLevels >= topLevelComments){
                $link.remove();
            }
        };

        $(selectors.moreCommentsLink).on('click', function (e) {
            e.preventDefault();
            var $section         = $(this).closest(selectors.section);
            loadMoreComments($section);
        });

        $(selectors.commentForm).on('submit', function(e) {
            e.preventDefault();
            var $form           = $(this);
            var url             = $form.attr('action');
            var commentParent   = '0';
            var $textarea       = $('textarea', $form);
            var $section        = $form.closest(selectors.section);
            var $list           = $(selectors.list, $section);
            var $respondSection = $form.closest(selectors.respondSection);
            var $cancelButton   = $(selectors.cancelReply, $respondSection);
            var $submitButton   = $(selectors.submitButton, $form);
            var requestData = {};

            $.each($form.serializeArray(), function(i, field) {
                requestData[field.name] = field.value;
            });

            requestData['is_ajax_item_comment_form'] = true;
            commentParent = requestData['comment_parent'];

            if (commentParent === '0') {
                $spinner.prependTo($list);
            } else {
                var $commentParent = $('#comment-' + commentParent);
                var $commentParentChildren = $('#comment-' + commentParent + '> .children');
                if (! $commentParentChildren.length) {
                    $commentParent.append('<ul class="children"></ul>');
                    $commentParentChildren = $('#comment-' + commentParent + '> .children');
                }
                $spinner.prependTo($commentParentChildren);
            }

            var xhr = $.ajax({
                'type':     'POST',
                'url':      url,
                'data':     requestData
            });

            xhr.done(function (res) {
                $textarea.val('');
                $cancelButton.trigger('click');
                $submitButton.attr('disabled', true);
                if (res.indexOf('<body id="error-page">') != -1){
                    res = $(res).filter('p')[1];
                }
                $spinner.replaceWith(res);
                if (commentParent !== '0') {
                    var $parent         = $commentParentChildren.closest(selectors.topLevelComment);
                    $('.children', $parent).addClass('children-visible');
                }
            });

            xhr.fail(function( jqXHR, textStatus ) {
                if(jqXHR.status===409){
                    alert(ctx.config.i18n.duplicate_comment);
                }else{
                    alert(ctx.config.i18n.comment_fail);
                }
                $spinner.remove();
            });
        });

        var validateForm = function( $form ) {
            var $submitButton   = $(selectors.submitButton, $form);
            var $author         = $(selectors.authorFields, $form);
            var $input          = $('textarea', $form);
            var disable         = false;
            if ( $author.length > 0 ){
                var $authorName = $('#author', $author);
                var $authorMail = $('#email', $author);
                if ( $authorName.val() === '' || $authorMail.val() === '' ) {
                    disable = true;
                }
            }
            if ($input.val() === '') {
                    disable = true;
                }
            $submitButton.attr('disabled', disable);
        };

        $(selectors.textarea).keyup(function() {
            var $parent         = $(this).closest(selectors.commentForm);
            var $author         = $(selectors.authorFields, $parent);
            while($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css('borderTopWidth')) + parseFloat($(this).css('borderBottomWidth'))) {
                $(this).height($(this).height()+1);
            }
            if ($(this).val()){
                $author.show();
                $parent.removeClass('snax-comment-form-collapsed').addClass('snax-comment-form-extended');
            } else {
                $author.hide();
                $parent.removeClass('snax-comment-form-extended').addClass('snax-comment-form-collapsed');
            }
            validateForm($parent);
        });

        $(selectors.authorFields).keyup(function() {
            var $parent         = $(this).closest(selectors.commentForm);
            validateForm($parent);
        });

        $(selectors.replyLogin).click(function(e){
            e.preventDefault();
            ctx.loginRequired();
        });
        $(selectors.respondLogin).click(function(e){
            e.preventDefault();
            ctx.loginRequired();
        });
    };

    // Fire.
    $(document).ready(function () {
        c.init();
        c.overrideDefaultHandler();
    });

})(jQuery, snax);

/*******************************
 *
 * Module: Password Reset
 *
 ******************************/

(function ($, ctx) {

    'use strict';

    /** CONFIG *******************************************/

    // Register new component.
    ctx.passwordReset = {};

    // Component namespace shortcut.
    var c = ctx.passwordReset;

    // CSS selectors.
    var selectors = {
        'resetPasswordForm':   '#snax_reset_password_form',
        'newPassword':          '#snax_reset_password_form #new_password',
        'repeatPassword':       '#snax_reset_password_form #repeat_password',
        'cookieName':           '#snax_reset_password_form .rp-cookie-name',
        'cookieValue':          '#snax_reset_password_form .rp-cookie_value',
        'resetErrorMessage':   '#snax_reset_password_form  .snax-reset-pass-error-message',
        'resetSuccessMessage': '#snax_reset_password_form  .snax-reset-pass-success-message',
    };

    // Allow accessing
    c.selectors = selectors;

    /** INIT *******************************************/

    c.init = function () {
        c.attachEventHandlers();
    };

    /** EVENTS *****************************************/

    c.attachEventHandlers = function() {
        c.matchPasswords();
        c.handleForm();
    };

    c.matchPasswords = function() {
            var $newPassword    = $(selectors.newPassword),
                $repeatPassword = $(selectors.repeatPassword);

            $repeatPassword.on('change', function(e) {
                if ($newPassword.val() !== $repeatPassword.val()){
                    $repeatPassword.get(0).setCustomValidity( ctx.config.i18n.passwords_dont_match);
                } else {
                    $repeatPassword.get(0).setCustomValidity('');
                }
            });
    }

    c.handleForm = function() {
        var $form           = $(selectors.resetPasswordForm),
            $cookieName     = $(selectors.cookieName),
            $cookieValue    = $(selectors.cookieValue),
            $newPassword    = $(selectors.newPassword),
            $errorMessage   = $(selectors.resetErrorMessage),
            $successMessage = $(selectors.resetSuccessMessage);

        $form.on('submit', function(e) {

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            $errorMessage.text('');
            $successMessage.text('');

            ctx.createCookie($cookieName.val(), $cookieValue.val(), 24);

            var xhr = $.ajax({
                'type':     'POST',
                'url':      $form.attr('action') + '?action=resetpass',
                'data':     $form.serialize(),
            });

            xhr.done(function (res) {
                if ($('.reset-pass', res).length){
                    $successMessage.html( '<p class="snax-validation-tip">' + ctx.config.i18n.password_set + '</p>' );
                }
                if ($('#login_error', res).length){
                    $errorMessage.html( '<p class="snax-validation-tip">' + ctx.config.i18n.link_invalid + '</p>' );
                }
            });

            return false;
        });
    };

    // Fire.
    $(document).ready(function () {
        if ($(selectors.resetPasswordForm).length){
            c.init();
        }
    });

})(jQuery, snax);

/*******************************
 *
 * Module: BuddyPress registration captcha
 *
 ******************************/

(function ($, ctx) {

    'use strict';

    var useReCaptcha;
    var reCaptchaToken;

    ctx.registerForm = function () {
        useReCaptcha = ctx.config.use_login_recaptcha;
        if (useReCaptcha && $('#buddypress #register-page').length >0) {
            loadReCaptcha();
            $('#signup_submit').attr('disabled', true);
        }
    };

    var loadReCaptcha = function() {
        var apiUrl  = ctx.config.recaptcha_api_url;
        var ver     = ctx.config.recaptcha_version;
        var siteKey = ctx.config.recaptcha_site_key;

        if (!siteKey || !apiUrl) {
            return;
        }

        var renderLoginReCaptcha = function() {
            if ('30' === ver) {
                grecaptcha.execute(
                    siteKey,
                    { action: 'login' }
                ).then( function( token ) {
                        $('#snax-register-recaptcha').html('<input type="hidden" name="g-recaptcha-response" value="'+ token +'">');
                        reCaptchaEnteredCorrectly(token);
                    } );
            } else {
                grecaptcha.render('snax-register-recaptcha', {
                    'sitekey' : siteKey,
                    'callback': reCaptchaEnteredCorrectly
                });
            }
        };

        // Google reCaptcha API loaded.
        if (typeof grecaptcha !== 'undefined') {
            renderLoginReCaptcha();
        } else {
            // API not loaded. Register callback and load script.
            window.snaxReCaptchaOnloadCallback = function() {
                renderLoginReCaptcha();
            };

            if ('30' === ver) {
                $('head').append('<script src="' + apiUrl + '?onload=snaxReCaptchaOnloadCallback&render='+siteKey+'" async defer>');
            } else {
                $('head').append('<script src="' + apiUrl + '?onload=snaxReCaptchaOnloadCallback&render=explicit" async defer>');
            }
        }
    };

    var reCaptchaEnteredCorrectly = function(response) {
        reCaptchaToken = response;
        $('#signup_submit').attr('disabled', false);
    };

    // Fire.
    $(document).ready(function () {
        ctx.registerForm();
    });

})(jQuery, snax);

/*******************************
 *
 * Module: Notifications
 *
 ******************************/

(function ($, ctx) {

    'use strict';

    var api              = {};      // Public API.
    var timeout          = 5000;
    var $notifications   = false;
    var $notificationTpl = false;

    var selectors = {
        'notifications':    '.snax-notifications',
        'notification':     '.snax-notification',
        'notificationText': '.snax-notification-text',
        'notificationClose':'.snax-notification-close'
    };

    var classes = {
        'on':   'snax-notifications-on',
        'off':  'snax-notifications-off',
    };

    api.add = function(html) {
        var $notification = $notificationTpl.clone(true);
        $notification.find(selectors.notificationText).html(html);

        $notification.on('click', selectors.notificationClose, function() {
            api.remove($notification);
        });

        // Auto-remove.
        setTimeout(function() {
            api.remove($notification);
        }, timeout);

        $notifications.prepend($notification);
        $notifications.removeClass(classes.off).addClass(classes.on);
    };

    api.remove = function($notification) {
        $notification.addClass('snax-notification-removed');
        setTimeout(function() {
            $notification.remove();

            if (api.isQueueEmpty()) {
                $notifications.removeClass(classes.on).addClass(classes.off);
            }
        }, 5000);
    };

    api.isQueueEmpty = function() {
        return $notifications.find(selectors.notification).length === 0;
    };

    var initNotifications = function() {
        $notifications = $(selectors.notifications);

        if ($notifications.length === 0) {
            return;
        }

        // Store notification template and rmeove it from DOM.
        $notificationTpl = $notifications.find(selectors.notification).detach();

        // Enable API.
        ctx.notifications = api;
    };

    // Fire.
    $(document).ready(function () {
        initNotifications();
    });

})(jQuery, snax);