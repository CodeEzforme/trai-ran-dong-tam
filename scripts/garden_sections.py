# -*- coding: utf-8 -*-
"""The medicinal garden page, using the six photographs supplied by the owner."""

PHOTOS = [
    ('vuon-thuoc-nam-05-cong-vuon.webp', 'Cổng Vườn thuốc nam', 'Lối vào Vườn thuốc nam trong không gian xanh của Đồng Tâm.', 1920, 1280),
    ('vuon-thuoc-nam-03-khong-gian-vuon.webp', 'Không gian vườn thuốc', 'Các khu cây thuốc được bố trí dọc theo lối đi trong vườn.', 1920, 1280),
    ('vuon-thuoc-nam-04-cay-lau-nam.webp', 'Khu cây lâu năm', 'Khu vườn cây lâu năm với các bảng tên cây.', 1920, 1280),
    ('vuon-thuoc-nam-06-nhom-cay-thuoc.webp', 'Các nhóm cây thuốc', 'Một góc vườn với bảng giới thiệu và tên các cây thuốc.', 1920, 1280),
    ('vuon-thuoc-nam-02-doan-tham-quan.webp', 'Đoàn tham quan vườn thuốc', 'Đoàn chụp ảnh lưu niệm tại cổng Vườn thuốc nam.', 1440, 884),
    ('vuon-thuoc-nam-01-ky-tiep-nhan.webp', 'Hoạt động tiếp nhận vườn thuốc mẫu', 'Hình ảnh ký tiếp nhận tại hội nghị chuyển giao, tiếp nhận vườn thuốc mẫu.', 1920, 1281),
]


def garden_page(c):
    esc, icon, button = c['ESC'], c['icon'], c['btn']

    def photo(item, eager=False):
        name, title, caption, width, height = item
        url = '/assets/images/' + name
        loading = 'fetchpriority="high"' if eager else 'loading="lazy"'
        return ('<figure class="garden-figure"><a class="garden-photo" href="' + url + '" data-garden-photo data-caption="' + esc(title) + '" aria-label="Xem ảnh lớn: ' + esc(title) + '">'
                '<img src="' + url + '" alt="' + esc(caption) + '" width="' + str(width) + '" height="' + str(height) + '" ' + loading + ' decoding="async">'
                '<span class="garden-zoom" aria-hidden="true">' + icon('search') + '</span></a><figcaption><strong>' + esc(title) + '</strong><span>' + esc(caption) + '</span></figcaption></figure>')

    hero = ('<section class="container garden-intro">' + c['breadcrumb']('Vườn thuốc nam') + '<div class="garden-hero">'
            '<div class="garden-copy"><span class="pill">' + icon('leaf') + ' Khám phá Đồng Tâm</span>'
            '<h1>Vườn thuốc nam</h1><p>Một góc xanh dành cho những cây thuốc quen thuộc. Dạo qua khu vườn, quan sát các nhóm cây và tìm hiểu thêm về không gian dược liệu tại Đồng Tâm.</p>'
            '<div class="garden-actions">' + button('Xem hình ảnh', '#hinh-anh') + '<a class="text-link" href="/contact/#len-lich">Liên hệ tham quan ' + icon('diagonal') + '</a></div></div>'
            + photo(PHOTOS[0], True) + '</div></section>')
    gallery = ('<section class="container garden-gallery-section" id="hinh-anh"><div class="garden-gallery-heading"><div><h2>Ghé thăm vườn thuốc</h2>'
               '<p>Không gian khu vườn cùng những hình ảnh hoạt động tại Đồng Tâm.</p></div><span>' + icon('search') + ' Chạm vào ảnh để xem lớn</span></div>'
               '<div class="garden-gallery">' + ''.join(photo(item) for item in PHOTOS[1:]) + '</div></section>')
    viewer = ('<dialog class="garden-lightbox" id="garden-lightbox" aria-label="Xem ảnh Vườn thuốc nam">'
              '<div class="garden-lightbox-top"><span id="garden-photo-count" aria-live="polite"></span><button type="button" data-garden-close aria-label="Đóng ảnh">' + icon('close') + '</button></div>'
              '<div class="garden-lightbox-stage"><button type="button" data-garden-previous aria-label="Ảnh trước">' + icon('chevron') + '</button><img alt="">'
              '<button type="button" data-garden-next aria-label="Ảnh tiếp theo">' + icon('chevron') + '</button></div><p id="garden-photo-caption" aria-live="polite"></p></dialog>')
    return hero + gallery + viewer
