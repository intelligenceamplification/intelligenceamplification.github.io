(() => {
  const current = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.site-header nav a').forEach(link => {
    const url = new URL(link.href);
    const path = url.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
    if (!url.hash && path === current) link.setAttribute('aria-current', 'page');
  });
  function openTarget(hash) {
    if (!hash || !hash.startsWith('#')) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    if (target.tagName === 'DETAILS') target.open = true;
    let parent = target.parentElement;
    while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
  }
  openTarget(location.hash);
  window.addEventListener('hashchange', () => openTarget(location.hash));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link) openTarget(link.hash);
  });
  document.querySelectorAll('.subscription-request').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const email = form.querySelector('input[type="email"]').value.trim();
      location.href = 'mailto:desmondwood@me.com?subject=' + encodeURIComponent('IAM Intelligence: free subscription request') + '&body=' + encodeURIComponent('Please send me future IAM Intelligence editions for free at ' + email + '.\n\nThank you.');
    });
  });
})();
