<?php
if (!defined('ABSPATH')) { exit; }
function hakuba_asset($path) {
    $relative = '/assets/' . ltrim($path, '/');
    $url = get_theme_file_uri($relative);
    $file = get_theme_file_path($relative);
    return is_file($file) ? add_query_arg('hakuba_v', (string) filemtime($file), $url) : $url;
}
function hakuba_route($path = '/') { return home_url($path); }
function hakuba_srcset($value) {
    return preg_replace_callback('~/(?:images|fonts)/[^\s,]+~', function ($match) { return hakuba_asset($match[0]); }, $value);
}
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('hakuba-public', get_theme_file_uri('/assets/css/site.css'), array(), (string) filemtime(get_theme_file_path('/assets/css/site.css')));
    wp_enqueue_script('hakuba-public', get_theme_file_uri('/assets/js/site.js'), array(), (string) filemtime(get_theme_file_path('/assets/js/site.js')), array('in_footer' => true, 'strategy' => 'defer'));
});
add_action('wp_head', function () {
    foreach (array('oswald-latin-500-600.woff2', 'source-sans-3-latin-400-700.woff2') as $font) {
        echo '<link rel="preload" as="font" type="font/woff2" crossorigin href="' . esc_url(hakuba_asset('fonts/' . $font)) . '">' . "\n";
    }
}, 2);
function hakuba_hero_image($path, $alt, $width = 1280, $height = 960) {
    if (has_post_thumbnail()) {
        echo get_the_post_thumbnail(get_the_ID(), 'full', array('fetchpriority' => 'high', 'alt' => get_post_meta(get_post_thumbnail_id(), '_wp_attachment_image_alt', true) ?: get_the_title()));
    } else {
        echo '<img src="' . esc_url(hakuba_asset($path)) . '" alt="' . esc_attr($alt) . '" width="' . absint($width) . '" height="' . absint($height) . '" fetchpriority="high">';
    }
}
function hakuba_hero_caption($fallback) {
    $caption = has_post_thumbnail() ? wp_get_attachment_caption(get_post_thumbnail_id()) : $fallback;
    if ($caption) { echo '<figcaption>' . esc_html($caption) . '</figcaption>'; }
}
function hakuba_home_media() {
    echo '<figure class="hakuba-hero__image">';
    hakuba_hero_image('images/optimized/hakuba-course-september-2026-1280.webp', 'Hakuba students practising together at the September Mevagissey course');
    hakuba_hero_caption('Mevagissey / September 2026');
    echo '</figure>';
}

// Version public, locally hosted Media images as well as bundled theme assets.
function hakuba_media_asset_url($url, $attachment_id) {
    $uploads = wp_get_upload_dir();
    $file = get_attached_file($attachment_id);
    if (is_admin() || !is_string($url) || !str_starts_with($url, trailingslashit($uploads['baseurl'])) || !$file || !is_file($file)) { return $url; }
    return add_query_arg('hakuba_v', (string) filemtime($file), $url);
}
add_filter('wp_get_attachment_image_src', function ($image, $attachment_id) {
    if (is_array($image)) { $image[0] = hakuba_media_asset_url($image[0], $attachment_id); }
    return $image;
}, 10, 2);
add_filter('wp_calculate_image_srcset', function ($sources, $size, $image_src, $metadata, $attachment_id) {
    if (is_array($sources)) {
        foreach ($sources as &$source) { $source['url'] = hakuba_media_asset_url($source['url'], $attachment_id); }
        unset($source);
    }
    return $sources;
}, 10, 5);
