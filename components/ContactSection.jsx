import Icon from './Icon';
import { SocialLinks } from './SiteShell';
export default function ContactSection({settings,fullPage=false}){
 const phone='tel:+'+settings.phone.replace(/\D/g,'').replace(/^0/,'84');
 const gmail='https://mail.google.com/mail/?'+new URLSearchParams({view:'cm',fs:'1',to:settings.email,su:'Liên hệ Trại rắn Đồng Tâm'}).toString();
 return <section className={'nx-section nx-container nx-contact-section'+(fullPage?'':' nx-home-contact')} id="lien-he">
  <div className="contact-grid">
   <div className="contact-details">
    <p className="nx-label">Hẹn gặp tại Đồng Tâm</p><h2>Chuyến đi bắt đầu<br/>từ một lời chào.</h2>
    <p>Gọi điện, nhắn Zalo hoặc gửi email để cùng Đồng Tâm chuẩn bị chuyến ghé thăm.</p>
    <div className="contact-row"><Icon name="pin"/><div><h3>Địa chỉ</h3><p>Ấp Tân Thuận B, xã Kim Sơn,<br/>tỉnh Đồng Tháp</p><a href="https://www.google.com/maps/search/?api=1&query=Trai+ran+Dong+Tam+Kim+Son" target="_blank" rel="noopener noreferrer">Xem đường đi <Icon name="diagonal"/></a></div></div>
    <div className="contact-row"><Icon name="clock"/><div><h3>Thời gian tham quan</h3><p>{settings.hours}</p></div></div>
    <div className="contact-row"><Icon name="mail"/><div><h3>Liên hệ</h3><p><a href={phone}>{settings.phone}</a><br/><a href={'mailto:'+settings.email}>{settings.email}</a></p>{fullPage&&<p>Điện thoại trung tâm: <a href="tel:+842733853204">0273 3853 204</a></p>}</div></div>
    <SocialLinks settings={settings}/>
   </div>
   <div className="nx-mail-card" id="len-lich">
    <span className="nx-mail-icon"><Icon name="mail"/></span>
    <p className="nx-label">Liên hệ qua email</p>
    <h3>Kể Đồng Tâm nghe<br/>về chuyến đi của bạn.</h3>
    <p>Trao đổi về lịch tham quan, dịch vụ và sản phẩm qua địa chỉ:</p>
    <a className="nx-mail-address" href={'mailto:'+settings.email}>{settings.email}</a>
    <a className="button primary nx-gmail-compose" href={gmail} target="_blank" rel="noopener noreferrer">Soạn thư trên Gmail <Icon name="diagonal"/></a>
    <a className="nx-mail-app" href={'mailto:'+settings.email}>Mở ứng dụng email <Icon name="arrow"/></a>
   </div>
  </div>
 </section>;
}
