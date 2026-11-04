/* Preserved content interactions; React owns navigation and the cover. */
(() => {
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const fold=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
const query=new URLSearchParams(location.search);
  $$('[data-date]').forEach(time => {
    const d = new Date(time.dataset.date);
    if (!Number.isNaN(d.getTime())) time.textContent = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' }).format(d);
  });

  const filterForm = $('.filter-form');
  const grid = $('.filter-grid');
  if (filterForm && grid) {
    const items = $$('.content-card', grid);
    const input = $('#catalogue-search');
    const pagination = $('.pagination');
    const pageSize = Number(grid.dataset.pageSize) || 12;
    function render() {
      const params = new URLSearchParams(location.search);
      const term = params.get('q') || '';
      const filtered = items.filter(item => fold(item.textContent).includes(fold(term)));
      const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
      const current = Math.min(pages, Math.max(1, parseInt(params.get('page') || params.get('product-page') || '1', 10) || 1));
      input.value = term;
      items.forEach(item => { item.hidden = true; });
      filtered.slice((current - 1) * pageSize, current * pageSize).forEach(item => { item.hidden = false; });
      $('#result-count').textContent = new Intl.NumberFormat('vi-VN').format(filtered.length);
      $('.empty-results').hidden = filtered.length > 0;
      pagination.replaceChildren();
      if (pages > 1) for (let i = 1; i <= pages; i++) {
        const link = document.createElement('a');
        const p = new URLSearchParams(params);
        p.set('page', String(i));
        p.delete('product-page');
        link.href = '?' + p.toString();
        link.textContent = new Intl.NumberFormat('vi-VN').format(i);
        link.setAttribute('aria-label', 'Trang ' + i);
        if (i === current) link.setAttribute('aria-current', 'page');
        pagination.append(link);
      }
    }
    filterForm.addEventListener('submit', event => {
      event.preventDefault();
      const p = new URLSearchParams();
      if (input.value.trim()) p.set('q', input.value.trim());
      history.pushState(null, '', location.pathname + (p.size ? '?' + p.toString() : ''));
      render();
    });
    pagination.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.pushState(null, '', link.href);
      render();
      $('.catalogue-toolbar').scrollIntoView({ block: 'start' });
    });
    window.addEventListener('popstate', render);
    render();
  }

  const contactForm = $('#len-lich');
  if (contactForm) {
    const date = $('input[name=date]', contactForm);
    if (date) {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
      const get = type => parts.find(part => part.type === type).value;
      date.min = `${get('year')}-${get('month')}-${get('day')}`;
    }
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const form = new FormData(contactForm);
      const subject = `${form.get('interest')} — ${form.get('name')}`;
      const body = `Kính gửi Trại rắn Đồng Tâm,\n\nHọ tên: ${form.get('name')}\nĐiện thoại: ${form.get('phone')}\nEmail: ${form.get('email') || 'Chưa cung cấp'}\nNgày dự kiến: ${form.get('date') || 'Cần tư vấn'}\nSố khách: ${form.get('guests') || 'Cần tư vấn'}\nQuan tâm: ${form.get('interest')}\n\n${form.get('message') || 'Tôi mong được tư vấn thêm.'}\n\nTrân trọng.`;
      const url = 'mailto:trairandongtam408@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      const fallback = $('.email-fallback', contactForm);
      fallback.href = url;
      fallback.hidden = false;
      $('.form-status', contactForm).textContent = 'Email đã được soạn. Hãy mở ứng dụng email để kiểm tra và gửi. Nếu ứng dụng chưa mở, dùng liên kết bên dưới hoặc gọi 0898 408 408.';
      location.href = url;
    });
  }

  const searchResults = $('#search-results');
  if (searchResults) {
    const term = query.get('q') || '';
    $('#results-query').value = term;
    if (term.trim()) fetch('/search-index.json').then(response => {
      if (!response.ok) throw new Error('index');
      return response.json();
    }).then(records => {
      const words = fold(term).split(/\s+/).filter(Boolean);
      const matches = records.filter(r => words.every(w => fold(r.title + ' ' + r.description).includes(w))).sort((a, b) => Number(fold(b.title).includes(fold(term))) - Number(fold(a.title).includes(fold(term))));
      const pageSize = 15;
      const pages = Math.max(1, Math.ceil(matches.length / pageSize));
      const current = Math.min(pages, Math.max(1, Number(query.get('page')) || 1));
      $('#search-count').textContent = `${new Intl.NumberFormat('vi-VN').format(matches.length)} kết quả cho “${term}”`;
      const labels = { home: 'Trang chủ', page: 'Thông tin', post: 'Bài viết', category: 'Danh mục', animal: 'Thế giới động vật', product: 'Sản phẩm', utility: 'Tiện ích' };
      for (const record of matches.slice((current - 1) * pageSize, current * pageSize)) {
        const link = document.createElement('a');
        link.href = record.path;
        const kind = document.createElement('small');
        kind.textContent = labels[record.kind] || 'Thông tin';
        const heading = document.createElement('h2');
        heading.textContent = record.title;
        const description = document.createElement('p');
        description.textContent = record.description;
        link.append(kind, heading, description);
        searchResults.append(link);
      }
      if (!matches.length) searchResults.textContent = 'Chưa tìm thấy nội dung phù hợp. Hãy thử từ khóa ngắn hơn hoặc xem sơ đồ website ở chân trang.';
      if (pages > 1) for (let i = 1; i <= pages; i++) {
        const link = document.createElement('a');
        link.href = '?q=' + encodeURIComponent(term) + '&page=' + i;
        link.textContent = new Intl.NumberFormat('vi-VN').format(i);
        if (i === current) link.setAttribute('aria-current', 'page');
        $('#search-pagination').append(link);
      }
    }).catch(() => {
      $('#search-count').textContent = 'Chưa tải được dữ liệu tìm kiếm. Hãy tải lại trang hoặc mở sơ đồ website ở chân trang.';
    });
  }

  const scene = $('#snake-scene');
  if (scene) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      import('/assets/snake.js?v=4').catch(() => {
        $('#scene-status').textContent = 'Đang hiển thị ảnh. Thiết bị chưa tải được mô hình 3D.';
        scene.dataset.state = 'error';
        scene.setAttribute('aria-busy', 'false');
        scene.querySelector('.scene-fallback').hidden = false;
        const retry = $('.scene-retry');
        if (retry) {
          retry.hidden = false;
          retry.textContent = 'Tải lại trang';
          retry.addEventListener('click', () => location.reload(), { once: true });
        }
        $$('.scene-controls button').forEach(button => { button.disabled = true; });
      });
    }, { rootMargin: '200px' });
    observer.observe(scene);
  }
})();
