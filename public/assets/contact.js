/* Direct submission keeps visitors on the website; values survive failed sends. */
(() => {
 for(const form of document.querySelectorAll('[data-contact-form]')){
  const button=form.querySelector('button[type=submit]'),status=form.querySelector('.form-status'),fallback=form.querySelector('.email-fallback'),date=form.elements.date;
  if(date){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());date.min=['year','month','day'].map(t=>p.find(x=>x.type===t).value).join('-');}
  let sending=false;
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(sending||!form.reportValidity())return;
   const values=Object.fromEntries(new FormData(form).entries());sending=true;button.disabled=true;button.setAttribute('aria-busy','true');status.dataset.state='pending';status.textContent='Đang gửi thông tin…';fallback.hidden=true;
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
   try{
    const response=await fetch(form.dataset.contactEndpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(values),signal:controller.signal});
    let data;try{data=await response.json();}catch{throw Error('Chưa nhận được phản hồi từ máy chủ.');}
    if(!response.ok||data.ok!==true)throw Error(data.error||'Chưa gửi được thông tin. Vui lòng thử lại.');
    status.dataset.state='success';status.textContent='Thông tin đã được tiếp nhận. Đồng Tâm sẽ liên hệ tư vấn với bạn.';form.reset();
   }catch(error){status.dataset.state='error';status.textContent=(error.name==='AbortError'?'Kết nối đang chậm. Thông tin đã điền vẫn được giữ; bạn có thể thử lại sau.':error instanceof TypeError?'Chưa kết nối được máy chủ. Thông tin đã điền vẫn được giữ; vui lòng thử lại.':error.message||'Chưa kết nối được máy chủ. Vui lòng thử lại.')+' Bạn cũng có thể gọi 0898 408 408 hoặc dùng email bên dưới.';fallback.hidden=false;}
   finally{clearTimeout(timer);sending=false;button.disabled=false;button.removeAttribute('aria-busy');}
  });
 }
})();
