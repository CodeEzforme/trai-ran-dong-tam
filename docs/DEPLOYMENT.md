# Demo Netlify

Đã chuyển bản tĩnh sang Netlify, ngày 03/11/2026, sau khi người dùng nhận lỗi 403 khi mở tên miền tạm Vercel qua điện thoại. Máy triển khai vẫn nhận HTTP 200 từ Vercel, nên chưa xác định được nguyên nhân khác biệt giữa hai đường truyền.

**Link xem demo mới:** https://beautiful-dango-c74581.netlify.app/

Netlify trả trạng thái `ready`. Bản demo được tạo khoảng 13:01 ngày 03/11/2026 và cần nhận quản lý trong vòng một giờ, khoảng trước 14:01 cùng ngày, theo giờ Việt Nam. Link HTTPS mới trả HTTP 200, không yêu cầu mật khẩu. Người dùng có thể nhận dự án bằng link quản lý riêng và đăng nhập Netlify để giữ bản demo.

Link nhận quản lý là thông tin riêng, không gửi cùng link demo cho khách. Kết quả riêng nằm ở `artifacts/deployment-netlify-result.json`; trạng thái để tiếp tục lần triển khai nằm ở `.tools/netlify-drop-private.json`. Không đưa hai file này vào website.

## Bản được xuất bản

- Nguồn website: `dist/` sau lần chỉnh mắt, mũi, đường miệng, hình khối đầu và nút “Cận mặt”.
- Thư mục xuất bản: `artifacts/publish-site/`.
- Gói tải lên: `artifacts/dong-tam-demo-full.zip`.
- Giữ đủ 216 đường dẫn và trang 404; chỉ đóng gói các ảnh thật sự được sử dụng.
- Ảnh được tải lên cùng website, không phụ thuộc máy tính cục bộ hoặc máy chủ ảnh website gốc.
- GLB và texture nhúng được giữ nguyên chất lượng nguồn để xem rõ khi cận mặt. Module `cobra-detail.js` chỉnh hình khối và bổ sung chi tiết lúc tải mô hình. Đã kiểm tra desktop/mobile và không có lỗi JavaScript.
- Đóng gói bằng `python scripts/package-drop.py`, sau đó triển khai bằng `python scripts/deploy-netlify.py`. Gói 27.7 MB gồm 180 ảnh cục bộ; chỉ chứa website đã build, không gồm mã nguồn, log hoặc thông tin quản lý triển khai. Netlify nhận 428 đường dẫn tệp và yêu cầu tải 409 nội dung khác nhau; bỏ cấu hình riêng của Vercel và thêm `_headers` của Netlify.
- Thêm meta robots và cấu hình header `X-Robots-Tag: noindex, nofollow, noarchive` cho bản demo.

Đây là bản chụp tĩnh tại thời điểm triển khai. Thay đổi mã nguồn cục bộ chưa tự động cập nhật bản công khai. Website thật `trairandongtam.vn` không bị thay đổi.

`scripts/verify-hosted-demo.cjs` kiểm tra trực tiếp bản công khai: trang chủ HTTP 200, không có màn hình mật khẩu hoặc thông báo bị chặn; GLB tải và chế độ cận mặt hoạt động; trang nghiên cứu khoa học trả HTTP 200. Kết quả và ảnh nằm ở `artifacts/netlify-hosted-check.json`, `artifacts/netlify-mobile-home.png`, `artifacts/netlify-mobile-face.png`. Kiểm tra dùng Chromium với viewport và user agent Safari iPhone, chưa kiểm chứng trực tiếp bằng iPhone thật hoặc mạng 4G của người dùng.

API triển khai dựa trên quy trình anonymous deployment trong Netlify CLI 27.16.2 (`dist/utils/deploy/drop-api.js`), với nguồn `created_via: cli`. Không cần tài khoản để tạo bản tạm; không thực hiện nhận quản lý thay người dùng.
