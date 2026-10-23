<?php
if (!defined('ABSPATH')) { exit; }
add_filter('pre_handle_404', function ($preempt, $query) {
    if ($preempt || !is_page('news') || post_password_required(get_queried_object())) { return $preempt; }
    // The Page contains a separate Posts archive, not paginated Page content.
    $page = hakuba_news_page_index();
    if ($page > max(1, (int) hakuba_news_query()->max_num_pages)) {
        $query->set_404();
        $query->set('hakuba_news_out_of_range', true);
        status_header(404);
        nocache_headers();
    } else {
        status_header(200);
    }
    return true;
}, 10, 2);
function hakuba_news_canonical_url() {
    $url = get_permalink(get_queried_object_id());
    $page = hakuba_news_page_index();
    return $page > 1 ? add_query_arg('paged', $page, $url) : $url;
}
add_filter('get_canonical_url', function ($url, $post) {
    return !is_404() && is_page('news') && $post->ID === get_queried_object_id() ? hakuba_news_canonical_url() : $url;
}, 10, 2);
add_filter('redirect_canonical', function ($redirect) {
    return get_query_var('hakuba_news_out_of_range') || (is_page('news') && hakuba_news_page_index() > 1) ? false : $redirect;
});
add_filter('wp_robots', function ($robots) {
    if (is_singular('post') && get_post_meta(get_queried_object_id(), '_hakuba_original_source', true)) {
        unset($robots['index']);
        $robots['noindex'] = true;
    }
    return $robots;
});
add_action('wp_head', function () {
    if (is_404() || !is_singular()) { return; }
    $post = get_queried_object();
    if (post_password_required($post)) { return; }
    $url = is_page('news') ? hakuba_news_canonical_url() : get_permalink($post);
    $description = $post->post_excerpt ?: wp_trim_words(wp_strip_all_tags($post->post_content), 28);
    if (!$description) { $description = 'Traditional Wado-Ryu karate for children aged 7+, teenagers and adults in Wroughton, Swindon and Mevagissey.'; }
    $image = has_post_thumbnail($post) ? get_the_post_thumbnail_url($post, 'large') : hakuba_asset('images/optimized/hakuba-course-september-2026-1280.webp');
    echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
    foreach (array('og:type'=>is_singular('post')?'article':'website','og:title'=>wp_get_document_title(),'og:description'=>$description,'og:url'=>$url,'og:image'=>$image,'og:locale'=>'en_GB','twitter:card'=>'summary_large_image') as $key=>$value) {
        echo '<meta ' . (str_starts_with($key,'twitter:')?'name':'property') . '="' . esc_attr($key) . '" content="' . esc_attr($value) . '">' . "\n";
    }
    $club = array('@context'=>'https://schema.org','@type'=>'SportsOrganization','@id'=>home_url('/#organisation'),'name'=>'Hakuba Karate','url'=>home_url('/'),'sport'=>'Wado-Ryu karate','logo'=>hakuba_asset('hakuba-logo.png'),'email'=>'hakuba.wadoryu.karate@gmail.com','telephone'=>'07772 491216','sameAs'=>array('https://www.facebook.com/profile.php?id=61586031931783','https://www.facebook.com/profile.php?id=100090005253077'),'areaServed'=>array('Wroughton','Swindon','Mevagissey'));
    $club['location'] = array_map(function ($venue) { return array('@type'=>'Place','name'=>$venue['name'],'address'=>$venue['address']); }, array_values(array_filter(hakuba_venues(), function ($venue) { return $venue['primary']; })));
    echo '<script type="application/ld+json">' . wp_json_encode($club, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) . '</script>' . "\n";
}, 5);
add_filter('pre_get_document_title', function ($title) {
    if (!is_singular('page')) { return $title; }
    $title = get_the_title(get_queried_object_id());
    return is_page('news') && hakuba_news_page_index() > 1 ? $title . ' - Page ' . hakuba_news_page_index() : $title;
});
