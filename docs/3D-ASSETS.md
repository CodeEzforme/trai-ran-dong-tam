# Mô hình 3D rắn hổ mang

- Nguồn: [Cobra — Innerscene 3D Parts Library](https://www.innerscene.com/tools/library/3d-parts/cobra-0b198528).
- Tệp tải công khai: `https://www.innerscene.com/api/library/cobra-0b198528/download`.
- Giấy phép nguồn công bố: **CC0**, cho phép sử dụng, chỉnh sửa và phân phối, kể cả thương mại; nguồn ghi đây là mô hình gốc của Innerscene.
- [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/).
- Tải ngày 02/11/2026, lưu tại `public/assets/models/cobra.glb`.
- Model study được tác giả mô tả là *Naja naja*, không phải ảnh chụp hoặc bản scan của một cá thể tại Đồng Tâm. Website dùng mô hình minh họa, không dùng để nhận dạng loài.

Tệp GLB chứa hình khối liền mạch của thân, cổ, đầu, mắt, lỗ mũi, texture màu và normal map. Website điều chỉnh kích thước hiển thị, camera, độ nhám, cường độ normal và ánh sáng; không gọi máy chủ nguồn khi người dùng mở website.

`docs/cobra-model-metadata.json` ghi kích thước tệp, mã SHA-256 và thông tin GLB để đối chiếu. Bản HTML trang nguồn được giữ tại `data/source/cobra-innerscene.html`.

Các module GLTFLoader, RoomEnvironment, BufferGeometryUtils và SkeletonUtils lấy cùng phiên bản **Three.js 0.186.1** với runtime. Giữ giấy phép MIT tại `public/assets/vendor/LICENSE`.

Lần chỉnh phần mặt: `public/assets/cobra-detail.js` nới nhẹ hình khối đầu với chuyển tiếp mềm ở gáy, giữ UV và texture gốc. Mắt nguồn bị chìm được thay bằng mắt nổi đúng bề mặt, có iris tạo bằng canvas, con ngươi tròn và điểm phản sáng nhỏ; bổ sung lỗ mũi và đường khép miệng theo giao điểm trên bề mặt da. Chi tiết được tạo tại trình duyệt, không ghi đè GLB nguồn. Nút “Cận mặt” chuyển cả camera và điểm nhìn vào đầu; nút này hoặc nút đặt lại đưa về toàn thân. Chế độ cận vẫn hỗ trợ xoay và phóng to/thu nhỏ, tôn trọng reduced motion.

Ảnh kiểm tra mới: `artifacts/cobra-face-close.png`, `artifacts/cobra-face-mobile-close.png`, `artifacts/cobra-face-full.png`. `scripts/experience-check.cjs` kiểm tra thêm chuyển cận mặt/toàn thân, xoay/zoom ở cận cảnh, khôi phục sau mất context và lỗi khung hình.
