'use client';
import { useEffect,useRef,useState } from 'react';
import CMS from './CMS';
import Icon from './Icon';
import { ServerCMS } from '../lib/server-cms.mjs';
import { siteUrl } from '../lib/paths.mjs';

export default function AdminAccess(){
  const api=useRef(null),mounted=useRef(false),passwordInput=useRef(null);
  const [user,setUser]=useState(null),[checking,setChecking]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[username,setUsername]=useState(''),[password,setPassword]=useState(''),[show,setShow]=useState(false);
  const redirect=process.env.NEXT_PUBLIC_ADMIN_URL||'';
  useEffect(()=>{
    mounted.current=true;
    if(redirect){const dest=new URL(redirect);if(dest.origin!==location.origin){location.replace(dest.href);return;}}
    const client=new ServerCMS();api.current=client;
    client.onExpired=()=>{if(mounted.current){setUser(null);setChecking(false);setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');}};
    client.session().then(account=>{if(mounted.current){setUser(account);if(!account)setError('');}}).catch(e=>{if(mounted.current)setError(e.message);}).finally(()=>{if(mounted.current)setChecking(false);});
    return()=>{mounted.current=false;};
  },[redirect]);
  async function login(e){
    e.preventDefault();if(busy||checking)return;setBusy(true);setError('');
    try{const account=await api.current.login(username.trim(),password);setPassword('');setShow(false);setUser(account);}
    catch(e){setPassword('');setError(e.message);passwordInput.current?.focus();}
    finally{setBusy(false);}
  }
  async function logout(){await api.current.disconnect();setUser(null);setPassword('');setError('');setShow(false);}
  if(user&&!checking)return <CMS api={api.current} account={user} onLogout={logout}/>;
  return <main className="admin-access">
    <section className="admin-access-story" aria-label="Trại rắn Đồng Tâm"><img className="admin-access-photo" src={siteUrl('/assets/images/trang-chu-anh-bia-01.webp')} alt="Không gian xanh tại Trại rắn Đồng Tâm" width="2048" height="1365"/><a className="admin-access-brand" href={siteUrl('/')}><img src={siteUrl('/assets/images/59ac3a66d469ee35.webp')} alt="Biểu trưng Đồng Tâm" width="47" height="47"/><span>Đồng Tâm<small>Trại rắn & du lịch sinh thái</small></span></a><div><Icon name="leaf"/><h2>Chăm chút từng câu chuyện<br/>từ khu vườn.</h2><p>Không gian quản trị website Trại rắn Đồng Tâm.</p></div><a className="admin-access-back" href={siteUrl('/')}>Khám phá website <Icon name="diagonal"/></a></section>
    <section className="admin-access-form-section"><div className="admin-access-form-wrap"><div className="admin-access-mark"><Icon name="leaf"/></div><p className="admin-access-label">Quản trị Đồng Tâm</p><h1>Chào mừng trở lại.</h1><p className="admin-access-description">Đăng nhập để quản lý nội dung, hình ảnh<br className="admin-access-break"/> và những câu chuyện mới từ Đồng Tâm.</p>
    {checking?<div className="admin-access-checking" role="status"><span className="admin-access-spinner"/>Đang kiểm tra phiên đăng nhập…</div>:<form onSubmit={login} className="admin-access-form" aria-label="Đăng nhập quản trị">
      <label htmlFor="admin-username">Tài khoản</label><input id="admin-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck="false" required maxLength={80} placeholder="Nhập tài khoản quản trị" value={username} disabled={busy} onChange={e=>setUsername(e.target.value)}/>
      <label htmlFor="admin-password">Mật khẩu</label><div className="admin-access-password"><input ref={passwordInput} id="admin-password" name="password" type={show?'text':'password'} autoComplete="current-password" required maxLength={256} placeholder="Nhập mật khẩu" value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/><button type="button" aria-label={show?'Ẩn mật khẩu':'Hiện mật khẩu'} aria-pressed={show} disabled={busy} onClick={()=>setShow(!show)}>{show?'Ẩn':'Hiện'}</button></div>
      {error&&<p className="admin-access-error" role="alert">{error}</p>}<button type="submit" className="admin-access-submit" disabled={busy}>{busy?<><span className="admin-access-spinner"/>Đang đăng nhập…</>:<>Đăng nhập <Icon name="arrow"/></>}</button>
    </form>}
    <p className="admin-access-help">Dành cho người được cấp quyền quản lý website.<br/>Nếu cần cấp lại mật khẩu, hãy liên hệ quản trị hệ thống.</p><a className="admin-access-home" href={siteUrl('/')}>Về trang chủ <Icon name="diagonal"/></a></div><p className="admin-access-footer">© 2026 Trại rắn Đồng Tâm</p></section>
  </main>;
}
