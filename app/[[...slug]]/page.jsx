import fs from 'node:fs';
import { notFound } from 'next/navigation';
import SiteShell from '../../components/SiteShell';
import Home from '../../components/Home';
import LegacyScripts from '../../components/LegacyScripts';
import { content, entries, homeData, renderDocument, utilityHtml, prefixHtml } from '../../lib/content.mjs';
const navigation=JSON.parse(fs.readFileSync('data/original-navigation.json','utf8')).map(([n,h,c])=>[n,new URL(h).pathname,c.map(([name,url])=>[name,new URL(url).pathname])]);
navigation.splice(navigation.findIndex(n=>n[1]==='/san-pham/')+1,0,['Vườn thuốc nam','/vuon-thuoc-nam/',[]]);
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
  return <SiteShell settings={content.settings} navigation={navigation} logo={homeData.logo} path={path}>
    {path==='/'?<Home settings={content.settings} animals={animals} news={entries.filter(d=>d.kind==='post').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3)} scene={prefixHtml(homeData.scene)} faq={prefixHtml(homeData.faq)} />:<div className="nx-content" dangerouslySetInnerHTML={{__html:doc?renderDocument(doc):utilityHtml(path)}} />}
    <LegacyScripts />
  </SiteShell>;
}
