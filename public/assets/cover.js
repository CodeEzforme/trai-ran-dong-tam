/* Advance every five seconds while visible, including during hover and focus. */
(() => {
  const hero = document.querySelector('[data-cover]');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('[data-cover-slide]')];
  const dots = [...hero.querySelectorAll('[data-cover-to]')];
  const controls = hero.querySelector('[data-cover-controls]');
  const pause = hero.querySelector('[data-cover-pause]');
  const caption = hero.querySelector('[data-cover-caption]');
  const counter = hero.querySelector('[data-cover-current]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 5000;
  let current = 0, timer, progress, available = [], paused = false, visible = true;
  function schedule() {
    clearTimeout(timer);
    progress?.cancel();
    hero.dataset.coverPlaying = String(!paused && visible && !document.hidden && available.length > 1);
    if (paused || !visible || document.hidden || available.length < 2) return;
    const bar = dots[current].querySelector('.cover-progress');
    if (bar && !reduced.matches) progress = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: interval, fill: 'forwards' });
    timer = setTimeout(() => {
      show(available[(available.indexOf(current) + 1) % available.length]);
    }, interval);
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
    if (counter) counter.textContent = String(index + 1).padStart(2, '0');
    schedule();
  }
  function updatePause() {
    const stopped = paused;
    pause.textContent = stopped ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-label', stopped ? 'Tiếp tục chuyển ảnh bìa' : 'Dừng chuyển ảnh bìa');
    pause.setAttribute('aria-pressed', String(stopped));
  }
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
  pause.addEventListener('click', () => { paused = !paused; updatePause(); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('pagehide', () => { clearTimeout(timer); progress?.cancel(); });
  reduced.addEventListener('change', () => { updatePause(); schedule(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(hero);
  Promise.allSettled(slides.map(slide => slide.querySelector('img').decode())).then(results => {
    available = results.flatMap((result, index) => result.status === 'fulfilled' ? [index] : []);
    dots.forEach((dot, index) => { dot.disabled = !available.includes(index); });
    controls.hidden = available.length < 2;
    if (available.length) show(available.includes(current) ? current : available[0]);
    updatePause();
  });
})();
