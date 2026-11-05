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
export const sectionIds=sections.map(s=>s.id);
export const findSection=id=>sections.find(s=>s.id===id);
export const flattenTopics=s=>s.topics.flatMap(t=>[t,...(t.children||[])]);
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
