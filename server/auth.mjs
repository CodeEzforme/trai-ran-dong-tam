import { createHmac, randomBytes, scrypt as derive, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(derive);
export const sessionSeconds=8*60*60;
const equal=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y);};
export async function hashPassword(password){
  const salt=randomBytes(16).toString('hex');
  const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
  return `scrypt$32768$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password,encoded){
  if(typeof password!=='string'||password.length>256)return false;
  const [algorithm,cost,salt,hash]=String(encoded).split('$');
  if(algorithm!=='scrypt'||cost!=='32768'||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{128}$/.test(hash))return false;
  const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
  return timingSafeEqual(key,Buffer.from(hash,'hex'));
}
export function authConfig(env=process.env){
  if(!env.CMS_PASSWORD_HASH||!env.CMS_SESSION_SECRET||env.CMS_SESSION_SECRET.length<32||!env.CMS_GITHUB_TOKEN)return null;
  return {username:env.CMS_ADMIN_USERNAME||'Admin',passwordHash:env.CMS_PASSWORD_HASH,secret:env.CMS_SESSION_SECRET,githubToken:env.CMS_GITHUB_TOKEN};
}
function sign(value,config){return createHmac('sha256',config.secret).update(value).digest('base64url');}
function version(config){return sign(config.passwordHash,config).slice(0,20);}
export function issueSession(config,now=Date.now()){
  const claims={username:config.username,csrf:randomBytes(24).toString('base64url'),exp:Math.floor(now/1000)+sessionSeconds,version:version(config)};
  const payload=Buffer.from(JSON.stringify(claims)).toString('base64url');
  return {value:payload+'.'+sign(payload,config),claims};
}
export function verifySession(value,config,now=Date.now()){
  if(!value||value.length>2048)return null;
  const [payload,signature,...extra]=value.split('.');if(extra.length||!signature||!equal(sign(payload,config),signature))return null;
  try{const c=JSON.parse(Buffer.from(payload,'base64url').toString());return c.username===config.username&&c.version===version(config)&&c.exp>now/1000&&typeof c.csrf==='string'?c:null;}catch{return null;}
}
export function cookieName(url){return new URL(url).protocol==='https:'?'__Host-dongtam-session':'dongtam-session';}
export function sessionCookie(value,url,maxAge=sessionSeconds){return `${cookieName(url)}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(url).protocol==='https:'?'; Secure':''}`;}
export function readSession(request,config){const cookie=request.headers.get('cookie')||'';const pair=cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName(request.url)+'='));return verifySession(pair?.slice(pair.indexOf('=')+1),config);}
export function sameOrigin(request,env=process.env){const origin=request.headers.get('origin');try{return !!origin&&new URL(origin).origin===(env.CMS_ORIGIN?new URL(env.CMS_ORIGIN).origin:new URL(request.url).origin);}catch{return false;}}
export function validCsrf(request,session){return equal(request.headers.get('x-cms-csrf')||'',session.csrf);}
export function uploadReceipt(path,sha,config,session){const value=Buffer.from(JSON.stringify({path,sha,exp:session.exp,csrf:session.csrf})).toString('base64url');return value+'.'+sign(value,config);}
export function readUploadReceipt(receipt,config,session){
  try{const [value,sig]=receipt.split('.');if(!equal(sign(value,config),sig))return null;const p=JSON.parse(Buffer.from(value,'base64url').toString());return p.exp>Date.now()/1000&&p.csrf===session.csrf&&/^public\/assets\/images\/uploads\/[a-zA-Z0-9._-]+\.webp$/.test(p.path)&&/^[a-f0-9]{40}$/.test(p.sha)?{path:p.path,sha:p.sha}:null;}catch{return null;}
}
// Per-instance limits complement the hosting provider's firewall; entries expire automatically.
export function loginLimiter(now=Date.now){
  const attempts=new Map();
  return {blocked(key){const hit=attempts.get(key);return !!hit&&hit.until>now()&&hit.count>=6;},fail(key){const old=attempts.get(key);attempts.set(key,{count:old&&old.until>now()?old.count+1:1,until:old&&old.until>now()?old.until:now()+15*60*1000});if(attempts.size>10000)for(const [k,v] of attempts)if(v.until<=now())attempts.delete(k);},clear(key){attempts.delete(key);}};
}
