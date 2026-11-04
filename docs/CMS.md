# Quản trị website Đồng Tâm

Website: https://codeezforme.github.io/trai-ran-dong-tam/

CMS: https://codeezforme.github.io/trai-ran-dong-tam/admin/

## Kết nối lần đầu

Mở CMS để xem nội dung hiện có. Chọn **Kết nối để quản lý** khi muốn sửa.

1. Đăng nhập tài khoản GitHub có quyền ghi vào `CodeEzforme/trai-ran-dong-tam`.
2. Mở liên kết tạo **fine-grained personal access token** trong hộp kết nối.
3. Resource owner: `CodeEzforme`. Repository access: **Only select repositories**, chọn `trai-ran-dong-tam`.
4. Repository permissions: **Contents → Read and write**. Chọn ngày hết hạn phù hợp.
5. Tạo khóa và dán vào CMS. Không gửi khóa qua tin nhắn hoặc đưa lên mã nguồn.

CMS giữ khóa trong bộ nhớ tab và chỉ gửi trực tiếp đến API `https://api.github.com`. Không dùng localStorage, sessionStorage hoặc cookie để lưu khóa. Tải lại/đóng tab sẽ phải kết nối lại. Người chưa kết nối chỉ xem nội dung đã xuất bản, không ghi được lên GitHub.

Đây là CMS lưu nội dung trong GitHub, không có tài khoản/mật khẩu riêng hoặc máy chủ cơ sở dữ liệu. Có thể mời người khác làm collaborator trong GitHub để họ quản lý bằng khóa riêng. Quyền truy cập được kiểm tra bởi GitHub; việc ẩn nút trên giao diện không phải lớp bảo vệ duy nhất.

## Bài viết, sản phẩm và trang

Chọn mục bên trái, tìm nội dung rồi mở để chỉnh. Có tiêu đề, giới thiệu ngắn, soạn thảo trực quan/HTML, ảnh đại diện, ngày hiển thị và danh mục. Nội dung mới mặc định là **Bản nháp**; chuyển sang **Xuất bản** để hiển thị công khai.

Đường dẫn của nội dung cũ được khóa để giữ liên kết. Nội dung mới có thể đổi đường dẫn trước khi lưu. Bản nháp không có trang công khai hoặc kết quả tìm kiếm; **repo hiện công khai nên nội dung nháp vẫn có thể đọc trong mã nguồn GitHub**. Không sử dụng CMS này để lưu dữ liệu nội bộ hoặc thông tin bệnh nhân.

**Xem trước nội dung** mở bản xem thử tiêu đề, ảnh và phần soạn thảo. Bố cục các trang nhập từ website cũ, gallery và mô hình 3D vẫn được giữ khi sửa phần nội dung. Các khối bố cục chuyên biệt vẫn nằm trong source; đây không phải trình kéo thả toàn bộ giao diện.

Nội dung cũ được giữ lại; dùng trạng thái nháp khi muốn gỡ hiển thị. Nút xóa áp dụng cho nội dung mới được tạo bằng CMS. Danh mục có trang riêng và có thể gán cho bài viết/sản phẩm trong trình soạn thảo.

## Ảnh bìa và thư viện ảnh

Trong **Trang chủ & liên hệ**, sửa lời giới thiệu, chú thích ảnh, đổi/thêm/xóa và đưa ảnh lên trước. Bìa tự chuyển mỗi **5 giây**, kể cả khi rê chuột/đặt focus. Khách có nút tạm dừng và chọn ảnh. Chế độ giảm chuyển động tắt hiệu ứng nhưng giữ lịch đổi ảnh.

Thư viện có ảnh đang dùng trong website. Tải JPG, PNG, WebP hoặc AVIF, tối đa 20 MB/ảnh. Trình duyệt đổi sang WebP và giới hạn cạnh dài 2400px. Ảnh mới được xếp vào hàng đợi; bấm **Lưu thay đổi** để tải ảnh cùng nội dung trong một lần. Không tự xóa ảnh cũ vì các trang khác có thể còn dùng ảnh đó.

## Lưu và xuất bản

Các thay đổi trước khi bấm lưu chỉ nằm trong bộ nhớ tab. Có nhắc khi rời tab với thay đổi chưa lưu.

Khi lưu, CMS kiểm tra dữ liệu, đối chiếu phiên bản đã tải, rồi ghi một commit chứa nội dung và ảnh mới. Nếu ai khác đã sửa nội dung, CMS dừng và giữ bản đang soạn để người quản lý sao chép/đối chiếu; không ghi đè thay đổi của người khác. **Tải dữ liệu mới** sẽ bỏ bản chỉnh sửa chưa lưu sau khi xác nhận.

Thông báo **Đã lưu vào GitHub** chỉ xác nhận đã ghi nội dung. GitHub Actions tiếp tục build, kiểm tra và triển khai. CMS theo dõi lần triển khai tương ứng và chỉ thông báo **Website đã cập nhật thành công** khi workflow thành công. Có liên kết lịch sử triển khai. Thường cần vài phút. Đóng tab không hủy lần triển khai đã bắt đầu.

## Khôi phục

Mỗi lần lưu là một commit. Có thể xem lịch sử file `content/content.json` hoặc revert commit trong repo để khôi phục. Sau revert, workflow tự triển khai lại. Nếu chỉ lỗi mạng khi lưu, kiểm tra lịch sử commit trước khi thử lại; CMS vẫn giữ bản chưa lưu trong màn hình.

Nếu workflow lỗi, mở tab Actions. Người quản lý repo có thể chạy lại workflow lỗi; nội dung đã lưu vẫn nằm trong GitHub. Không phải tạo lại bài.
