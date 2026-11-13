import fs from 'node:fs';
import {load} from 'cheerio';
const file='content/content.json',data=JSON.parse(fs.readFileSync(file,'utf8'));
data.settings.name='Trại Rắn Đồng Tâm';
const rename=(path,title)=>{const d=data.documents.find(d=>d.path===path);if(d)d.title=title;for(const c of data.categories.filter(c=>c.path===path))c.name=title;};
rename('/vuon-thuoc-nam/','Công tác bảo tồn');
rename('/danh-muc-san-pham/ran/','Lớp bò sát');rename('/danh-muc-san-pham/thu/','Lớp thú');rename('/danh-muc-san-pham/chim/','Lớp chim');
rename('/danh-muc-san-pham/thuc-pham-chuc-nang/','Thực phẩm');rename('/category/tin-moi/','Tin nổi bật');
for(const id of ['about-directors','about-administration','about-tourism','about-aquaculture','about-factory'])data.categories.find(c=>c.id===id).parentId='about-organization';
for(const [section,id,path,title] of [
 ['about','about-other','/gioi-thieu/khac/','Khác'],['research','research-other','/nghien-cuu-khoa-hoc/khac/','Khác'],
 ['herbs','herbs-animals','/vuon-thuoc-nam/con-thuoc/','Con thuốc'],['herbs','herbs-other','/vuon-thuoc-nam/khac/','Khác'],
 ['products','products-other','/san-pham/khac/','Khác'],['tourism','tourism-other','/du-lich-sinh-thai/khac/','Khác'],
 ['news','news-videos','/tin-tuc/video-noi-bat/','Video nổi bật'],['news','news-other','/tin-tuc/khac/','Khác']]){
 if(!data.categories.some(c=>c.id===id))data.categories.push({id,path,name:title,section,kind:section==='products'?'product':'post'});
 if(!data.documents.some(d=>d.path===path))data.documents.push({id,path,title,section,kind:'category',categories:[],body:'',image:'',excerpt:'',status:'published',date:'2026-11-13'});
}
const treatment=data.documents.find(d=>d.path==='/dieu-tri-ran-can/');treatment.section='treatment';
for(const c of data.categories.filter(c=>c.targetPath===treatment.path)){
 c.section='treatment';const d=data.documents.find(d=>d.path===c.path);if(d)d.section='treatment';
}
// Retain legacy categories and their articles, but consolidate their menu entries.
for(const [oldId,newId]of [['70','news-other'],['67','news-other'],['1','news-other']]){
 for(const d of data.documents)if(d.categories.includes(oldId))d.categories=[...new Set([...d.categories,newId])];
 const d=data.documents.find(d=>d.path===data.categories.find(c=>c.id===oldId)?.path);if(d)d.status='draft';
}
const templatesFile='data/migrated-templates.json',templates=JSON.parse(fs.readFileSync(templatesFile,'utf8'));
let $=load(templates['bang-gia-dich-vu'],null,false);$('.service-note').remove();templates['bang-gia-dich-vu']=$.html();
$=load(templates['dieu-tri-ran-can'],null,false);$('h2').filter((_,e)=>$(e).text().trim()==='Liên hệ trung tâm').closest('section').remove();templates['dieu-tri-ran-can']=$.html();
$=load(templates['vuon-thuoc-nam'],null,false);$('.garden-figure').filter((_,e)=>$(e).find('img').attr('src')?.includes('06-nhom-cay-thuoc')).remove();templates['vuon-thuoc-nam']=$.html();
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');fs.writeFileSync(templatesFile,JSON.stringify(templates,null,2)+'\n');
