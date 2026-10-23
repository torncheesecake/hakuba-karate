<?php
if (!defined('ABSPATH')) { exit; }
$syllabuses = json_decode(file_get_contents(__DIR__ . '/../data/public-syllabus.json'), true);
?>
<section class="syllabus-library" id="syllabus" aria-labelledby="syllabus-title">
  <div class="syllabus-library__intro"><div><p class="kicker">The club resource library</p><h2 id="syllabus-title">Find your syllabus.</h2></div><p>Choose your grade to read it here, without zooming into a PDF. Keep practising earlier material too: progression builds on what you already know.</p></div>
  <p class="syllabus-library__note">These reading versions adapt the club's published PDFs for club use. Your instructor confirms current grading requirements. The original documents remain available below.</p>
  <div class="syllabus-library__list">
  <?php foreach ($syllabuses as $item): ?>
    <details class="syllabus-reader syllabus-reader--<?php echo esc_attr($item['id']); ?>" id="syllabus-<?php echo esc_attr($item['id']); ?>" name="syllabus">
      <summary><span class="syllabus-reader__belt" aria-hidden="true"></span><strong><?php echo esc_html($item['grade']); ?></strong><span><?php echo esc_html($item['colour']); ?> belt</span><span class="syllabus-reader__action">Read syllabus <span aria-hidden="true">+</span></span></summary>
      <article class="syllabus-reader__body" aria-label="<?php echo esc_attr($item['grade']); ?> syllabus">
        <header><p class="kicker">Hakuba Wado-Ryu / Reading edition</p><h3><?php echo esc_html($item['grade'] . ' / ' . $item['colour'] . ' belt'); ?></h3><a class="editorial-link" href="<?php echo esc_url(hakuba_asset(ltrim($item['pdf'], '/'))); ?>">Open original PDF <span aria-hidden="true">↗</span></a></header>
        <?php foreach ($item['sections'] as $section): ?>
          <section class="syllabus-reader__section"><h4><?php echo esc_html($section['title']); ?></h4><div><?php foreach ($section['blocks'] as $text) { echo '<p>' . esc_html($text) . '</p>'; } ?></div></section>
        <?php endforeach; ?>
        <footer><p>Selected reference material from the published document, not a substitute for dojo instruction. Your instructor confirms current grading requirements.</p><a href="<?php echo esc_url($item['source']); ?>">View the club's source PDF</a></footer>
      </article>
    </details>
  <?php endforeach; ?>
  </div>
</section>
