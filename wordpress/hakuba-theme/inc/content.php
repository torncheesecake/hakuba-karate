<?php
if (!defined('ABSPATH')) { exit; }
function hakuba_venues($location = 'all') { return function_exists('hakuba_club_get_venues') ? hakuba_club_get_venues($location) : array(); }
function hakuba_venue_image($venue, $class = '') {
    if ($venue['image_id']) { echo wp_get_attachment_image($venue['image_id'], 'large', false, array('class'=>$class, 'loading'=>'lazy')); return; }
    echo '<div class="venue-photo-pending">Venue photograph to be added by the club</div>';
}
function hakuba_venue_address($venue) {
    echo '<address class="venue-address"><strong>' . esc_html($venue['name']) . '</strong><span>' . esc_html($venue['address']) . '</span>';
    $map = 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($venue['name'] . ' ' . $venue['address']);
    echo '<a href="' . esc_url($map) . '">Find the venue on a map</a></address>';
}
function hakuba_venue_cards() {
    echo '<div class="dojo-locations__grid">'; $count = 0;
    foreach (hakuba_venues() as $venue) {
        if (!$venue['primary']) { continue; } $count++;
        $url = home_url('/locations/' . sanitize_title($venue['location']) . '/');
        echo '<article class="dojo-location"><a class="dojo-location__image" href="' . esc_url($url) . '" aria-label="' . esc_attr('Explore ' . $venue['location'] . ' dojo') . '">'; hakuba_venue_image($venue);
        echo '</a><div class="dojo-location__copy"><p class="public-eyebrow">' . esc_html($venue['area']) . '</p><h3>' . esc_html($venue['location']) . '</h3>'; hakuba_venue_address($venue);
        echo '<p>' . esc_html($venue['note']) . '</p><a class="public-text-link" href="' . esc_url($url) . '">Venue &amp; class details <span aria-hidden="true">&#8594;</span></a></div></article>';
    }
    if (!$count) { echo '<p>Venue details are not available here yet. Please contact the club before travelling.</p>'; }
    echo '</div>';
}
function hakuba_contact_venues() {
    echo '<div class="contact-venues">';
    foreach (hakuba_venues() as $venue) {
        if (!$venue['primary']) { continue; }
        echo '<article><h3>' . esc_html($venue['location']) . ' <small>' . esc_html($venue['area']) . '</small></h3>'; hakuba_venue_address($venue);
        echo '<a href="' . esc_url(home_url('/locations/' . sanitize_title($venue['location']) . '/')) . '">Venue and class details</a></article>';
    }
    echo '</div>';
}
function hakuba_news_page_index() {
    return is_page('news') ? max(1, absint(get_query_var('paged')), absint(get_query_var('page'))) : 1;
}
function hakuba_news_query($compact = false) {
    static $queries = array();
    $page = $compact ? 1 : hakuba_news_page_index();
    $key = ($compact ? 'compact-' : 'archive-') . $page;
    if (!isset($queries[$key])) {
        $queries[$key] = new WP_Query(array('post_type'=>'post','post_status'=>'publish','has_password'=>false,'posts_per_page'=>$compact ? 3 : 12,'paged'=>$page,'orderby'=>'date','order'=>'DESC'));
    }
    return $queries[$key];
}
function hakuba_news_date($post) {
    if (!get_post_meta($post->ID, '_hakuba_original_source', true)) { return get_the_date('j F Y', $post); }
    $date = get_post_meta($post->ID, '_hakuba_original_date', true);
    if (!is_string($date) || !preg_match('/\A([0-9]{4})-([0-9]{2})-([0-9]{2})\z/', $date, $parts) || !checkdate((int) $parts[2], (int) $parts[3], (int) $parts[1])) { return ''; }
    $published = DateTimeImmutable::createFromFormat('!Y-m-d', $date, wp_timezone());
    return $published ? wp_date('j F Y', $published->getTimestamp(), wp_timezone()) : '';
}
function hakuba_news($compact = false) {
    $page = hakuba_news_page_index();
    $query = hakuba_news_query($compact);
    $posts = $query->posts;
    echo '<div class="' . ($compact ? 'public-news__list' : 'news-band__list') . '">';
    foreach ($posts as $post) {
        $source = get_post_meta($post->ID, '_hakuba_original_source', true);
        $url = $source ?: get_permalink($post);
        $date = hakuba_news_date($post);
        echo '<article>';
        if ($date !== '') { echo '<p class="' . ($compact ? 'public-eyebrow' : 'news-date') . '">' . esc_html($date) . '</p>'; }
        echo '<h3><a href="' . esc_url($url) . '">' . esc_html(get_the_title($post)) . '</a></h3>';
        if (!$compact) {
            if (has_post_thumbnail($post)) { echo get_the_post_thumbnail($post, 'medium_large', array('loading'=>'lazy')); }
            if ($post->post_excerpt) { echo '<p>' . esc_html($post->post_excerpt) . '</p>'; }
            echo '<a class="news-post-link" href="' . esc_url($url) . '">' . ($source ? 'Read the original club post' : 'Read the club post') . ' <span class="news-post-link__arrow" aria-hidden="true">&#8599;</span></a>';
        }
        echo '</article>';
    }
    if (!$posts) { echo '<p>No club posts are published here yet. Follow the club pages for updates.</p>'; }
    echo '</div>';
    if (!$compact && $query->max_num_pages > 1) {
        echo '<nav class="news-pagination" aria-label="News archive pages">' . wp_kses_post(paginate_links(array('base'=>add_query_arg('paged', '%#%', get_permalink(get_queried_object_id())),'format'=>'','current'=>$page,'total'=>$query->max_num_pages,'prev_text'=>'Newer posts','next_text'=>'Older posts'))) . '</nav>';
    }
}
function hakuba_member_access() {
    $available = function_exists('hakuba_local_app_available') && hakuba_local_app_available();
    $signed_in = is_user_logged_in();
    $approved = $signed_in && current_user_can('hakuba_access_app');
    $connection_note = $available ? 'Local preview: progress is separate from your existing app account.' : 'The app connection is not enabled in this local preview yet.';
    $app_url = home_url('/member-app/');
    echo '<section class="member-access" id="member-access" aria-labelledby="member-access-title"><h3 id="member-access-title">Welcome to your member app</h3>';
    if ($signed_in && !$approved) {
        echo '<p>Your account is awaiting club approval. You are signed in, but the club needs to approve your account before you can use the app.</p><p><a class="cta-button cta-button--primary" href="' . esc_url(home_url('/contact/')) . '">Ask the club about approval</a></p>';
    } elseif ($approved) {
        if ($available) {
            echo '<p>Your account is approved. Open the app to keep practising between classes.</p><a class="cta-button cta-button--primary" href="' . esc_url($app_url) . '">Open member app</a>';
        } else {
            echo '<p>Your account is approved, but the app connection is not enabled in this local preview yet.</p><p><a href="' . esc_url(home_url('/contact/')) . '">Ask the club for help accessing the app</a>.</p>';
        }
    } else {
        echo '<p>Sign in to keep practising between classes. Your account needs club approval before you can use the app.</p><div class="button-row"><a class="cta-button cta-button--primary" href="' . esc_url(wp_login_url($app_url)) . '">Sign in</a>';
        if (get_option('users_can_register')) {
            echo '<a class="cta-button cta-button--secondary" href="' . esc_url(wp_registration_url()) . '">Register an account</a>';
        } else {
            echo '<a class="cta-button cta-button--secondary" href="' . esc_url(home_url('/contact/')) . '">Ask about registration</a>';
        }
        echo '</div><p>Registration does not grant app access until the club approves your account.</p>';
    }
    echo '<p><a href="' . esc_url(wp_lostpassword_url($app_url)) . '">Reset your password</a> or <a href="' . esc_url(home_url('/contact/')) . '">ask the club for account help</a>.</p>';
    if (!$approved || $available) { echo '<p class="public-small">' . esc_html($connection_note) . '</p>'; }
    echo '</section>';
}
function hakuba_contact_form() {
    echo '<form class="contact-form-panel" aria-describedby="enquiry-availability"><h2>Your first step.</h2><p id="enquiry-availability" class="enquiry-mode">Form preview only. Sending is not connected; please email or phone the club.</p><fieldset disabled><legend>Enquiry form preview</legend><div class="contact-fields">';
    foreach (array('name'=>'Name','email'=>'Email','phone'=>'Phone (optional)','age'=>'Student age') as $name=>$label) {
        echo '<div class="contact-field"><label for="enquiry-' . esc_attr($name) . '">' . esc_html($label) . '</label><input disabled id="enquiry-' . esc_attr($name) . '" name="' . esc_attr($name) . '" type="' . ($name === 'age' ? 'number' : ($name === 'email' ? 'email' : ($name === 'phone' ? 'tel' : 'text'))) . '"></div>';
    }
    echo '<div class="contact-field"><label for="enquiry-location">Preferred location</label><select disabled id="enquiry-location" name="location"><option>Choose your dojo</option><option>Wroughton</option><option>Mevagissey</option></select></div><div class="contact-field"><label for="enquiry-interest">Session interest</label><select disabled id="enquiry-interest" name="interest"><option>Kids</option><option>Teen-adult</option><option>Beginner</option><option>Not sure</option></select></div></div><div class="contact-field contact-field--full"><label for="enquiry-message">Message</label><textarea disabled id="enquiry-message" name="message" rows="5"></textarea></div><label class="checkbox-row contact-consent" for="enquiry-consent"><input disabled id="enquiry-consent" name="consent" type="checkbox"><span>I agree to be contacted about this enquiry.</span></label><button class="contact-submit" disabled type="button">Enquiry service not connected</button></fieldset><a class="cta-button cta-button--primary contact-email" href="mailto:hakuba.wadoryu.karate@gmail.com">Email the club</a></form>';
}
