# Trại rắn Đồng Tâm — Next.js + CMS

Website React/Next.js, nội dung tiếng Việt và CMS quản trị bài viết, sản phẩm, động vật, danh mục, trang nội dung, ảnh bìa và thông tin liên hệ.

- Website: **https://codeezforme.github.io/trai-ran-dong-tam/**
- CMS: **https://codeezforme.github.io/trai-ran-dong-tam/admin/**
- Repo: [CodeEzforme/trai-ran-dong-tam](https://github.com/CodeEzforme/trai-ran-dong-tam)
- Hướng dẫn quản trị: [docs/CMS.md](docs/CMS.md)

## Công nghệ

Next.js 16.4.5 App Router, React 19.3.1, CSS responsive, Three.js/WebGL. Next.js xuất HTML cho từng trang; GitHub Pages phục vụ website, GitHub Actions build và triển khai. React điều khiển slideshow, menu, tìm kiếm, hộp thoại và toàn bộ CMS. Liên kết giữa các trang dùng điều hướng trình duyệt để giữ hoạt động các tương tác nội dung đã nhập, lịch sử và native View Transitions.

Giữ đủ 217 đường dẫn công khai hiện có, thêm `/admin/`: tổng 218 trang chức năng. Bao gồm 214 nội dung quản trị: 92 trang, 12 bài viết, 85 hồ sơ động vật, 11 sản phẩm và 14 trang danh mục. Thư viện có 475 ảnh. Giữ thứ tự điều hướng gốc, Vườn thuốc nam ngay sau Sản phẩm, 6 ảnh vườn thuốc, 3 ảnh điều trị và mô hình rắn có texture với điều khiển cận mặt.

Hai ảnh bìa chủ dự án cung cấp tự chuyển mỗi 5 giây; có ảnh thu nhỏ và tạm dừng. Giao diện mới ưu tiên ảnh thật, nội dung ngắn gọn và hiển thị tốt từ 360px. Giảm chuyển động tắt fade nhưng vẫn đổi ảnh theo yêu cầu.

## Chạy dự án

Cần **Node.js 22.14+** và npm. Không cần Python cho build/chạy bản Next.js.

```sh
npm ci
npm run dev
```

Mở `http://localhost:3001`. Trên máy hiện tại có Node portable tại `.tools/node.exe`; nếu Node mặc định quá cũ, thêm thư mục `.tools` vào đầu PATH trước khi chạy npm.

```sh
npm test
npm run build
npm run check
npm run preview
```

Build xuất vào `out/`. Preview ở `http://localhost:3001`. Để kiểm tra đúng URL GitHub Pages, đặt `NEXT_PUBLIC_BASE_PATH=/trai-ran-dong-tam` cho cả build, check và preview. Khi deploy tên miền gốc, bỏ biến này. `SITE_ORIGIN` cấu hình origin của sitemap; bản demo mặc định noindex.

## Nguồn dữ liệu và CMS

`content/content.json` là nguồn nội dung duy nhất cho bản mới. Không chạy migration lại sau khi đã sửa nội dung bằng CMS.

CMS đọc/ghi GitHub API bằng khóa của người quản lý, giữ khóa trong bộ nhớ tab. Xuất bản bằng một commit nguyên tử gồm JSON và ảnh; so sánh phiên bản và cập nhật ref không force để tránh ghi đè khi có người khác sửa. GitHub Actions tự build sau commit. Xem [hướng dẫn kết nối](docs/CMS.md).

Repo hiện công khai: nháp được loại khỏi website và chỉ mục, nhưng vẫn đọc được trong source GitHub. CMS chưa có tài khoản/mật khẩu riêng, cơ sở dữ liệu riêng hoặc luồng duyệt nhiều cấp. Đây là CMS dùng GitHub; không yêu cầu máy chủ bổ sung.

## Cấu trúc

| Đường dẫn | Vai trò |
| --- | --- |
| `app/[[...slug]]/page.jsx` | Tạo toàn bộ trang công khai và metadata |
| `app/admin/` | Giao diện quản trị responsive |
| `components/` | Header, bìa React, trang chủ, CMS và trình soạn thảo |
| `content/content.json` | Trang, bài viết, sản phẩm, danh mục và thiết lập |
| `lib/content.mjs` | Lọc nháp, làm sạch HTML, dựng nội dung và liên kết |
| `lib/github-cms.mjs` | Xác thực, kiểm tra xung đột, ghi commit và theo dõi triển khai |
| `data/migrated-templates.json` | Bố cục chuyên biệt nhập từ bản cũ |
| `public/assets/` | Ảnh, font, mô hình 3D và tương tác nội dung cũ |
| `scripts/prepare-next.mjs` | Chuẩn bị dữ liệu và tài nguyên đúng base path |
| `scripts/check-next.mjs` | Kiểm tra route, liên kết, ảnh và nháp |
| `tests/cms.test.mjs` | Kiểm thử lưu/xung đột, mã hóa tiếng Việt và làm sạch HTML |
| `.github/workflows/pages.yml` | CI và triển khai GitHub Pages |

Trình soạn thảo dùng DOMPurify ở client và sanitize-html khi build. Các template nhập sẵn được giữ riêng, không nhận mã JavaScript từ CMS. Tài nguyên bên thứ ba ở `public/assets/vendor/` được giữ nguyên. Mô hình minh họa không dùng để nhận dạng loài; nguồn/giấy phép ở [docs/3D-ASSETS.md](docs/3D-ASSETS.md).

## Kiểm tra trình duyệt

`scripts/next-browser-check.cjs` dùng Playwright/Edge đã có trong `.tools/`: kiểm tra bìa 5 giây, menu, tìm kiếm không dấu, gallery, Three.js, CMS soạn bài/tải ảnh/xem trước/lưu, xung đột và responsive. API ghi GitHub được mô phỏng trong bài kiểm tra trình duyệt để không đăng bài thử lên website. Tệp kết quả và ảnh chụp nằm trong `artifacts/` được bỏ qua bởi Git.

## Bản cũ

Python generator và snapshot WordPress vẫn được giữ để đối chiếu/migration, không chạy trong pipeline Next.js. `scripts/migrate-next.py` chỉ nhập dữ liệu một lần và từ chối ghi đè CMS hiện có. Dữ liệu nguồn/giấy phép được ghi ở `docs/MIGRATION.md`, các skill tại `docs/SKILLS.md`. Bản mới không thay đổi website WordPress ở tên miền `trairandongtam.vn`.

Biểu mẫu liên hệ vẫn soạn email để người dùng kiểm tra và gửi; không có máy chủ gửi mail, thanh toán hay xác nhận đặt lịch tự động.
