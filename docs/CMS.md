# Quản trị website Đồng Tâm

Website: https://codeezforme.github.io/trai-ran-dong-tam/

CMS: https://trai-ran-dong-tam.vercel.app/admin/

## Đăng nhập quản trị

Mở CMS, nhập tài khoản **Admin** và mật khẩu chủ dự án đã thiết lập, rồi chọn **Đăng nhập**. Chưa đăng nhập sẽ không thấy dashboard quản trị. Liên kết `/admin/` trên website GitHub Pages tự chuyển sang màn hình đăng nhập này.

Phiên được giữ khi tải lại trang trong thời hạn 8 giờ. Chọn **Đăng xuất** ở cuối thanh bên để kết thúc phiên. Nếu có nội dung chưa lưu, màn hình sẽ nhắc trước khi đăng xuất.

Mật khẩu được kiểm tra ở máy chủ; cookie phiên dùng HttpOnly và Secure. Trình duyệt không giữ khóa GitHub trong localStorage, sessionStorage hay cookie. Người quản lý không cần nhập khóa GitHub để sử dụng CMS.

Nội dung vẫn lưu trong GitHub; phần máy chủ xác thực và kết nối kho nội dung chạy trên Vercel. Xem [cấu hình hosting và đổi mật khẩu](ADMIN-HOSTING.md) khi cần. Hệ thống hiện có một tài khoản quản trị, chưa có chức năng tạo nhiều tài khoản hay phân vai.

## Bài viết, sản phẩm và trang

Chọn mục bên trái, tìm nội dung rồi mở để chỉnh. Có tiêu đề, giới thiệu ngắn, soạn thảo trực quan/HTML, ảnh đại diện, ngày hiển thị và danh mục. Nội dung mới mặc định là **Bản nháp**; chuyển sang **Xuất bản** để hiển thị công khai.

Thanh bên có **Giới thiệu, Nghiên cứu khoa học, Du lịch sinh thái, Sản phẩm, Vườn thuốc nam, Tin tức, Tuyển dụng**. Mỗi nhóm có nút **Thêm bài viết** hoặc **Thêm sản phẩm**. Trong trình soạn thảo, chọn **Chuyên mục chính** và đánh dấu **Danh mục hiển thị** để đưa bài vào đúng nhánh. Nhánh chưa có bài sẽ có thông báo đang cập nhật; không tự sinh thông tin tuyển dụng, nghiên cứu hay tiêu chuẩn sản xuất.

Đổi **Tiêu đề** của trang/danh mục đang có trong menu rồi lưu sẽ cập nhật tên ở menu, điều hướng Giới thiệu, tiêu đề trang và sơ đồ website sau khi triển khai. Các vị trí này lấy tên từ dữ liệu CMS; URL và thứ tự menu được giữ ổn định. Mục **Tổng quan** là tên ngắn của trang Giới thiệu. Không cần tạo lại bài khi đổi tên danh mục.

Muốn đưa sản phẩm ra trang chủ, mở sản phẩm, đánh dấu **Sản phẩm nổi bật trên trang chủ**, chọn **Xuất bản** rồi lưu. Trang chủ hiển thị tối đa 4 sản phẩm được đánh dấu, theo thứ tự nội dung hiện có.

Đường dẫn của nội dung cũ được khóa để giữ liên kết. Nội dung mới có thể đổi đường dẫn trước khi lưu. Bản nháp không có trang công khai hoặc kết quả tìm kiếm; **repo hiện công khai nên nội dung nháp vẫn có thể đọc trong mã nguồn GitHub**. Không sử dụng CMS này để lưu dữ liệu nội bộ hoặc thông tin bệnh nhân.

**Xem trước nội dung** mở bản xem thử tiêu đề, ảnh và phần soạn thảo. Bố cục các trang nhập từ website cũ và gallery vẫn được giữ khi sửa phần nội dung. Khu 3D đã gỡ theo yêu cầu. Các khối bố cục chuyên biệt vẫn nằm trong source; đây không phải trình kéo thả toàn bộ giao diện.

Nội dung cũ được giữ lại; dùng trạng thái nháp khi muốn gỡ hiển thị. Nút xóa áp dụng cho nội dung mới được tạo bằng CMS. Danh mục có trang riêng và có thể gán cho bài viết/sản phẩm trong trình soạn thảo.

Trong **Danh mục**, chọn **Chuyên mục chính** để danh mục đã xuất bản xuất hiện trong menu tương ứng. **Danh mục cha** cho đặt danh mục bên trong một danh mục khác cùng chuyên mục. **Trang mở khi bấm danh mục** cho liên kết tới trang có sẵn thay vì tạo lại nội dung. Ví dụ, **Điều trị rắn cắn** nằm trong **Nghiên cứu khoa học** và mở trang điều trị hiện có. Bản nháp không xuất hiện trong menu; hệ thống chặn chọn danh mục cha tạo vòng lặp.

Để chèn ảnh vào bài, đặt con trỏ trong nội dung, chọn **Chèn ảnh**, rồi chọn ảnh trong thư viện hoặc tải ảnh mới. Ảnh được chèn tại con trỏ; ảnh mới có bản xem trước ngay và được tải lên khi lưu. Nút này cũng dùng được trong chế độ HTML.

Trong **Giới thiệu → Sơ đồ tổ chức**, danh sách nhân sự được chia theo tên bộ phận, ảnh, tên và chức vụ trong phần Nội dung. Đây là nguồn chung cho các trang Ban giám đốc, Ban hành chính, Đội nuôi trồng dược liệu và Bộ phận du lịch. Sửa hồ sơ tại đây để các trang cùng cập nhật; mỗi hồ sơ trùng cả ảnh, tên và chức vụ trong một bộ phận chỉ hiển thị một lần. Các trang bộ phận vẫn có phần nội dung riêng để bổ sung giới thiệu. Chưa có nhân sự của Đội nuôi thủy đặc sản/Xưởng chế biến thì website không tự thêm.

## Ảnh bìa và thư viện ảnh

Trong **Trang chủ & liên hệ → Ảnh bìa trang chủ**, đổi/thêm/xóa và đưa ảnh lên trước. Banner hiển thị nguyên khung, không có lớp chữ hoặc nút đè lên ảnh. Tiêu đề website và giới thiệu dùng cho tìm kiếm. Bìa tự chuyển mỗi **5 giây**, kể cả khi rê chuột/đặt focus. Khách có nút tạm dừng và các chấm chọn ảnh; ảnh đang chọn có chấm xanh dài. Chế độ giảm chuyển động tắt hiệu ứng nhưng giữ lịch đổi ảnh.

Mục **Ảnh bìa danh mục** cho đổi ảnh chung ở đầu các chuyên mục chính. Mặc định dùng ảnh cổng Trại rắn do chủ dự án cung cấp. Ảnh này độc lập với ảnh đại diện của từng bài viết.

Phần **Mạng xã hội** cho sửa Facebook, TikTok và Zalo. Các liên kết hiện ở chân trang và phần liên hệ. Tin tức được đưa lên ngay sau ảnh bìa.

Phần liên hệ hiển thị địa chỉ email và nút **Soạn thư trên Gmail** để người xem tự viết và gửi thư. Sửa trường **Email** trong **Trang chủ & liên hệ** sẽ cập nhật địa chỉ hiển thị và các nút email. Không cần cấu hình gửi mail hoặc cung cấp mật khẩu Gmail. Xem [liên hệ email](CONTACT-EMAIL.md).

Thư viện có ảnh đang dùng trong website. Tải JPG, PNG, WebP hoặc AVIF, tối đa 20 MB/ảnh. Trình duyệt đổi sang WebP và giới hạn cạnh dài 2400px. Ảnh mới được xếp vào hàng đợi; bấm **Lưu thay đổi** để tải ảnh cùng nội dung trong một lần. Không tự xóa ảnh cũ vì các trang khác có thể còn dùng ảnh đó.

## Lưu và xuất bản

Các thay đổi trước khi bấm lưu chỉ nằm trong bộ nhớ tab. Có nhắc khi rời tab với thay đổi chưa lưu.

Khi lưu, CMS kiểm tra dữ liệu, đối chiếu phiên bản đã tải, rồi ghi một commit chứa nội dung và ảnh mới. Nếu ai khác đã sửa nội dung, CMS dừng và giữ bản đang soạn để người quản lý sao chép/đối chiếu; không ghi đè thay đổi của người khác. **Tải dữ liệu mới** sẽ bỏ bản chỉnh sửa chưa lưu sau khi xác nhận.

Thông báo **Đã lưu vào GitHub** chỉ xác nhận đã ghi nội dung. GitHub Actions tiếp tục build, kiểm tra và triển khai. CMS theo dõi lần triển khai tương ứng và chỉ thông báo **Website đã cập nhật thành công** khi workflow thành công. Có liên kết lịch sử triển khai. Thường cần vài phút. Đóng tab không hủy lần triển khai đã bắt đầu.

## Khôi phục

Mỗi lần lưu là một commit. Có thể xem lịch sử file `content/content.json` hoặc revert commit trong repo để khôi phục. Sau revert, workflow tự triển khai lại. Nếu chỉ lỗi mạng khi lưu, kiểm tra lịch sử commit trước khi thử lại; CMS vẫn giữ bản chưa lưu trong màn hình.

Nếu workflow lỗi, mở tab Actions. Người quản lý repo có thể chạy lại workflow lỗi; nội dung đã lưu vẫn nằm trong GitHub. Không phải tạo lại bài.
