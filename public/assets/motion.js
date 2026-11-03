/* Progressive motion: ordinary links, browser history and form behavior stay native. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.createElement('div');
  progress.className = 'navigation-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    document.body.classList.add('is-navigating');
    window.setTimeout(() => document.body.classList.remove('is-navigating'), 2500);
  });
  window.addEventListener('pageshow', () => document.body.classList.remove('is-navigating'));
  const groups = [...document.querySelectorAll('.experience-grid,.conservation,.scene-copy,.news-section .section-heading')];
  if (!reduced.matches && 'IntersectionObserver' in window) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed'); observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px 25px 0px' });
    groups.forEach(group => { group.classList.add('reveal'); observer.observe(group); });
    reduced.addEventListener('change', () => { if (reduced.matches) document.body.classList.remove('motion-ready'); });
  }
  const art = document.querySelector('[data-depth]');
  if (art && matchMedia('(pointer: fine)').matches && !reduced.matches) {
    let bounds, frame;
    art.addEventListener('pointerenter', () => { bounds = art.getBoundingClientRect(); });
    art.addEventListener('pointermove', event => {
      if (!bounds || reduced.matches) return;
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { art.style.transform = `perspective(1200px) rotateY(${x * 3}deg) rotateX(${-y * 2}deg)`; });
    });
    art.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); art.style.transform = ''; bounds = null; });
  }
  const track = document.querySelector('.animal-track');
  if (track) document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
    const direction = button.dataset.gallery === 'next' ? 1 : -1;
    track.scrollBy({ left: direction * track.clientWidth * 0.78, behavior: reduced.matches ? 'instant' : 'smooth' });
  }));
  const header = document.querySelector('.site-header');
  const utility = document.querySelector('.utility');
  if (header && utility && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => header.classList.toggle('scrolled', !entries[0].isIntersecting)).observe(utility);
  }
})();
