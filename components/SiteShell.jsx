'use client';
import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import { siteUrl } from '../lib/paths.mjs';
import { socialDefaults } from '../lib/structure.mjs';
function SubLinks({items,path}){
 return items.map(item=>item.children?.length?<details key={item.id} className="nx-subgroup"><summary>{item.label}<Icon name="chevron"/></summary><div className="nx-subchildren"><a href={siteUrl(item.path)}>Tất cả {item.label.toLowerCase()}</a><SubLinks items={item.children} path={path}/></div></details>:<a href={siteUrl(item.path)} key={item.id} aria-current={path===item.path?'page':undefined}>{item.label}</a>);
}
export function SocialLinks({settings}){
 const links={...socialDefaults,...settings.social};
 return <div className="nx-social-links" aria-label="Kết nối với Đồng Tâm">{[['facebook','Facebook'],['tiktok','TikTok'],['zalo','Zalo']].map(([key,label])=><a key={key} href={links[key]} target="_blank" rel="noopener noreferrer">{label}<Icon name="diagonal"/></a>)}</div>;
}
export default function SiteShell({ settings, navigation, logo, path, activeSection, children }) {
  const [mobile, setMobile] = useState(false), [open, setOpen] = useState(-1);
  const search = useRef(null), input = useRef(null), nav = useRef(null), menu = useRef(null);
  useEffect(() => {
    function close(e) {
      if (e.type === 'keydown' && e.key !== 'Escape') return;
      if (e.type === 'click' && nav.current?.contains(e.target)) return;
      setOpen(-1);
      if (e.type === 'keydown') { setMobile(false); if (nav.current?.contains(document.activeElement)) menu.current?.focus(); }
    }
    document.addEventListener('click', close); document.addEventListener('keydown', close);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', close); };
  }, []);
  const telephone = 'tel:+' + settings.phone.replace(/\D/g, '').replace(/^0/, '84');
  return <div className="nx-site">
    <a href="#main" className="skip-link">Chuyển đến nội dung</a>
    <div className="nx-utility"><div className="nx-container"><span><Icon name="leaf" /> Nơi thiên nhiên gặp gỡ tri thức</span><a href={siteUrl('/contact/')}><Icon name="pin" /> {settings.location}</a><a href={telephone}>{settings.phone}</a></div></div>
    <header className="nx-header"><div className="nx-container nx-header-inner">
      <a className="nx-brand" href={siteUrl('/')} aria-label="Đồng Tâm — Trang chủ"><img src={siteUrl(logo)} alt="Biểu trưng Đồng Tâm" width="49" height="49" /><span>{settings.name}<small>{settings.tagline}</small></span></a>
      <nav ref={nav} className={'nx-nav' + (mobile ? ' nx-open' : '')} aria-label="Điều hướng chính" id="nx-navigation">
        {navigation.map(({id,label,path:href,children:items=[]}, i) => <div className={'nx-nav-item' + (open === i ? ' nx-expanded' : '')+(activeSection===id?' nx-current-section':'')} key={href}
          onPointerEnter={e => { if (e.pointerType === 'mouse' && window.innerWidth > 1180) setOpen(i); }}
          onPointerLeave={() => { if (window.innerWidth > 1180 && !nav.current?.contains(document.activeElement)) setOpen(-1); }}>
          <a href={siteUrl(href)} aria-current={path === href ? 'page' : undefined}>{label}</a>
          {!!items.length && <><button type="button" aria-label={'Mở danh mục ' + label} aria-expanded={open === i} aria-controls={'nx-sub-' + i} onClick={e => { e.stopPropagation(); setOpen(open === i ? -1 : i); }}><Icon name="chevron" /></button><div className="nx-subnav" id={'nx-sub-' + i}><SubLinks items={items} path={path}/></div></>}
        </div>)}
      </nav>
      <div className="nx-header-actions"><button className="nx-icon-btn" aria-label="Tìm kiếm website" onClick={() => { search.current.showModal(); input.current.focus(); }}><Icon name="search" /></button><a href={siteUrl('/contact/#len-lich')} className="nx-visit-btn">Tham quan <Icon name="diagonal" /></a><button ref={menu} className="nx-icon-btn nx-menu-btn" aria-label={mobile ? 'Đóng menu' : 'Mở menu'} aria-expanded={mobile} aria-controls="nx-navigation" onClick={e => { e.stopPropagation(); setMobile(!mobile); }}><Icon name={mobile ? 'close' : 'menu'} /></button></div>
    </div></header>
    <main id="main">{children}</main>
    <footer className="nx-footer"><div className="nx-container nx-footer-grid"><div><a className="nx-brand" href={siteUrl('/')}><img src={siteUrl(logo)} width="49" height="49" alt="Đồng Tâm" /><span>{settings.name}<small>{settings.tagline}</small></span></a><p>Một hành trình gần hơn với thiên nhiên.<br />Một góc nhìn mới về sự sống.</p><a className="nx-footer-phone" href={telephone}>{settings.phone}</a><SocialLinks settings={settings}/></div><div><h2>Khám phá Đồng Tâm</h2>{[['Câu chuyện Đồng Tâm','/gioi-thieu/'],['Du lịch sinh thái','/du-lich-sinh-thai/'],['Vườn thuốc nam','/vuon-thuoc-nam/'],['Nghiên cứu khoa học','/nghien-cuu-khoa-hoc/']].map(([n,h])=><a key={h} href={siteUrl(h)}>{n}</a>)}</div><div><h2>Thông tin hữu ích</h2>{[['Sản phẩm','/san-pham/'],['Điều trị rắn cắn','/dieu-tri-ran-can/'],['Tin tức','/tin-tuc/'],['Tuyển dụng','/tuyen-dung/'],['Sơ đồ website','/so-do-website/']].map(([n,h])=><a key={h} href={siteUrl(h)}>{n}</a>)}</div><div><h2>Hẹn gặp tại khu vườn</h2><p>Ấp Tân Thuận B, xã Kim Sơn,<br />tỉnh Đồng Tháp</p><p>{settings.hours}</p><a href={'mailto:' + settings.email}>{settings.email}</a><a href="https://www.google.com/maps/search/?api=1&query=Trai+ran+Dong+Tam+Kim+Son" target="_blank" rel="noopener noreferrer">Xem đường đi <Icon name="diagonal" /></a></div></div><div className="nx-container nx-footer-bottom"><span>© 2026 Trại rắn Đồng Tâm</span><span>Thiên nhiên · Bảo tồn · Khoa học</span><a href="#top">Về đầu trang ↑</a></div></footer>
    <dialog ref={search} className="nx-search" onClick={e => { if(e.target === search.current) { const r=e.currentTarget.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) search.current.close(); } }}><div><h2>Tìm kiếm Đồng Tâm</h2><button className="nx-icon-btn" aria-label="Đóng tìm kiếm" onClick={()=>search.current.close()}><Icon name="close" /></button></div><form action={siteUrl('/tim-kiem/')}><label className="sr-only" htmlFor="nx-search">Từ khóa tìm kiếm</label><input ref={input} id="nx-search" name="q" placeholder="Tìm loài vật, sản phẩm, bài viết…" type="search" /><button className="nx-visit-btn">Tìm kiếm</button></form><p>Gợi ý: rắn hổ chúa, vườn thuốc nam, du lịch sinh thái.</p></dialog>
  </div>;
}
