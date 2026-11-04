import { siteUrl } from './paths.mjs';
export class SessionExpired extends Error {}
export class ServerCMS {
  constructor(){this.csrf=null;this.sha=null;this.onExpired=null;}
  async request(route,{method='GET',body}={}){
    let response;
    try{response=await fetch(siteUrl('/api/cms/'+route),{method,credentials:'same-origin',cache:'no-store',headers:{...(body?{'Content-Type':'application/json'}:{}),...(this.csrf?{'X-CMS-CSRF':this.csrf}:{})},...(body?{body:JSON.stringify(body)}:{})});}
    catch{throw new Error('Chưa kết nối được máy chủ. Hãy kiểm tra mạng và thử lại.');}
    let data;try{data=await response.json();}catch{throw new Error('Máy chủ đăng nhập chưa sẵn sàng. Vui lòng thử lại sau.');}
    if(!response.ok){
      if(response.status===401&&route!=='login'){this.csrf=null;this.onExpired?.();throw new SessionExpired('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');}
      throw new Error(data.error||'Chưa xử lý được yêu cầu. Hãy thử lại.');
    }
    return data;
  }
  async session(){try{const session=await this.request('session');this.csrf=session.csrf;return session.user;}catch(e){if(e instanceof SessionExpired)return null;throw e;}}
  async login(username,password){const data=await this.request('login',{method:'POST',body:{username,password}});this.csrf=data.csrf;return data.user;}
  async load(){const {data,sha}=await this.request('content');this.sha=sha;return data;}
  async publish(data,media=[]){
    const uploads=[];
    for(const image of media){const result=await this.request('media',{method:'POST',body:{path:image.path,base64:image.base64}});uploads.push(result.receipt);}
    const result=await this.request('publish',{method:'POST',body:{data,sha:this.sha,uploads}});this.sha=result.sha;return result.commit;
  }
  async deployment(sha){const result=await this.request('deployment?sha='+encodeURIComponent(sha));return result.run;}
  async disconnect(){await this.request('logout',{method:'POST',body:{}});this.csrf=null;this.sha=null;}
}
