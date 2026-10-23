<?php
if (!defined('ABSPATH')) { exit; }
function hakuba_time($time) {
    $value = DateTimeImmutable::createFromFormat('!H:i', $time, new DateTimeZone('Europe/London'));
    return $value ? $value->format('g:ia') : '';
}
function hakuba_schedule($title = 'Weekly class times', $location = 'all', $types = array()) {
    $id = wp_unique_id('hakuba-schedule-');
    echo '<section class="dojo-schedule" aria-labelledby="' . esc_attr($id) . '-title"><div class="dojo-schedule__heading"><div><h2 id="' . esc_attr($id) . '-title">' . esc_html($title) . '</h2><p>Usual weekly sessions. Beginners welcome.</p></div>';
    if (!function_exists('hakuba_club_get_sessions')) { echo '</div><p>Class information is unavailable here. Please contact the club to confirm your session.</p></section>'; return; }
    $sessions = hakuba_club_get_sessions($location, $types);
    if ($location === 'all') {
        echo '<div class="dojo-schedule__filters" hidden role="group" aria-label="Filter class times by dojo">';
        foreach (array('all'=>'Both dojos','Wroughton'=>'Wroughton','Mevagissey'=>'Mevagissey') as $key=>$label) {
            echo '<button type="button" data-location="' . esc_attr($key) . '" class="dojo-schedule__filter' . ($key === 'all' ? ' is-active' : '') . '" aria-pressed="' . ($key === 'all' ? 'true' : 'false') . '" aria-controls="' . esc_attr($id) . '-sessions">' . esc_html($label) . '</button>';
        }
        echo '</div>';
    }
    echo '</div><p class="dojo-schedule__guidance">No booking needed. Choose a suitable session and arrive a few minutes early to meet your instructor.</p><div class="dojo-schedule__groups" id="' . esc_attr($id) . '-sessions">';
    $groups = array();
    foreach ($sessions as $session) { $groups[$session['location']][] = $session; }
    foreach ($groups as $dojo=>$rows) {
        $venues = hakuba_club_get_venues($dojo);
        $area = $venues ? $venues[0]['area'] : $dojo;
        echo '<section class="dojo-schedule__dojo" data-dojo="' . esc_attr($dojo) . '" aria-labelledby="' . esc_attr($id . '-' . sanitize_title($dojo)) . '"><header class="dojo-schedule__place"><div><p>' . esc_html($area) . '</p><h3 id="' . esc_attr($id . '-' . sanitize_title($dojo)) . '">' . esc_html($dojo) . '</h3>';
        if (count(array_unique(array_column($rows, 'venue_id'))) === 1) { echo '<span>' . esc_html($rows[0]['venue']) . '</span>'; }
        echo '</div><a href="' . esc_url(home_url('/locations/' . sanitize_title($dojo) . '/')) . '">Venue details</a></header><ul class="dojo-schedule__sessions">';
        foreach ($rows as $row) {
            $next = hakuba_club_next_occurrence($row);
            $start = hakuba_time($row['start']); $end = hakuba_time($row['end']);
            if (substr($start, -2) === substr($end, -2)) { $start = substr($start, 0, -2); }
            $interest = $row['type'] === 'Kids' ? 'Kids' : ($row['type'] === 'Adults' ? 'Teen-adult' : 'Not sure');
            $url = add_query_arg(array('location'=>$dojo,'interest'=>$interest,'session'=>$row['key']), home_url('/contact/'));
            echo '<li class="dojo-schedule__session"><div class="dojo-schedule__when"><h4>' . esc_html($row['day']) . '</h4><p class="dojo-schedule__time">' . esc_html($start) . '<span>&ndash;</span>' . esc_html($end) . '</p></div><div class="dojo-schedule__who"><p class="dojo-schedule__audience">' . esc_html($row['audience']) . '</p>';
            if ($next) { echo '<p class="dojo-schedule__next">Next class: <time datetime="' . esc_attr($next) . '">' . esc_html(wp_date('j M', strtotime($next . 'T12:00:00Z'), new DateTimeZone('Europe/London'))) . '</time></p>'; }
            if (count(array_unique(array_column($rows,'venue_id'))) > 1) { echo '<p>' . esc_html($row['venue']) . '</p>'; }
            echo '</div><a class="dojo-schedule__enquiry" href="' . esc_url($url) . '" aria-label="' . esc_attr('Ask about ' . $row['audience'] . ', ' . $row['day'] . ' in ' . $dojo) . '">Ask about this class <span aria-hidden="true">&#8599;</span></a></li>';
        }
        echo '</ul></section>';
    }
    if (!$groups) { echo '<p>No matching weekly sessions are currently published. Contact the club for guidance.</p>'; }
    echo '</div>';
    $now = new DateTimeImmutable('today', new DateTimeZone('Europe/London'));
    $last = $now->modify('+35 days')->format('Y-m-d');
    $session_ids = array_column($sessions, 'location', 'id');
    $changes = array_filter(hakuba_club_get_exceptions($location), function ($row) use ($now, $last, $session_ids) { return $row['date'] >= $now->format('Y-m-d') && $row['date'] <= $last && isset($session_ids[$row['session_id']]); });
    if ($changes) {
        echo '<aside class="calendar-notice" aria-label="Upcoming class changes"><div class="calendar-notice__changes"><strong>Upcoming class changes</strong><ul>';
        foreach ($changes as $change) { echo '<li data-change-location="' . esc_attr($session_ids[$change['session_id']]) . '">' . esc_html($change['notice']) . '</li>'; }
        echo '</ul></div></aside>';
    }
    echo '</section>';
}

/** A compact weekly overview without repeating the dated calendar. */
function hakuba_class_summary() {
    echo '<div class="class-overview"><h2>Find your weekly class.</h2><div class="class-overview__dojos">';
    $groups = array();
    if (function_exists('hakuba_club_get_sessions')) {
        foreach (hakuba_club_get_sessions() as $session) { $groups[$session['location']][] = $session; }
    }
    foreach ($groups as $dojo => $sessions) {
        echo '<section class="class-overview__dojo"><h3>' . esc_html($dojo) . '</h3><ul>';
        foreach ($sessions as $session) {
            $start = hakuba_time($session['start']);
            $end = hakuba_time($session['end']);
            if (substr($start, -2) === substr($end, -2)) { $start = substr($start, 0, -2); }
            echo '<li><div><strong>' . esc_html($session['day']) . '</strong><span>' . esc_html($session['audience']) . '</span></div><span class="class-overview__time">' . esc_html($start) . '&ndash;' . esc_html($end) . '</span></li>';
        }
        echo '</ul><a class="public-text-link" href="' . esc_url(home_url('/locations/' . sanitize_title($dojo) . '/')) . '">Venue &amp; arrival information <span aria-hidden="true">&#8594;</span></a></section>';
    }
    if (!$groups) { echo '<p>Contact the club for current class times.</p>'; }
    echo '</div></div>';
}

function hakuba_class_link() {
    echo '<p class="class-guide">Ready to give it a go? <a href="' . esc_url(home_url('/classes/#class-times')) . '">View class times and any changes</a>. No booking needed; arrive a few minutes early to meet your instructor.</p>';
}
