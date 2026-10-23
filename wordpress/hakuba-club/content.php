<?php
if (!defined('ABSPATH')) { exit; }

function hakuba_club_locations() {
    return array('Wroughton', 'Mevagissey', 'Winterbourne');
}

function hakuba_club_days() {
    return array('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
}

/** Field names here are appended to the _hakuba_ metadata prefix. */
function hakuba_club_schema() {
    return array(
        'hakuba_venue' => array(
            'address' => array('Address', 'text'),
            'location' => array('Club location', hakuba_club_locations()),
            'area' => array('Area', 'text'),
            'primary' => array('Primary venue', 'checkbox'),
            'note' => array('Visitor note', 'textarea'),
            'active' => array('Active venue', 'checkbox'),
        ),
        'hakuba_session' => array(
            'key' => array('Unique session key (lowercase letters, numbers and hyphens)', 'text'),
            'venue_id' => array('Venue', 'venue'),
            'audience' => array('Who can attend', 'text'),
            'type' => array('Session type', array('Kids', 'Adults', 'Mixed', 'Family')),
            'day' => array('Weekday', hakuba_club_days()),
            'start' => array('Start time', 'time'),
            'end' => array('End time', 'time'),
            'active' => array('Active session', 'checkbox'),
        ),
        'hakuba_exception' => array(
            'session_id' => array('Cancelled session', 'session'),
            'date' => array('Cancellation date', 'date'),
            'notice' => array('Notice for visitors', 'textarea'),
            'source' => array('Verification reference (for example, club notice or organiser)', 'text'),
            'checked_on' => array('Date verified', 'date'),
        ),
    );
}

function hakuba_club_valid_date($value) {
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/D', $value)) { return false; }
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, new DateTimeZone('Europe/London'));
    return $date && $date->format('Y-m-d') === $value && substr($value, 0, 4) !== '0000';
}

function hakuba_club_meta($id, $type) {
    $fields = array();
    foreach (hakuba_club_schema()[$type] as $key => $definition) {
        $fields[$key] = get_post_meta($id, '_hakuba_' . $key, true);
    }
    return $fields;
}

function hakuba_club_posts($type) {
    return get_posts(array('post_type' => $type, 'post_status' => 'publish', 'has_password' => false, 'numberposts' => -1, 'orderby' => 'ID', 'order' => 'ASC', 'suppress_filters' => true));
}

function hakuba_club_duplicate($type, $id, $fields) {
    $query = array('relation' => 'AND');
    foreach ($fields as $key => $value) {
        $query[] = array('key' => '_hakuba_' . $key, 'value' => $value, 'compare' => '=');
    }
    return (bool) get_posts(array(
        'post_type' => $type, 'post_status' => array('publish', 'future', 'draft', 'pending', 'private'),
        'post__not_in' => $id ? array($id) : array(), 'numberposts' => 1, 'fields' => 'ids', 'meta_query' => $query,
    ));
}

/** Validate the entire candidate before any metadata is changed. */
function hakuba_club_validate($type, $fields, $id = 0, $check_unique = true) {
    $schema = hakuba_club_schema();
    if (!isset($schema[$type])) { return new WP_Error('hakuba_invalid', 'Unknown club record type.'); }
    $clean = array();
    foreach ($schema[$type] as $key => $definition) {
        $value = $fields[$key] ?? '';
        if (!is_scalar($value)) { return new WP_Error('hakuba_invalid', $definition[0] . ': enter one value.'); }
        $value = (string) $value;
        $kind = $definition[1];
        if (is_array($kind) && !in_array($value, $kind, true)) {
            return new WP_Error('hakuba_invalid', $definition[0] . ': choose an available option.');
        }
        if ($kind === 'checkbox' && !in_array($value, array('', '0', '1'), true)) {
            return new WP_Error('hakuba_invalid', $definition[0] . ': use 1 or 0.');
        }
        if ($kind === 'time' && !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/D', $value)) {
            return new WP_Error('hakuba_invalid', $definition[0] . ': use a valid 24-hour time (HH:MM).');
        }
        if ($kind === 'date' && !hakuba_club_valid_date($value)) {
            return new WP_Error('hakuba_invalid', $definition[0] . ': use a real date (YYYY-MM-DD).');
        }
        if ($kind === 'venue' || $kind === 'session') {
            if (!ctype_digit($value) || (int) $value < 1) { return new WP_Error('hakuba_invalid', $definition[0] . ': choose a record.'); }
            $related_type = $kind === 'venue' ? 'hakuba_venue' : 'hakuba_session';
            $related = get_post((int) $value);
            if (!$related || $related->post_type !== $related_type || $related->post_status !== 'publish' || $related->post_password !== '' || get_post_meta($related->ID, '_hakuba_active', true) !== '1') {
                return new WP_Error('hakuba_invalid', $definition[0] . ': choose a published, active record without password protection.');
            }
            $valid_related = hakuba_club_validate($related_type, hakuba_club_meta($related->ID, $related_type), $related->ID);
            if (is_wp_error($valid_related)) { return new WP_Error('hakuba_invalid', $definition[0] . ': the related record needs correcting first.'); }
            $clean[$key] = (int) $value;
        } elseif ($kind === 'checkbox') {
            $clean[$key] = $value === '1' ? '1' : '0';
        } else {
            $clean[$key] = $kind === 'textarea' ? sanitize_textarea_field($value) : sanitize_text_field($value);
        }
    }
    if ($type === 'hakuba_session') {
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $clean['key'])) { return new WP_Error('hakuba_invalid', 'Enter a unique lowercase session key using letters, numbers and single hyphens.'); }
        if ($clean['audience'] === '') { return new WP_Error('hakuba_invalid', 'Describe who can attend.'); }
        if ($clean['start'] >= $clean['end']) { return new WP_Error('hakuba_invalid', 'The end time must be after the start time on the same day.'); }
        if ($check_unique && hakuba_club_duplicate($type, $id, array('key' => $clean['key']))) { return new WP_Error('hakuba_invalid', 'That session key is already in use.'); }
    }
    if ($type === 'hakuba_exception') {
        if ($clean['notice'] === '' || $clean['source'] === '') { return new WP_Error('hakuba_invalid', 'Enter a visitor notice and verification reference.'); }
        $today = new DateTimeImmutable('today', new DateTimeZone('Europe/London'));
        if ($clean['checked_on'] > $today->format('Y-m-d')) { return new WP_Error('hakuba_invalid', 'The verification date cannot be in the future.'); }
        $date = new DateTimeImmutable($clean['date'], new DateTimeZone('Europe/London'));
        if ($date->format('l') !== get_post_meta($clean['session_id'], '_hakuba_day', true)) { return new WP_Error('hakuba_invalid', 'The cancellation date must fall on the selected session weekday.'); }
        if ($check_unique && hakuba_club_duplicate($type, $id, array('session_id' => $clean['session_id'], 'date' => $clean['date']))) { return new WP_Error('hakuba_invalid', 'That session already has a cancellation on this date.'); }
    }
    return $clean;
}

function hakuba_club_get_venues($location = 'all') {
    $rows = array();
    foreach (hakuba_club_posts('hakuba_venue') as $post) {
        $meta = hakuba_club_validate('hakuba_venue', hakuba_club_meta($post->ID, 'hakuba_venue'), $post->ID);
        if (is_wp_error($meta) || $meta['active'] !== '1' || ($location !== 'all' && $meta['location'] !== $location)) { continue; }
        $rows[] = array('id' => (int) $post->ID, 'name' => $post->post_title, 'address' => $meta['address'], 'location' => $meta['location'], 'area' => $meta['area'], 'primary' => $meta['primary'] === '1', 'note' => $meta['note'], 'image_id' => (int) get_post_thumbnail_id($post->ID));
    }
    return $rows;
}

function hakuba_club_get_sessions($location = 'all', $types = array()) {
    $venues = array_column(hakuba_club_get_venues($location), null, 'id');
    $rows = array();
    foreach (hakuba_club_posts('hakuba_session') as $post) {
        $meta = hakuba_club_validate('hakuba_session', hakuba_club_meta($post->ID, 'hakuba_session'), $post->ID);
        if (is_wp_error($meta) || $meta['active'] !== '1' || !isset($venues[$meta['venue_id']]) || ($types && !in_array($meta['type'], (array) $types, true))) { continue; }
        $venue = $venues[$meta['venue_id']];
        $rows[] = array('id' => (int) $post->ID, 'key' => $meta['key'], 'venue_id' => $meta['venue_id'], 'venue' => $venue['name'], 'location' => $venue['location'], 'audience' => $meta['audience'], 'type' => $meta['type'], 'day' => $meta['day'], 'start' => $meta['start'], 'end' => $meta['end']);
    }
    $days = array_flip(hakuba_club_days());
    usort($rows, function ($a, $b) use ($days) { return array($days[$a['day']], $a['start'], $a['id']) <=> array($days[$b['day']], $b['start'], $b['id']); });
    return $rows;
}

function hakuba_club_get_exceptions($location = 'all') {
    $sessions = array_column(hakuba_club_get_sessions($location), null, 'id');
    $rows = array();
    $seen = array();
    foreach (hakuba_club_posts('hakuba_exception') as $post) {
        // A duplicate from a trusted import must not erase a verified cancellation.
        $meta = hakuba_club_validate('hakuba_exception', hakuba_club_meta($post->ID, 'hakuba_exception'), $post->ID, false);
        if (is_wp_error($meta) || !isset($sessions[$meta['session_id']])) { continue; }
        $pair = $meta['session_id'] . ':' . $meta['date'];
        if (isset($seen[$pair])) { continue; }
        $seen[$pair] = true;
        $rows[] = array('id' => (int) $post->ID, 'session_id' => $meta['session_id'], 'date' => $meta['date'], 'notice' => $meta['notice'], 'source' => $meta['source'], 'checked_on' => $meta['checked_on']);
    }
    usort($rows, function ($a, $b) { return array($a['date'], $a['session_id'], $a['id']) <=> array($b['date'], $b['session_id'], $b['id']); });
    return $rows;
}

/** The persisted active session is authoritative, not caller-supplied schedule fields. */
function hakuba_club_next_occurrence($session, $now = null) {
    if (!is_array($session) || !isset($session['id']) || !is_scalar($session['id']) || !ctype_digit((string) $session['id'])) { return null; }
    $sessions = array_column(hakuba_club_get_sessions(), null, 'id');
    if (!isset($sessions[$session['id']])) { return null; }
    $session = $sessions[$session['id']];
    $timezone = new DateTimeZone('Europe/London');
    if ($now !== null && !$now instanceof DateTimeInterface) { return null; }
    $now = $now === null ? new DateTimeImmutable('now', $timezone) : DateTimeImmutable::createFromInterface($now)->setTimezone($timezone);
    $cancelled = array();
    foreach (hakuba_club_get_exceptions($session['location']) as $exception) {
        if ($exception['session_id'] === $session['id']) { $cancelled[$exception['date']] = true; }
    }
    $day = $now->setTime(0, 0);
    $horizon = $now->modify('+35 days');
    for ($offset = 0; $offset <= 35; $offset++) {
        $date = $day->modify('+' . $offset . ' days');
        if ($date->format('l') !== $session['day'] || isset($cancelled[$date->format('Y-m-d')])) { continue; }
        list($hour, $minute) = array_map('intval', explode(':', $session['start']));
        $start = $date->setTime($hour, $minute);
        if ($start->format('H:i') !== $session['start']) { continue; }
        if ($start >= $now && $start <= $horizon) { return $start->format('Y-m-d'); }
    }
    return null;
}
