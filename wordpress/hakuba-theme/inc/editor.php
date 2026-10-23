<?php
if (!defined('ABSPATH')) { exit; }
function hakuba_managed_page($post) {
    if (!$post || $post->post_type !== 'page') { return false; }
    $route = (int)get_option('page_on_front') === $post->ID ? 'home' : get_page_uri($post);
    return in_array($route, hakuba_page_views(), true);
}
add_filter('use_block_editor_for_post', function ($use, $post) { return hakuba_managed_page($post) ? false : $use; }, 10, 2);
add_action('load-post.php', function () {
    $post = get_post(absint($_GET['post'] ?? 0));
    if (hakuba_managed_page($post)) { remove_post_type_support('page', 'editor'); }
});
add_action('edit_form_after_title', function ($post) {
    if (hakuba_managed_page($post)) {
        echo '<div class="notice notice-info inline"><p><strong>Approved Hakuba layout.</strong> The page title controls the browser/search title, not the visible heading. The excerpt controls the search summary. Visible headings and section copy are theme-managed in this first build. Page featured images appear only on Home, Classes, First Class, Kids, Adults and News. Location imagery belongs to Club venues; other managed pages do not use a Page featured image. Use Club venues, sessions and calendar changes for shared class information; use Posts and Media for news and photos. Other existing pages keep their normal editor.</p></div>';
    }
});
// Keep the app entry point fail-closed until an approved delivery adapter is installed.
add_action('template_redirect', function () {
    $path = untrailingslashit(wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
    $app_path = untrailingslashit(wp_parse_url(home_url('/member-app/'), PHP_URL_PATH));
    if ($path !== $app_path) { return; }
    nocache_headers();
    header('X-Robots-Tag: noindex, nofollow', true);
    if (!is_user_logged_in()) { auth_redirect(); exit; }
    if (!current_user_can('hakuba_access_app')) {
        wp_die('Your account needs club approval before you can use the Hakuba members app. Please contact the club if you are waiting for access.', 'Club approval required', array('response' => 403, 'back_link' => true));
    }
    wp_die('The members app is not connected to this local website preview yet. Your approval has been checked, but no private app files are exposed here.', 'Members app not connected', array('response' => 503, 'back_link' => true));
}, 0);
