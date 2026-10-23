<?php if (!defined('ABSPATH')) { exit; } $member_app = !empty($args['member_app']); ?>
<header id="hakuba-site-header" class="site-header public-header"><div class="container site-header__inner"><div class="site-header__bar">
<a href="<?php echo esc_url(home_url('/')); ?>" class="brand"><img src="<?php echo esc_url(get_theme_mod('custom_logo') ? wp_get_attachment_image_url(get_theme_mod('custom_logo'), 'full') : hakuba_asset('hakuba-logo.png')); ?>" alt="Hakuba Karate logo" class="brand__logo" width="54" height="54"><span>Hakuba Karate<small>Traditional Wado-Ryu</small></span></a>
<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="main-nav" hidden><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg> Menu</button></div>
<nav id="main-nav" aria-label="Main navigation">
<?php
$menu = get_nav_menu_locations();
if (!empty($menu['primary'])) {
    $items = wp_get_nav_menu_items($menu['primary']);
    $has_app = false;
    foreach ($items ?: array() as $item) {
        if (untrailingslashit($item->url) === untrailingslashit(home_url('/member-app/'))) { $has_app = true; }
        echo '<a href="' . esc_url($item->url) . '"' . (($member_app ? untrailingslashit($item->url) === untrailingslashit(home_url('/member-app/')) : url_to_postid($item->url) === get_queried_object_id()) ? ' aria-current="page" class="active"' : '') . '>' . esc_html($item->title) . '</a>';
    }
    if (!$has_app) { echo '<a href="' . esc_url(home_url('/member-app/')) . '"' . ($member_app ? ' class="active" aria-current="page"' : '') . '>App</a>'; }
} else {
    foreach (array('/classes/' => 'Classes', '/beginners/' => 'First Class', '/locations/' => 'Locations', '/about/' => 'About', '/news/' => 'News', '/app/' => 'Resources', '/member-app/' => 'App', '/contact/' => 'Contact') as $url => $label) {
        $active = $member_app ? $url === '/member-app/' : !is_front_page() && untrailingslashit(wp_parse_url(get_permalink(), PHP_URL_PATH) ?: '') === untrailingslashit(wp_parse_url(home_url($url), PHP_URL_PATH) ?: '');
        echo '<a href="' . esc_url(home_url($url)) . '" class="' . ($active ? 'active ' : '') . ($label === 'Contact' ? 'public-nav-trial' : '') . '"' . ($active ? ' aria-current="page"' : '') . '>' . esc_html($label === 'Contact' ? 'Try a free class' : $label) . '</a>';
    }
}
?></nav><?php if (is_user_logged_in()): $header_user = wp_get_current_user(); ?>
<div id="member-account-slot">
<details class="site-account">
<summary aria-label="Your account"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg></summary>
<div class="site-account__panel">
<p class="site-account__name"><?php echo esc_html($header_user->display_name); ?></p>
<?php if ($member_app): ?><button type="button" onclick="showProfile(); this.closest('details').open = false;">Profile &amp; settings</button><?php else: ?><a href="<?php echo esc_url(home_url('/member-app/')); ?>">Members app</a><?php endif; ?>
<?php if (current_user_can('edit_posts')): ?><a href="<?php echo esc_url(admin_url()); ?>">WordPress dashboard</a><?php endif; ?>
<a href="<?php echo esc_url(get_edit_profile_url()); ?>">WordPress account</a>
<a href="<?php echo esc_url(wp_logout_url(home_url('/'))); ?>">Sign out</a>
</div></details></div>
<?php endif; ?></div></header>
