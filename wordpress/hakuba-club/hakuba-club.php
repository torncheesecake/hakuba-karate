<?php
/**
 * Plugin Name: Hakuba Club Content
 * Description: Native venues, weekly sessions and verified dated cancellations. No automatic setup or member integration.
 * Version: 0.1.0
 * Requires PHP: 8.0
 */
if (!defined('ABSPATH')) { exit; }

require_once __DIR__ . '/content.php';
require_once __DIR__ . '/admin.php';

add_action('init', function () {
    foreach (array('hakuba_venue' => 'Venues', 'hakuba_session' => 'Sessions', 'hakuba_exception' => 'Dated cancellations') as $type => $label) {
        register_post_type($type, array(
            'labels' => array('name' => $label, 'singular_name' => array('hakuba_venue' => 'Venue', 'hakuba_session' => 'Session', 'hakuba_exception' => 'Dated cancellation')[$type]),
            'public' => false,
            'publicly_queryable' => false,
            'exclude_from_search' => true,
            'show_ui' => true,
            'show_in_rest' => false,
            'show_in_nav_menus' => false,
            'has_archive' => false,
            'rewrite' => false,
            'query_var' => false,
            'capability_type' => 'post',
            'map_meta_cap' => true,
            'capabilities' => array('read' => 'edit_posts'),
            'supports' => $type === 'hakuba_venue' ? array('title', 'thumbnail') : array('title'),
        ));
    }
});

add_filter('wp_sitemaps_post_types', function ($types) {
    foreach (array_keys(hakuba_club_schema()) as $type) { unset($types[$type]); }
    return $types;
});
