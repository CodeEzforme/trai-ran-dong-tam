# Triển khai lâu dài bằng GitHub Pages

- Repository: https://github.com/CodeEzforme/trai-ran-dong-tam
- Website: https://codeezforme.github.io/trai-ran-dong-tam/
- Workflow: https://github.com/CodeEzforme/trai-ran-dong-tam/actions/workflows/pages.yml

GitHub Pages lưu bản website trên tài khoản GitHub của chủ dự án. Bản này không dùng cơ chế demo 60 phút của Vercel Drop hoặc Netlify Drop.

Mỗi lần đẩy lên nhánh `main`, workflow `.github/workflows/pages.yml` cài Node.js 22 và các dependency được khóa trong `package-lock.json`, chạy kiểm thử CMS, build Next.js và kiểm tra 218 trang chức năng. Chỉ thư mục `out/` được tải lên Pages. Có thể chạy lại bằng nút **Run workflow** trong tab Actions.

`NEXT_PUBLIC_BASE_PATH` nhận `base_path` từ GitHub và được dùng trong Next.js, liên kết nội dung, import map, tìm kiếm, font và GLB. Dữ liệu tìm kiếm sinh liên kết đúng dưới `/trai-ran-dong-tam/`; trang 404 dùng cùng đường dẫn tài nguyên. Build cho tên miền gốc thì bỏ biến này. Không dùng script chuẩn bị đường dẫn của bản Python cho thư mục Next.js `out/`.

Các ảnh, font, thư viện Three.js và mô hình rắn đi cùng repository. Không cần máy tính cá nhân chạy server để khách truy cập. `.tools/`, `artifacts/`, thông tin đăng nhập, token, log và thư mục build được loại khỏi Git bằng `.gitignore`.

## Cập nhật

```powershell
git add .
git commit -m "Update Dong Tam website"
git push origin main
```

Đợi workflow có trạng thái thành công trước khi gửi link. Nếu đổi tên repository hoặc dùng tên miền riêng, workflow nhận đường dẫn mới từ `actions/configure-pages`; không sửa cố định đường dẫn trong JavaScript.

Người quản lý có thể cập nhật nội dung tại `/admin/` bằng CMS. Xem [hướng dẫn CMS](CMS.md). CMS tạo commit trên cùng nhánh và kích hoạt workflow tương tự khi đẩy mã nguồn.

## Kiểm tra đã chuẩn bị

- `npm test`: mã hóa tiếng Việt, làm sạch HTML, quyền truy cập, xung đột và commit nguyên tử.
- `npm run build` và `npm run check`: 217 trang công khai cùng CMS, giữ các URL nguồn và kiểm tra tài nguyên dưới đường dẫn repository.
- `scripts/next-browser-check.cjs`: bìa 5 giây, menu, gallery, Three.js, tìm kiếm, CMS và responsive; API ghi trong kiểm thử được mô phỏng để không đăng bài thử lên website.

Website là bản demo giao diện; meta robots được đặt `noindex,nofollow`. Website thật `trairandongtam.vn` chưa bị thay đổi.
