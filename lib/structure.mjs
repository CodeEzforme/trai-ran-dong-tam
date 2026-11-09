export const sections=[
 {id:'about',label:'Giới thiệu',path:'/gioi-thieu/',icon:'file',kind:'post',topics:[
  {id:'about-overview',label:'Tổng quan',path:'/gioi-thieu/'},
  {id:'about-organization',label:'Sơ đồ tổ chức',path:'/to-chuc/'},
  {id:'about-directors',label:'Ban giám đốc',path:'/ban-giam-doc/'},
  {id:'about-administration',label:'Ban hành chính',path:'/ban-hanh-chinh/'},
  {id:'about-tourism',label:'Bộ phận du lịch',path:'/bo-phan-du-lich/'},
  {id:'about-aquaculture',label:'Đội nuôi thủy đặc sản',path:'/doi-nuoi-thuy-dac-san/'},
  {id:'about-factory',label:'Xưởng chế biến',path:'/xuong-che-bien/'}]},
 {id:'research',label:'Nghiên cứu khoa học',path:'/nghien-cuu-khoa-hoc/',icon:'file',kind:'post',topics:[
  {id:'research-projects',label:'Đề tài nghiên cứu khoa học',path:'/de-tai-nghien-cuu-khoa-hoc/'},
  {id:'research-factory',label:'Hình ảnh nhà xưởng',path:'/hinh-anh-nha-xuong/'},
  {id:'research-standards',label:'Tiêu chuẩn, quy trình sản xuất',path:'/tieu-chuan-quy-trinh-san-xuat/'}]},
 {id:'tourism',label:'Du lịch sinh thái',path:'/du-lich-sinh-thai/',icon:'leaf',kind:'post',topics:[
  {id:'tourism-wildlife',label:'Động vật hoang dã',path:'/dong-vat-hoang-da/',children:[
   {id:'73',label:'Rắn',path:'/danh-muc-san-pham/ran/'},
   {id:'72',label:'Thú',path:'/danh-muc-san-pham/thu/'},
   {id:'77',label:'Chim',path:'/danh-muc-san-pham/chim/'},
   {id:'78',label:'Khác',path:'/danh-muc-san-pham/khac/'}]},
  {id:'tourism-museum',label:'Nhà bảo tàng',path:'/nha-bao-tang-ran/'},
  {id:'tourism-restaurant',label:'Dịch vụ nhà hàng',path:'/nha-hang-dong-tam/'},
  {id:'tourism-games',label:'Dịch vụ trò chơi',path:'/dich-vu-tro-choi/'}]},
 {id:'products',label:'Sản phẩm',path:'/san-pham/',icon:'cube',kind:'product',topics:[
  {id:'71',label:'Thuốc',path:'/danh-muc-san-pham/thuoc/'},
  {id:'80',label:'Mỹ phẩm',path:'/danh-muc-san-pham/my-pham/'},
  {id:'23',label:'Thực phẩm chức năng',path:'/danh-muc-san-pham/thuc-pham-chuc-nang/'},
  {id:'74',label:'Rượu',path:'/danh-muc-san-pham/ruou/'},
  {id:'products-ocop-local',label:'Một số sản phẩm OCOP địa phương',path:'/san-pham-ocop/'}]},
 {id:'herbs',label:'Vườn thuốc nam',path:'/vuon-thuoc-nam/',icon:'leaf',kind:'post',topics:[
  {id:'herbs-medicinal',label:'Cây thuốc nam',path:'/vuon-thuoc-nam/cay-thuoc-nam/'},
  {id:'herbs-perennial',label:'Cây lâu năm',path:'/vuon-thuoc-nam/cay-lau-nam/'}]},
 {id:'news',label:'Tin tức',path:'/tin-tuc/',icon:'file',kind:'post',topics:[]},
 {id:'careers',label:'Tuyển dụng',path:'/tuyen-dung/',icon:'file',kind:'post',topics:[]},
];
export const navigation=[{id:'home',label:'Trang chủ',path:'/',children:[]},...sections.map(s=>({...s,children:s.topics}))];
// The tree defines ordering and stable identities; published CMS documents own
// the displayed names. Overview links can have an intentional shorter alias.
export function resolveSections(data){
 const documents=data?.documents||[],categories=data?.categories||[];
 const topic=(item,section)=>{
  const category=categories.find(c=>c.id===item.id)||categories.find(c=>c.path===item.path);
  const doc=documents.find(d=>d.path===(category?.path||item.path));
  if(doc?.status==='draft'||category?.section&&category.section!==section.id)return null;
  const alias=item.path===section.path&&item.label!==section.label;
  const label=(alias?category?.name:doc?.title)||category?.name||item.label;
  const path=category?.targetPath||doc?.path||category?.path||item.path;if(documents.find(d=>d.path===path)?.status==='draft')return null;
  return {...item,label:label.trim(),path,...(item.children?{children:item.children.map(t=>topic(t,section)).filter(Boolean)}:{})};
 };
 return sections.filter(s=>documents.find(d=>d.path===s.path)?.status!=='draft').map(s=>{
  const topics=s.topics.map(t=>topic(t,s)).filter(Boolean),nodes=new Map(flattenTopics({topics}).map(t=>[t.id,t])),custom=[];
  for(const c of categories){
   if(c.section!==s.id||nodes.has(c.id)||sections.some(g=>g.path===c.path)||flattenTopics({topics}).some(t=>t.path===c.path))continue;
   const doc=documents.find(d=>d.path===c.path);if(!doc||doc.status!=='published')continue;
   const path=c.targetPath||c.path;if(documents.find(d=>d.path===path)?.status==='draft')continue;
   const node={id:c.id,label:(doc.title||c.name).trim(),path,children:[]};nodes.set(c.id,node);custom.push({category:c,node});
  }
  const move=(node,parent)=>{if(!parent||parent===node)return;for(const sibling of [topics,...[...nodes.values()].map(n=>n.children).filter(Boolean)]){const index=sibling.indexOf(node);if(index>=0)sibling.splice(index,1);}parent.children||=[];if(!parent.children.includes(node))parent.children.push(node);};
  for(const {category,node}of custom){const parent=nodes.get(category.parentId);if(parent&&parent!==node)move(node,parent);else topics.push(node);}
  for(const c of categories){if(c.section===s.id&&c.parentId&&nodes.has(c.id))move(nodes.get(c.id),nodes.get(c.parentId));}
  return {...s,label:documents.find(d=>d.path===s.path)?.title||s.label,topics};
 });
}
export function navigationFor(data){return [{id:'home',label:'Trang chủ',path:'/',children:[]},...resolveSections(data).map(s=>({...s,children:s.topics}))];}
export const sectionIds=sections.map(s=>s.id);
export const findSection=(id,data)=>(data?resolveSections(data):sections).find(s=>s.id===id);
export const flattenTopics=s=>(s.topics||[]).flatMap(t=>[t,...flattenTopics({topics:t.children||[]})]);
export function sectionFor(doc,categories=[]){
 if(sectionIds.includes(doc.section))return doc.section;
 if(doc.kind==='animal')return 'tourism';
 if(doc.kind==='product')return 'products';
 const topic=categories.find(c=>doc.categories?.includes(c.id)&&sectionIds.includes(c.section));if(topic)return topic.section;
 const group=sections.find(s=>s.path===doc.path||flattenTopics(s).some(t=>t.path===doc.path));
 if(group)return group.id;
 return doc.kind==='post'?'news':'';
}
export function collectionFor(path,data){
 const documents=data.documents.filter(d=>d.status==='published');
 const category=data.categories.find(c=>c.path===path);
 const root=sections.find(s=>s.path===path);
 const contentKinds=new Set(['post','product','animal']);
 if(root)return documents.filter(d=>contentKinds.has(d.kind)&&sectionFor(d,data.categories)===root.id&&(root.id==='products'||d.kind!=='animal'));
 if(!category)return null;
 const ids=[category.id,...data.categories.filter(c=>c.section===category.section&&c.name===category.name).map(c=>c.id)];
 if(path==='/dong-vat-hoang-da/')return documents.filter(d=>d.kind==='animal'||(d.kind==='post'&&d.categories.some(id=>ids.includes(id)||['73','72','77','78'].includes(id))));
 return documents.filter(d=>contentKinds.has(d.kind)&&d.categories.some(id=>ids.includes(id)));
}
export const socialDefaults={facebook:'https://www.facebook.com/TrairanDongTamQK9',tiktok:'https://www.tiktok.com/@trairandongtam408',zalo:'https://zalo.me/0898408408'};
