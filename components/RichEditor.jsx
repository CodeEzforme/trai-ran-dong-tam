'use client';
import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
export const purify=html=>DOMPurify.sanitize(html,{ALLOWED_TAGS:['p','br','h2','h3','h4','ul','ol','li','strong','b','em','i','a','img','figure','figcaption','blockquote','table','thead','tbody','tr','th','td','hr','sup','sub'],ALLOWED_ATTR:['href','src','alt','width','height','colspan','rowspan'],ALLOW_DATA_ATTR:false});
export default function RichEditor({value,onChange,disabled,onImage}){
  const editor=useRef(null),selection=useRef(null); const [source,setSource]=useState(false);
  useEffect(()=>{ if(editor.current && editor.current.innerHTML!==value && document.activeElement!==editor.current) editor.current.innerHTML=purify(value); },[value,source]);
  function remember(){const s=window.getSelection();if(s?.rangeCount && editor.current?.contains(s.anchorNode)) selection.current=s.getRangeAt(0).cloneRange();}
  function restore(){editor.current?.focus(); if(selection.current){const s=window.getSelection();s.removeAllRanges();s.addRange(selection.current);}}
  function command(name,arg){restore();document.execCommand(name,false,arg);onChange(purify(editor.current.innerHTML));remember();}
  function link(){const url=window.prompt('Địa chỉ liên kết (https://… hoặc /duong-dan/)');if(url && /^(https?:\/\/|\/(?!\/)|mailto:|tel:)/.test(url)) command('createLink',url);}
  return <div className="cms-rich"><div className="cms-editor-tools" aria-label="Định dạng nội dung">
    <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>command('bold')} aria-label="Chữ đậm"><b>B</b></button>
    <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>command('italic')} aria-label="Chữ nghiêng"><i>I</i></button>
    <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>command('formatBlock','h2')}>Tiêu đề</button>
    <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>command('formatBlock','p')}>Đoạn văn</button>
    <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>command('insertUnorderedList')}>Danh sách</button>
    <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={link}>Liên kết</button>
    <button type="button" disabled={disabled||source} onMouseDown={e=>e.preventDefault()} onClick={()=>{remember();onImage(image=>command('insertHTML','<img src="'+image.path+'" alt="'+image.name.replace(/["<>]/g,'')+'">'));}}>Chèn ảnh</button>
    <button type="button" className={source?'cms-tool-active':''} onClick={()=>setSource(!source)}>HTML</button>
  </div>{source?<textarea className="cms-html-editor" aria-label="Nội dung HTML" value={value} disabled={disabled} onChange={e=>onChange(e.target.value)} onBlur={()=>onChange(purify(value))} spellCheck={false} />:<div ref={editor} className="cms-visual-editor" role="textbox" aria-label="Nội dung bài viết" aria-multiline="true" contentEditable={!disabled} suppressContentEditableWarning onInput={()=>onChange(purify(editor.current.innerHTML))} onKeyUp={remember} onMouseUp={remember} onPaste={e=>{e.preventDefault();const html=e.clipboardData.getData('text/html'),text=e.clipboardData.getData('text/plain');command('insertHTML',html?purify(html):text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>'));}} />}</div>;
}
