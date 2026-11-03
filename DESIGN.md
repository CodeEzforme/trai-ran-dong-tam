# Đồng Tâm — thiên nhiên, tri thức và sự sống

Website giới thiệu một điểm đến có thật tại Đồng Tháp, phục vụ gia đình, trường học, khách tham quan, người tìm thông tin về nghiên cứu và sản phẩm. Ngôn ngữ chính là tiếng Việt. Giữ toàn bộ URL công khai được kiểm kê từ WordPress; không dựng lại trang quản trị hoặc chức năng thanh toán không có trên nguồn.

## Hệ thiết kế

- Xanh rừng `#163e2d`: nhận diện, điều hướng và nền nội dung bảo tồn.
- Xanh lá `#d4e7be`: nút chính trên nền tối, bảng thông tin.
- Vàng hoa `#e8bd64`: điểm nhấn nhỏ và đánh dấu trải nghiệm 3D.
- Trắng sương `#f7f9f4`: nền trang, khoảng thở.
- Mực xanh `#20372c`: văn bản.
- Xám lá `#657366`: văn bản phụ.

Be Vietnam Pro dùng cho nội dung và tiêu đề, hỗ trợ đầy đủ dấu tiếng Việt. Tiêu đề lớn, trọng lượng rõ, hạn chế chữ in hoa. Ảnh động vật và cảnh quan thực tế là chất liệu chủ đạo. Lưới tối đa 1320px, khoảng cách 24px; nội dung đọc tối đa 760px. Góc bo lớn dành cho ảnh chính, nhỏ hơn cho nút; không biến tất cả nội dung thành các thẻ giống nhau.

## Bố cục

Trang chủ mở đầu bằng một khung cảnh thiên nhiên toàn chiều rộng có tiêu đề bên trái, thông tin chuyến thăm ngay phía dưới. Tiếp theo là các lối khám phá theo nhu cầu: tham quan, tìm hiểu loài, khám phá mô hình 3D, nghiên cứu, tin tức và lên lịch chuyến đi. Mô hình rắn là điểm tương tác chính; các phần còn lại dùng bố cục và ảnh tĩnh.

```
logo | điều hướng                         tìm kiếm | lên lịch
┌──────────────── ảnh thiên nhiên thực tế ──────────────────┐
│  Tiêu đề + hành động                  ghi chú địa điểm   │
└──────────────────────────────────────────────────────────┘
giờ mở cửa          địa điểm           liên hệ
trải nghiệm sinh thái: các ảnh lớn bất đối xứng
thế giới động vật: danh mục + ảnh loài
mô hình rắn Three.js tương tác | câu chuyện bảo tồn
nghiên cứu + sản phẩm       tin tức
lên lịch tham quan + câu hỏi thường gặp
chân trang đầy đủ liên kết và sơ đồ website
```

Trang danh mục có tìm kiếm, lọc, phân trang qua URL. Trang bài viết có tiêu đề, ngày xuất bản, ảnh và nội dung đọc sạch, bỏ giao diện Elementor cũ. Trang rỗng nguồn không thêm kiến thức sinh học hoặc y tế giả định. Biểu mẫu tạo email để người dùng kiểm tra và gửi; không báo đã gửi khi chưa có máy chủ.

## Skill áp dụng

Đã đọc `frontend-design`, `web-design-guidelines`, `threejs-fundamentals`, `threejs-geometry`, `threejs-materials`, `threejs-performance`, `threejs-interaction`. Chi tiết nguồn ở `docs/SKILLS.md`.

Thiết kế gắn với khu bảo tồn: ảnh thật, màu tán lá, thông tin chuyến thăm hữu ích. Tránh giao diện SaaS và số liệu quảng cáo không xác minh. Three.js có phương án ảnh dự phòng, nút xoay/đặt lại/phóng to bằng bàn phím, không tự động quay, giới hạn pixel ratio, dừng khi ngoài màn hình. Bố cục phải hoạt động ở 360px và hỗ trợ reduced motion.

## Điều chỉnh theo phản hồi

Giảm khoảng cách dọc: section desktop 52px, tablet 44px, mobile 32px. Hero desktop còn khoảng 510px, thanh đầu trang gọn hơn. Giữ nguyên nội dung và hệ màu; thu khoảng đệm giữa tiêu đề, ảnh và phần kế tiếp.

Navigation dùng đúng nhãn, URL, cấp mục và thứ tự của website gốc từ `data/original-navigation.json`: Trang chủ, Nghiên cứu khoa học, Du lịch sinh thái, Sản phẩm, Điều trị rắn cắn, Tổ chức, Tin tức. Không gom lại thành các nhóm mới. Trên desktop dùng nền trắng, trạng thái mục hiện tại xanh nhạt, dropdown nổi; trên mobile là các mục mở rộng theo đúng thứ tự đó.

Thay mô hình rắn ghép hình học đơn giản bằng mesh GLB liền mạch có texture màu và normal map, mắt và lỗ mũi riêng. Ánh sáng môi trường, ánh sáng ban ngày và bóng tiếp xúc tạo độ sâu; không dùng bệ tròn đồ chơi. Chuyển động có easing khi người dùng xoay/zoom, không có vòng lặp chuyển động tự động. Nguồn và giấy phép mô hình ghi tại `docs/3D-ASSETS.md`.

## Bố cục và chuyển động bản 3

Hero tách chữ và ảnh, giữ ảnh rắn trong kích thước phù hợp độ phân giải nguồn, thêm ảnh tham quan nhỏ tạo chiều sâu. Xanh lá sáng `#edf3e7` giúp mở đầu thân thiện, vàng nắng `#e6b65f` dùng cho dấu lá và mốc năm 1977 có nguồn. Khu trải nghiệm là lưới bất đối xứng một ảnh lớn và hai ảnh ngang. Dải động vật kéo ngang có nút trước/sau, ảnh bo theo hình lá; không đổi cấu trúc URL.

Chuyển trang dùng View Transitions native giữa các tài liệu, giữ header ổn định và có thanh tiến trình. Link, lịch sử trình duyệt và biểu mẫu vẫn dùng điều hướng chuẩn. Thêm một lượt xuất hiện cho hero, chuyển cảnh khi các nhóm trải nghiệm vào màn hình và hiệu ứng nghiêng nhẹ ảnh theo chuột. Không có vòng lặp trang trí tự chạy. Reduced motion bỏ chuyển động.

Khung 3D sáng, phần nút nằm riêng bên dưới. Máy ảnh tự fit theo kích thước thật và tỷ lệ khung. Không tạo environment map động: dùng ánh sáng trực tiếp và hemisphere để giảm tài nguyên GPU. Ảnh chỉ được thay bằng canvas sau khi đọc thử một khung hình nhỏ xác nhận mô hình đã được vẽ. Lỗi tải, timeout, mất WebGL context đều giữ ảnh, khóa nút 3D và cho phép thử lại.

Viewer render theo nhu cầu dùng `preserveDrawingBuffer: true` để giữ khung hình khi ra ngoài viewport và khi trình duyệt chụp canvas cho chuyển trang. Kiểm tra cả pixel sau khi cuộn khỏi khung; không chỉ kiểm tra trạng thái DOM đã tải.
