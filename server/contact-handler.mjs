import { loginLimiter } from './auth.mjs';
export const contactRecipient='trairandongtam408@gmail.com';
const knownOrigins=new Set(['https://trai-ran-dong-tam.vercel.app','https://codeezforme.github.io']);
const limit=loginLimiter();
export function validateContact(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Dữ liệu liên hệ không hợp lệ.');
 const text=(key,max)=>{if(input[key]!==undefined&&typeof input[key]!=='string')throw Error('Dữ liệu liên hệ không hợp lệ.');const value=(input[key]||'').trim();if(value.length>max)throw Error('Nội dung đã nhập quá dài.');return value;};
 const name=text('name',100),phone=text('phone',25),email=text('email',254),message=text('message',5000),date=text('date',10),interest=text('interest',100),website=text('website',300),guests=text('guests',5);
 if(name.length<2||!/^[+0-9 ().-]{8,25}$/.test(phone)||phone.replace(/\D/g,'').length<8)throw Error('Vui lòng nhập họ tên và số điện thoại hợp lệ.');
 if(email&&!/^[^\s@<>"\r\n]+@[^\s@<>"\r\n]+\.[^\s@<>"\r\n]+$/.test(email))throw Error('Địa chỉ email không hợp lệ.');
 if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(new Date(date).valueOf())||new Date(date).toISOString().slice(0,10)!==date))throw Error('Ngày dự kiến không hợp lệ.');
 if(guests&&(!/^\d+$/.test(guests)||Number(guests)<1||Number(guests)>10000))throw Error('Số khách dự kiến không hợp lệ.');
 return {name,phone,email,message,date,interest,website,guests};
}
export function createContactHandler({fetcher=(...args)=>fetch(...args),rateLimit=limit}={}){
 return async function handle(request){
  const origin=request.headers.get('origin'),url=new URL(request.url),allowed=!!origin&&(knownOrigins.has(origin)||origin===url.origin);
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',Vary:'Origin',...(allowed?{'Access-Control-Allow-Origin':origin}:{})};
  const json=(value,status=200)=>Response.json(value,{status,headers});
  if(!allowed)return json({ok:false,error:'Yêu cầu gửi thông tin không hợp lệ.'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Accept','Access-Control-Max-Age':'600'}});
  if(request.method!=='POST')return json({ok:false,error:'Phương thức không được hỗ trợ.'},405);
  const key=(request.headers.get('x-forwarded-for')?.split(',')[0]||'local').trim();
  if(rateLimit.blocked(key))return json({ok:false,error:'Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau hoặc gọi trực tiếp Đồng Tâm.'},429);
  try{
   if(!request.headers.get('content-type')?.startsWith('application/json')||Number(request.headers.get('content-length'))>16000)return json({ok:false,error:'Dữ liệu gửi lên không hợp lệ.'},400);
   const reader=request.body?.getReader();if(!reader)throw Error('Vui lòng điền thông tin liên hệ.');let total=0;const chunks=[];
   for(;;){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>16000){await reader.cancel();return json({ok:false,error:'Nội dung liên hệ quá dài.'},413);}chunks.push(value);}
   let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Error('Dữ liệu gửi lên không hợp lệ.');}
   const data=validateContact(input);if(data.website)return json({ok:true});rateLimit.fail(key);
   const payload={name:data.name,email:data.email||undefined,'Số điện thoại':data.phone,'Ngày dự kiến':data.date||'Cần tư vấn','Số khách':data.guests||'Cần tư vấn','Quan tâm':data.interest||'Thông tin tham quan','Lời nhắn':data.message||'Khách mong được tư vấn thêm.',_subject:'Đồng Tâm — Yêu cầu tư vấn từ website',_template:'table',_captcha:'false',_url:'https://trai-ran-dong-tam.vercel.app/contact/'};
   if(data.email)payload._replyto=data.email;
   let upstream;
   try{upstream=await fetcher('https://formsubmit.co/ajax/'+contactRecipient,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',Referer:'https://trai-ran-dong-tam.vercel.app/contact/'},body:JSON.stringify(payload),signal:AbortSignal.timeout(18000)});}catch{return json({ok:false,error:'Dịch vụ email chưa phản hồi. Thông tin của bạn vẫn được giữ; vui lòng thử lại sau.'},502);}
   let result;try{result=await upstream.json();}catch{return json({ok:false,error:'Chưa nhận được xác nhận từ dịch vụ email. Vui lòng thử lại sau.'},502);}
   if(!upstream.ok||(result.success!==true&&result.success!=='true')){
    if(/activat|confirm/i.test(result.message||''))return json({ok:false,activationRequired:true,error:'Hộp thư nhận đang chờ xác nhận kích hoạt. Vui lòng gọi trực tiếp Đồng Tâm để được tư vấn.'},503);
    return json({ok:false,error:'Chưa gửi được thông tin qua email. Vui lòng thử lại sau hoặc gọi trực tiếp Đồng Tâm.'},502);
   }
   return json({ok:true});
  }catch(error){return json({ok:false,error:error.message||'Vui lòng kiểm tra lại thông tin đã điền.'},400);}
 };
}
export const handleContact=createContactHandler();
