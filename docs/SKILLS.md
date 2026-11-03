# Các bộ skill đã tổng hợp

Các skill được tải bằng trình cài `skill-installer` vào `.agents/skills/`, dùng trong phạm vi dự án này. Không chạy script cài đặt từ các repository nguồn. Codex nhận diện tự động từ lượt làm việc tiếp theo; các tệp đã được đọc trực tiếp và áp dụng trong lần dựng ban đầu.

| Nguồn GitHub | Skill cài đặt | Áp dụng trong dự án |
| --- | --- | --- |
| [Anthropic / skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | `frontend-design` | Định hướng riêng cho Đồng Tâm, typography tiếng Việt, ảnh thật, nhịp bố cục và bản thiết kế `DESIGN.md` |
| [Vercel / agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | `web-design-guidelines` | Kiểm tra bàn phím, focus, form labels, reduced motion, ảnh dự phòng, trạng thái UI và URL bộ lọc |
| [CloudAI-X / threejs-skills](https://github.com/CloudAI-X/threejs-skills) | `threejs-fundamentals` | Scene, camera, renderer, resize, import map cục bộ |
| [CloudAI-X / threejs-skills](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-geometry) | `threejs-geometry` | Chuẩn hóa kích thước mô hình bằng bounding box, đặt tâm và mặt đất tiếp xúc |
| [CloudAI-X / threejs-skills](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-materials) | `threejs-materials` | Texture vảy và normal map của GLB, SRGBColorSpace, độ nhám PBR và ánh sáng môi trường |
| [CloudAI-X / threejs-skills](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-performance) | `threejs-performance` | Lazy import, giới hạn pixel ratio, chỉ render khi có tương tác, dừng ngoài màn hình, dispose tài nguyên |
| [CloudAI-X / threejs-skills](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-interaction) | `threejs-interaction` | OrbitControls, nút xoay/zoom/reset có tên truy cập cho bàn phím |

Hướng dẫn Vercel tham chiếu: [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md). Bản đã đọc nằm trong `data/source/guidelines.html`.

Các revision `main` truy vấn trong phiên cài đặt được ghi tại `skill-revisions.json`; đây là thông tin nguồn, không phải khai báo rằng repository đã được khóa dependency bằng Git. Mỗi skill giữ nguyên tệp `SKILL.md` từ nguồn; mã SHA-256 nằm trong `skill-file-hashes.json`. Giấy phép Anthropic được giữ trong thư mục skill; giấy phép CloudAI-X được giữ tại `CloudAI-X-LICENSE.txt`. Repository Vercel không trả về giấy phép qua endpoint license tại thời điểm truy vấn; bản sao giữ nguyên thông tin tác giả và liên kết nguồn.

Three.js runtime dùng phiên bản **0.186.1**, đồng bộ với phiên bản được bộ skill Three.js mô tả; giấy phép MIT được giữ tại `public/assets/vendor/LICENSE`. Runtime không dùng CDN và không cần gọi GitHub khi khách mở website.
