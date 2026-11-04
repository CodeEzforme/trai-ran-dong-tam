export const kinds = { post: 'Bài viết', product: 'Sản phẩm', animal: 'Động vật', page: 'Trang nội dung', category: 'Danh mục' };
export function validateContent(data) {
  if (data?.version !== 1 || !Array.isArray(data.documents) || !Array.isArray(data.categories)) throw new Error('Dữ liệu CMS không đúng định dạng.');
  const ids = new Set(), paths = new Set();
  for (const d of data.documents) {
    if (!d.id || ids.has(d.id)) throw new Error('Mã nội dung bị trùng.');
    if (!d.title?.trim() || !kinds[d.kind]) throw new Error('Nội dung cần tiêu đề và loại hợp lệ.');
    if (!/^\/(?:[a-zA-Z0-9\u00c0-\u1eff%_-]+\/)+$/.test(d.path) || /^\/(admin|tim-kiem|so-do-website|assets|_next)(\/|$)/.test(d.path) || paths.has(d.path)) throw new Error('Đường dẫn bị trùng hoặc không hợp lệ: ' + d.path);
    if (!['published', 'draft'].includes(d.status)) throw new Error('Trạng thái nội dung không hợp lệ.');
    if (!Array.isArray(d.categories)) throw new Error('Danh mục nội dung không hợp lệ.');
    if (typeof d.body !== 'string' || d.body.length > 2000000) throw new Error('Nội dung quá dài.');
    for (const image of [d.image]) if (image && !/^\/assets\/[a-zA-Z0-9._/-]+$/.test(image)) throw new Error('Hãy chọn ảnh trong thư viện.');
    ids.add(d.id); paths.add(d.path);
  }
  const s = data.settings;
  if (!s?.headline?.trim() || !Array.isArray(s.slides) || !s.slides.length || s.slides.length > 12) throw new Error('Trang chủ cần tiêu đề và từ 1 đến 12 ảnh bìa.');
  for (const slide of s.slides) {
    if (!/^\/assets\/[a-zA-Z0-9._/-]+$/.test(slide.image) || (slide.mobile && !/^\/assets\/[a-zA-Z0-9._/-]+$/.test(slide.mobile))) throw new Error('Ảnh bìa cần được chọn từ thư viện.');
  }
  if (!/^[\d\s+().-]{6,25}$/.test(s.phone) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s.email)) throw new Error('Số điện thoại hoặc email không hợp lệ.');
  return data;
}
