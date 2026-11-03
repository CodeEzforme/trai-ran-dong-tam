# Phạm vi dữ liệu và chuyển đổi

Nguồn: [Trại rắn Đồng Tâm](https://trairandongtam.vn/). Bản dữ liệu công khai được lấy ngày **02/11/2026**, theo múi giờ Asia/Bangkok.

## Kiểm kê

| Nội dung nguồn | Số đường dẫn |
| --- | ---: |
| Trang WordPress, bao gồm trang chủ | 92 |
| Bài viết | 12 |
| Động vật và sản phẩm WooCommerce | 96 |
| Danh mục sản phẩm | 9 |
| Danh mục bài viết | 5 |
| **Tổng nguồn** | **214** |
| Trang tìm kiếm mới | 1 |
| Sơ đồ website mới | 1 |
| **Tổng bản dựng** | **216** |

Đối chiếu tự động trong `scripts/check.py`: mọi URL trong API nguồn phải có file HTML tương ứng. Danh sách và URL gốc nằm trong `data/route-inventory.json`. Đây là phạm vi công khai do API cung cấp; không bao gồm quản trị, bản nháp, dữ liệu khách hàng, đơn hàng, tệp nội bộ hoặc các trang không được công bố.

## Nội dung và ảnh

- Giữ dữ liệu HTML nguồn trong `data/source/` để có thể đối chiếu. Bản mới loại bỏ script, form cũ, CSS Elementor, widget chia sẻ và cách trình bày không còn phù hợp; giữ phần nội dung đọc, bảng và ảnh.
- Trang không có nội dung nguồn có trạng thái rõ ràng và lối đi tiếp. Không tự tạo giá vé, giá bán, đánh giá khách hàng hoặc hướng dẫn y khoa.
- Khi trang loài rỗng và hồ sơ WooCommerce có cùng slug, dùng nội dung hồ sơ đó trên URL trang cũ. Trường hợp hổ mang Xiêm dùng ánh xạ slug rõ ràng trong generator.
- Phân loại sản phẩm do website gốc cung cấp. Bản mới chưa chuẩn hóa lại các phân loại không nhất quán.
- Ảnh nguồn tải cục bộ và được tối ưu WebP, giới hạn cạnh 1600px. AVIF được giữ định dạng khi không chuyển đổi được. `data/assets.json` ghi ánh xạ đầy đủ. Tài sản tải lỗi được ghi ở `data/asset-failures.json` và hiển thị ảnh dự phòng, không để ảnh vỡ.
- Giữ ảnh thực tế và nhận diện từ nguồn trong phạm vi thiết kế lại được yêu cầu. Các tài sản này không được tuyên bố là có giấy phép mở chỉ vì truy cập công khai.

## Thông tin liên hệ

Footer nguồn ghi địa chỉ: Ấp Tân Thuận B, xã Kim Sơn, tỉnh Đồng Tháp; thời gian tham quan 7:00–17:00 mỗi ngày; điện thoại 0898 408 408; email trairandongtam408@gmail.com. Trang liên hệ cũ còn có số 0273 3853 204, được giữ ở trang liên hệ bản mới. Không gắn số tư vấn du lịch thành số cấp cứu.

Biểu mẫu tạo email nháp trên thiết bị người dùng. Lịch tham quan và giá cần được trung tâm xác nhận trực tiếp. Chưa kết nối WordPress, CRM, email delivery hay thanh toán.

## Triển khai

Website đang hoạt động chưa bị thay đổi. Bản dựng tĩnh là artifact để xem xét và đưa lên hosting. Sau khi chọn thời điểm chuyển đổi, cần đồng bộ nội dung mới phát sinh, cấu hình hosting trả `404.html` với mã 404, giữ URL thư mục, HTTPS và kiểm tra domain canonical. Không cần thay cấu trúc URL nguồn.
