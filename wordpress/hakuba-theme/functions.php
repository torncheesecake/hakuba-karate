<?php
if (!defined('ABSPATH')) { exit; }
function hakuba_page_views() { return array('home','classes','classes/kids','classes/adults','classes/beginners','beginners','kids-karate','adult-karate','locations','locations/wroughton','locations/mevagissey','about','news','contact','app'); }
foreach (array('assets', 'content', 'schedule', 'seo', 'editor') as $module) {
    require_once __DIR__ . '/inc/' . $module . '.php';
}
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', array('search-form', 'gallery', 'caption', 'style', 'script'));
    add_post_type_support('page', 'excerpt');
    register_nav_menus(array('primary' => 'Main navigation'));
});
add_filter('body_class', function ($classes) { $classes[] = 'hakuba-wordpress'; return $classes; });

// Front-end account controls live in the shared site header; keep the admin toolbar in wp-admin.
add_filter('show_admin_bar', function ($show) { return is_admin() ? $show : false; });
