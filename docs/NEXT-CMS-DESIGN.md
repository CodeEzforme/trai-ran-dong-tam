# Giao diện Next.js và CMS

Website phục vụ khách tham quan Trại rắn Đồng Tâm. Giữ toàn bộ URL, thứ tự menu gốc, ảnh do chủ dự án cung cấp và mô hình Three.js. Bìa đổi ảnh sau 5 giây.

Màu: xanh tán cây #163e2d, trắng sương #f7f9f4, xanh non #d4e7be, vàng nắng #edc47b, mực #20372c. Be Vietnam Pro dùng cho toàn bộ chữ, với tiêu đề nhẹ và khoảng dòng chặt hơn nội dung.

Bố cục: ảnh bìa thật toàn chiều rộng, chữ bên trái và bộ chọn ảnh bên phải; dải thông tin chuyến đi gọn; lưới trải nghiệm gồm một ảnh lớn và hai ảnh nhỏ; động vật có thể kéo ngang; 3D và câu chuyện bảo tồn; tin mới và liên hệ. Căn trái, lưới tối đa 1320px. Không dùng hiệu ứng trang trí che ảnh và không thêm số liệu quảng cáo.

CMS có thanh điều hướng riêng, danh sách nội dung có tìm kiếm và bộ lọc, trình soạn thảo cùng ảnh đại diện, trạng thái nháp/đã xuất bản, quản lý ảnh và thiết lập bìa. Bản nháp chưa xuất bản không xuất hiện trong trang công khai hoặc chỉ mục tìm kiếm.

Kiến trúc: Next.js App Router xuất HTML tĩnh trên GitHub Pages. Nội dung JSON trong repo là nguồn chính; bản mẫu HTML nhập một lần từ website hiện có. CMS xác thực quyền ghi trực tiếp với GitHub bằng token chỉ lưu trong bộ nhớ của tab, xuất bản một commit chứa nội dung và ảnh, kiểm tra xung đột trước khi ghi. Không đưa token lên repo, localStorage hoặc trang công khai. GitHub Actions build lại sau xuất bản. CMS thông báo rõ trạng thái đã lưu vào repo và trạng thái triển khai, không báo website cập nhật trước khi triển khai thành công.

Phê bình trước khi xây dựng: giữ bảng màu tự nhiên đã được duyệt, bỏ các khối đồng dạng và các hiệu ứng bay lên lặp lại. Dành trọng tâm cho hai ảnh thật; chuyển động tự chạy chỉ ở slideshow theo yêu cầu. Các trang cũ giữ nội dung chuyên môn, biểu mẫu và ảnh; React thay shell và các phần tương tác mới.
