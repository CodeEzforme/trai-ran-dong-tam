import { notFound } from 'next/navigation';
import SiteShell from '../../components/SiteShell';
import Home from '../../components/Home';
import LegacyScripts from '../../components/LegacyScripts';
import ContactSection from '../../components/ContactSection';
import { navigation,sectionFor } from '../../lib/structure.mjs';
import { content, entries, homeData, renderDocument, utilityHtml, prefixHtml } from '../../lib/content.mjs';
export const dynamicParams=false;
export function generateStaticParams() { return [{slug:[]}, ...entries.map(d=>({slug:d.path.slice(1,-1).split('/')})), {slug:['tim-kiem']},{slug:['so-do-website']}]; }
export async function generateMetadata({params}) {
  const {slug=[]}=await params; const path='/'+(slug.length?slug.join('/')+'/':''); const d=entries.find(d=>d.path===path);
  return {title:d?.title || (path==='/'?'Trang chủ':path==='/tim-kiem/'?'Tìm kiếm':'Sơ đồ website'),description:d?.excerpt || content.settings.description};
}
export default async function Page({params}) {
  const {slug=[]}=await params; const path='/'+(slug.length?slug.join('/')+'/':'');
  const doc=entries.find(d=>d.path===path); if(!doc && !['/','/tim-kiem/','/so-do-website/'].includes(path)) notFound();
  const animals=homeData.animals.map(a=>content.documents.find(d=>d.path===a.path)||a).filter(a=>a.status!=='draft');
  return <SiteShell settings={content.settings} navigation={navigation} logo={homeData.logo} path={path} activeSection={path==='/'?'home':doc?sectionFor(doc,content.categories):undefined}>
    {path==='/'?<Home settings={content.settings} animals={animals} categories={content.categories} products={entries.filter(d=>d.kind==='product'&&d.featured===true).slice(0,4)} news={entries.filter(d=>d.kind==='post'&&sectionFor(d,content.categories)==='news').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3)} faq={prefixHtml(homeData.faq)} />:path==='/contact/'?<><section className="page-intro"><div className="container"><nav className="breadcrumb" aria-label="Đường dẫn"><a href={process.env.NEXT_PUBLIC_BASE_PATH?process.env.NEXT_PUBLIC_BASE_PATH+'/':'/'}>Trang chủ</a><span>/</span><span>Liên hệ</span></nav><h1>{doc.title}</h1><p className="intro-description">{doc.excerpt}</p></div></section><ContactSection settings={content.settings} fullPage/><div dangerouslySetInnerHTML={{__html:prefixHtml(homeData.faq)}}/></>:<div className="nx-content" dangerouslySetInnerHTML={{__html:doc?renderDocument(doc):utilityHtml(path)}} />}
    <LegacyScripts />
  </SiteShell>;
}
