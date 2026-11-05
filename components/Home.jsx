import Cover from './Cover';
import Icon from './Icon';
import ContactSection from './ContactSection';
import { siteUrl } from '../lib/paths.mjs';

function News({items}){
 return <section className="nx-section nx-container nx-latest-news" id="tin-tuc"><div className="nx-section-heading"><div><p className="nx-label">Nhịp sống Đồng Tâm</p><h2>Tin tức & hoạt động.</h2></div><a className="nx-text-link" href={siteUrl('/tin-tuc/')}>Tất cả tin tức <Icon name="diagonal"/></a></div><div className="nx-news-grid">{items.map(n=><article key={n.path}><a href={siteUrl(n.path)} className="nx-news-photo"><img src={siteUrl(n.image||'/assets/fallback.svg')} alt={n.title} width="800" height="540" loading="lazy"/></a><p>Hoạt động Đồng Tâm <time dateTime={n.date}>{n.date.split('-').reverse().join('/')}</time></p><h3><a href={siteUrl(n.path)}>{n.title}</a></h3></article>)}</div></section>;
}
function Products({items,categories}){
 if(!items.length)return null;
 return <section className="nx-featured-products nx-section" id="san-pham-noi-bat"><div className="nx-container"><div className="nx-section-heading"><div><p className="nx-label">Sản phẩm Đồng Tâm</p><h2>Những sản phẩm nổi bật.</h2></div><a className="nx-text-link" href={siteUrl('/san-pham/')}>Xem tất cả sản phẩm <Icon name="diagonal"/></a></div><div className="nx-product-grid">{items.map(p=><article key={p.id}><a className="nx-product-photo" href={siteUrl(p.path)}><img src={siteUrl(p.image||'/assets/fallback.svg')} alt={p.title} width="600" height="600" loading="lazy"/><span><Icon name="diagonal"/></span></a><p>{categories.find(c=>p.categories.includes(c.id))?.name||'Sản phẩm Đồng Tâm'}</p><h3><a href={siteUrl(p.path)}>{p.title}</a></h3><a href={siteUrl(p.path)} className="nx-product-more">Thông tin sản phẩm <Icon name="arrow"/></a></article>)}</div></div></section>;
}
export default function Home({settings,animals,news,products,categories,faq}){
 const experiences=[
  {title:'Những cuộc gặp kỳ thú.',text:'Đến gần hơn với thế giới động vật.',path:'/dong-vat-hoang-da/',image:animals[0]?.image||'/assets/images/bc74f6dd5d56662b.webp',kind:'nx-experience-main'},
  {title:'Dạo một vòng vườn thuốc.',text:'Khám phá khu vườn dược liệu Đồng Tâm.',path:'/vuon-thuoc-nam/',image:'/assets/images/vuon-thuoc-nam-05-cong-vuon.webp'},
  {title:'Thêm một chút kỷ niệm.',text:'Một ngày xanh cùng những người thân yêu.',path:'/du-lich-sinh-thai/',image:'/assets/images/trang-chu-anh-bia-02.webp'},
 ];
 return <>
  <Cover settings={settings}/>
  <News items={news}/>
  <Products items={products} categories={categories}/>
  <section className="nx-section nx-container nx-experiences" id="trai-nghiem"><div className="nx-section-heading"><div><p className="nx-label">Đi đâu ở Đồng Tâm?</p><h2>Mỗi lối đi,<br/>một điều mới.</h2></div><p>Giữa những tán cây xanh, có những cuộc gặp<br className="nx-desktop-break"/> khiến một ngày bình thường trở nên đặc biệt.</p><a className="nx-text-link" href={siteUrl('/du-lich-sinh-thai/')}>Tất cả trải nghiệm <Icon name="diagonal"/></a></div><div className="nx-experience-grid">{experiences.map(e=><a href={siteUrl(e.path)} className={'nx-experience '+(e.kind||'')} key={e.path}><img src={siteUrl(e.image)} alt={e.title} width="1200" height="800" loading="lazy"/><div><h3>{e.title}</h3><p>{e.text}</p></div><span><Icon name="diagonal"/></span></a>)}</div><div className="nx-experience-links">{[['Nhà bảo tàng','/nha-bao-tang-ran/'],['Dịch vụ nhà hàng','/nha-hang-dong-tam/'],['Dịch vụ trò chơi','/dich-vu-tro-choi/']].map(([n,h])=><a href={siteUrl(h)} key={h}>{n}<Icon name="diagonal"/></a>)}</div></section>
  <section className="nx-animals nx-section"><div className="nx-container"><div className="nx-section-heading"><div><p className="nx-label">Những cư dân của Đồng Tâm</p><h2>Mỗi loài, một điều kỳ thú.</h2></div><a className="nx-text-link" href={siteUrl('/dong-vat-hoang-da/')}>Khám phá các loài <Icon name="diagonal"/></a></div><div className="nx-animal-track">{animals.map(a=><a href={siteUrl(a.path)} className="nx-animal" key={a.path}><div><img src={siteUrl(a.image)} alt={a.title} width="600" height="700" loading="lazy"/><span><Icon name="diagonal"/></span></div><h3>{a.title.split(' – ')[0]}</h3><p>{a.title.split(' – ')[1]?.toLowerCase()||'Thế giới động vật Đồng Tâm'}</p></a>)}</div></div></section>
  <section className="nx-section nx-container nx-story"><div className="nx-story-photo"><img src={siteUrl('/assets/images/vuon-thuoc-nam-03-khong-gian-vuon.webp')} alt="Không gian vườn thuốc nam Đồng Tâm" width="1920" height="1280" loading="lazy"/><div><span>Từ năm</span><strong>1977</strong><span>Một hành trình vì sự sống</span></div></div><div className="nx-story-copy"><p className="nx-label">Câu chuyện phía sau khu vườn</p><h2>Gìn giữ thiên nhiên.<br/>Kết nối sự sống.</h2><p>Đồng Tâm gắn kết công tác nuôi trồng, nghiên cứu, chế biến dược liệu với bảo tồn và giáo dục thiên nhiên.</p><p>Mỗi chuyến ghé thăm là dịp để hiểu thêm về thế giới quanh mình và những người đang chăm sóc, gìn giữ thế giới ấy.</p><a href={siteUrl('/gioi-thieu/')} className="nx-text-link">Câu chuyện Đồng Tâm <Icon name="arrow"/></a><div className="nx-story-links"><a href={siteUrl('/nghien-cuu-khoa-hoc/')}><Icon name="file"/> Nghiên cứu khoa học <Icon name="diagonal"/></a><a href={siteUrl('/san-pham/')}><Icon name="leaf"/> Sản phẩm Đồng Tâm <Icon name="diagonal"/></a></div></div></section>
  <ContactSection settings={settings}/>
  <div dangerouslySetInnerHTML={{__html:faq}}/>
 </>;
}
