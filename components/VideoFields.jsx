'use client';
import VideoPlayer from './VideoPlayer';
import {videoSource} from '../lib/video.mjs';

export default function VideoFields({doc,disabled,onChange}){
 const source=videoSource(doc.videoUrl);
 return <section className="cms-video-panel" aria-labelledby="cms-video-heading"><h2 id="cms-video-heading">Video / clip</h2><label className="cms-field">Liên kết video / clip<input type="url" value={doc.videoUrl||''} disabled={disabled} placeholder="Dán liên kết YouTube hoặc tệp MP4/WebM" onChange={e=>onChange({videoUrl:e.target.value.trim()})}/></label>{source?<><p className="cms-video-ready" role="status">Đã nhận diện video. Bấm nút phát bên dưới để xem thử.</p><VideoPlayer doc={doc}/><p className="cms-help">Video được lưu cùng bài viết. Có thể để trống phần nội dung chữ bên dưới.</p></>:doc.videoUrl?<p className="cms-help" role="status">Chưa nhận diện được video. Dán liên kết YouTube hoặc liên kết HTTPS tới tệp MP4/WebM.</p>:<p className="cms-help">Hỗ trợ liên kết chia sẻ YouTube, YouTube Shorts và tệp MP4/WebM qua HTTPS.</p>}</section>;
}
