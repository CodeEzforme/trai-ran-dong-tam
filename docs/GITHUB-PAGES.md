# Triển khai lâu dài bằng GitHub Pages

- Repository: https://github.com/CodeEzforme/trai-ran-dong-tam
- Website: https://codeezforme.github.io/trai-ran-dong-tam/
- Workflow: https://github.com/CodeEzforme/trai-ran-dong-tam/actions/workflows/pages.yml

GitHub Pages lưu bản website trên tài khoản GitHub của chủ dự án. Bản này không dùng cơ chế demo 60 phút của Vercel Drop hoặc Netlify Drop.

Mỗi lần đẩy lên nhánh `main`, workflow `.github/workflows/pages.yml` cài Python 3.12 và thư viện, build 217 đường dẫn cùng trang 404, kiểm tra liên kết và chuẩn bị các URL cho đường dẫn repository. Chỉ thư mục website đã build được tải lên Pages. Có thể chạy lại bằng nút **Run workflow** trong tab Actions.

`scripts/prepare-pages.py` điều chỉnh liên kết HTML, import map, module JavaScript, tìm kiếm, font và đường dẫn GLB theo `base_path` GitHub cung cấp. Dữ liệu tìm kiếm sinh liên kết đúng dưới `/trai-ran-dong-tam/`; trang 404 dùng cùng đường dẫn tài nguyên. Bản dùng tên miền riêng hoặc localhost ở thư mục gốc vẫn build bằng `python scripts/build.py`.

Các ảnh, font, thư viện Three.js và mô hình rắn đi cùng repository. Không cần máy tính cá nhân chạy server để khách truy cập. `.tools/`, `artifacts/`, thông tin đăng nhập, token, log và thư mục build được loại khỏi Git bằng `.gitignore`.

## Cập nhật

```powershell
git add .
git commit -m "Update Dong Tam website"
git push origin main
```

Đợi workflow có trạng thái thành công trước khi gửi link. Nếu đổi tên repository hoặc dùng tên miền riêng, workflow nhận đường dẫn mới từ `actions/configure-pages`; không sửa cố định đường dẫn trong JavaScript.

## Kiểm tra đã chuẩn bị

- `python scripts/check.py`: 214/214 đường dẫn nguồn, 217 đường dẫn tổng cộng, không có liên kết nội bộ hỏng.
- `python scripts/prepare-pages.py --base-path /trai-ran-dong-tam`: 218 tệp HTML, không có liên kết vượt khỏi đường dẫn repository.
- `scripts/pages-check.cjs`: trang chủ, ảnh, điều hướng, import map, tải GLB, cận mặt, tìm kiếm và liên kết danh mục hoạt động dưới đường dẫn repository; không có lỗi JavaScript hoặc yêu cầu tài nguyên thất bại.

Website là bản demo giao diện; meta robots được đặt `noindex,nofollow`. Website thật `trairandongtam.vn` chưa bị thay đổi.
