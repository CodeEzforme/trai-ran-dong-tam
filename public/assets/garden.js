/* Native dialog keeps Escape, focus trapping and keyboard navigation accessible. */
(() => {
  const links = [...document.querySelectorAll('[data-garden-photo]')];
  const dialog = document.querySelector('#garden-lightbox');
  if (!dialog || !links.length) return;
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('#garden-photo-caption');
  const count = dialog.querySelector('#garden-photo-count');
  let current = 0, opener;
  function show(index) {
    current = (index + links.length) % links.length;
    const link = links[current];
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    caption.textContent = link.dataset.caption;
    count.textContent = `${current + 1} / ${links.length}`;
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); opener = link; show(index); dialog.showModal();
  }));
  dialog.querySelector('[data-garden-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-garden-previous]').addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-garden-next]').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
})();
