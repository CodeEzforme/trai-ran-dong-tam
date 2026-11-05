import Icon from './Icon';
export default function ContactForm(){
 return <form className="contact-form nx-contact-form" id="len-lich" method="post" action="https://trai-ran-dong-tam.vercel.app/api/contact" data-contact-form data-contact-endpoint="https://trai-ran-dong-tam.vercel.app/api/contact">
  <p className="section-kicker">Gửi lời nhắn</p><h2>Cùng lên lịch<br/>cho một ngày xanh.</h2>
  <div className="form-grid">
   <label>Họ và tên<input name="name" required autoComplete="name" maxLength={100} placeholder="Họ và tên của bạn"/></label>
   <label>Số điện thoại<input name="phone" type="tel" required autoComplete="tel" inputMode="tel" maxLength={25} placeholder="Số điện thoại liên hệ"/></label>
   <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="Email để nhận phản hồi"/></label>
   <label>Ngày dự kiến<input name="date" type="date"/></label>
   <label>Số khách dự kiến<input name="guests" type="number" min="1" max="10000" inputMode="numeric" placeholder="Ví dụ: 10"/></label>
   <label>Bạn quan tâm<select name="interest"><option>Tham quan gia đình</option><option>Tham quan trường học / đoàn</option><option>Sản phẩm Đồng Tâm</option><option>Thông tin khác</option></select></label>
  </div>
  <label>Lời nhắn<textarea name="message" rows={4} maxLength={5000} placeholder="Bạn muốn được tư vấn điều gì?"/></label>
  <label className="nx-form-honeypot" aria-hidden="true">Để trống ô này<input name="website" tabIndex={-1} autoComplete="off"/></label>
  <p className="form-note">Thông tin được gửi tới trairandongtam408@gmail.com để Đồng Tâm liên hệ tư vấn. Lịch tham quan được xác nhận trực tiếp với bạn.</p>
  <button className="button primary" type="submit">Gửi thông tin <Icon name="diagonal"/></button>
  <p className="form-status" role="status" aria-live="polite"/>
  <a className="email-fallback" hidden href="mailto:trairandongtam408@gmail.com">Gửi bằng ứng dụng email</a>
 </form>;
}
