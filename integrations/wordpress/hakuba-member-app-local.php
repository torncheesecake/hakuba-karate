<?php
/**
 * Plugin Name: Hakuba Members App - Local Adapter
 * Description: Local-only private app delivery and isolated preview progress. Never enables production or migrates member data.
 * Version: 0.1.0
 */
if (!defined('ABSPATH')) { exit; }

function hakuba_local_app_environment() {
    return wp_get_environment_type() === 'local' && in_array(wp_parse_url(home_url(), PHP_URL_HOST), array('localhost', '127.0.0.1', '::1'), true);
}
function hakuba_local_app_source() {
    if (!hakuba_local_app_environment() || !defined('HAKUBA_MEMBER_APP_FILE') || !is_string(HAKUBA_MEMBER_APP_FILE) || !path_is_absolute(HAKUBA_MEMBER_APP_FILE)) { return false; }
    $file = realpath(HAKUBA_MEMBER_APP_FILE);
    $document_root = realpath($_SERVER['DOCUMENT_ROOT'] ?? ABSPATH);
    if (!$file || !is_file($file) || !is_readable($file) || !$document_root) { return false; }
    foreach (array(realpath(ABSPATH), $document_root) as $root) {
        if (!$root || $file === $root || str_starts_with($file, rtrim($root, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR)) { return false; }
    }
    return $file;
}
function hakuba_local_app_headers() {
    nocache_headers();
    header('X-Robots-Tag: noindex, nofollow', true);
    header('X-Content-Type-Options: nosniff', true);
    header('Referrer-Policy: no-referrer', true);
}
function hakuba_local_app_available() {
    return hakuba_local_app_environment() && hakuba_local_app_source();
}
function hakuba_local_app_permission(WP_REST_Request $request) {
    $logout = $request->get_route() === '/hakuba-member/v1/logout';
    if (!hakuba_local_app_environment() || (!$logout && !hakuba_local_app_source())) { return new WP_Error('hakuba_app_unavailable', 'The local app is unavailable.', array('status'=>503)); }
    if (!is_user_logged_in()) { return new WP_Error('hakuba_sign_in', 'Please sign in.', array('status'=>401)); }
    if (!$logout && !current_user_can('hakuba_access_app')) { return new WP_Error('hakuba_approval', 'Club approval is required.', array('status'=>403)); }
    if (!$request->get_header('X-WP-Nonce') || !wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) { return new WP_Error('hakuba_nonce', 'Please reopen the app.', array('status'=>403)); }
    if ($request->get_header('X-Hakuba-Member-Id') !== (string) get_current_user_id()) { return new WP_Error('hakuba_account_changed', 'Your signed-in account changed. Please reopen the app.', array('status'=>409)); }
    if ($request->get_method() !== 'GET') {
        $home = wp_parse_url(home_url());
        $origin = $home['scheme'] . '://' . $home['host'] . (isset($home['port']) ? ':' . $home['port'] : '');
        if ($request->get_header('Origin') !== $origin) { return new WP_Error('hakuba_origin', 'Use the app on this website.', array('status'=>403)); }
    }
    return true;
}
function hakuba_local_app_progress() {
    global $wpdb;
    $key = '_hakuba_local_app_progress_v1';
    $exists = metadata_exists('user', get_current_user_id(), $key);
    $data = $exists ? get_user_meta(get_current_user_id(), $key, true) : array();
    if ($wpdb->last_error || !is_array($data)) { return new WP_Error('hakuba_progress_read', 'Saved progress could not be loaded. Saving is paused.', array('status'=>503)); }
    return $data;
}
function hakuba_local_app_clean($value, &$count, $depth = 0) {
    if (++$count > 12000 || $depth > 16) { throw new InvalidArgumentException('Progress is too complex.'); }
    if (is_array($value)) {
        $clean = array();
        foreach ($value as $key=>$item) {
            if (is_string($key) && (strlen($key) > 160 || in_array($key, array('__proto__', 'constructor', 'prototype'), true) || sanitize_text_field($key) !== $key)) { throw new InvalidArgumentException('Invalid progress key.'); }
            $clean[$key] = hakuba_local_app_clean($item, $count, $depth + 1);
        }
        return $clean;
    }
    if (is_string($value)) {
        if (strlen($value) > 12000) { throw new InvalidArgumentException('Progress text is too long.'); }
        return sanitize_textarea_field($value);
    }
    if (is_null($value) || is_bool($value) || is_int($value) || (is_float($value) && is_finite($value))) { return $value; }
    throw new InvalidArgumentException('Invalid progress value.');
}
function hakuba_local_app_save(WP_REST_Request $request) {
    if (strlen($request->get_body()) > 524288) { return new WP_Error('hakuba_progress_size', 'Progress is too large.', array('status'=>413)); }
    if (!str_starts_with(strtolower($request->get_header('Content-Type')), 'application/json')) { return new WP_Error('hakuba_progress_type', 'Use JSON for progress.', array('status'=>415)); }
    $payload = $request->get_json_params();
    if (!is_array($payload)) { return new WP_Error('hakuba_progress_format', 'Invalid progress.', array('status'=>400)); }
    $existing = hakuba_local_app_progress();
    if (is_wp_error($existing)) { return $existing; }
    $clean = array(); $count = 0;
    try {
        foreach (array('progress', 'achievements', 'quizHistory') as $field) {
            if (!array_key_exists($field, $payload)) { continue; }
            if (!is_array($payload[$field])) { throw new InvalidArgumentException('Invalid progress field.'); }
            $clean[$field] = hakuba_local_app_clean($payload[$field], $count);
        }
    } catch (InvalidArgumentException $error) { return new WP_Error('hakuba_progress_format', $error->getMessage(), array('status'=>400)); }
    if (!$clean) { return new WP_Error('hakuba_progress_empty', 'No progress fields supplied.', array('status'=>400)); }
    $merged = array_merge($existing, $clean, array('lastSyncedAt'=>gmdate('c')));
    // Use only the authenticated owner; submitted identity/email fields are ignored.
    update_user_meta(get_current_user_id(), '_hakuba_local_app_progress_v1', wp_slash($merged));
    if (get_user_meta(get_current_user_id(), '_hakuba_local_app_progress_v1', true) !== $merged) { return new WP_Error('hakuba_progress_write', 'Progress could not be saved. Please try again.', array('status'=>503)); }
    return rest_ensure_response(array('ok'=>true,'data'=>(object) $merged));
}
add_action('rest_api_init', function () {
    if (!hakuba_local_app_environment()) { return; }
    $permission = 'hakuba_local_app_permission';
    register_rest_route('hakuba-member/v1', '/session', array('methods'=>'GET','permission_callback'=>$permission,'callback'=>function () { return rest_ensure_response(array('approved'=>true,'userId'=>get_current_user_id(),'calendar'=>hakuba_local_app_calendar())); }));
    register_rest_route('hakuba-member/v1', '/progress', array(
        array('methods'=>'GET','permission_callback'=>$permission,'callback'=>function () { $data = hakuba_local_app_progress(); return is_wp_error($data) ? $data : rest_ensure_response(array('ok'=>true,'data'=>(object) $data)); }),
        array('methods'=>'POST','permission_callback'=>$permission,'callback'=>'hakuba_local_app_save'),
    ));
    register_rest_route('hakuba-member/v1', '/logout', array('methods'=>'POST','permission_callback'=>$permission,'callback'=>function () { wp_logout(); return rest_ensure_response(array('signedOut'=>true)); }));
});
add_filter('rest_post_dispatch', function ($response, $server, $request) {
    if (str_starts_with(strtolower($request->get_route()), '/hakuba-member/v1/')) {
        $response->header('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
        $response->header('X-Robots-Tag', 'noindex, nofollow');
        $response->header('X-Content-Type-Options', 'nosniff');
    }
    return $response;
}, 10, 3);
/** Reuse the website's published sessions and individually recorded cancellations. */
function hakuba_local_app_calendar() {
    $calendar = array('all'=>null, 'swindon'=>null, 'mevagissey'=>null);
    if (!function_exists('hakuba_club_get_sessions') || !function_exists('hakuba_club_next_occurrence')) { return $calendar; }
    foreach (hakuba_club_get_sessions() as $session) {
        $date = hakuba_club_next_occurrence($session);
        if (!$date) { continue; }
        $key = $date . 'T' . $session['start'];
        $time = new DateTimeImmutable($key, new DateTimeZone('Europe/London'));
        $entry = array('sort'=>$key, 'label'=>$time->format('D j M, g:ia') . ' / ' . $session['location'] . ' / ' . $session['audience']);
        $dojo = $session['location'] === 'Wroughton' ? 'swindon' : 'mevagissey';
        foreach (array('all', $dojo) as $group) {
            if ($calendar[$group] === null || $key < $calendar[$group]['sort']) { $calendar[$group] = $entry; }
        }
    }
    return $calendar;
}
add_action('template_redirect', function () {
    $path = untrailingslashit(rawurldecode(wp_parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/'));
    $app = untrailingslashit(wp_parse_url(home_url('/member-app/'), PHP_URL_PATH));
    if (!in_array($path, array($app, $app . '/index.html'), true)) { return; }
    hakuba_local_app_headers();
    if (!is_user_logged_in()) { auth_redirect(); exit; }
    if (!current_user_can('hakuba_access_app')) { wp_die('Your account needs club approval before you can use the Hakuba members app.', 'Club approval required', array('response'=>403)); }
    $file = hakuba_local_app_source();
    if (!$file || !is_readable(__DIR__ . '/member-session.js')) { wp_die('The local members app is unavailable. Please contact the club.', 'App unavailable', array('response'=>503)); }
    $html = file_get_contents($file);
    if ($html === false || !str_contains($html, '<head>')) { wp_die('The local members app could not be loaded.', 'App unavailable', array('response'=>503)); }
    if (function_exists('hakuba_asset')) {
        foreach (array('bwf-logo.jpg', 'ewf-logo.png') as $logo) { $html = str_replace('src="/' . $logo . '"', 'src="' . esc_url(hakuba_asset($logo)) . '"', $html); }
        $html = str_replace('https://iwf-karate.org/uploads/6/3/3/3/6333193/2941994.png', esc_url(hakuba_asset('iwf-logo.png')), $html);
    }
    // Render the same trusted theme fragment after the existing access checks.
    if (!locate_template('template-parts/site-header.php') || !str_contains($html, '<!-- HAKUBA_SITE_HEADER -->')) {
        wp_die('The member page header is unavailable.', 'App unavailable', array('response'=>503));
    }
    ob_start();
    get_template_part('template-parts/site-header', null, array('member_app'=>true));
    $site_header = ob_get_clean();
    $html = str_replace('<!-- HAKUBA_SITE_HEADER -->', $site_header, $html);
    $html = str_replace('</body>', '<script src="' . esc_url(hakuba_asset('js/site.js')) . '" defer></script></body>', $html);
    $user = wp_get_current_user();
    $config = array(
        'user'=>array('id'=>(int) $user->ID,'displayName'=>$user->display_name,'email'=>$user->user_email),
        'nonce'=>wp_create_nonce('wp_rest'),
        'session'=>array(
        'calendar'=>hakuba_local_app_calendar(),
        'sessionUrl'=>rest_url('hakuba-member/v1/session'),
        'progressUrl'=>rest_url('hakuba-member/v1/progress'),
        'logoutUrl'=>rest_url('hakuba-member/v1/logout'),
        'accessUrl'=>home_url('/app/#member-access'),
        'storageNamespace'=>'hakuba:local-wp:' . get_current_blog_id() . ':',
        ),
    );
    $bootstrap = '<script>window.HAKUBA_APPROVED_SESSION=' . wp_json_encode($config, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) . ';</script><script src="' . esc_url(add_query_arg('ver', (string) filemtime(__DIR__ . '/member-session.js'), plugins_url('member-session.js', __FILE__))) . '"></script>';
    status_header(200);
    header('Content-Type: text/html; charset=UTF-8', true);
    header("Content-Security-Policy: frame-ancestors 'self'; base-uri 'self'; object-src 'none'; connect-src 'self'", true);
    echo str_replace('<head>', '<head>' . $bootstrap, $html);
    exit;
}, -10);
