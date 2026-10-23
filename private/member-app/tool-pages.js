// Presentation controls only: no member progress or account writes.
(() => {
  let badgeFilter = 'all';
  function refreshAchievements() {
    const badges = [...document.querySelectorAll('.member-badge')];
    const tier = document.getElementById('achievement-tier-filter')?.value || 'all';
    const category = document.getElementById('achievement-category-filter')?.value || 'all';
    let visible = 0;
    for (const badge of badges) {
      const earned = badge.dataset.earned === 'true';
      const matchesState = badgeFilter === 'earned' ? earned : badgeFilter === 'next' ? !earned : true;
      badge.hidden = !matchesState || (tier !== 'all' && badge.dataset.tier !== tier) || (category !== 'all' && badge.dataset.category !== category);
      if (!badge.hidden) visible++;
    }
    document.querySelectorAll('[data-badge-filter]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.badgeFilter === badgeFilter));
    });
    const status = document.getElementById('badge-filter-status');
    if (status) status.textContent = badges.length ? `${visible} of ${badges.length} achievements shown` : '';
    const empty = document.getElementById('achievement-filter-empty');
    if (empty) empty.hidden = visible !== 0;
  }
  function refreshHome() {
    const summary = document.getElementById('home-review-summary');
    if (!summary || typeof getMemberHomeLearning !== 'function') return;
    const { profile, belt, recordedBelt } = getMemberHomeLearning();
    const recorded = document.getElementById('home-recorded-belt');
    if (recorded) recorded.textContent = recordedBelt
      ? 'Recorded in this app: ' + recordedBelt.name + ' / ' + recordedBelt.color
      : 'No passed belt recorded yet. The selector below chooses what you study.';
    document.getElementById('home-review-syllabus').textContent = 'Up to ' + belt.color + ' / ' + belt.name + '. This is your chosen syllabus, not an awarded grade.';
    summary.textContent = !profile.total
      ? 'There are no quiz terms for this syllabus yet. Browse terminology or continue your syllabus instead.'
      : !profile.seen
        ? 'No recall record for this syllabus yet. Try a short review, or browse terminology first. Your answers will help shape later practice.'
        : profile.due || profile.weak
          ? profile.due + ' terms due for review; ' + profile.weak + ' need more practice. Some terms may be in both groups.'
          : 'Nothing is due for review in this syllabus right now. Keep familiar terms fresh with a short practice.';
    const focus = document.getElementById('home-review-focus');
    focus.hidden = !profile.focus.length;
    focus.textContent = profile.focus.length ? 'Suggested focus: ' + profile.focus.join(', ') + '.' : '';
    document.getElementById('home-review-start').textContent = profile.total
      ? 'Start ' + Math.min(5, profile.total) + '-question review'
      : 'Explore terminology';
  }
  window.hakubaToolPages = { refreshAchievements, refreshHome };
  document.addEventListener('DOMContentLoaded', () => {
    refreshHome();
    const nextClass = document.getElementById('next-class-display');
    const homeClass = document.getElementById('home-next-class');
    if (nextClass && homeClass) {
      const refreshClass = () => { homeClass.textContent = nextClass.textContent; };
      refreshClass();
      new MutationObserver(refreshClass).observe(nextClass, { childList: true, characterData: true, subtree: true });
    }
    const beltLabel = document.getElementById('current-belt-label');
    if (beltLabel) new MutationObserver(refreshHome).observe(beltLabel, { childList: true, characterData: true, subtree: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshHome(); });
    const quizStart = document.getElementById('quiz-start');
    const foldQuizHelp = (selector, title) => {
      const content = quizStart?.querySelector(selector);
      if (!content) return;
      const details = document.createElement('details');
      details.className = 'quiz-help';
      const summary = document.createElement('summary');
      summary.textContent = title;
      details.append(summary, content);
      quizStart.append(details);
    };
    foldQuizHelp('.quiz-adaptive-intro', 'How difficulty adjusts');
    foldQuizHelp('#weak-spots-dashboard', 'Your practice overview');
    document.querySelectorAll('[data-badge-filter]').forEach(button => button.addEventListener('click', () => {
      badgeFilter = button.dataset.badgeFilter;
      refreshAchievements();
    }));
    ['achievement-tier-filter', 'achievement-category-filter'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', refreshAchievements);
    });
    document.querySelectorAll('[data-search-example]').forEach(button => button.addEventListener('click', () => {
      const input = document.getElementById('search-input');
      input.value = button.dataset.searchExample;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    }));
    document.querySelectorAll('#stances-tab [data-stance-target]').forEach(button => button.addEventListener('click', () => {
      const heading = document.getElementById(button.dataset.stanceTarget);
      if (!heading) return;
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start', behavior: 'auto' });
    }));
    const terminology = document.querySelector('#terminology-tab > .card');
    if (terminology) {
      const nav = document.createElement('nav');
      nav.className = 'member-category-jumps';
      nav.setAttribute('aria-label', 'Terminology categories');
      terminology.querySelectorAll(':scope > h3').forEach((heading, index) => {
        heading.id = `term-category-${index}`;
        heading.tabIndex = -1;
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = heading.textContent;
        button.addEventListener('click', () => {
          heading.focus({ preventScroll: true });
          heading.scrollIntoView({ block: 'start', behavior: 'auto' });
        });
        nav.append(button);
      });
      terminology.querySelector('.member-tool-heading').after(nav);
    }
    const calendarButtons = [...document.querySelectorAll('.cal-filter-btn')];
    const selected = window.hakubaMemberStorage.getItem('calendarFilter') || 'all';
    calendarButtons.forEach(button => {
      button.type = 'button';
      button.setAttribute('aria-pressed', String(button.id === `cal-filter-${selected}`));
    });
    const controls = calendarButtons[0]?.parentElement.parentElement;
    if (controls) { controls.classList.add('member-calendar-controls'); controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', 'Filter calendar by dojo'); }
    refreshAchievements();
  });
})();
