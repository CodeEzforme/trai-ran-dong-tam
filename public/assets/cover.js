/* Crossfade only while the cover is visible; visitors can choose or pause it. */
(() => {
  const hero = document.querySelector('[data-cover]');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('[data-cover-slide]')];
  const dots = [...hero.querySelectorAll('[data-cover-to]')];
  const controls = hero.querySelector('[data-cover-controls]');
  const pause = hero.querySelector('[data-cover-pause]');
  const caption = hero.querySelector('[data-cover-caption]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer, available = [], paused = reduced.matches, visible = true, hovering = false, focused = false;
  function schedule() {
    clearTimeout(timer);
    if (paused || reduced.matches || !visible || hovering || focused || document.hidden || available.length < 2) return;
    timer = setTimeout(() => {
      show(available[(available.indexOf(current) + 1) % available.length]);
    }, 6500);
  }
  function show(index) {
    if (!available.includes(index)) return;
    current = index; hero.dataset.coverIndex = String(index + 1);
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
    caption.textContent = slides[index].dataset.caption;
    schedule();
  }
  function updatePause() {
    const stopped = paused || reduced.matches;
    pause.hidden = reduced.matches;
    pause.textContent = stopped ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-label', stopped ? 'Tiếp tục chuyển ảnh bìa' : 'Dừng chuyển ảnh bìa');
    pause.setAttribute('aria-pressed', String(stopped));
  }
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
  pause.addEventListener('click', () => { paused = !paused; updatePause(); schedule(); });
  hero.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; schedule(); } });
  hero.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  hero.addEventListener('focusin', () => { focused = true; schedule(); });
  hero.addEventListener('focusout', event => { focused = hero.contains(event.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('pagehide', () => clearTimeout(timer));
  reduced.addEventListener('change', () => { paused = reduced.matches; updatePause(); schedule(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(hero);
  Promise.allSettled(slides.map(slide => slide.querySelector('img').decode())).then(results => {
    available = results.flatMap((result, index) => result.status === 'fulfilled' ? [index] : []);
    dots.forEach((dot, index) => { dot.disabled = !available.includes(index); });
    controls.hidden = available.length < 2;
    if (available.length) show(available.includes(current) ? current : available[0]);
    updatePause();
  });
})();
