'use client';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { siteUrl } from '../lib/paths.mjs';
export default function Cover({ settings }) {
  const slides = settings.slides;
  const [current, setCurrent] = useState(0), [paused, setPaused] = useState(false), [visible, setVisible] = useState(true);
  const hero = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    observer.observe(hero.current); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let timer;
    function schedule() { clearTimeout(timer); if (!paused && visible && !document.hidden && slides.length > 1) timer = setTimeout(()=>setCurrent(i=>(i+1)%slides.length),5000); }
    schedule(); document.addEventListener('visibilitychange',schedule);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange',schedule); };
  }, [current, paused, visible, slides.length]);
  return <section ref={hero} className="nx-cover" aria-label="Khám phá Đồng Tâm" data-cover-index={current + 1} data-cover-playing={!paused && visible}>
    <div className="nx-cover-photos">{slides.map((slide,i)=><picture key={i} className={i===current?'nx-cover-photo nx-active':'nx-cover-photo'} aria-hidden={i!==current}><source media="(max-width: 760px)" srcSet={siteUrl(slide.mobile || slide.image)} /><img src={siteUrl(slide.image)} alt={slide.caption || 'Khung cảnh Trại rắn Đồng Tâm'} width="2048" height="1365" fetchPriority={i===0?'high':'low'} /></picture>)}</div>
    <div className="nx-cover-shade" />
    <div className="nx-container nx-cover-inner"><div className="nx-cover-copy"><span className="nx-cover-intro"><Icon name="leaf" /> Một ngày xanh ở Đồng Tâm</span><h1>{settings.headline}</h1><p>{settings.description}</p><div className="nx-cover-actions"><a href={siteUrl('/du-lich-sinh-thai/')} className="nx-sun-btn">Bắt đầu khám phá <Icon name="diagonal" /></a><a className="nx-3d-link" href="#tin-tuc"><span><Icon name="file" /></span> Tin tức mới</a></div></div>
    <div className="nx-cover-bottom"><div className="nx-cover-location"><Icon name="pin" /><div><span>Hẹn gặp tại</span><strong>{settings.location}</strong></div></div><div className="nx-cover-selector"><p>{slides[current].caption}</p><div>{slides.map((s,i)=><button key={i} onClick={()=>setCurrent(i)} aria-label={'Xem ảnh bìa ' + (i+1)} aria-pressed={i===current} className="nx-cover-thumb"><img src={siteUrl(s.mobile||s.image)} alt="" width="80" height="54" />{i===current && <span key={current+':'+paused+':'+visible} className="nx-cover-progress" style={{animationPlayState:paused?'paused':'running'}} />}</button>)}{slides.length>1 && <button className="nx-cover-pause" aria-label={paused?'Tiếp tục chuyển ảnh bìa':'Dừng chuyển ảnh bìa'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'▶':'Ⅱ'}</button>}</div></div></div></div>
    <div className="nx-container nx-visit-ribbon"><div><Icon name="clock" /><span><small>Thời gian mở cửa</small><strong>{settings.hours}</strong></span></div><a href={siteUrl('/bang-gia-dich-vu/')}><Icon name="leaf" /><span><small>Dành cho mọi hành trình</small><strong>Thông tin vé & dịch vụ</strong></span><Icon name="diagonal" /></a><a href={siteUrl('/contact/#len-lich')}><Icon name="pin" /><span><small>Gia đình, trường học & đoàn</small><strong>Cùng lên lịch chuyến đi</strong></span><Icon name="diagonal" /></a></div>
  </section>;
}
