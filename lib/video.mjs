export function videoSource(value){
 try{
  const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return null;
  const host=u.hostname.toLowerCase();
  if(['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(host)){
   const id=host==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
   return /^[\w-]{11}$/.test(id||'')?{kind:'embed',src:`https://www.youtube-nocookie.com/embed/${id}`}:null;
  }
  if(/\.(mp4|webm)$/i.test(u.pathname))return {kind:'file',src:u.href};
 }catch{}
 return null;
}
export function publishedVideos(data){return data.documents.filter(d=>d.status==='published'&&d.kind==='post'&&d.section==='news'&&d.categories.includes('news-videos')&&videoSource(d.videoUrl)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));}
export function videoHtml(doc,escape){const v=videoSource(doc.videoUrl);if(!v)return '';const player=v.kind==='embed'?`<iframe class="nx-video-player" src="${escape(v.src)}" title="${escape(doc.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`:`<video class="nx-video-player" controls preload="metadata"${doc.image?` poster="${escape(doc.image)}"`:''}><source src="${escape(v.src)}"></video>`;return `${player}<a class="nx-video-source" href="${escape(doc.videoUrl)}" target="_blank" rel="noopener noreferrer">${v.kind==='embed'?'Xem trên YouTube':'Mở video'} ↗</a>`;}
