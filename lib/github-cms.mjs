import { repository } from './paths.mjs';
import { validateContent } from './model.mjs';
const encoder = new TextEncoder();
export function toBase64(text) {
  const bytes=encoder.encode(text); let binary='';
  for(let i=0;i<bytes.length;i+=16384) binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
  return btoa(binary);
}
export function fromBase64(text) { return new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g,'')),c=>c.charCodeAt(0))); }
export class GitHubCMS {
  #token;
  constructor(token, fetcher=(...args)=>globalThis.fetch(...args)) { this.#token=token; this.fetcher=fetcher; this.sha=null; }
  async request(path, {method='GET',body,raw=false,anonymous=false}={}) {
    const response=await this.fetcher('https://api.github.com'+path,{method,cache:'no-store',headers:{Accept:raw?'application/vnd.github.raw+json':'application/vnd.github+json',...(!anonymous?{Authorization:'Bearer '+this.#token}:{}),'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
    if(!response.ok) {
      if(response.status===409 || response.status===422) throw new Error('Nội dung đã được thay đổi ở nơi khác. Tải lại dữ liệu trước khi xuất bản; bản chỉnh sửa hiện tại vẫn được giữ trong màn hình.');
      if(response.status===401) throw new Error('Khóa truy cập không hợp lệ hoặc đã hết hạn. Hãy kết nối lại.');
      if(response.status===403 || response.status===404) throw new Error('Không đủ quyền truy cập. Chọn repo trai-ran-dong-tam và cấp Contents: Read and write.');
      throw new Error('GitHub chưa xử lý được yêu cầu ('+response.status+'). Hãy thử lại; thay đổi chưa bị mất.');
    }
    return raw?response.text():response.json();
  }
  get root(){return `/repos/${repository.owner}/${repository.name}`;}
  async connect(){
    const user=await this.request('/user');
    const repo=await this.request(this.root);
    if(repo.permissions && !repo.permissions.push) throw new Error('Tài khoản này chưa có quyền xuất bản website.');
    const data=await this.load(); return {user,data};
  }
  async load(){
    const url=this.root+'/contents/'+repository.file+'?ref='+repository.branch;
    const file=await this.request(url);
    const text=file.content?fromBase64(file.content):await this.request(url,{raw:true});
    const data=validateContent(JSON.parse(text)); this.sha=file.sha; return data;
  }
  async publish(data, media=[]){
    validateContent(data);
    if(!this.sha) throw new Error('Hãy tải dữ liệu CMS trước khi lưu.');
    const head=await this.request(this.root+'/git/ref/heads/'+repository.branch);
    // Read against an immutable commit; never combine a stale file with a newer tree.
    const file=await this.request(this.root+'/contents/'+repository.file+'?ref='+head.object.sha);
    if(file.sha!==this.sha) throw new Error('Nội dung đã được thay đổi ở nơi khác. Hãy tải lại dữ liệu trước khi xuất bản.');
    const parent=await this.request(this.root+'/git/commits/'+head.object.sha);
    const json=JSON.stringify(data,null,2)+'\n';
    const blob=await this.request(this.root+'/git/blobs',{method:'POST',body:{content:json,encoding:'utf-8'}});
    const tree=[{path:repository.file,mode:'100644',type:'blob',sha:blob.sha}];
    for(const image of media){
      if(!/^public\/assets\/images\/uploads\/[a-zA-Z0-9._-]+\.webp$/.test(image.path)) throw new Error('Đường dẫn ảnh tải lên không hợp lệ.');
      const b=image.sha?{sha:image.sha}:await this.request(this.root+'/git/blobs',{method:'POST',body:{content:image.base64,encoding:'base64'}});
      if(image.sha&&!/^[a-f0-9]{40}$/.test(image.sha))throw new Error('Mã ảnh tải lên không hợp lệ.');
      tree.push({path:image.path,mode:'100644',type:'blob',sha:b.sha});
    }
    const nextTree=await this.request(this.root+'/git/trees',{method:'POST',body:{base_tree:parent.tree.sha,tree}});
    const commit=await this.request(this.root+'/git/commits',{method:'POST',body:{message:'cms: update website content',tree:nextTree.sha,parents:[head.object.sha]}});
    // force:false rejects a concurrent writer instead of overwriting their commit.
    await this.request(this.root+'/git/refs/heads/'+repository.branch,{method:'PATCH',body:{sha:commit.sha,force:false}});
    this.sha=blob.sha; return commit;
  }
  async deployment(sha){
    const data=await this.request(this.root+'/actions/workflows/pages.yml/runs?head_sha='+encodeURIComponent(sha)+'&per_page=3',{anonymous:true});
    return data.workflow_runs?.find(run=>run.head_sha===sha) || null;
  }
  disconnect(){this.#token='';this.sha=null;}
}
