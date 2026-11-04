import { siteUrl } from '../lib/paths.mjs';
export default function NotFound(){return <main className="nx-not-found"><p>Đồng Tâm</p><h1>Lối này chưa có trên bản đồ.</h1><p>Trang bạn tìm không tồn tại hoặc đã thay đổi đường dẫn.</p><a className="nx-visit-btn" href={siteUrl('/')}>Về trang chủ</a></main>;}
