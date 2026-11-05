'use client';
import { sections,sectionFor } from '../lib/structure.mjs';
export default function ContentFields({doc,categories,disabled,onChange,onCategorySection}){
 const group=sectionFor(doc,categories);
 const choices=categories.filter(c=>c.section===group&&c.path!==doc.path);
 return <>
  <label className="cms-field">Chuyên mục chính<select aria-label="Chuyên mục chính" value={group} disabled={disabled} onChange={e=>{onChange({section:e.target.value});if(doc.kind==='category')onCategorySection(e.target.value);}}><option value="">Thông tin khác</option>{sections.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
  {doc.kind!=='category'&&<div className="cms-taxonomy"><p>Danh mục hiển thị</p><div className="cms-checks">{choices.map(c=><label key={c.id}><input type="checkbox" checked={doc.categories.includes(c.id)} disabled={disabled} onChange={e=>onChange({categories:e.target.checked?[...doc.categories,c.id]:doc.categories.filter(id=>id!==c.id)})}/>{c.name}</label>)}</div>{!choices.length&&<p className="cms-help">Bài viết sẽ hiển thị trong chuyên mục chính đã chọn.</p>}</div>}
  {doc.kind==='product'&&<label className="cms-feature-toggle"><input type="checkbox" disabled={disabled} checked={doc.featured===true} onChange={e=>onChange({featured:e.target.checked})}/><span>Sản phẩm nổi bật trên trang chủ</span></label>}
 </>;
}
