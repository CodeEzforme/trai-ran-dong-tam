import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {content,renderDocument} from '../lib/content.mjs';
import {navigationFor,collectionFor} from '../lib/structure.mjs';
import {publishedVideos,videoSource} from '../lib/video.mjs';
test('requested menu hierarchy and marked removals survive public rendering',()=>{
 const nav=navigationFor(content);assert.deepEqual(nav.map(s=>s.label),['Trang chủ','Giới thiệu','Nghiên cứu khoa học','Điều trị rắn cắn','Công tác bảo tồn','Sản phẩm','Du lịch sinh thái','Tin tức','Tuyển dụng']);
 const departments=nav[1].children.find(c=>c.id==='about-organization').children;for(const id of ['about-directors','about-administration','about-tourism','about-aquaculture','about-factory'])assert(departments.some(d=>d.id===id));
 for(const [path,removed]of [['/bang-gia-dich-vu/','service-note'],['/dieu-tri-ran-can/','Liên hệ trung tâm'],['/vuon-thuoc-nam/','06-nhom-cay-thuoc']])assert(!renderDocument(content.documents.find(d=>d.path===path)).includes(removed));
});
test('new treatment and recruitment posts reach their collections while drafts stay hidden',()=>{
 for(const [section,path]of [['treatment','/dieu-tri-ran-can/'],['careers','/tuyen-dung/']]){
 const data=structuredClone(content);data.documents.push({id:'new',path:path+'test/',kind:'post',section,status:'published',categories:[]});assert(collectionFor(path,data).some(d=>d.id==='new'));data.documents.at(-1).status='draft';assert(!collectionFor(path,data).some(d=>d.id==='new'));
 }
});
test('only published news videos reach the home feed; video URLs cannot inject markup',()=>{
 const entry={id:'video',path:'/tin-tuc/test-video/',title:'Video thử',kind:'post',section:'news',categories:['news-videos'],status:'published',body:'',videoUrl:'https://youtu.be/abcdefghijk',date:'2026-11-13'};
 assert.equal(publishedVideos({documents:[entry,{...entry,id:'draft',status:'draft'},{...entry,id:'other',section:'research'}]}).length,1);
 const $=load(renderDocument(entry));assert.equal($('iframe').attr('src'),'https://www.youtube-nocookie.com/embed/abcdefghijk');
 for(const url of ['javascript:alert(1)','https://youtube.com.evil.test/watch?v=abcdefghijk','http://example.com/a.mp4','https://user:pass@example.com/a.mp4'])assert.equal(videoSource(url),null);
 assert.equal(videoSource('https://example.com/clip.mp4').kind,'file');
});
