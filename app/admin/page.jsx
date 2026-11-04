import AdminAccess from '../../components/AdminAccess';
import './admin.css';
import './login.css';
export const metadata={title:'Quản trị nội dung',robots:{index:false,follow:false}};
export default function AdminPage(){
  const destination=process.env.NEXT_PUBLIC_ADMIN_URL;
  if(destination)return <>
    <meta httpEquiv="refresh" content={'0;url='+destination}/>
    <main className="admin-redirect"><h1>Đang mở trang quản trị mới.</h1><p>Đăng nhập bằng tài khoản Admin để thêm và lưu nội dung.</p><a href={destination}>Mở trang đăng nhập Admin</a></main>
  </>;
  return <AdminAccess />;
}
