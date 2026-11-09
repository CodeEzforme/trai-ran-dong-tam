import fs from 'node:fs';
import {editDocument,validateContent} from '../lib/model.mjs';
const file='content/content.json';let data=JSON.parse(fs.readFileSync(file,'utf8'));
const doc=data.documents.find(d=>d.id==='entry-3cea2e1c-5ca2-40c4-8c4a-99446517bb75');
if(!doc||!data.documents.some(d=>d.path==='/dieu-tri-ran-can/'))throw Error('Existing treatment category/page not found. No changes written.');
data=editDocument(data,doc.id,{section:'research',parentId:'',targetPath:'/dieu-tri-ran-can/'});
data=editDocument(data,data.documents.find(d=>d.path==='/dieu-tri-ran-can/').id,{section:'research'});
validateContent(data);fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');console.log('Linked the existing treatment category to its existing page under research. Bodies and uploaded images retained.');
