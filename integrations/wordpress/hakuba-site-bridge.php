<?php
/**
 * Plugin Name: Hakuba Replacement Site Bridge
 * Description: Explicit approved-member session bridge for the replacement. Does not grant existing users access automatically.
 * Version: 0.1.0
 */
if (!defined('ABSPATH')) { exit; }

function hakuba_site_member_allowed() {
    return is_user_logged_in() && current_user_can('hakuba_access_app');
}

function hakuba_site_member_session() {
    nocache_headers();
    if (!is_user_logged_in()) { wp_send_json(array('approved' => false), 401); }
    if (!hakuba_site_member_allowed()) { wp_send_json(array('approved' => false), 403); }
    $user = wp_get_current_user();
    wp_send_json(array(
        'approved' => true,
        'user' => array('id' => (int) $user->ID, 'displayName' => $user->display_name, 'email' => $user->user_email),
        'nonce' => wp_create_nonce('wp_rest'),
        'logoutNonce' => wp_create_nonce('hakuba_site_member_logout'),
    ));
}
add_action('wp_ajax_hakuba_site_member_session', 'hakuba_site_member_session');
add_action('wp_ajax_nopriv_hakuba_site_member_session', 'hakuba_site_member_session');

add_action('wp_ajax_hakuba_site_member_logout', function () {
    check_ajax_referer('hakuba_site_member_logout');
    wp_logout();
    nocache_headers();
    wp_send_json(array('signedOut' => true));
});

// Approval is required for progress APIs too, including after access is withdrawn.
add_filter('rest_pre_dispatch', function ($result, $server, $request) {
    if (stripos($request->get_route(), '/hakuba-app/v1/progress') === 0 && !hakuba_site_member_allowed()) {
        return new WP_Error('hakuba_approval_required', 'Club approval is required.', array('status' => is_user_logged_in() ? 403 : 401));
    }
    return $result;
}, 10, 3);

function hakuba_site_member_field($user) {
    if (!current_user_can('manage_options') || !current_user_can('edit_user', $user->ID)) { return; }
    wp_nonce_field('hakuba_member_approval_' . $user->ID, 'hakuba_member_approval_nonce');
    ?>
    <h2>Hakuba replacement app</h2>
    <p><label><input type="checkbox" name="hakuba_access_app" value="1" <?php checked(user_can($user, 'hakuba_access_app')); ?> /> Approved for the replacement member app</label></p>
    <p>No accounts are approved automatically. This does not change membership records or migrate progress.</p>
    <?php
}
add_action('show_user_profile', 'hakuba_site_member_field');
add_action('edit_user_profile', 'hakuba_site_member_field');

function hakuba_site_member_save($user_id) {
    if (!current_user_can('manage_options') || !current_user_can('edit_user', $user_id)) { return; }
    if (!isset($_POST['hakuba_member_approval_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['hakuba_member_approval_nonce'])), 'hakuba_member_approval_' . $user_id)) { return; }
    $user = get_user_by('id', $user_id);
    if (!$user) { return; }
    if (isset($_POST['hakuba_access_app']) && $_POST['hakuba_access_app'] === '1') { $user->add_cap('hakuba_access_app'); }
    else { $user->remove_cap('hakuba_access_app'); }
}
add_action('personal_options_update', 'hakuba_site_member_save');
add_action('edit_user_profile_update', 'hakuba_site_member_save');
