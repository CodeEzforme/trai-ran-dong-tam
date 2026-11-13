'use client';
import { sections,sectionFor } from '../lib/structure.mjs';
import VideoPlayer from './VideoPlayer';
import {videoSource} from '../lib/video.mjs';
export default function ContentFields({doc,categories,documents=[],disabled,onChange,onCategorySection}){
 const group=sectionFor(doc,categories);
 const choices=categories.filter(c=>c.section===group&&c.path!==doc.path);
 return <>
  {doc.kind==='post'&&doc.videoUrl&&<><VideoPlayer doc={doc}/>{!videoSource(doc.videoUrl)&&<p className="cms-help" role="status">Chưa nhận diện được video. Dán liên kết YouTube hoặc liên kết HTTPS tới tệp MP4/WebM.</p>}</>}
  {doc.kind==='post'&&<label className="cms-field">Liên kết video / clip<input type="url" value={doc.videoUrl||''} disabled={disabled} placeholder="https://www.youtube.com/watch?v=…" onChange={e=>onChange({videoUrl:e.target.value})}/><small>Hỗ trợ YouTube hoặc liên kết HTTPS tới tệp MP4/WebM. Chọn Tin tức → Video nổi bật và xuất bản để hiển thị trên trang chủ.</small></label>}
  <label className="cms-field">Chuyên mục chính<select aria-label="Chuyên mục chính" value={group} disabled={disabled} onChange={e=>{onChange({section:e.target.value,...(doc.kind==='category'?{parentId:''}:{})});if(doc.kind==='category')onCategorySection(e.target.value);}}><option value="">Thông tin khác</option>{sections.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
  {doc.kind==='category'&&<><label className="cms-field">Danh mục cha<select aria-label="Danh mục cha" value={categories.find(c=>c.path===doc.path)?.parentId||''} disabled={disabled||!group} onChange={e=>onChange({parentId:e.target.value})}><option value="">Trực tiếp trong chuyên mục chính</option>{categories.filter(c=>c.section===group&&c.path!==doc.path&&!sections.some(s=>s.path===c.path)).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="cms-field">Trang mở khi bấm danh mục<select aria-label="Trang mở khi bấm danh mục" value={categories.find(c=>c.path===doc.path)?.targetPath||''} disabled={disabled} onChange={e=>onChange({targetPath:e.target.value})}><option value="">Trang của danh mục này</option>{documents.filter(d=>d.path!==doc.path&&d.status==='published'&&['page','category'].includes(d.kind)).map(d=><option key={d.id} value={d.path}>{d.title}</option>)}</select></label><p className="cms-help">Danh mục đã xuất bản sẽ có trong menu của chuyên mục chính. Có thể chọn trang sẵn có để liên kết.</p></>}
  {doc.kind!=='category'&&<div className="cms-taxonomy"><p>Danh mục hiển thị</p><div className="cms-checks">{choices.map(c=><label key={c.id}><input type="checkbox" checked={doc.categories.includes(c.id)} disabled={disabled} onChange={e=>onChange({categories:e.target.checked?[...doc.categories,c.id]:doc.categories.filter(id=>id!==c.id)})}/>{c.name}</label>)}</div>{!choices.length&&<p className="cms-help">Bài viết sẽ hiển thị trong chuyên mục chính đã chọn.</p>}</div>}
  {doc.kind==='product'&&<label className="cms-feature-toggle"><input type="checkbox" disabled={disabled} checked={doc.featured===true} onChange={e=>onChange({featured:e.target.checked})}/><span>Sản phẩm nổi bật trên trang chủ</span></label>}
 </>;
}
