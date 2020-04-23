/* global document */
/* global jQuery */
/* global uploader */
/* global snax */
/* global alert */
/* global confirm */
/* global plupload */
/* global snaxDemoItemsConfig */
/* global fabric */
/* global snax_quizzes */
/* global snax_polls */
/* global snax_front_submission_config */

(function ($, ctx) {

    'use strict';

    var config = $.parseJSON(window.snax_front_config);

    /** CONFIG *******************************************/

        // Register new component
    ctx.uploadFeaturedImage = {};

    // Component namespace shortcut
    var c = ctx.uploadFeaturedImage;

    // CSS selectors
    var selectors = {
        'parentFormat':             '.snax-form-frontend input[name=snax-post-format]',
        'form':                     '.snax-tab-content-featured-image',
        'mediaForm':                '.snax-media-upload-form',
        'imageDelete':              '.snax-media-action-delete-featured',
        'featuredImage':            '#snax-featured-image'
    };

    var classes = {
        'formHidden':           'snax-tab-content-hidden',
        'formVisible':          'snax-tab-content-visible'
    };

    var i18n = {
        'confirm':              config.i18n.are_you_sure
    };

    // Allow overriding via child theme modifications.js.
    c.selectors = selectors;
    c.classes   = classes;
    c.i18n      = i18n;

    var $form;
    var $mediaForm;
    var parentFormat,
        postId,
        setAsFeatured,
        sourceForm;

    /** INIT *******************************************/

    c.init = function () {
        $form = $(selectors.form);

        if ($form.length === 0) {
            return;
        }

        if (snax.currentUserId === 0) {
            snax.log('Snax: User not logged in!');
            return;
        }

        parentFormat = $(selectors.parentFormat).val();

        $mediaForm  = $form.find(selectors.mediaForm);

        if ($mediaForm.length === 0) {
            snax.log('Snax Front Submission Error: media form missing!');
            return;
        }

        postId          = $form.attr('data-snax-parent-post-id') ? parseInt($form.attr('data-snax-parent-post-id'), 10) : '';
        setAsFeatured   = $form.attr('data-snax-featured') ? $form.attr('data-snax-featured') : 'standard';
        sourceForm      = $form.attr('data-snax-source-form') ? $form.attr('data-snax-source-form') : '';

        c.handleImageUpload();
        c.handleImageDelete();
    };

    c.handleImageUpload = function() {
        $mediaForm.on('snaxFileUploaded', function(e, mediaId) {
            c.createImage(mediaId);
        });
    };

    c.createImage = function(mediaId) {
        var xhr = $.ajax({
            'type': 'GET',
            'url': snax.config.ajax_url,
            'dataType': 'json',
            'data': {
                'action':               'snax_load_featured_image_tpl',
                'snax_media_id':        mediaId,
                'snax_parent_format':   parentFormat,
                'snax_post_id':         postId,
                'snax_featured':        setAsFeatured,
                'snax_source_form':     sourceForm
            }
        });

        xhr.done(function (res) {
            if (res.status === 'success') {
                var $image = $(res.args.html);

                // Hide upload form.
                $(selectors.form).removeClass(classes.formVisible).addClass(classes.formHidden);

                // Load image.
                $(selectors.featuredImage).empty().append($image);

                $mediaForm.trigger('snaxPreviewLoaded');
            }
        });
    };

    c.handleImageDelete = function() {
        $(selectors.featuredImage).on('click', selectors.imageDelete, function(e) {
            e.preventDefault();

            if ( !ctx.skipConfirmation ) {
                if (!confirm(i18n.confirm)) {
                    return;
                }
            }

            // Reset.
            ctx.skipConfirmation = false;

            c.deleteImage();
        });
    };

    c.deleteImage = function() {
        var $imageWrapper = $(selectors.featuredImage);
        var $link         = $imageWrapper.find(selectors.imageDelete);

        snax.deleteItem($link, function(res) {
            if (res.status === 'success') {
                $imageWrapper.empty();

                $(selectors.form).addClass(classes.formVisible).removeClass(classes.formHidden);

                $form.trigger('snaxImageDeleted');
            }
        });
    };

    // Init components.
    $(document).ready(function() {
        ctx.uploadFeaturedImage.init();
    });

})(jQuery, snax);
