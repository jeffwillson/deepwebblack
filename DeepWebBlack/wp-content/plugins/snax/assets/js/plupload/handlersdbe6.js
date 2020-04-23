/* global snax_plupload_i18n */

var snaxPlupload = {};

(function ($, ctx) {

	'use strict';

	// @todo
	// 1) Removed upload method dependencies
	// Actions "Browse files" (plupload) and "Browser by url" ends in the same way but depends on different upload methods.
	// We shouldn't rely on these methods while handling upload steps (in progress, successful, failed upload):
	// "Browse files" -> uploader.bind('FileUploaded')
	// "Browser by url" -> $mediaForm.on('snaxFileUploaded')
	// We have to rewrite that to use only events on $mediaForm like "snaxFileUploaded".
	//
	// 2) Make upload steps clear
	// There is no easy way to obtain correct upload workflow now.
	// We rely on plupload events like "FilesAdded", "FileUploaded", "Error", "UploadComplete"
	// and Snax events like "snaxUploadInProgress", "snaxUploadCompleted".
	// Now, no one has bloody idea which event fires after which.
	//
	// 3) Init Queue
	// initQueue() should be fired only internally.

	var uploaders 			= {},						// Loaded uploader instances.
		i18n 				= snax_plupload_i18n,
		fileErrors			= {},						// File specific errror.
		errors 				= [],						// Global errors (I/O etc).
		$currentForm,									// Form being in use.
		showFeedback		= true,
		$filesAll,
		$fileProcessing,
		$filesUploadProgressBar,
		$filesStates,
		uploadStarted,                  		// Defines if upload process already started.
		filesAll,                       		// Number of all chosen by user files.
		filesAllList,                   		// List of all file names choses by user.
		fileProcessing,                 		// Index of file currently processing.
		filesUploaded,                  		// Number of files already uploaded.
		filesFailed,                    		// Number of files that failed to upload.
		fileStateMessages,              		// State messages.
		fileStates;                     		// States of processed files. Format: [ { name: 1.jpg, state: 1 }, ... ].
												// States: 1 (success),  -1 (error), file not in array (not processed yet).

	var selectors = {
		'fileProcessing':           '.snax-xofy-x',
		'filesAll':                 '.snax-xofy-y',
		'filesUploadProgressBar':   '.snax-progress-bar',
		'fileState':                '.snax-state',
		'filesStates':              '.snax-states',
		'statesWrapper':            '.snax-details',
		'loadImageFromUrl':         '.snax-load-image-from-url'
	};

	var classes = {
		'fileState':            'snax-state',
		'fileStateProcessing':  'snax-state-processing',
		'fileStateSuccess':     'snax-state-success',
		'fileStateError':       'snax-state-error',
		'fileProcessed':        'snax-details-expanded'
	};

	/** PLUPLOAD ****************************************/

	/*
	 * When user choose files to upload, only the filtered files will be processed.
	 * Filtered files are those passed all registered filters. Pluplod default filters, in order of registartion and execution:
	 * - mime_types,
	 * - max_file_size,
	 * - prevent_duplicates
	 * Custom filters are fired only if all above filter passed. But we want to have access to skipped files.
	 * The only way to get full list of chosen by user files (even those that won't be finally processed)
	 * is to override first default filter (the 'mime_types' filter) and store file list for futher use.
	 */
	plupload.addFileFilter('mime_types', function(filters, file, cb) {
		filesAll++;
		filesAllList.push(file);

		// At this point we test against all allowed mime types.
		if (filters.length && !filters.regexp.test(file.name)) {
			this.trigger('Error', {
				code : plupload.FILE_EXTENSION_ERROR,
				message : plupload.translate('File extension error.'),
				file : file
			});
			cb(false);
		} else {
			cb(true);
		}
	});

	plupload.addFileFilter('image_max_file_size', function(maxSize, file, cb) {
		// All WP allowed image formats.
		var imageRegex = /(\.jpeg|\.jpg|\.png|\.gif|\.ico)$/i;

		// Skip test if not an image.
		if (!imageRegex.test(file.name)) {
			cb(true);
			return;
		}

		var undef;
		maxSize = plupload.parseSize(maxSize);

		// Invalid file size
		if (file.size !== undef && maxSize && file.size > maxSize) {
			this.trigger('Error', {
				code : plupload.FILE_SIZE_ERROR,
				message : plupload.translate('File size error.'),
				file : file
			});
			cb(false);
		} else {
			cb(true);
		}
	});

	plupload.addFileFilter('video_max_file_size', function(maxSize, file, cb) {
		// All WP allowed video formats.
		var videoRegex = /(\.mp4|\.m4v|\.mov|\.wmv|\.avi|\.mpg|\.ogv|\.3gp|\.3g2)$/i;

		// Skip test if not a video.
		if (!videoRegex.test(file.name)) {
			cb(true);
			return;
		}

		var undef;

		maxSize = plupload.parseSize(maxSize);

		// Invalid file size
		if (file.size !== undef && maxSize && file.size > maxSize) {
			this.trigger('Error', {
				code : plupload.FILE_SIZE_ERROR,
				message : plupload.translate('File size error.'),
				file : file
			});
			cb(false);
		} else {
			cb(true);
		}
	});

	plupload.addFileFilter('audio_max_file_size', function(maxSize, file, cb) {
		// All WP allowed audio formats.
		var audioRegex = /(\.mp3|\.m4a|\.ogg|\.wav)$/i;

		// Skip test if not an audio.
		if (!audioRegex.test(file.name)) {
			cb(true);
			return;
		}

		var undef;

		maxSize = plupload.parseSize(maxSize);

		// Invalid file size
		if (file.size !== undef && maxSize && file.size > maxSize) {
			this.trigger('Error', {
				code : plupload.FILE_SIZE_ERROR,
				message : plupload.translate('File size error.'),
				file : file
			});
			cb(false);
		} else {
			cb(true);
		}
	});

	ctx.getUploader = function(id) {
		return typeof uploaders[id] ? uploaders[id] : false;
	};

	ctx.initUploader = function($form) {
		var formId = $form.attr('id');
		var config = snaxPluploadConfig && snaxPluploadConfig[formId] ? snaxPluploadConfig[formId] : false;

		if (!config) {
			snax.log('No config found for '+ formId +'!');
			return;
		}

		var isIE = navigator.userAgent.indexOf('Trident/') != -1 || navigator.userAgent.indexOf('MSIE ') != -1;

		// Make sure flash sends cookies (seems in IE it does without switching to url-stream mode).
		if ( ! isIE && 'flash' === plupload.predictRuntime( config ) &&
			( ! config.required_features || ! config.required_features.hasOwnProperty( 'send_binary_string' ) ) ) {

			config.required_features = config.required_features || {};
			config.required_features.send_binary_string = true;
		}

		// DOM element that will be used as a container for the Plupload html structures.
		config['container'] = $form.find('.snax-plupload-upload-ui').get(0);

		// The DOM element to be used as the dropzone for the files, or folders (Chrome 21+).
		config['drop_element'] = $form.find('.snax-drag-drop-area').get(0);

		// Almost any DOM element can be turned into a file dialog trigger, but usually it is either a button, actual file input or an image.
		config['browse_button'] = $form.find('.snax-plupload-browse-button').get(0);

		// Create.
		var uploader = new plupload.Uploader(config);

		// Store.
		uploaders[formId] = uploader;

		$form.data('snaxUploader', uploader);

		// Bind listeners.
		uploader.bind('Init', function(up) {
			var $uploaddiv = $form.find('.snax-plupload-upload-ui');

			if ( up.features.dragdrop && ! $(document.body).hasClass('mobile') ) {
				$uploaddiv.addClass('drag-drop');

				$form.find('.snax-drag-drop-area').on('dragover.wp-uploader', function(){ // dragenter doesn't fire right :(
					$uploaddiv.addClass('drag-over');
				}).on('dragleave.wp-uploader, drop.wp-uploader', function(){
					$uploaddiv.removeClass('drag-over');
				});
			} else {
				$uploaddiv.removeClass('drag-drop');
				$form.find('.snax-drag-drop-area').off('.wp-uploader');
			}
		});

		uploader.bind( 'postinit', function( up ) {
			up.refresh();
		});

		// Init.
		uploader.init();

		uploader.bind('FilesAdded', function( up, files ) {
			// Block multiple files dropping.
			if ( ! up.getOption('multi_selection') && up.files.length > 1) {
				alert(i18n.multi_drop_forbidden);

				ctx.initQueue(up);
				return;
			}

			ctx.setCurrentForm($form);

			ctx.uploadStart();

			up.refresh();
			up.start();
		});

		uploader.bind('UploadFile', function(up, file) {
			ctx.fileUploading(up, file);
		});

		uploader.bind('Error', function(up, err) {
			ctx.uploadError(err.file, err.code, err.message, up);
			up.refresh();

			if (typeof err.file !== 'undefined') {
				ctx.fileUploadError(err.file);
			}
		});

		uploader.bind('UploadComplete', function () {
			ctx.uploadComplete();
		});

		uploader.bind('FileUploaded', function (up, file, response) {
			ctx.uploadSuccess(file, response.response, $form);
		});

		uploader.bind('UploadProgress', function() {
			$form.trigger('snaxUploadInProgress');
		});

		ctx.handleImageFromUrl($form);
	};

	ctx.setCurrentForm = function($form) {
		$currentForm = $form;
	};

	ctx.uploadStart = function(mode) {
		if (uploadStarted) {
			return;
		}

		uploadStarted = true;

		if (typeof mode === 'undefined') {
			mode = 'normal';
		}

		// Reset.
		if ('normal' === mode) {
			errors = [];
			fileErrors = [];
		}

		if (showFeedback) {
			ctx.initFeedback();
		}
	};

	ctx.hideFeedback = function() {
		showFeedback = false;
	};

	ctx.initFeedback = function() {
		fileProcessing = 1;
		filesUploaded = 0;

		$fileProcessing         = $(selectors.fileProcessing);
		$filesAll               = $(selectors.filesAll);
		$filesUploadProgressBar = $(selectors.filesUploadProgressBar);
		$filesStates            = $(selectors.filesStates);

		// Numbers (1 of 5).
		$fileProcessing.text(fileProcessing);
		$filesAll.text(filesAll);

		// Progress bar.
		$filesUploadProgressBar.css('width', 0);

		// States.
		var i;
		$filesStates.empty();
		$(selectors.statesWrapper).removeClass(classes.fileProcessed);

		for(i = 0; i < filesAll; i++) {
			$filesStates.append('<li class="'+ classes.fileState +'"></li>');
		}

		snax.displayFeedback('processing-files');
		ctx.startPolling();
	};

	var timer;

	ctx.startPolling = function() {
		timer = setInterval(function() {
			ctx.updateFeedback();
		}, 500);
	};

	ctx.stopPolling = function() {
		clearInterval(timer);
	};

	ctx.updateFeedback = function() {
		if (ctx.uploadFinished()) {
			return;
		}

		var currentFileIndex = fileProcessing - 1;
		var currentFile      = filesAllList[currentFileIndex];
		var currentFileState = typeof fileStates[currentFile.id] !== 'undefined' ? fileStates[currentFile.id] : 0;

		var $fileState = $(selectors.filesStates).find(selectors.fileState).eq(currentFileIndex);

		$fileState.addClass(classes.fileStateProcessing);

		if (currentFileState !== 0) {
			$fileState.
				removeClass(classes.fileStateProcessing).
				addClass(currentFileState === 1 ? classes.fileStateSuccess : classes.fileStateError);

			if (currentFileState === -1) {
				// File specific error.
				var errorMessage = fileErrors[currentFile.id];

				// If specific error message not set, display general error info.
				if (!errorMessage) {
					errorMessage = fileStateMessages[currentFile.id];
				}

				// Get global error.
				if (!errorMessage) {
					var globalError = errors.pop();

					errorMessage = globalError ? globalError.message : i18n.upload_failed;
				}

				$fileState.text(errorMessage);
			}

			fileProcessing++;
			filesUploaded++;

			var progress = filesUploaded / filesAll * 100;

			$fileProcessing.text(filesUploaded);
			$filesUploadProgressBar.css('width', progress + '%');
		}
	};

	ctx.uploadFinished = function() {
		var finished = filesUploaded === filesAll;

		if (finished) {
			ctx.stopPolling();

			if (filesFailed > 0) {
				$(selectors.statesWrapper).addClass(classes.fileProcessed);

				// Not all files are broken.
				if (filesFailed < filesAll) {
					$currentForm.trigger('snaxAfterSuccessfulUpload');

					// Feedback will be closed via button click.
				}
			} else {
				setTimeout(function() {
					$currentForm.trigger('snaxAfterSuccessfulUpload');

					snax.hideFeedback();
				}, 750);
			}

			ctx.initQueue();
		}

		return finished;
	};

	ctx.uploadSuccess = function(file, response, $form, data) {
		// If async-upload returned an error message, we need to catch it here.
		if ( response.match(/media-upload-error|error-div/) ) {
			ctx.fileUploadError(file);
		} else {
			ctx.fileProcessed(file, 1);
			$form.trigger('snaxFileUploaded', [ response, data ]);
		}
	};

	ctx.fileProcessed = function(file, status, stateMessage) {
		fileStates[file.id] = status;
		fileStateMessages[file.id] = stateMessage;

		if (status === -1) {
			filesFailed++;
		}
	};

	ctx.uploadComplete = function() {};

	// This method is triggered when something goest wrong with file upload e.g.:
	// - file is too large
	// - doesn't match allowed mime types
	// - HTTP error during upload
	ctx.fileUploadError = function(file, errorMessage) {
		// If any of chosen files is valid and normal upload was not fired, we need to init feedback here.
		ctx.fileProcessed(file, -1, errorMessage);

		// If some error occured and normal upload won't start, we need to run it manually.
		setTimeout(function() {
			ctx.uploadStart('error');
		}, 100);
	};

	// Check to see if a large file failed to upload.
	ctx.fileUploading = function( up, file ) {
		var hundredmb 	= 100 * 1024 * 1024;
		var max 		= parseInt( up.settings.max_file_size, 10 );

		if ( max > hundredmb && file.size > hundredmb ) {
			setTimeout( function() {
				if ( file.status < 3 && file.loaded === 0 ) { // Not uploading.
					wpFileError( file, i18n.big_upload_failed.replace( '%1$s', '<a class="uploader-html" href="#">' ).replace( '%2$s', '</a>' ) );
					up.stop(); 				// Stops the whole queue.
					up.removeFile( file );
					up.start(); 			// Restart the queue.
				}
			}, 10000 ); // Wait for 10 sec. for the file to start uploading.
		}
	};

	ctx.initQueue = function(uploader) {
		uploadStarted = false;
		filesAll = 0;
		filesAllList = [];
		fileStates = [];
		fileStateMessages = [];
		filesFailed = 0;

		if ( ! uploader && $currentForm ) {
			uploader = $currentForm.data('snaxUploader');
		}

		// Reset uploader queue.
		if (typeof uploader !== 'undefined') {
			while (uploader.files.length > 0) {
				uploader.removeFile(uploader.files[0]);
			}
		}
	};

	/**
	 * IMAGE FROM URL
	 *
	 */

	ctx.handleImageFromUrl = function($form) {

		$form.find(selectors.loadImageFromUrl).on('paste', function() {
			var $url = $(this);

			setTimeout(function () {
				ctx.uploadFromUrl($url.val(), $form);
			}, 200);
		});
	};

	ctx.uploadFromUrl = function(url, $form) {
		url = $.trim(url);

		if (!url || !snax.isValidUrl(url)) {
			ctx.wpQueueError(i18n.invalid_url);
			$form.trigger('snaxUploadCompleted');
			return;
		}

		$form.trigger('snaxUploadInProgress');

		ctx.setCurrentForm($form);

		var xhr = $.ajax({
			'type': 'POST',
			'url': snax.config.ajax_url,
			'dataType': 'json',
			'data': {
				'action':           'snax_save_image_from_url',
				'security':         $('input[name=snax-add-media-item-nonce]').val(),
				'snax_image_url':   url,
				'snax_author_id':     snax.currentUserId
			}
		});

		xhr.done(function (res) {
			if (res.status === 'success') {
				ctx.uploadSuccess(fakeFile, res.args.image_id.toString(), $form);
				$form.trigger('snaxFileFromUrlUploaded', [res.args.image_id.toString()]);
			} else {
				ctx.fileUploadError(fakeFile, res.args.error_message);
			}

			$form.trigger('snaxUploadCompleted');
			$(selectors.loadImageFromUrl).val('');
		});

		// Simulate uploading process.
		var fakeFile = { 'id': 1 };
		filesAll++;
		filesAllList.push(fakeFile);
		ctx.uploadStart();
	};

	ctx.initFakeUpload = function($mediaForm, fakeFiles) {
		ctx.setCurrentForm($mediaForm);

		// Simulate uploading process.
		filesAll = fakeFiles.length;
		filesAllList = fakeFiles;

		ctx.uploadStart();
	};

	ctx.fakeFileUploaded = function(fakeFile, mediaId, $mediaForm, fakeFileData) {
		ctx.uploadSuccess(fakeFile, mediaId, $mediaForm, fakeFileData);
	};

	/**
	 * ERRORS
	 */

	// Generic upload error handler.
	ctx.uploadError = function(fileObj, errorCode, message, uploader) {
		var hundredmb = 100 * 1024 * 1024, max;

		switch (errorCode) {
			case plupload.FAILED:
				ctx.wpFileError(fileObj, i18n.upload_failed);
				break;
			case plupload.FILE_EXTENSION_ERROR:
				ctx.wpFileExtensionError( uploader, fileObj, i18n.invalid_filetype );
				break;
			case plupload.FILE_SIZE_ERROR:
				ctx.uploadSizeError(uploader, fileObj);
				break;
			case plupload.IMAGE_FORMAT_ERROR:
				ctx.wpFileError(fileObj, i18n.not_an_image);
				break;
			case plupload.IMAGE_MEMORY_ERROR:
				ctx.wpFileError(fileObj, i18n.image_memory_exceeded);
				break;
			case plupload.IMAGE_DIMENSIONS_ERROR:
				ctx.wpFileError(fileObj, i18n.image_dimensions_exceeded);
				break;
			case plupload.GENERIC_ERROR:
				ctx.wpQueueError(i18n.upload_failed);
				break;
			case plupload.IO_ERROR:
				max = parseInt( uploader.settings.filters.max_file_size, 10 );

				if ( max > hundredmb && fileObj.size > hundredmb )
					ctx.wpFileError( fileObj, i18n.big_upload_failed.replace('%1$s', '<a class="uploader-html" href="#">').replace('%2$s', '</a>') );
				else
					ctx.wpQueueError(i18n.io_error);
				break;
			case plupload.HTTP_ERROR:
				ctx.wpQueueError(i18n.http_error);
				break;
			case plupload.INIT_ERROR:
				jQuery('.media-upload-form').addClass('html-uploader');
				break;
			case plupload.SECURITY_ERROR:
				ctx.wpQueueError(i18n.security_error);
				break;

			default:
				ctx.wpFileError(fileObj, i18n.default_error);
		}
	};

	// Generic error message.
	ctx.wpQueueError = function(message) {
		errors.push({
			'message': message
		});
	};

	// File-specific error messages.
	ctx.wpFileError = function(file, message) {
		message = i18n.error_uploading.replace('%s', file.name) + ' ' + message;

		fileErrors[file.id] = message;
	};

	ctx.wpFileExtensionError = function( up, file, message ) {
		fileErrors[file.id] = message;

		up.removeFile(file);
	};

	ctx.uploadSizeError = function( up, file ) {
		var message, errorDiv;

		message = i18n.file_exceeds_size_limit.replace('%s', file.name);

		fileErrors[file.id] = message;

		up.removeFile(file);
	};

	ctx.getErrors = function() {
		return errors
	};

	ctx.getFileErrors = function() {
		return fileErrors;
	};

	ctx.getFileStates = function() {
		return fileStates;
	};

	ctx.getFileStateMessages = function() {
		return fileStateMessages;
	};

	// Set up queue on load.
	ctx.initQueue();

})(jQuery, snaxPlupload);
