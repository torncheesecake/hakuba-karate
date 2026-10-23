<?php if (!defined('ABSPATH')) { exit; } ?>
<section class="resource-hero bleed-full"><div class="container">
  <p class="kicker">Hakuba / Training resources</p><h1>From the dojo.<br>Into your practice.</h1>
  <p>Your syllabus, a word you want to remember, your next step. Find the reference you need and bring your questions to class.</p>
  <nav aria-label="On this page"><a href="#syllabus">Find your syllabus ↓</a><a href="#member-app-preview">Explore the members app ↓</a><a href="#reference-library">Terminology &amp; kata ↓</a></nav>
</div></section>
<?php require __DIR__ . '/../template-parts/syllabus-library.php'; ?>
<section class="resource-app bleed-full" id="member-app-preview" aria-labelledby="resource-app-title"><div class="container resource-app__inner">
  <div><p class="kicker">For approved members</p><h2 id="resource-app-title">Your practice.<br>All together.</h2>
    <p>The same Hakuba feel, with the tools to support your training between classes. Pick a syllabus, keep track of what you have learnt and revisit the things you want to practise.</p>
    <ul><li><strong>Find your focus.</strong> Belt syllabus, stances, terminology and search.</li><li><strong>Make it stick.</strong> Study mode, practice quizzes, counting and belt tying.</li><li><strong>Prepare your next step.</strong> Track your syllabus progress, collect achievements and keep up with the club calendar.</li></ul>
    <?php hakuba_member_access(); ?>
    <p class="resource-app__note">The app supports practice. Your instructor guides your progress.</p>
  </div>
  <figure><img src="<?php echo esc_url(hakuba_asset('images/member-app-dashboard-current.png')); ?>" alt="Example of the redesigned Hakuba app with a syllabus selector, training panel and icon menu" width="1100" height="980" loading="lazy"><figcaption>Example interface. No personal progress or live class information is shown.</figcaption></figure>
</div></section>
<section class="resource-reference" id="reference-library"><div><p class="kicker">Understand the foundations</p><h2>The words.<br>The forms. The values.</h2><p>Use the club's existing reference library alongside your syllabus. Ask your instructor if a movement or explanation is unfamiliar.</p></div><ul class="resource-index">
  <li><a href="https://hakuba-karate.co.uk/karate-terminology/">Karate terminology<span aria-hidden="true">↗</span></a></li>

  <li><a href="https://hakuba-karate.co.uk/katas-of-wadoryu/">Katas of Wadoryu<span aria-hidden="true">↗</span></a></li>
</ul></section>
