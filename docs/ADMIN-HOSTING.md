# Hosting và đăng nhập Admin

- Website GitHub Pages: https://codeezforme.github.io/trai-ran-dong-tam/
- Website trên Vercel: https://trai-ran-dong-tam.vercel.app/
- Đăng nhập quản trị: https://trai-ran-dong-tam.vercel.app/admin/
- Vercel project: `birbirthday-bao-na/trai-ran-dong-tam`.

Trang `/admin/` trên GitHub Pages chuyển sang trang quản trị Vercel. Website tĩnh vẫn được GitHub Actions build và triển khai như trước. Vercel được liên kết với cùng repository để tự triển khai khi nhánh `main` thay đổi.

## Đăng nhập

Tài khoản **Admin**, dùng mật khẩu đã được chủ dự án thiết lập. Mật khẩu không được ghi trong tài liệu hoặc repository. Chưa đăng nhập chỉ có form đăng nhập; nội dung CMS được tải từ endpoint riêng sau khi máy chủ xác nhận phiên.

Mật khẩu dùng scrypt N=32768, r=8, p=1, salt ngẫu nhiên. Cookie phiên 8 giờ có chữ ký HMAC; production dùng `__Host-`, `Secure`, `HttpOnly`, `SameSite=Strict`, không đặt Domain. Phiên được giữ khi tải lại trang. Mật khẩu được thay thì các phiên cũ không còn hợp lệ. Đăng xuất xóa cookie của trình duyệt. Cookie không chứa khóa GitHub.

Các request ghi kiểm tra cùng origin và CSRF. Login trả cùng một lỗi cho sai tài khoản/sai mật khẩu. Có giới hạn số lần thử theo IP trong từng instance; đây không phải bộ đếm phân tán giữa mọi serverless instance. Có thể bổ sung rate limiting ở Vercel Firewall khi cần.

## Biến môi trường riêng của server

- `CMS_ADMIN_USERNAME`
- `CMS_PASSWORD_HASH`
- `CMS_SESSION_SECRET`
- `CMS_GITHUB_TOKEN`

Các giá trị thật đã được thiết lập dưới dạng biến bí mật trên hosting. Chỉ `CMS_ADMIN_USERNAME` là tên tài khoản; trình duyệt không nhận ba biến bí mật còn lại. Không dùng tiền tố `NEXT_PUBLIC_` cho bí mật. Không thêm file môi trường vào Git. `.vercelignore` loại file môi trường, công cụ nội bộ và artifact khỏi source upload.

`NEXT_PUBLIC_ADMIN_URL` chỉ dùng cho build GitHub Pages; không đặt nó cho build Vercel. `CMS_ORIGIN` có thể khóa một origin chính thức; khi bỏ trống, máy chủ so sánh với origin của deployment hiện tại.

## Thay mật khẩu hoặc khóa GitHub

Dùng `scripts/configure-admin.mjs` với một dòng JSON qua stdin có `username`, `password` và tùy chọn `githubToken`. Không truyền mật khẩu trong tham số lệnh. Nếu không đưa token vào stdin, script lấy phiên GitHub CLI trên máy quản lý. Script tạo `.env.admin.local` được Git bỏ qua, chứa hash thay cho mật khẩu gốc và khóa phiên ngẫu nhiên.

Cập nhật các biến server trong Vercel Project → Settings → Environment Variables, rồi redeploy. Không đặt mật khẩu/khóa trong mã nguồn hoặc bình luận commit. Thay cả hash và khóa phiên sẽ vô hiệu các phiên trước đó.

## Chạy và kiểm tra cục bộ

```sh
npm run build
npm run admin:local
```

Mở `http://127.0.0.1:3004/admin/`. Cần cấu hình `.env.admin.local` trước. Phần public vẫn có thể chạy riêng bằng `npm run dev`; login và CMS cần server API.

`npm test` kiểm tra mật khẩu, phiên hết hạn/sửa chữ ký, cookie, quyền truy cập API, CSRF, khóa GitHub không lộ trong response và giữ nguyên quy trình xuất bản nguyên tử.

`scripts/admin-browser-check.cjs` nhận thông tin đăng nhập qua stdin tắt echo. Chạy với `ADMIN_TEST_ORIGIN` để kiểm tra local hoặc hosting thật. Script chỉ đăng nhập, đọc và đăng xuất; không xuất bản bài thử. Kiểm tra ảnh và trạng thái được lưu trong `artifacts/` đã bỏ qua khỏi Git.

## Thiết lập Vercel cho agent

Đã làm theo playbook `https://vercel.com/get-started.md`: CLI 65.11.0 được xác thực, plugin Vercel được cài ở scope người dùng của Codex, và endpoint MCP dùng chung `https://mcp.vercel.com` đã được thêm vào cấu hình. Plugin cần được phiên agent mới nạp; không yêu cầu restart website. MCP còn cần hoàn tất OAuth riêng nếu `codex mcp list` báo chưa đăng nhập. Triển khai hiện tại dùng CLI đã xác thực, không phụ thuộc MCP.

Tạo CI token qua OAuth app của CLI bị Vercel từ chối. Đã dùng Git integration sau khi chủ dự án liên kết GitHub thành công; không lưu access token CLI ngắn hạn vào GitHub Secrets để thay CI token.
