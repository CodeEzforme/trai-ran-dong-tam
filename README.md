# Trại rắn Đồng Tâm — Next.js + CMS

Website React/Next.js, nội dung tiếng Việt và CMS quản trị bài viết, sản phẩm, động vật, danh mục, trang nội dung, ảnh bìa và thông tin liên hệ.

- Website: **https://codeezforme.github.io/trai-ran-dong-tam/**
- CMS: **https://trai-ran-dong-tam.vercel.app/admin/**
- Repo: [CodeEzforme/trai-ran-dong-tam](https://github.com/CodeEzforme/trai-ran-dong-tam)
- Hướng dẫn quản trị: [docs/CMS.md](docs/CMS.md)

## Công nghệ

Next.js 16.4.5 App Router, React 19.3.1, CSS responsive. Next.js xuất HTML cho từng trang; GitHub Pages và Vercel phục vụ website, tự build sau mỗi commit. React điều khiển slideshow, menu, tìm kiếm, hộp thoại và toàn bộ CMS. Liên kết giữa các trang dùng điều hướng trình duyệt để giữ hoạt động các tương tác nội dung đã nhập, lịch sử và native View Transitions.

Giữ các đường dẫn cũ, nội dung và ảnh do chủ dự án đã lưu qua CMS. Bản ngày 05/11/2026 có 227 đường dẫn công khai và `/admin/`, giữ 6 ảnh vườn thuốc và 3 ảnh điều trị. Menu theo sơ đồ mới gồm Trang chủ, Giới thiệu, Nghiên cứu khoa học, Du lịch sinh thái, Sản phẩm, Vườn thuốc nam, Tin tức, Tuyển dụng. Các nhánh cho phép thêm bài từ CMS. Gỡ khu 3D lỗi khỏi giao diện. Xem [sơ đồ và thay đổi trang chủ](docs/SITEMAP-2026-11.md).

Hai ảnh bìa chủ dự án cung cấp tự chuyển mỗi 5 giây; có ảnh thu nhỏ và tạm dừng. Tin mới ngay sau ảnh bìa, tiếp theo là sản phẩm nổi bật, trải nghiệm và form liên hệ. Giao diện ưu tiên ảnh thật và hiển thị tốt từ 360px. Giảm chuyển động tắt fade nhưng vẫn đổi ảnh theo yêu cầu.

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

CMS đăng nhập bằng tài khoản/mật khẩu riêng, xác thực ở server với scrypt và cookie HttpOnly/Secure. Khóa GitHub nằm trong biến môi trường server, trình duyệt chỉ gọi API CMS. Xuất bản bằng một commit nguyên tử gồm JSON và ảnh; so sánh phiên bản và cập nhật ref không force để tránh ghi đè khi có người khác sửa. GitHub Actions và Vercel tự build sau commit. Xem [hướng dẫn CMS](docs/CMS.md) và [hosting admin](docs/ADMIN-HOSTING.md).

Repo hiện công khai: nháp được loại khỏi website và chỉ mục, nhưng vẫn đọc được trong source GitHub. CMS hiện có một tài khoản Admin, chưa có luồng duyệt nhiều cấp hay phân vai. API xác thực chạy trên Vercel Functions; website công khai vẫn hoạt động trên GitHub Pages.

## Cấu trúc

| Đường dẫn | Vai trò |
| --- | --- |
| `app/[[...slug]]/page.jsx` | Tạo toàn bộ trang công khai và metadata |
| `app/admin/` | Giao diện quản trị responsive |
| `components/` | Header, bìa React, trang chủ, CMS và trình soạn thảo |
| `content/content.json` | Trang, bài viết, sản phẩm, danh mục và thiết lập |
| `lib/content.mjs` | Lọc nháp, làm sạch HTML, dựng nội dung và liên kết |
| `lib/structure.mjs`, `lib/collections.mjs` | Sơ đồ, chuyên mục và danh sách nội dung công khai |
| `lib/about.mjs`, `app/interior.css` | Giới thiệu, nhóm nhân sự không trùng và bố cục đọc cho trang bên trong |
| `lib/github-cms.mjs` | Xác thực, kiểm tra xung đột, ghi commit và theo dõi triển khai |
| `server/`, `api/cms.mjs` | Xác thực mật khẩu, cookie phiên, CSRF và API quản trị |
| `components/AdminAccess.jsx` | Màn hình đăng nhập và kiểm tra phiên trước khi vào CMS |
| `data/migrated-templates.json` | Bố cục chuyên biệt nhập từ bản cũ |
| `public/assets/` | Ảnh, font, mô hình 3D và tương tác nội dung cũ |
| `scripts/prepare-next.mjs` | Chuẩn bị dữ liệu và tài nguyên đúng base path |
| `scripts/check-next.mjs` | Kiểm tra route, liên kết, ảnh và nháp |
| `tests/cms.test.mjs` | Kiểm thử lưu/xung đột, mã hóa tiếng Việt và làm sạch HTML |
| `.github/workflows/pages.yml` | CI và triển khai GitHub Pages |

Trình soạn thảo dùng DOMPurify ở client và sanitize-html khi build. Các template nhập sẵn được giữ riêng, không nhận mã JavaScript từ CMS. Tài nguyên bên thứ ba ở `public/assets/vendor/` được giữ nguyên. Mô hình minh họa không dùng để nhận dạng loài; nguồn/giấy phép ở [docs/3D-ASSETS.md](docs/3D-ASSETS.md).

## Kiểm tra trình duyệt

`scripts/next-browser-check.cjs` dùng Playwright/Edge đã có trong `.tools/`: kiểm tra bìa 5 giây, sơ đồ mới, sản phẩm nổi bật, tìm kiếm không dấu, gallery, liên kết Gmail và màn hình đăng nhập. `scripts/cms-taxonomy-check.cjs` kiểm tra thêm/xuất bản vào cả 7 nhóm bằng API mô phỏng. `scripts/admin-browser-check.cjs` kiểm tra đăng nhập thật, cookie phiên, tải lại, đăng xuất và API không có quyền. Không tự gửi email thử. Tệp kết quả và ảnh chụp nằm trong `artifacts/` được bỏ qua bởi Git.

## Bản cũ

Python generator và snapshot WordPress vẫn được giữ để đối chiếu/migration, không chạy trong pipeline Next.js. `scripts/migrate-next.py` chỉ nhập dữ liệu một lần và từ chối ghi đè CMS hiện có. Dữ liệu nguồn/giấy phép được ghi ở `docs/MIGRATION.md`, các skill tại `docs/SKILLS.md`. Bản mới không thay đổi website WordPress ở tên miền `trairandongtam.vn`.

Theo yêu cầu cuối cùng, trang chủ và `/contact/` hiển thị **trairandongtam408@gmail.com** cùng nút **Soạn thư trên Gmail**. Khách tự viết và gửi thư trong Gmail hoặc ứng dụng email của mình. Không cần cấu hình máy chủ gửi mail, dịch vụ trung gian hoặc mật khẩu Gmail. Xem [liên hệ email](docs/CONTACT-EMAIL.md).
