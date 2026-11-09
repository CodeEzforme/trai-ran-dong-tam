'use client';
import { useEffect,useRef,useState } from 'react';
import DOMPurify from 'dompurify';
export const purify=html=>DOMPurify.sanitize(html,{ALLOWED_TAGS:['p','br','h2','h3','h4','ul','ol','li','strong','b','em','i','a','img','figure','figcaption','blockquote','table','thead','tbody','tr','th','td','hr','sup','sub'],ALLOWED_ATTR:['href','src','alt','width','height','colspan','rowspan'],ALLOW_DATA_ATTR:false});
export default function RichEditor({value,onChange,disabled,onImage,resolveImageSrc=path=>path}){
 const editor=useRef(null),htmlEditor=useRef(null),selection=useRef(null),lastValue=useRef(null),sourceSelection=useRef(null),resolver=useRef(resolveImageSrc);
 const [source,setSource]=useState(false);resolver.current=resolveImageSrc;
 useEffect(()=>{
  if(!editor.current)return;
  if(lastValue.current===value&&editor.current.childNodes.length)return;
  editor.current.innerHTML=purify(value);lastValue.current=value;selection.current=null;
  for(const img of editor.current.querySelectorAll('img')){const path=img.getAttribute('src');img.dataset.cmsSrc=path;img.src=resolver.current(path);}
 },[value,source]);
 function remember(){const s=window.getSelection();if(s?.rangeCount&&editor.current?.contains(s.anchorNode))selection.current=s.getRangeAt(0).cloneRange();if(htmlEditor.current)sourceSelection.current=[htmlEditor.current.selectionStart,htmlEditor.current.selectionEnd];}
 function restore(){
  const node=editor.current;if(!node)return null;node.focus();let range=selection.current;
  if(!range||!node.contains(range.commonAncestorContainer)){range=document.createRange();range.selectNodeContents(node);range.collapse(false);}
  const s=window.getSelection();s.removeAllRanges();s.addRange(range);return range;
 }
 function emit(){
  const clone=editor.current.cloneNode(true);
  for(const img of clone.querySelectorAll('img')){if(img.dataset.cmsSrc)img.setAttribute('src',img.dataset.cmsSrc);img.removeAttribute('data-cms-src');}
  const html=purify(clone.innerHTML);lastValue.current=html;onChange(html);remember();
 }
 function command(name,arg){if(!restore())return;document.execCommand(name,false,arg);emit();}
 function insertImage(image){
  if(source){const [start,end]=sourceSelection.current||[value.length,value.length],tag='<img src="'+image.path.replace(/["<>]/g,'')+'" alt="'+image.name.replace(/["<>]/g,'')+'">';onChange(value.slice(0,start)+tag+value.slice(end));requestAnimationFrame(()=>{htmlEditor.current?.focus();htmlEditor.current?.setSelectionRange(start+tag.length,start+tag.length);});return;}
  const range=restore();if(!range)return;range.deleteContents();const img=document.createElement('img');img.dataset.cmsSrc=image.path;img.src=image.preview||resolver.current(image.path);img.alt=image.name;range.insertNode(img);range.setStartAfter(img);range.collapse(true);selection.current=range.cloneRange();const s=window.getSelection();s.removeAllRanges();s.addRange(range);emit();
 }
 function link(){const url=window.prompt('Địa chỉ liên kết (https://… hoặc /duong-dan/)');if(url&&/^(https?:\/\/|\/(?!\/)|mailto:|tel:)/.test(url))command('createLink',url);}
 return <div className="cms-rich"><div className="cms-editor-tools" aria-label="Định dạng nội dung">
  <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>command('bold')} aria-label="Chữ đậm"><b>B</b></button>
  <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>command('italic')} aria-label="Chữ nghiêng"><i>I</i></button>
  <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>command('formatBlock','h2')}>Tiêu đề</button>
  <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>command('formatBlock','p')}>Đoạn văn</button>
  <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>command('insertUnorderedList')}>Danh sách</button>
  <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={link}>Liên kết</button>
  <button type="button" disabled={disabled} onMouseDown={e=>e.preventDefault()} onClick={()=>{remember();onImage(insertImage);}}>Chèn ảnh</button>
  <button type="button" className={source?'cms-tool-active':''} onClick={()=>{if(source){lastValue.current=null;onChange(purify(value));}setSource(!source);}}>HTML</button>
 </div>{source?<textarea ref={htmlEditor} className="cms-html-editor" aria-label="Nội dung HTML" value={value} disabled={disabled} onSelect={remember} onChange={e=>onChange(e.target.value)} spellCheck={false}/>:<div ref={editor} className="cms-visual-editor" role="textbox" aria-label="Nội dung bài viết" aria-multiline="true" contentEditable={!disabled} suppressContentEditableWarning onInput={emit} onKeyUp={remember} onMouseUp={remember} onPaste={e=>{e.preventDefault();const html=e.clipboardData.getData('text/html'),text=e.clipboardData.getData('text/plain');command('insertHTML',html?purify(html):text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>'));}}/>}</div>;
}
