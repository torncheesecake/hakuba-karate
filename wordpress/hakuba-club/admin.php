<?php
if (!defined('ABSPATH')) { exit; }

add_action('add_meta_boxes', function () {
    foreach (array_keys(hakuba_club_schema()) as $type) {
        add_meta_box('hakuba-club-fields', 'Club details', 'hakuba_club_metabox', $type, 'normal', 'high');
    }
});

function hakuba_club_metabox($post) {
    wp_nonce_field('hakuba_club_save_' . $post->ID, 'hakuba_club_nonce');
    echo '<p>Complete these details before publishing. Invalid submissions keep existing records at their previous publication status and preserve their club details; new records remain drafts. Withdraw a record explicitly using Trash or a valid status or active-state change. Use Posts and Media for news and photographs.</p>';
    if ($post->post_type === 'hakuba_exception') {
        echo '<p>Record only a confirmed cancellation on one date. Recurring closures and replacement sessions are not supported.</p>';
    }
    foreach (hakuba_club_schema()[$post->post_type] as $key => $definition) {
        list($label, $kind) = $definition;
        $value = get_post_meta($post->ID, '_hakuba_' . $key, true);
        $name = 'hakuba_fields[' . $key . ']';
        $html_id = 'hakuba-' . $key;
        echo '<p><label for="' . esc_attr($html_id) . '"><strong>' . esc_html($label) . '</strong></label><br>';
        if ($kind === 'venue' || $kind === 'session') {
            $records = $kind === 'venue' ? hakuba_club_get_venues() : hakuba_club_get_sessions();
            echo '<select id="' . esc_attr($html_id) . '" name="' . esc_attr($name) . '" required><option value="">Choose a published active record</option>';
            $found = false;
            foreach ($records as $record) {
                $found = $found || (string) $record['id'] === (string) $value;
                $text = $kind === 'venue' ? $record['name'] . ' (' . $record['location'] . ')' : $record['key'] . ' (' . $record['day'] . ' ' . $record['start'] . ', ' . $record['venue'] . ')';
                echo '<option value="' . esc_attr($record['id']) . '" ' . selected($value, $record['id'], false) . '>' . esc_html($text) . '</option>';
            }
            if ($value !== '' && !$found) { echo '<option value="' . esc_attr($value) . '" selected>' . esc_html('Unavailable record #' . $value . ': choose another') . '</option>'; }
            echo '</select>';
        } elseif (is_array($kind)) {
            echo '<select id="' . esc_attr($html_id) . '" name="' . esc_attr($name) . '" required><option value="">Choose an option</option>';
            foreach ($kind as $option) { echo '<option value="' . esc_attr($option) . '" ' . selected($value, $option, false) . '>' . esc_html($option) . '</option>'; }
            echo '</select>';
        } elseif ($kind === 'checkbox') {
            echo '<input type="checkbox" id="' . esc_attr($html_id) . '" name="' . esc_attr($name) . '" value="1" ' . checked($value, '1', false) . '>';
        } elseif ($kind === 'textarea') {
            echo '<textarea class="widefat" rows="3" id="' . esc_attr($html_id) . '" name="' . esc_attr($name) . '">' . esc_textarea($value) . '</textarea>';
        } else {
            $required = in_array($key, array('key', 'audience', 'start', 'end', 'date', 'source', 'checked_on'), true) ? ' required' : '';
            echo '<input class="regular-text" type="' . esc_attr($kind) . '" id="' . esc_attr($html_id) . '" name="' . esc_attr($name) . '" value="' . esc_attr($value) . '"' . $required . '>';
        }
        echo '</p>';
    }
}

function hakuba_club_form_request($id) {
    return isset($_POST['post_ID']) && is_scalar($_POST['post_ID']) && (int) $_POST['post_ID'] === (int) $id && isset($_POST['action']) && $_POST['action'] === 'editpost';
}

function hakuba_club_form_candidate($id, $type) {
    if (!current_user_can('edit_post', $id)) { return new WP_Error('hakuba_invalid', 'You cannot edit this record.'); }
    if (!isset($_POST['hakuba_club_nonce']) || !is_string($_POST['hakuba_club_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['hakuba_club_nonce'])), 'hakuba_club_save_' . $id)) {
        return new WP_Error('hakuba_invalid', 'The security check failed. Reload the editor and try again.');
    }
    if (!isset($_POST['hakuba_fields']) || !is_array($_POST['hakuba_fields'])) { return new WP_Error('hakuba_invalid', 'Club details were missing. Reload the editor and try again.'); }
    $fields = wp_unslash($_POST['hakuba_fields']);
    $schema = hakuba_club_schema()[$type];
    if (array_diff(array_keys($fields), array_keys($schema))) { return new WP_Error('hakuba_invalid', 'Unknown club fields were submitted. Reload the editor and try again.'); }
    foreach ($schema as $key => $definition) {
        if ($definition[1] === 'checkbox' && !isset($fields[$key])) { $fields[$key] = '0'; }
    }
    return hakuba_club_validate($type, $fields, $id);
}

function hakuba_club_admin_error($id, $message) {
    if (!get_current_user_id()) { return; }
    set_transient('hakuba_club_error_' . get_current_user_id(), 'Record #' . (int) $id . ': ' . $message . ' Club details were not changed. Existing records retain their previous publication status; new records remain drafts.', 120);
}

// Read the stored status before WordPress writes; submitted status fields are not the previous state.
add_filter('wp_insert_post_data', function ($data, $postarr) {
    $type = $data['post_type'];
    if (!isset(hakuba_club_schema()[$type]) || in_array($data['post_status'], array('auto-draft', 'trash', 'inherit'), true) || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)) { return $data; }
    $id = isset($postarr['ID']) ? (int) $postarr['ID'] : 0;
    $form = hakuba_club_form_request($id);
    $candidate = $form ? hakuba_club_form_candidate($id, $type) : hakuba_club_validate($type, hakuba_club_meta($id, $type), $id);
    if (!is_wp_error($candidate) && trim(wp_strip_all_tags(wp_unslash($data['post_title']))) === '') {
        $candidate = new WP_Error('hakuba_invalid', 'Enter a title for this record.');
    }
    if ($form) { $GLOBALS['hakuba_club_candidates'][$id] = $candidate; }
    if (is_wp_error($candidate)) {
        if ($form || in_array($data['post_status'], array('publish', 'future', 'private', 'pending'), true)) {
            $previous = $id ? get_post($id) : null;
            $data['post_status'] = $previous && $previous->post_status !== 'auto-draft' ? $previous->post_status : 'draft';
            hakuba_club_admin_error($id, $candidate->get_error_message());
        }
    }
    return $data;
}, 10, 2);

add_action('save_post', function ($id, $post) {
    if (!isset(hakuba_club_schema()[$post->post_type]) || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_autosave($id) || wp_is_post_revision($id) || !hakuba_club_form_request($id) || !current_user_can('edit_post', $id)) { return; }
    $candidate = $GLOBALS['hakuba_club_candidates'][$id] ?? hakuba_club_form_candidate($id, $post->post_type);
    if (is_wp_error($candidate)) { return; }
    // Only the validated allowlist is persisted; no partial save on validation failure.
    foreach ($candidate as $key => $value) { update_post_meta($id, '_hakuba_' . $key, $value); }
    unset($GLOBALS['hakuba_club_candidates'][$id]);
}, 10, 2);

add_action('admin_notices', function () {
    if (!current_user_can('edit_posts')) { return; }
    $key = 'hakuba_club_error_' . get_current_user_id();
    $error = get_transient($key);
    if ($error) {
        echo '<div class="notice notice-error"><p>' . esc_html($error) . '</p></div>';
        delete_transient($key);
    }
    $screen = get_current_screen();
    if ($screen && isset(hakuba_club_schema()[$screen->post_type])) {
        echo '<div class="notice notice-info"><p>Hakuba Club Content: setup is not automatic. Add and publish venues first, then sessions, then verified dated cancellations. News uses standard Posts and Media. This plugin does not configure accounts, member approval, email or external publishing.</p></div>';
    }
});
