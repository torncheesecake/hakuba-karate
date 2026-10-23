<?php
if (!defined('ABSPATH')) { exit; }
get_header();
while (have_posts()) {
    the_post();
    if (post_password_required()) { echo get_the_password_form(); continue; }
    $route = is_front_page() ? 'home' : get_page_uri();
    $views = hakuba_page_views();
    if (in_array($route, $views, true)) { require __DIR__ . '/views/' . str_replace('/', '-', $route) . '.php'; }
    else { echo '<section><h1>' . esc_html(get_the_title()) . '</h1>'; the_content(); echo '</section>'; }
}
get_footer();
