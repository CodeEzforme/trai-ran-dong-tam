import { sectionIds } from './structure.mjs';
import { videoSource } from './video.mjs';
export const kinds = { post: 'Bài viết', product: 'Sản phẩm', animal: 'Động vật', page: 'Trang nội dung', category: 'Danh mục' };
export function deleteDocument(data,id){
 const doc=data.documents.find(d=>d.id===id);if(!doc||doc.deletedAt)return data;
 const removed=new Set(data.categories.filter(c=>c.path===doc.path).map(c=>c.id));
 const clean=item=>({...item,...(removed.has(item.parentId)?{parentId:''}:{}),...(item.targetPath===doc.path?{targetPath:''}:{})});
 return {...data,documents:data.documents.map(d=>({...clean(d),categories:d.categories.filter(id=>!removed.has(id)),...(d.id===id?{status:'draft',deletedAt:new Date().toISOString()}: {})})),categories:data.categories.filter(c=>!removed.has(c.id)).map(clean)};
}
export function editDocument(data,id,patch){
 const before=data.documents.find(d=>d.id===id);if(!before)return data;
 return {...data,documents:data.documents.map(d=>d.id===id?{...d,...patch}:d),categories:data.categories.map(c=>c.path===before.path?{...c,...(typeof patch.title==='string'?{name:patch.title}:{}),...(typeof patch.path==='string'?{path:patch.path}:{}),...(before.kind==='category'?Object.fromEntries(['section','parentId','targetPath'].filter(key=>patch[key]!==undefined).map(key=>[key,patch[key]])):{})}:c)};
}
export function validateContent(data) {
  if (data?.version !== 1 || !Array.isArray(data.documents) || !Array.isArray(data.categories)) throw new Error('Dữ liệu CMS không đúng định dạng.');
  const ids = new Set(), paths = new Set();
  for (const d of data.documents) {
    if (!d.id || ids.has(d.id)) throw new Error('Mã nội dung bị trùng.');
    if (!d.title?.trim() || !kinds[d.kind]) throw new Error('Nội dung cần tiêu đề và loại hợp lệ.');
    if (!/^\/(?:[a-zA-Z0-9\u00c0-\u1eff%_-]+\/)+$/.test(d.path) || /^\/(admin|tim-kiem|so-do-website|assets|_next)(\/|$)/.test(d.path) || paths.has(d.path)) throw new Error('Đường dẫn bị trùng hoặc không hợp lệ: ' + d.path);
    if (!['published', 'draft'].includes(d.status)) throw new Error('Trạng thái nội dung không hợp lệ.');
    if (!Array.isArray(d.categories)) throw new Error('Danh mục nội dung không hợp lệ.');
    if(d.section&&!sectionIds.includes(d.section))throw new Error('Chuyên mục nội dung không hợp lệ.');
    if(d.featured!==undefined&&typeof d.featured!=='boolean')throw new Error('Trạng thái sản phẩm nổi bật không hợp lệ.');
    if(d.videoUrl&&!videoSource(d.videoUrl))throw new Error('Video cần liên kết HTTPS YouTube hoặc tệp MP4/WebM.');
    if (typeof d.body !== 'string' || d.body.length > 2000000) throw new Error('Nội dung quá dài.');
    for (const image of [d.image]) if (image && !/^\/assets\/[a-zA-Z0-9._/-]+$/.test(image)) throw new Error('Hãy chọn ảnh trong thư viện.');
    ids.add(d.id); paths.add(d.path);
  }
  const s = data.settings;
  const categoryIds=new Set(data.categories.map(c=>c.id));
  for(const c of data.categories){
    if(c.targetPath&&(!paths.has(c.targetPath)||typeof c.targetPath!=='string'))throw Error('Trang liên kết của danh mục không hợp lệ.');
    if(c.parentId){
      if(!categoryIds.has(c.parentId))throw Error('Danh mục cha không tồn tại.');
      const seen=new Set([c.id]);let current=c;
      while(current.parentId){if(seen.has(current.parentId))throw Error('Danh mục cha không được tạo vòng lặp.');seen.add(current.parentId);current=data.categories.find(x=>x.id===current.parentId);if(!current||current.section!==c.section)throw Error('Danh mục cha phải cùng chuyên mục.');if(seen.size>5)throw Error('Danh mục chỉ hỗ trợ tối đa bốn cấp con.');}
    }
  }
  if (!s?.headline?.trim() || !Array.isArray(s.slides) || !s.slides.length || s.slides.length > 12) throw new Error('Trang chủ cần tiêu đề và từ 1 đến 12 ảnh bìa.');
  if(s.sectionCover&&!/^\/assets\/[a-zA-Z0-9._/-]+$/.test(s.sectionCover))throw Error('Ảnh bìa danh mục cần được chọn từ thư viện.');
  for (const slide of s.slides) {
    if (!/^\/assets\/[a-zA-Z0-9._/-]+$/.test(slide.image) || (slide.mobile && !/^\/assets\/[a-zA-Z0-9._/-]+$/.test(slide.mobile))) throw new Error('Ảnh bìa cần được chọn từ thư viện.');
  }
  if (!/^[\d\s+().-]{6,25}$/.test(s.phone) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(s.email)) throw new Error('Số điện thoại hoặc email không hợp lệ.');
  const socialHosts={facebook:['facebook.com','www.facebook.com'],tiktok:['tiktok.com','www.tiktok.com'],zalo:['zalo.me']};
  for(const [key,value]of Object.entries(s.social||{})){
    if(!socialHosts[key])throw new Error('Mạng xã hội không hợp lệ.');
    try{const u=new URL(value);if(u.protocol!=='https:'||!socialHosts[key].includes(u.hostname)||u.username||u.password)throw Error();}catch{throw new Error('Liên kết '+key+' không hợp lệ.');}
  }
  return data;
}
