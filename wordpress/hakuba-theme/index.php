<?php
get_header();
echo '<section><h1>From the club</h1>';
while (have_posts()) { the_post(); echo '<article><h2><a href="' . esc_url(get_permalink()) . '">' . esc_html(get_the_title()) . '</a></h2>'; the_excerpt(); echo '</article>'; }
the_posts_pagination(); echo '</section>'; get_footer();
