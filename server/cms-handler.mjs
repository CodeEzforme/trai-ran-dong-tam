import { authConfig, verifyPassword, issueSession, readSession, sessionCookie, sameOrigin, validCsrf, loginLimiter, uploadReceipt, readUploadReceipt } from './auth.mjs';
import { GitHubCMS } from '../lib/github-cms.mjs';
import { validateContent } from '../lib/model.mjs';
const limiter=loginLimiter();
const headers={'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Vary':'Cookie'};
const json=(data,status=200,extra={})=>Response.json(data,{status,headers:{...headers,...extra}});
async function body(request,max=3500000){
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Error('BAD_BODY');
  if(Number(request.headers.get('content-length'))>max)throw new Error('BODY_SIZE');
  const reader=request.body?.getReader();if(!reader)throw new Error('BAD_BODY');
  const chunks=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new Error('BODY_SIZE');}chunks.push(value);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new Error('BAD_BODY');}
}
export function createCMSHandler({env=process.env,fetcher=globalThis.fetch,rateLimit=limiter}={}){
 return async function handle(request){
  const url=new URL(request.url),route=(url.searchParams.get('endpoint')||url.pathname).replace(/\/$/,'').split('/').at(-1),method=request.method;
  if(!['GET','POST'].includes(method))return json({error:'Phương thức không được hỗ trợ.'},405,{Allow:'GET, POST'});
  const config=authConfig(env);
  if(!config)return json({error:'Máy chủ đăng nhập chưa được cấu hình. Vui lòng liên hệ người quản lý website.'},503);
  try{
    if(method==='POST'&&!sameOrigin(request,env))return json({error:'Yêu cầu không hợp lệ. Hãy mở lại trang quản trị.'},403);
    if(route==='login'&&method==='POST'){
      const key=(request.headers.get('x-forwarded-for')?.split(',')[0]||'local').trim();
      if(rateLimit.blocked(key))return json({error:'Đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.'},429,{'Retry-After':'900'});
      const input=await body(request,2048);
      const valid=await verifyPassword(input.password,config.passwordHash);
      if(input.username!==config.username||!valid){rateLimit.fail(key);return json({error:'Tài khoản hoặc mật khẩu không đúng.'},401);}
      rateLimit.clear(key);const {value,claims}=issueSession(config);
      return json({user:{login:config.username,name:config.username},csrf:claims.csrf},200,{'Set-Cookie':sessionCookie(value,request.url)});
    }
    const session=readSession(request,config);
    if(!session)return json({error:'Vui lòng đăng nhập để tiếp tục.'},401);
    if(method==='POST'&&!validCsrf(request,session))return json({error:'Phiên xác thực không hợp lệ. Hãy tải lại trang.'},403);
    if(route==='session'&&method==='GET')return json({user:{login:session.username,name:session.username},csrf:session.csrf});
    if(route==='logout'&&method==='POST')return json({ok:true},200,{'Set-Cookie':sessionCookie('',request.url,0)});
    const api=new GitHubCMS(config.githubToken,(...args)=>fetcher(...args));
    try{
      if(route==='email-status'&&method==='GET'){
        let reachable=false;
        try{const result=await fetcher('https://formsubmit.co/',{method:'GET',redirect:'follow',signal:AbortSignal.timeout(8000)});reachable=result.ok;await result.body?.cancel();}catch{}
        return json({provider:'FormSubmit',recipient:'trairandongtam408@gmail.com',reachable,activation:'Owner confirmation is required once; no email was sent by this check.'});
      }
      if(route==='content'&&method==='GET') {const data=await api.load();return json({data,sha:api.sha});}
      if(route==='media'&&method==='POST'){
        const input=await body(request);
        if(!/^public\/assets\/images\/uploads\/[a-zA-Z0-9._-]+\.webp$/.test(input.path)||typeof input.base64!=='string'||input.base64.length>3200000||!/^[A-Za-z0-9+/]+={0,2}$/.test(input.base64))return json({error:'Ảnh tải lên không hợp lệ hoặc quá lớn.'},400);
        const bytes=Buffer.from(input.base64,'base64');
        if(bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP')return json({error:'Ảnh cần có định dạng WebP.'},400);
        const blob=await api.request(api.root+'/git/blobs',{method:'POST',body:{content:input.base64,encoding:'base64'}});
        return json({receipt:uploadReceipt(input.path,blob.sha,config,session)});
      }
      if(route==='publish'&&method==='POST'){
        const input=await body(request);validateContent(input.data);
        if(!/^[a-f0-9]{40}$/.test(input.sha)||!Array.isArray(input.uploads)||input.uploads.length>50)return json({error:'Dữ liệu xuất bản không hợp lệ.'},400);
        const uploads=input.uploads.map(r=>readUploadReceipt(r,config,session));
        if(uploads.some(r=>!r))return json({error:'Ảnh tải lên đã hết phiên. Hãy chọn và tải ảnh lại.'},400);
        api.sha=input.sha;const commit=await api.publish(input.data,uploads);
        return json({sha:api.sha,commit:{sha:commit.sha,html_url:commit.html_url}});
      }
      if(route==='deployment'&&method==='GET'){
        const sha=new URL(request.url).searchParams.get('sha');if(!/^[a-f0-9]{40}$/.test(sha||''))return json({error:'Mã triển khai không hợp lệ.'},400);
        const run=await api.deployment(sha);return json({run:run?{status:run.status,conclusion:run.conclusion,html_url:run.html_url,head_sha:run.head_sha}:null});
      }
      return json({error:'Không tìm thấy yêu cầu.'},404);
    }finally{api.disconnect();}
  }catch(error){
    if(error.message==='BODY_SIZE')return json({error:'Nội dung quá lớn. Hãy giảm kích thước ảnh hoặc chia nhỏ lần tải.'},413);
    if(error.message==='BAD_BODY')return json({error:'Dữ liệu gửi lên không hợp lệ.'},400);
    if(/thay đổi ở nơi khác/.test(error.message))return json({error:error.message},409);
    if(/GitHub|quyền truy cập|Khóa truy cập/.test(error.message))return json({error:'Chưa truy cập được kho nội dung. Vui lòng liên hệ người quản lý để kiểm tra kết nối GitHub.'},502);
    return json({error:'Chưa xử lý được yêu cầu. Hãy thử lại; các thay đổi đang soạn vẫn được giữ.'},400);
  }
 };
}
export const handleCMS=createCMSHandler();
