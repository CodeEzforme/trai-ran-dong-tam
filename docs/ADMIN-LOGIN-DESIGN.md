# Đăng nhập quản trị

Người quản lý dùng tài khoản/mật khẩu riêng. Chưa đăng nhập chỉ thấy màn hình đăng nhập; CMS được tải sau khi máy chủ xác nhận phiên. Form có tên tài khoản, mật khẩu, hiện/ẩn mật khẩu, lỗi rõ ràng, trạng thái đang đăng nhập và đăng xuất.

Thiết kế giữ Be Vietnam Pro, xanh rừng #163e2d, trắng sương #f7f9f4, xanh non #d4e7be, vàng nắng #edc47b, mực #20372c. Màn hình chia hai: bên trái là một ảnh thật tại Đồng Tâm và lời chào ngắn, bên phải là form gọn, căn trái. Mobile ưu tiên form, ảnh thu nhỏ thành dải đầu trang. Không có dashboard hoặc số liệu ở trước màn hình đăng nhập.

Máy chủ kiểm tra mật khẩu scrypt bằng so sánh constant time, tạo phiên có chữ ký với cookie HttpOnly/Secure/SameSite, kiểm tra origin và CSRF khi ghi. Khóa GitHub ở biến môi trường phía máy chủ; trình duyệt chỉ gọi các endpoint CMS cố định. Thông tin đăng nhập không đưa vào source, bundle, localStorage hay sessionStorage. Login thất bại không cho biết riêng tài khoản hay mật khẩu sai.

GitHub Pages giữ phần website tĩnh. Mật khẩu riêng cần máy chủ xác thực; cấu hình Vercel Functions và máy chủ Node cục bộ dùng chung handler. Chỉ chuyển link admin công khai sang hosting mới sau khi hosting được kết nối và kiểm tra thực tế. Không đưa một phép so sánh mật khẩu trong JavaScript lên Pages rồi coi đó là xác thực.
