<?php
get_header();
while (have_posts()) { the_post(); if (post_password_required()) { echo get_the_password_form(); continue; } ?>
<article class="club-post"><header><p class="kicker">Club news<?php $date = hakuba_news_date(get_post()); if ($date !== '') { echo ' / ' . esc_html($date); } ?></p><h1><?php the_title(); ?></h1></header><?php if (has_post_thumbnail()) { the_post_thumbnail('large'); } ?><div class="club-post__body"><?php the_content(); ?></div><a class="editorial-link" href="<?php echo esc_url(home_url('/news/')); ?>">Back to club news</a></article>
<?php } get_footer();
