import {videoSource} from '../lib/video.mjs';
import {siteUrl} from '../lib/paths.mjs';
export default function VideoPlayer({doc}){
 const video=videoSource(doc.videoUrl);if(!video)return null;
 return <div className="nx-video-preview">{video.kind==='embed'?<iframe className="nx-video-player" src={video.src} title={doc.title||'Xem trước video'} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<video className="nx-video-player" controls preload="metadata" poster={doc.image?siteUrl(doc.image):undefined}><source src={video.src}/></video>}<a className="nx-video-source" href={doc.videoUrl} target="_blank" rel="noopener noreferrer">{video.kind==='embed'?'Xem trên YouTube':'Mở video'} ↗</a></div>;
}
