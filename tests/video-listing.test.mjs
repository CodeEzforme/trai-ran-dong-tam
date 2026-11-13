import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {content,renderDocument} from '../lib/content.mjs';
import {listing} from '../lib/collections.mjs';
test('video collections offer an inline player and direct source link for published video posts',()=>{
 const doc={id:'test-video',path:'/tin-tuc/video-test/',title:'Video kiểm tra',kind:'post',section:'news',categories:['news-videos'],status:'published',date:'2026-11-13',body:'',videoUrl:'https://youtu.be/WRK8WgeqmvQ?si=test'};
 const $=load(listing([doc],content,'Video nổi bật'));assert.equal($('iframe').length,1);assert.equal($('iframe').attr('src'),'https://www.youtube-nocookie.com/embed/WRK8WgeqmvQ');assert.equal($('.nx-video-source').attr('href'),doc.videoUrl);assert.equal($('.card-image').length,0);
 const entry=load(renderDocument(doc));assert.equal(entry('iframe').length,1);assert.equal(entry('.nx-video-source').attr('target'),'_blank');
});
