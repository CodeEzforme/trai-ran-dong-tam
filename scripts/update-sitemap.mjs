// One-time, idempotent enrichment of the current CMS data. Never reload the old snapshot.
import fs from 'node:fs';
import { sections,flattenTopics,sectionFor,socialDefaults } from '../lib/structure.mjs';
const file='content/content.json',data=JSON.parse(fs.readFileSync(file,'utf8'));
const animalIds=new Set(['73','72','77','78']);
for(const c of data.categories){
 if(!c.section)c.section=animalIds.has(c.id)?'tourism':(['71','80','23','74','79'].includes(c.id)?'products':(c.name==='Đề tài nghiên cứu khoa học'?'research':'news'));
}
for(const s of sections)for(const t of flattenTopics(s)){
 const found=data.categories.find(c=>c.id===t.id);
 if(found){found.section=s.id;continue;}
 data.categories.push({id:t.id,name:t.label,path:t.path,kind:s.id==='products'?'product':'post',section:s.id});
}
for(const s of sections)if(!data.categories.some(c=>c.path===s.path))data.categories.push({id:'section-'+s.id,name:s.label,path:s.path,kind:s.kind,section:s.id});
const animalAliases=new Set(data.documents.filter(d=>d.kind==='animal').map(d=>d.path.split('/').filter(Boolean).at(-1)));
for(const d of data.documents){
 if(!d.section)d.section=sectionFor(d,data.categories)||(d.kind==='page'&&animalAliases.has(d.path.split('/').filter(Boolean).at(-1))?'tourism':'');
 if(d.path==='/san-pham-nghien-cuu-cap-bo/'||d.path==='/doi-nuoi-trong-duoc-lieu/')d.section=d.path.includes('cap-bo')?'research':'about';
 if(d.path==='/coffee-and-tea-dong-tam/'||d.path==='/bang-gia-dich-vu/')d.section='tourism';
 if(d.path==='/to-chuc/')d.title='Sơ đồ tổ chức';
 if(d.path==='/san-pham-ocop/')d.title='Một số sản phẩm OCOP địa phương';
 if(d.kind==='post'&&/hoi-dong-khoa-hoc-cap-bo/.test(d.id)){d.section='research';if(!d.categories.includes('research-projects'))d.categories.push('research-projects');}
 if(d.kind==='product'&&d.featured===undefined)d.featured=d.title==='Bột rắn lục'||['/san-pham/cobratoxan/','/san-pham/kem-boi-da-cobratofor/','/san-pham/mo-tran/'].includes(d.path);
}
const descriptions={about:'Thông tin và hoạt động của các bộ phận tại Đồng Tâm.',research:'Thông tin về hoạt động nghiên cứu, nhà xưởng và quy trình sản xuất tại Đồng Tâm.',tourism:'Khám phá động vật hoang dã, nhà bảo tàng và các dịch vụ tại Đồng Tâm.',products:'Khám phá các sản phẩm được giới thiệu tại Đồng Tâm.',herbs:'Ghé thăm không gian cây thuốc và vườn cây lâu năm tại Đồng Tâm.',news:'Tin tức và những hoạt động mới từ Đồng Tâm.',careers:'Thông tin tuyển dụng được cập nhật tại chuyên mục này.'};
for(const s of sections)for(const t of flattenTopics(s))if(!data.documents.some(d=>d.path===t.path)){
 let body='';let image='';
 if(t.id==='herbs-medicinal'){image='/assets/images/vuon-thuoc-nam-03-khong-gian-vuon.webp';body='<figure><img src="'+image+'" alt="Không gian cây thuốc nam tại Đồng Tâm"><figcaption>Không gian cây thuốc nam tại Đồng Tâm.</figcaption></figure><figure><img src="/assets/images/vuon-thuoc-nam-06-nhom-cay-thuoc.webp" alt="Các nhóm cây trong vườn thuốc"><figcaption>Các nhóm cây trong vườn thuốc.</figcaption></figure>';}
 if(t.id==='herbs-perennial'){image='/assets/images/vuon-thuoc-nam-04-cay-lau-nam.webp';body='<figure><img src="'+image+'" alt="Khu vườn cây lâu năm tại Đồng Tâm"><figcaption>Khu vườn cây lâu năm tại Đồng Tâm.</figcaption></figure>';}
 data.documents.push({id:'sitemap-'+t.id,path:t.path,title:t.label,kind:'category',section:s.id,excerpt:descriptions[s.id],body,image,categories:[],status:'published',date:'2026-11-05'});
}
data.settings.social={...socialDefaults,...(data.settings.social||{})};
data.settings.contactRecipient='trairandongtam408@gmail.com';
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
console.log(`Updated taxonomy: ${sections.length} content groups; ${data.documents.length} current documents preserved/enriched.`);
