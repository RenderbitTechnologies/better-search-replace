<?php
/**
 * Displays the main "Settings" tab.
 *
 * @link       http://expandedfronts.com/better-search-replace/
 * @since      1.1
 *
 * @package    Better_Search_Replace
 * @subpackage Better_Search_Replace/templates
 */

// Prevent direct/unauthorized access.
if ( ! defined( 'BSR_PATH' ) ) exit;

// Get information about the current license.
$license = get_option( 'bsr_license_key' );
$status  = get_option( 'bsr_license_status' );

// Other settings.
$page_size 	= get_option( 'bsr_page_size' ) ? get_option( 'bsr_page_size' ) : 20000;

 ?>

<?php settings_fields( 'bsr_settings_fields' ); ?>

<table class="form-table">

	<tbody>

		<tr valign="top">
			<th scope="row" valign="top">
				<?php _e( 'Max Page Size', 'better-search-replace' ); ?>
			</th>
			<td>
				<div id="bsr-slider"></div>
				<br><span id="bsr-page-size-info"><?php _e( 'Current Setting: ', 'better-search-replace' ); ?></span><span id="bsr-page-size-value"><?php echo absint( $page_size ); ?></span>
				<input id="bsr_page_size" type="hidden" name="bsr_page_size" value="" />
				<p class="description"><?php _e( 'If you notice timeouts or are unable to backup/import the database, try decreasing this value.', 'better-search-replace' ); ?></p>
			</td>
		</tr>

		<tr valign="top">
			<th scope="row" valign="top">
				<?php _e('License Key', 'better-search-replace' ); ?>
			</th>
			<td>
				<input id="bsr_license_key" name="bsr_license_key" type="text" class="regular-text" value="<?php esc_attr_e( $license ); ?>" />
				<p class="description" for="bsr_license_key"><?php _e( 'Enter your license key for support and updates.', 'better-search-replace' ); ?></p>
			</td>
		</tr>

		<?php if( false !== $license ) { ?>
			<tr valign="top">
				<th scope="row" valign="top">
					<?php _e( 'Activate License', 'better-search-replace' ); ?>
				</th>
				<td>
					<?php if( $status !== false && $status == 'valid' ) { ?>
						<span style="color:green;"><?php _e('active'); ?></span>
						<?php wp_nonce_field( 'bsr_license_nonce', 'bsr_license_nonce' ); ?>
						<input type="submit" class="button-secondary" name="bsr_license_deactivate" value="<?php _e( 'Deactivate License', 'better-search-replace' ); ?>"/>
					<?php } else {
						wp_nonce_field( 'bsr_license_nonce', 'bsr_license_nonce' ); ?>
						<input type="submit" class="button-secondary" name="bsr_license_activate" value="<?php _e( 'Activate License', 'better-search-replace' ); ?>"/>
					<?php } ?>
				</td>
			</tr>
		<?php } ?>

	</tbody>

</table>
<?php submit_button(); ?>
