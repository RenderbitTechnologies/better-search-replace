(function( $ ) {
	'use strict';

	/**
	 * Initializes our event handlers.
	 */
	function bsr_init() {
		bsr_backup_database();
		bsr_import_database();
		bsr_search_replace();
		bsr_update_slider();
		bsr_save_profile();
	}

	/**
	 * Recursive function for performing batch operations.
	 */
	function bsr_process_step( action, step, page, data ) {

		$.ajax({
			type: 'POST',
			url: bsr_object_vars.endpoint + action,
			data: {
				bsr_ajax_nonce : bsr_object_vars.ajax_nonce,
				action: action,
				bsr_step: step,
				bsr_page: page,
				bsr_data: data
			},
			dataType: 'json',
			success: function( response ) {

				// Maybe display more details.
				if ( typeof response.message != 'undefined' ) {
					$('.bsr-description').remove();
					$('.bsr-progress-wrap').append( '<p class="description bsr-description">' + response.message + '</p>' );
				}

				if ( 'done' == response.step ) {

					bsr_update_progress_bar( '100%' );

					// Maybe run another action.
					if ( typeof response.next_action != 'undefined' ) {
						bsr_update_progress_bar( '0%', 0 );
						bsr_process_step( response.next_action, 0, 0, response.bsr_data );
					} else {
						$('.bsr-spinner').remove();
						$('.bsr-progress-wrap').remove();
						$('.bsr-disabled').removeClass('bsr-disabled button-disabled' );
						window.location = response.url;
					}

				} else {
					bsr_update_progress_bar( response.percentage );
					bsr_process_step( action, response.step, response.page, response.bsr_data );
				}

			}
		}).fail(function (response) {
			$('.bsr-spinner').remove();
			$('.bsr-progress-wrap').remove();
			$('.bsr-disabled').removeClass('bsr-disabled button-disabled' );
			$('#bsr-error-wrap').html( '<div class="error"><p>' + bsr_object_vars.unknown + '</p></div>' );
			if ( window.console && window.console.log ) {
				console.log(response);
			}
		});

	}

	/**
	 * Initializes a database backup.
	 */
	function bsr_backup_database() {

		var backup_submit = $( '#bsr-backup-submit' );
		backup_submit.click( function( e ) {

			e.preventDefault();

			if ( ! backup_submit.hasClass( 'button-disabled' ) ) {

				var data = $( '.bsr-action-form' ).serialize();

				backup_submit.addClass( 'bsr-disabled button-disabled' );
				$('#bsr-backup-form').append('<div class="spinner is-active bsr-spinner"></div><div class="bsr-progress-wrap"><div class="bsr-progress"></div></div>');
				bsr_process_step( 'process_backup', 0, 0, data );

			}

		});

	}

	/**
	 * Initializes a database import.
	 */
	function bsr_import_database() {
		var import_submit = $( '#bsr-import-submit' );
		import_submit.click( function( e ) {

			e.preventDefault();

			var file_data 	= $('#bsr-file-import').prop('files')[0];
			var profile 	= $('#bsr_profile').val();
			var form_data 	= new FormData();

			form_data.append( 'bsr_import_file', file_data);
			form_data.append( 'action', 'upload_import' );
			form_data.append( 'profile', profile );
			form_data.append( 'bsr_ajax_nonce', bsr_object_vars.ajax_nonce );

			$.ajax({
				url: bsr_object_vars.endpoint + 'upload_import',
				dataType: 'json',
				cache: false,
				contentType: false,
				processData: false,
				data: form_data,
				type: 'post',
				success: function( response ) {

					if ( response.upload_method === 'manual' ) {

						if ( confirm( 'No upload was detected, but an existing backup file was detected at ' + response.file + '. Do you want to import it?' ) ) {

							if ( ! import_submit.hasClass( 'button-disabled' ) ) {
								import_submit.addClass( 'bsr-disabled button-disabled' );
								$('#bsr-import-form').append('<div class="spinner is-active bsr-spinner"></div><div class="bsr-progress-wrap"><div class="bsr-progress"></div></div>');
								$('.bsr-progress-wrap').append( '<p class="description bsr-description">Importing database...</p>' );
								bsr_process_step( 'process_import', 0, 0, response );
							}

						}

					} else if ( response.upload_method == 'ajax' ) {

						if ( ! import_submit.hasClass( 'button-disabled' ) ) {

							import_submit.addClass( 'bsr-disabled button-disabled' );
							$('#bsr-import-form').append('<div class="spinner is-active bsr-spinner"></div><div class="bsr-progress-wrap"><div class="bsr-progress"></div></div>');
							$('.bsr-progress-wrap').append( '<p class="description bsr-description">Importing database...</p>' );
							bsr_process_step( 'process_import', 0, 0, response );

						}

					} else {
						alert( 'Please upload a valid backup file, or try increasing the max upload size.' );
					}



				}
			}).fail(function (response) {
				if ( window.console && window.console.log ) {
					console.log( response );
				}
			});

		});
	}

	/**
	 * Initializes a search/replace.
	 */
	function bsr_search_replace() {

		var search_replace_submit = $( '#bsr-submit' );
		var bsr_error_wrap = $( '#bsr-error-wrap' );
		search_replace_submit.click( function( e ) {

			e.preventDefault();

			if ( ! search_replace_submit.hasClass( 'button-disabled' ) ) {

				if ( ! $( '#search_for' ).val() ) {
					bsr_error_wrap.html( '<div class="error"><p>' + bsr_object_vars.no_search + '</p></div>' );
				} else if ( ! $( '#select_tables' ).val() ) {
					bsr_error_wrap.html( '<div class="error"><p>' + bsr_object_vars.no_tables + '</p></div>' );
				} else {
					var data = $( '.bsr-action-form' ).serialize();
					bsr_error_wrap.html('');
					search_replace_submit.addClass( 'bsr-disabled button-disabled' );
					$( '#bsr-submit-wrap' ).append('<div class="spinner is-active bsr-spinner"></div><div class="bsr-progress-wrap"><div class="bsr-progress"></div></div>');
					bsr_process_step( 'process_search_replace', 0, 0, data );
				}

			}

		});

	}

	/**
	 * Updates the progress bar for AJAX bulk actions.
	 */
	function bsr_update_progress_bar( percentage, speed ) {
		if ( typeof speed == 'undefined' ) {
			speed = 150;
		}
		$( '.bsr-progress' ).animate({
			width: percentage
		}, speed );
	}

	/**
	 * Updates the "Max Page Size" slider.
	 */
	function bsr_update_slider( percentage ) {
		$('#bsr-slider').slider({
			value: bsr_object_vars.page_size,
			range: "min",
			min: 1000,
			max: 50000,
			step: 1000,
			change: function( event, ui ) {
				$('#bsr-page-size-value').text( ui.value );
				$('#bsr_page_size').val( ui.value );
			}
		});
	}

	/**
	 * Displays the "Profile Name" field.
	 */
	function bsr_save_profile() {
		$('#save_profile').change( function() {
			if ( this.checked ) {
				$(this).closest('tr').next('tr').fadeIn('fast');
			} else {
				$(this).closest('tr').next('tr').fadeOut('fast');
			}
		});
	}

	bsr_init();

})( jQuery );
