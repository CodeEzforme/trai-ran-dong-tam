# Trại rắn Đồng Tâm

Website được dựng lại từ dữ liệu công khai của [trairandongtam.vn](https://trairandongtam.vn/), với thiết kế xanh rừng, bố cục responsive và mô hình rắn Three.js tương tác. Mã nguồn tại `G:\TraiRanDongTam`. Đây là bản mới để xem trước, chưa thay đổi website đang hoạt động.

Website trên GitHub Pages: **https://codeezforme.github.io/trai-ran-dong-tam/**. Mã nguồn: [CodeEzforme/trai-ran-dong-tam](https://github.com/CodeEzforme/trai-ran-dong-tam). Tự build và deploy khi cập nhật nhánh `main`; xem [hướng dẫn triển khai](docs/GITHUB-PAGES.md).

## Chạy dự án

Máy hiện tại đã có Python và các thư viện cần thiết. Mở terminal tại thư mục dự án:

```powershell
npm run dev
```

Mở **http://localhost:3000**. Có thể chạy trực tiếp `python scripts/serve.py` nếu không dùng npm. Lệnh dựng lại nội dung trước khi mở máy chủ. Sau khi sửa nội dung hoặc giao diện, chạy `npm run build` rồi tải lại trình duyệt. Nếu cổng đang được sử dụng, dùng `python scripts/serve.py --port 3001`.

Trên máy mới cần Python 3.7+ và cài thư viện:

```powershell
python -m pip install -r requirements.txt
npm run build
npm run preview
```

Không cần cài Node modules để chạy website. Three.js 0.186.1, phông chữ và ảnh đã được lưu cục bộ.

## Những gì đã thực hiện

- Trang chủ mới và các giao diện cho trang nội dung, danh mục, hồ sơ loài, sản phẩm, bài viết, liên hệ, bảng giá và bảo tàng.
- Giữ 214 đường dẫn được lấy từ API công khai: 92 trang, 12 bài viết, 96 mục động vật/sản phẩm, 9 danh mục sản phẩm và 5 danh mục bài viết.
- Thêm trang tìm kiếm toàn website và sơ đồ website: tổng cộng 216 đường dẫn.
- Tìm kiếm tiếng Việt không dấu, lọc danh mục, phân trang, trạng thái không có kết quả, URL giữ bộ lọc và trang hiện tại.
- Three.js hiển thị mô hình rắn GLB với texture, normal map, ánh sáng trực tiếp và bóng đổ. Camera tự fit theo khung desktop/mobile; thanh xoay/zoom/reset nằm riêng. Chỉ ẩn ảnh khi đã kiểm tra được khung hình 3D. Có timeout tải, ảnh thay thế, nút thử lại và xử lý mất WebGL context. Nguồn CC0 tại [docs/3D-ASSETS.md](docs/3D-ASSETS.md).
- Trang chủ dùng bố cục chữ/ảnh bất đối xứng, ảnh tham quan nổi, lưới trải nghiệm và dải động vật kéo ngang. View Transitions native tạo chuyển trang; ảnh nghiêng nhẹ theo chuột, các nhóm nội dung xuất hiện khi cuộn. Reduced motion tắt hiệu ứng.
- Menu desktop/mobile, hộp tìm kiếm có điều khiển bàn phím, FAQ, nội dung dựng sẵn cho SEO, sitemap XML và trang 404.
- Biểu mẫu có kiểm tra trường bắt buộc, tạo bản nháp email qua `mailto:` và liên kết dự phòng. Website không báo đã gửi email hoặc đã xác nhận lịch.
- 7 skill GitHub được cài trong `.agents/skills/`. Nguồn, vai trò và giấy phép ở [docs/SKILLS.md](docs/SKILLS.md).

## Cấu trúc

| Đường dẫn | Vai trò |
| --- | --- |
| `scripts/build.py` | Mẫu trang, điều hướng, chuyển đổi nội dung và sinh HTML |
| `scripts/home_sections.py` | Bố cục trang chủ và khu 3D |
| `public/assets/style.css` | Hệ giao diện và bố cục responsive |
| `public/assets/refinements.css` | Thanh điều hướng theo bản gốc và bố cục gọn hơn |
| `public/assets/experience.css` | Bố cục ảnh/chữ, khung 3D và chuyển động |
| `public/assets/app.js` | Menu, tìm kiếm, lọc, phân trang, biểu mẫu |
| `public/assets/motion.js` | Chuyển trang, gallery và hiệu ứng theo tương tác |
| `public/assets/snake.js` | Cảnh và mô hình Three.js |
| `public/assets/cobra-detail.js` | Hình khối đầu, mắt, lỗ mũi và nét miệng được bổ sung lên mô hình |
| `public/assets/models/cobra.glb` | Mô hình rắn có texture và normal map, lưu cục bộ |
| `data/source/` | Bản chụp dữ liệu WordPress công khai |
| `data/route-inventory.json` | Danh sách tất cả URL đã dựng |
| `data/assets.json` | Ánh xạ URL ảnh gốc sang file cục bộ |
| `public/assets/images/` | Ảnh tải từ website gốc, tối ưu WebP khi có thể |
| `public/assets/fonts/` | Phông Be Vietnam Pro cục bộ |
| `DESIGN.md` | Hệ màu, bố cục và định hướng thiết kế |
| `dist/` | Website hoàn chỉnh để đưa lên hosting tĩnh |
| `.github/workflows/pages.yml` | Tự build, kiểm tra và deploy GitHub Pages |
| `scripts/prepare-pages.py` | Điều chỉnh URL trang và tài nguyên theo đường dẫn repository |
| `artifacts/` | Ảnh chụp trình duyệt và kết quả kiểm tra |

Nội dung động vật và sản phẩm giữ phân loại do website gốc cung cấp. Một số phân loại trên nguồn chưa đồng nhất. Các trang cũ không có nội dung được giữ URL và có thông báo rõ ràng; trang loài rỗng có hồ sơ sản phẩm tương ứng sẽ hiển thị hồ sơ đó. Mô hình 3D là minh họa nghệ thuật, không phải mô hình khoa học để nhận dạng loài.

## Kiểm tra

```powershell
npm run build
npm run check
```

Kiểm tra tĩnh đối chiếu đủ đường dẫn nguồn, liên kết nội bộ, ảnh cục bộ, tiêu đề và main landmark trên toàn bộ 216 trang.

Đã chạy kiểm tra trình duyệt bằng Playwright với Microsoft Edge trên máy hiện tại. Script: `scripts/browser-check.cjs`. Kết quả: `artifacts/browser-check.json`; ảnh xem trước: `artifacts/home-desktop.png`, `artifacts/home-mobile.png`, `artifacts/snake-3d.png`. Các thư viện kiểm thử nằm ở `.tools/`, tách khỏi mã chạy website.

Kiểm tra riêng bản 3: `scripts/experience-check.cjs`, kết quả ở `artifacts/experience-v3-check.json`. Bao gồm xác nhận khung hình trước khi ẩn ảnh, mất WebGL context và thử lại, lỗi tải GLB và thử lại, xoay/zoom/reset liên tục, gallery, chuyển trang native, nút Back và responsive 360–1440px. Ảnh mới: `artifacts/hero-v3.png`, `artifacts/scene-v3.png`, `artifacts/hero-v3-mobile.png`.

## Đưa lên website thật

Build rồi đưa **nội dung thư mục `dist/`** lên hosting tĩnh có hỗ trợ `index.html` trong các thư mục và trang lỗi `404.html`. Không cần SPA fallback. Các URL gốc đã được giữ nguyên.

Để thay website WordPress hiện tại cần quyền hosting/domain và kế hoạch chuyển đổi dữ liệu phát sinh sau bản chụp này. Bản dựng hiện tại chưa có CMS, máy chủ gửi email, thanh toán hoặc hệ thống đặt lịch. Chỉ đường mở Google Maps và cần mạng; ảnh, phông và phần 3D hoạt động từ tài nguyên cục bộ.

Ảnh, nội dung và nhận diện thuộc nguồn được ghi ở `docs/MIGRATION.md`; việc tải để dựng bản thiết kế không thay đổi quyền sở hữu của các tài sản này.
