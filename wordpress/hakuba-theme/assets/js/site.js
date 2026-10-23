(() => {
  const header = document.querySelector('.public-header');
  const toggle = header?.querySelector('.nav-toggle');
  const nav = header?.querySelector('#main-nav');
  if (toggle && nav) {
    document.documentElement.classList.add('hakuba-js');
    toggle.hidden = false;
    const close = () => { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); };
    toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
    header.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); } });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    window.matchMedia('(min-width: 980px)').addEventListener('change', close);
  }
  const account = header?.querySelector('.site-account');
  if (account) {
    document.addEventListener('click', event => { if (!account.contains(event.target)) account.open = false; });
    account.addEventListener('keydown', event => {
      if (event.key === 'Escape') { account.open = false; account.querySelector('summary').focus(); }
    });
  }
  document.querySelectorAll('.dojo-schedule').forEach(schedule => {
    const filters = schedule.querySelector('.dojo-schedule__filters');
    if (!filters) return;
    filters.hidden = false;
    filters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      const location = button.dataset.location;
      filters.querySelectorAll('button').forEach(item => { const active = item === button; item.setAttribute('aria-pressed', String(active)); item.classList.toggle('is-active', active); });
      schedule.querySelectorAll('[data-dojo]').forEach(group => { group.hidden = location !== 'all' && group.dataset.dojo !== location; });
      schedule.querySelectorAll('[data-change-location]').forEach(change => { change.hidden = location !== 'all' && change.dataset.changeLocation !== location; });
      const notice = schedule.querySelector('.calendar-notice');
      if (notice) notice.hidden = !notice.querySelector('[data-change-location]:not([hidden])');
    }));
  });
})();
