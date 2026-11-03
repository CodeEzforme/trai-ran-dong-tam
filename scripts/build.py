# -*- coding: utf-8 -*-
"""Generate a portable, pre-rendered site from the preserved public inventory."""
import html
import json
import re
import shutil
import unicodedata
from pathlib import Path
from urllib.parse import urlparse, unquote
from bs4 import BeautifulSoup
from home_sections import homepage, exhibit

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
SOURCE = ROOT / 'data/source'
ASSETS = json.loads((ROOT / 'data/assets.json').read_text(encoding='utf-8')) if (ROOT / 'data/assets.json').exists() else {}
PAGES = json.loads((SOURCE / 'pages.json').read_text(encoding='utf-8'))
POSTS = json.loads((SOURCE / 'posts.json').read_text(encoding='utf-8'))
PRODUCTS = json.loads((SOURCE / 'products.json').read_text(encoding='utf-8'))
CATEGORIES = json.loads((SOURCE / 'categories.json').read_text(encoding='utf-8'))
PRODUCT_CATS = json.loads((SOURCE / 'product-cats.json').read_text(encoding='utf-8'))
HOME = BeautifulSoup((SOURCE / 'home.html').read_text(encoding='utf-8'), 'html.parser')
RECORDS = []
ESC = html.escape

ICONS = {
 'arrow':'<path d="M4 12h15m-6-6 6 6-6 6"/>',
 'diagonal':'<path d="M6 18 18 6M6 6h12v12"/>',
 'pin':'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'phone':'<path d="m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3c-1 5-4 5-7 4C8 19 5 16 3 10 2 6 3 3 7 3Z"/>',
 'search':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 'leaf':'<path d="M20 3C5 2 1 10 7 17c7 6 15 1 13-14ZM5 20 16 9"/>',
 'menu':'<path d="M4 6h16M4 12h16M4 18h16"/>',
 'close':'<path d="m5 5 14 14M19 5 5 19"/>',
 'chevron':'<path d="m7 10 5 5 5-5"/>',
 'mail':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
 'cube':'<path d="m12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5M12 12v10"/>',
 'check':'<path d="m5 12 4 4L20 5"/>',
 'calendar':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'minus':'<path d="M5 12h14"/>',
 'rotate':'<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>',
 'book':'<path d="M12 5C8 2 5 3 2 4v16c4-2 7-2 10 0 3-2 6-2 10 0V4c-3-1-6-2-10 1ZM12 5v15"/>',
}

def icon(name, cls=''):
    return '<svg class="icon '+cls+'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS.get(name,ICONS['leaf'])+'</svg>'

def plain(raw):
    return BeautifulSoup(raw or '', 'html.parser').get_text(' ', strip=True)

def title(raw):
    text = html.unescape(plain(raw)).strip()
    for separator in [' – ', ' –', ' &#8211; ']:
        if separator in text:
            prefix,suffix=text.split(separator,1)
            if prefix.isupper():
                return prefix[:1].upper()+prefix[1:].lower()+' – '+suffix.strip()
    return text[:1].upper()+text[1:].lower() if text.isupper() or sum(c.isupper() for c in text)>len(text)*.55 else text

def local(url):
    if not url:return ''
    p=urlparse(url)
    return p.path + ('?'+p.query if p.query else '') + ('#'+p.fragment if p.fragment else '') if p.hostname in ['trairandongtam.vn','www.trairandongtam.vn'] else url

def image_url(url):
    return ASSETS.get(url, '/assets/fallback.svg')

def image(url, alt, cls='', eager=False):
    return '<img src="'+ESC(image_url(url))+'" alt="'+ESC(alt)+'" class="'+cls+'" width="1200" height="800" '+('fetchpriority="high"' if eager else 'loading="lazy"')+' decoding="async">'

def product_img(p):
    return p['images'][0]['src'] if p.get('images') else ''

def product_find(text):
    return next((p for p in PRODUCTS if text in p['slug']), PRODUCTS[0])

def page_find(slug):
    return next((p for p in PAGES if p['slug']==slug),None)

def page_img(p):
    if not p:return ''
    soup=BeautifulSoup(p['content']['rendered'],'html.parser')
    im=next((i for i in soup.select('img[src]') if '/uploads/' in i['src'] and not small_icon(i)),None)
    return im['src'] if im else ''

def small_icon(node):
    width,height=str(node.get('width','')),str(node.get('height',''))
    return width.isdigit() and height.isdigit() and int(width)<=64 and int(height)<=64

HOME_IMGS=list(dict.fromkeys(i['src'] for i in HOME.select('img[src]') if '/uploads/' in i['src']))
LOGO=HOME_IMGS[0]
HERO=product_img(product_find('tran-gam'))
SNAKE=product_img(product_find('ran-ho-chua'))

def btn(label,href,kind='primary',symbol='arrow'):
    return '<a class="button '+kind+'" href="'+ESC(href)+'">'+label+icon(symbol)+'</a>'

def clean(raw):
    soup=BeautifulSoup(raw or '', 'html.parser')
    for e in soup.select('script,style,form,iframe,button,input,select,textarea,noscript,.xs_social_share_widget,.wpforms-container,.elementor-button-wrapper,.elementor-widget-shortcode,.wp-block-shortcode'):
        e.decompose()
    allowed={'p','h2','h3','h4','h5','h6','ul','ol','li','table','thead','tbody','tr','th','td','figure','figcaption','img','a','strong','b','em','i','blockquote','br','sup','sub','hr'}
    for e in list(soup.find_all(True)):
        if e.name is None:continue
        if e.name=='h1':e.name='h2'
        if e.name not in allowed:
            e.unwrap();continue
        attrs={}
        if e.name=='a':
            href=local(e.get('href',''))
            if href.startswith(('/','https://','http://','mailto:','tel:','#')):
                attrs['href']=href
                if href.startswith('http'):attrs['rel']='noopener noreferrer'
        if e.name=='img':
            if small_icon(e):
                e.replace_with(e.get('alt',''))
                continue
            src=e.get('data-src') or e.get('src','')
            if not src or 'submit-spin' in src:
                e.decompose();continue
            attrs={'src':image_url(src),'alt':e.get('alt','Ảnh từ Trại rắn Đồng Tâm'),'loading':'lazy','width':'1200','height':'800','decoding':'async'}
        if e.name in ['td','th']:
            for key in ['colspan','rowspan']:
                if str(e.get(key,'')).isdigit():attrs[key]=e[key]
        e.attrs=attrs
    for e in reversed(soup.find_all(['p','ul','ol','h2','h3','h4','a','strong','em'])):
        if not e.get_text(strip=True) and not e.find('img'):e.decompose()
    return str(soup).strip()

CONTENT_NAV=[('Khám phá','/du-lich-sinh-thai/',[
 ('Du lịch sinh thái','/du-lich-sinh-thai/'),('Thế giới loài rắn','/danh-muc-san-pham/ran/'),('Các loài chim','/danh-muc-san-pham/chim/'),('Các loài thú','/danh-muc-san-pham/thu/'),('Động vật khác','/danh-muc-san-pham/khac/'),('Nhà bảo tàng rắn','/nha-bao-tang-ran/'),('Nhà hàng Đồng Tâm','/nha-hang-dong-tam/'),('Coffee & Tea Đồng Tâm','/coffee-and-tea-dong-tam/'),('Bảng giá dịch vụ','/bang-gia-dich-vu/')]),
 ('Về Đồng Tâm','/gioi-thieu/',[('Giới thiệu','/gioi-thieu/'),('Tổ chức','/to-chuc/'),('Ban giám đốc','/ban-giam-doc/'),('Ban hành chính','/ban-hanh-chinh/'),('Bộ phận du lịch','/bo-phan-du-lich/'),('Đội nuôi trồng dược liệu','/doi-nuoi-trong-duoc-lieu/'),('Xưởng chế biến','/xuong-che-bien/')]),
 ('Nghiên cứu','/nghien-cuu-khoa-hoc/',[('Nghiên cứu khoa học','/nghien-cuu-khoa-hoc/'),('Sản phẩm nghiên cứu cấp Bộ','/san-pham-nghien-cuu-cap-bo/'),('Điều trị rắn cắn','/dieu-tri-ran-can/')]),
 ('Sản phẩm','/san-pham/',[('Tất cả sản phẩm','/san-pham/'),('Sản phẩm OCOP','/san-pham-ocop/'),('Thuốc','/danh-muc-san-pham/thuoc/'),('Mỹ phẩm','/danh-muc-san-pham/my-pham/'),('Thực phẩm chức năng','/danh-muc-san-pham/thuc-pham-chuc-nang/'),('Rượu','/danh-muc-san-pham/ruou/')]),
 ('Tin tức','/tin-tuc/',[('Tin tức & hoạt động','/tin-tuc/'),('Sự kiện','/su-kien/'),('Thông báo','/thong-bao/'),('Tuyển dụng','/tuyen-dung/')])]

MAIN_NAV=[(label,local(href),[(name,local(url)) for name,url in items]) for label,href,items in json.loads((ROOT / "data/original-navigation.json").read_text(encoding="utf-8"))]

def header(path):
    links=''
    for index,(label,href,items) in enumerate(MAIN_NAV):
        active=path==href or any(path==v for _,v in items)
        current=' aria-current="page"' if path==href else ''
        links+='<div class="nav-group"><a class="nav-link '+('active' if active else '')+'" href="'+href+'"'+current+'>'+label+'</a>'
        if items:
            links+='<button class="nav-toggle" aria-label="Mở danh mục '+label+'" aria-controls="nav-sub-'+str(index)+'" aria-expanded="false">'+icon('chevron')+'</button><div class="nav-dropdown" id="nav-sub-'+str(index)+'">'+''.join('<a href="'+h+'"'+(' aria-current="page"' if path==h else '')+'>'+l+'</a>' for l,h in items)+'</div>'
        links+='</div>'
    return '<a class="skip-link" href="#main">Chuyển đến nội dung</a><div class="utility"><div class="container"><span>'+icon('leaf')+' Nơi thiên nhiên gặp gỡ tri thức</span><a href="/contact/">'+icon('pin')+' Kim Sơn, Đồng Tháp</a><a href="tel:+84898408408">'+icon('phone')+' 0898 408 408</a></div></div><header class="site-header"><div class="header-inner container"><a class="brand" href="/" aria-label="Trại rắn Đồng Tâm — Trang chủ">'+image(LOGO,'Biểu trưng Trại rắn Đồng Tâm','brand-mark',True)+'<span>Đồng Tâm<small>Trại rắn & du lịch sinh thái</small></span></a><nav id="main-nav" class="main-nav" aria-label="Điều hướng chính">'+links+'</nav><div class="header-actions"><button class="icon-button search-open" aria-label="Tìm kiếm website">'+icon('search')+'</button><a class="button primary compact" href="/contact/#len-lich">Tham quan'+icon('diagonal')+'</a><button id="menu-toggle" class="icon-button menu-toggle" aria-label="Mở menu" aria-controls="main-nav" aria-expanded="false">'+icon('menu')+'</button></div></div></header>'

def footer():
    return '<footer class="site-footer"><div class="container footer-grid"><div class="footer-about"><a class="brand" href="/">'+image(LOGO,'Biểu trưng Đồng Tâm','brand-mark')+'<span>Đồng Tâm<small>Trại rắn & du lịch sinh thái</small></span></a><p>Một hành trình gần hơn với thiên nhiên.<br>Một góc nhìn mới về sự sống.</p><a class="footer-phone" href="tel:+84898408408">0898 408 408</a></div><div><h2>Khám phá Đồng Tâm</h2><a href="/gioi-thieu/">Câu chuyện của chúng tôi</a><a href="/du-lich-sinh-thai/">Du lịch sinh thái</a><a href="/nha-bao-tang-ran/">Nhà bảo tàng rắn</a><a href="/nghien-cuu-khoa-hoc/">Nghiên cứu khoa học</a><a href="/dieu-tri-ran-can/">Điều trị rắn cắn</a></div><div><h2>Thông tin hữu ích</h2><a href="/bang-gia-dich-vu/">Bảng giá dịch vụ</a><a href="/san-pham/">Sản phẩm Đồng Tâm</a><a href="/tin-tuc/">Tin tức & hoạt động</a><a href="/tuyen-dung/">Tuyển dụng</a><a href="/so-do-website/">Sơ đồ website</a></div><div><h2>Hẹn gặp bạn tại Đồng Tâm</h2><p>Ấp Tân Thuận B, xã Kim Sơn,<br>tỉnh Đồng Tháp</p><p>7:00 – 17:00, tất cả các ngày</p><a href="mailto:trairandongtam408@gmail.com">trairandongtam408@gmail.com</a><a class="map-link" href="https://www.google.com/maps/search/?api=1&query=Trai+ran+Dong+Tam+Kim+Son" target="_blank" rel="noopener noreferrer">Xem đường đi '+icon('diagonal')+'</a></div></div><div class="container footer-bottom"><span>© 2026 Trại rắn Đồng Tâm</span><span>Thiên nhiên · Bảo tồn · Khoa học</span><a href="#top">Về đầu trang ↑</a></div></footer>'

def search_dialog():
    return '<dialog id="search-dialog" class="search-dialog"><div class="dialog-top"><h2>Tìm kiếm Đồng Tâm</h2><button class="icon-button dialog-close" aria-label="Đóng tìm kiếm">'+icon('close')+'</button></div><form action="/tim-kiem/" method="get" class="search-form"><label for="site-search" class="sr-only">Từ khóa tìm kiếm</label><input id="site-search" type="search" name="q" placeholder="Tìm loài vật, sản phẩm, bài viết…" autocomplete="off"><button class="button primary" type="submit">Tìm kiếm'+icon('search')+'</button></form><p class="muted">Gợi ý: rắn hổ chúa, bảo tàng rắn, du lịch sinh thái</p></dialog>'

def shell(name,body,path='/',desc='',extra=''):
    d=desc or plain(body)[:155]
    return '<!doctype html><html lang="vi" id="top"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#163e2d"><title>'+ESC(name)+' | Trại rắn Đồng Tâm</title><meta name="description" content="'+ESC(d[:170])+'"><link rel="canonical" href="https://trairandongtam.vn'+ESC(path)+'"><link rel="icon" href="'+image_url(LOGO)+'"><link rel="stylesheet" href="/assets/style.css?v=3"><link rel="stylesheet" href="/assets/refinements.css?v=3"><link rel="stylesheet" href="/assets/experience.css?v=4"><script type="importmap">{"imports":{"three":"/assets/vendor/three.module.js","three/addons/":"/assets/vendor/","three/addons/controls/OrbitControls.js":"/assets/vendor/OrbitControls.js"}}</script><script defer src="/assets/app.js?v=4"></script><script defer src="/assets/motion.js?v=3"></script>'+extra+'</head><body class="'+('page-home' if path=='/' else 'page-inner')+'">'+header(path)+'<main id="main">'+body+'</main>'+footer()+search_dialog()+'</body></html>'

def breadcrumb(name):
    return '<nav class="breadcrumb" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span aria-hidden="true">/</span><span>'+ESC(name)+'</span></nav>'

def intro(name,subtitle='',photo='',tag=''):
    return '<section class="page-intro '+('with-photo' if photo else '')+'"><div class="container">'+breadcrumb(name)+'<div class="intro-copy">'+('<p class="section-kicker">'+tag+'</p>' if tag else '')+'<h1>'+ESC(name)+'</h1>'+('<p class="intro-description">'+subtitle+'</p>' if subtitle else '')+'</div>'+ (image(photo,name,'intro-photo',True) if photo else '')+'</div></section>'

def cards(items,kind='product'):
    content=''
    for p in items:
        ispost=kind=='post'
        n=title(p['title']['rendered']) if ispost else title(p['name'])
        url=local(p['link'] if ispost else p['permalink'])
        photo=page_img(p) if ispost else product_img(p)
        cats=p.get('categories',[])
        label='Hoạt động Đồng Tâm' if ispost else (cats[0]['name'] if cats else 'Khám phá Đồng Tâm')
        date='<time datetime="'+p['date']+'" data-date="'+p['date']+'">'+p['date'][:10]+'</time>' if ispost else ''
        content+='<article class="content-card"><a class="card-image" href="'+url+'" tabindex="-1" aria-hidden="true">'+image(photo,n)+'<span class="circle-link">'+icon('diagonal')+'</span></a><div class="card-meta"><span>'+label+'</span>'+date+'</div><h3><a href="'+url+'">'+ESC(n)+'</a></h3></article>'
    return content

def scene_block():
    return exhibit(globals())

def faq():
    qs=[('Đồng Tâm mở cửa lúc mấy giờ?','Khu tham quan mở cửa từ 7:00 đến 17:00, tất cả các ngày trong tuần. Bạn có thể liên hệ trước khi đến để hỏi thông tin dịch vụ và lịch hoạt động.'),('Trại rắn Đồng Tâm ở đâu?','Ấp Tân Thuận B, xã Kim Sơn, tỉnh Đồng Tháp. Bấm “Xem đường đi” để mở vị trí trên Google Maps.'),('Có thể tham quan những khu vực nào?','Bạn có thể tìm hiểu các loài rắn, chim, thú, nhà bảo tàng rắn và các không gian sinh thái. Website cũng giới thiệu nhà hàng, Coffee & Tea Đồng Tâm cùng các dịch vụ tham quan.'),('Tôi muốn hỏi giá vé và đặt lịch cho đoàn?','Vui lòng gọi 0898 408 408 hoặc dùng biểu mẫu liên hệ. Nhân viên sẽ tư vấn giá, dịch vụ và lịch phù hợp với đoàn của bạn.')]
    return '<section class="section faq-section"><div class="container faq-layout"><div><p class="section-kicker">Trước chuyến đi</p><h2>Bạn hỏi,<br>Đồng Tâm trả lời.</h2><p class="muted">Một vài thông tin để chuyến ghé thăm của bạn dễ dàng hơn.</p></div><div>'+''.join('<details class="faq"><summary>'+q+icon('plus')+'</summary><p>'+a+'</p></details>' for q,a in qs)+'</div></div></section>'

def visit_strip():
    return '<section class="visit-strip"><div class="container"><div>'+icon('clock')+'<span><small>Thời gian mở cửa</small><strong>7:00 – 17:00 mỗi ngày</strong></span></div><div>'+icon('pin')+'<span><small>Hẹn gặp tại</small><strong>Kim Sơn, Đồng Tháp</strong></span></div><a href="/contact/#len-lich">'+icon('calendar')+'<span><small>Dành cho gia đình & đoàn</small><strong>Tư vấn chuyến tham quan</strong></span>'+icon('diagonal')+'</a></div></section>'

def cta():
    return '<section class="container visit-cta"><div>'+icon('leaf')+'<h2>Một ngày xanh.<br>Thêm nhiều điều mới.</h2><p>Rời nhịp sống thường ngày, cùng nhau khám phá thế giới tự nhiên tại Đồng Tâm.</p>'+btn('Lên lịch chuyến đi','/contact/#len-lich','light','diagonal')+'</div><div class="cta-detail"><p>'+icon('clock')+' 7:00 – 17:00 mỗi ngày</p><p>'+icon('pin')+' Ấp Tân Thuận B, Kim Sơn, Đồng Tháp</p><a href="tel:+84898408408">'+icon('phone')+' 0898 408 408</a></div></section>'

def home():
    return homepage(globals())

def catalogue(name,items,path,description,groups=None):
    filters=''
    if groups:
        filters='<div class="category-tabs">'+''.join('<a class="'+('selected' if h==path else '')+'" href="'+h+'">'+n+'</a>' for n,h in groups)+'</div>'
    return intro(name,description)+ '<section class="section catalogue"><div class="container">'+filters+'<div class="catalogue-toolbar"><p><strong id="result-count">'+str(len(items))+'</strong> mục đang được giới thiệu</p><form class="filter-form" role="search"><label for="catalogue-search" class="sr-only">Tìm trong danh mục</label><input id="catalogue-search" name="q" type="search" autocomplete="off" placeholder="Tìm trong danh mục…"><button class="icon-button" aria-label="Lọc danh mục">'+icon('search')+'</button></form></div><div class="cards-grid four filter-grid" data-page-size="12">'+cards(items)+'</div><p class="empty-results" hidden>Chưa có kết quả phù hợp. Hãy thử một từ khóa khác hoặc xóa bộ lọc.</p><nav class="pagination" aria-label="Phân trang danh mục"></nav></div></section>'+cta()

ANIMAL_GROUPS=[('Rắn','/danh-muc-san-pham/ran/'),('Chim','/danh-muc-san-pham/chim/'),('Thú','/danh-muc-san-pham/thu/'),('Khác','/danh-muc-san-pham/khac/')]
SHOP_GROUPS=[('Tất cả','/san-pham/'),('Thuốc','/danh-muc-san-pham/thuoc/'),('Mỹ phẩm','/danh-muc-san-pham/my-pham/'),('Thực phẩm chức năng','/danh-muc-san-pham/thuc-pham-chuc-nang/'),('Rượu','/danh-muc-san-pham/ruou/')]
ANIMAL_IDS={77,78,73,72}

def is_animal(p):
    # Preserve publisher categories. Unclassified species are listed with the nature collection.
    return bool(ANIMAL_IDS.intersection(c['id'] for c in p['categories'])) or not p['categories']

def product_page(p,name=None):
    n=title(name or p['name'])
    animal=is_animal(p)
    cats=p['categories']
    category=cats[0]['name'] if cats else 'Thế giới tự nhiên'
    content=clean(p['description'])
    short=plain(p.get('short_description',''))
    gallery=''.join(image(x['src'],n) for x in p.get('images',[])[1:])
    related=[x for x in PRODUCTS if x['id']!=p['id'] and any(c['id'] in [d['id'] for d in cats] for c in x['categories'])][:4]
    return '<section class="container detail-top">'+breadcrumb(n)+'<div class="product-hero"><div class="product-visual">'+image(product_img(p),n,'',True)+'</div><div class="product-summary"><p class="section-kicker">'+ESC(category)+'</p><h1>'+ESC(n)+'</h1><p>'+(ESC(short) if short else ('Tìm hiểu thông tin về loài trong bộ sưu tập thiên nhiên của Trại rắn Đồng Tâm.' if animal else 'Sản phẩm được giới thiệu trên website chính thức của Trại rắn Đồng Tâm. Liên hệ trung tâm để biết thông tin và giá hiện tại.'))+'</p>'+btn('Lên lịch tham quan' if animal else 'Liên hệ tư vấn','/contact/#len-lich')+'<a class="text-link" href="'+('/danh-muc-san-pham/'+cats[0]['slug']+'/' if cats else '/du-lich-sinh-thai/')+'">Xem danh mục '+icon('arrow')+'</a></div></div></section><section class="section detail-content"><div class="container article-layout"><aside class="article-aside"><p>'+('Hồ sơ loài' if animal else 'Thông tin sản phẩm')+'</p><a href="#thong-tin">Thông tin chi tiết</a><a href="#lien-quan">'+('Loài' if animal else 'Sản phẩm')+' liên quan</a><a href="/contact/">Liên hệ Đồng Tâm</a></aside><article class="prose" id="thong-tin">'+(content or '<p>Nội dung chi tiết đang được cập nhật. Vui lòng liên hệ trung tâm để được hỗ trợ.</p>')+gallery+'</article></div></section>'+('<section id="lien-quan" class="section animal-section"><div class="container"><div class="section-heading"><h2>Tiếp tục khám phá</h2></div><div class="cards-grid four">'+cards(related)+'</div></div></section>' if related else '')

def post_page(p):
    n=title(p['title']['rendered'])
    content=clean(p['content']['rendered'])
    return '<section class="article-intro container">'+breadcrumb('Tin tức')+'<a class="pill" href="/tin-tuc/">Nhịp sống Đồng Tâm</a><h1>'+ESC(n)+'</h1><p class="article-meta">Trại rắn Đồng Tâm <span>·</span> <time datetime="'+p['date']+'" data-date="'+p['date']+'">'+p['date'][:10]+'</time></p></section><section class="article-body container"><article class="prose">'+(content or '<div class="source-empty"><h2>Nội dung đang được cập nhật</h2><p>Bài viết này chưa có nội dung chi tiết trên website gốc.</p></div>')+'</article><a class="text-link back-link" href="/tin-tuc/">← Quay về tin tức</a></section><section class="section news-section"><div class="container"><h2>Chuyện khác ở Đồng Tâm</h2><div class="cards-grid three">'+cards([x for x in POSTS if x['id']!=p['id']][:3],'post')+'</div></div></section>'

def news_page(name,posts):
    return intro(name,'Những hoạt động, sự kiện và câu chuyện mới từ Trại rắn Đồng Tâm.')+'<section class="section"><div class="container"><div class="category-tabs"><a href="/tin-tuc/">Tất cả tin tức</a><a href="/category/tin-moi/">Tin mới</a><a href="/category/tin-noi-bo/">Tin nội bộ</a><a href="/su-kien/">Sự kiện</a><a href="/thong-bao/">Thông báo</a></div>'+('<div class="cards-grid three">'+cards(posts,'post')+'</div>' if posts else '<div class="source-empty"><h2>Chưa có bài viết trong mục này</h2><p>Bạn có thể xem các hoạt động mới nhất của Đồng Tâm tại trang tin tức.</p>'+btn('Xem tin tức','/tin-tuc/')+'</div>')+'</div></section>'

def contact():
    return intro('Hẹn gặp bạn tại Đồng Tâm','Bạn đang lên kế hoạch cho một ngày khám phá? Liên hệ để được tư vấn lịch tham quan, dịch vụ và thông tin cho đoàn.')+'<section class="section"><div class="container contact-grid"><div class="contact-details"><h2>Chuyến đi bắt đầu<br>từ một lời chào.</h2><div class="contact-row">'+icon('pin')+'<div><h3>Địa chỉ</h3><p>Ấp Tân Thuận B, xã Kim Sơn,<br>tỉnh Đồng Tháp</p><a class="text-link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=Trai+ran+Dong+Tam+Kim+Son">Xem đường đi '+icon('diagonal')+'</a></div></div><div class="contact-row">'+icon('phone')+'<div><h3>Gọi cho Đồng Tâm</h3><p><a href="tel:+84898408408">0898 408 408</a><br><a href="tel:+842733853204">0273 3853 204</a></p></div></div><div class="contact-row">'+icon('mail')+'<div><h3>Email</h3><a href="mailto:trairandongtam408@gmail.com">trairandongtam408@gmail.com</a></div></div><div class="contact-row">'+icon('clock')+'<div><h3>Thời gian tham quan</h3><p>7:00 – 17:00, tất cả các ngày trong tuần</p></div></div></div><form class="contact-form" id="len-lich"><p class="section-kicker">Cùng lên lịch</p><h2>Kể Đồng Tâm nghe<br>về chuyến đi của bạn.</h2><div class="form-grid"><label>Họ và tên<input name="name" required autocomplete="name" placeholder="Nguyễn Văn An…"></label><label>Số điện thoại<input name="phone" type="tel" required autocomplete="tel" inputmode="tel" placeholder="09xx xxx xxx…" pattern="[+0-9 \\-]{8,20}"></label><label>Email<input name="email" type="email" autocomplete="email" spellcheck="false" placeholder="ban@example.com…"></label><label>Ngày dự kiến<input name="date" type="date"></label><label>Số khách dự kiến<input name="guests" type="number" min="1" max="10000" inputmode="numeric" placeholder="Ví dụ: 10…"></label><label>Bạn quan tâm<select name="interest"><option>Tham quan gia đình</option><option>Tham quan trường học / đoàn</option><option>Sản phẩm Đồng Tâm</option><option>Thông tin khác</option></select></label></div><label>Lời nhắn<textarea name="message" rows="4" placeholder="Bạn muốn được tư vấn điều gì?…"></textarea></label><p class="form-note">Biểu mẫu sẽ mở ứng dụng email với nội dung đã điền. Bạn kiểm tra và gửi email để liên hệ; lịch tham quan được xác nhận trực tiếp bởi Đồng Tâm.</p><button class="button primary" type="submit">Soạn email liên hệ '+icon('diagonal')+'</button><p class="form-status" role="status" aria-live="polite"></p><a class="email-fallback" hidden href="mailto:trairandongtam408@gmail.com">Mở email liên hệ</a></form></div></section><section class="container map-section"><div class="location-panel"><div class="location-visual">'+image(page_img(page_find('gioi-thieu')),'Không gian Trại rắn Đồng Tâm')+'</div><div class="location-copy"><p class="section-kicker">Hẹn gặp tại khu vườn</p><h2>Đường đến Đồng Tâm.</h2><p>Ấp Tân Thuận B, xã Kim Sơn,<br>tỉnh Đồng Tháp</p><a class="button primary" href="https://www.google.com/maps/search/?api=1&query=Trai+ran+Dong+Tam+Kim+Son" target="_blank" rel="noopener noreferrer">Mở chỉ đường Google Maps '+icon('diagonal')+'</a></div></div></section>'+faq()

def empty_page(p):
    n=title(p['title']['rendered'])
    slug=p['slug']
    if slug=='bang-gia-dich-vu':
        return intro('Bảng giá dịch vụ','Liên hệ Đồng Tâm để nhận thông tin giá vé, dịch vụ và tư vấn lịch phù hợp với chuyến đi của bạn.')+'<section class="section"><div class="container service-grid">'+''.join('<article class="service-panel">'+icon(sym)+'<h2>'+label+'</h2><p>'+desc+'</p>'+btn('Liên hệ tư vấn','/contact/#len-lich')+'</article>' for sym,label,desc in [('leaf','Khách tham quan','Hỏi thông tin vé vào cổng và các trải nghiệm đang hoạt động.'),('calendar','Đoàn & trường học','Trao đổi số lượng khách, ngày dự kiến và nhu cầu của đoàn.'),('book','Dịch vụ tại Đồng Tâm','Tìm hiểu nhà hàng, bảo tàng và các dịch vụ trong khu tham quan.')])+'</div><p class="container muted service-note">Trang gốc chưa công bố bảng giá chi tiết. Giá và dịch vụ được xác nhận trực tiếp bởi Đồng Tâm.</p></section>'+cta()
    if slug=='dieu-tri-ran-can':
        return intro(n,'Thông tin liên hệ Trung tâm Nuôi trồng, nghiên cứu, chế biến dược liệu — Trại rắn Đồng Tâm.')+'<section class="section"><div class="container info-panel"><div>'+icon('phone')+'<h2>Liên hệ trung tâm</h2><p>Website gốc giới thiệu hoạt động tiếp nhận, khám chữa bệnh cho bệnh nhân bị rắn độc cắn tại đơn vị. Trang chuyên mục hiện chưa công bố hướng dẫn hoặc lịch tiếp nhận chi tiết.</p><p>Vui lòng liên hệ trực tiếp để được cung cấp thông tin chuyên môn và tiếp nhận phù hợp.</p>'+btn('Gọi 0273 3853 204','tel:+842733853204')+'</div><div><h3>Địa chỉ Đồng Tâm</h3><p>Ấp Tân Thuận B, xã Kim Sơn, tỉnh Đồng Tháp</p><a class="text-link" href="/contact/">Thông tin liên hệ '+icon('arrow')+'</a></div></div></section>'
    aliases={'ran-ho-meo-ho-mang-xiem':'ho-mang-xiem-ran-ho-meo'}
    matching=next((x for x in PRODUCTS if unquote(x['slug'])==aliases.get(slug,slug)),None)
    if matching:return product_page(matching,n)
    if slug.startswith('nhom-') or slug=='danh-muc-thu':
        mapping={'nhom-ran':'ran','nhom-chim':'chim','nhom-thu':'thu','danh-muc-thu':'thu','nhom-thu-khac':'khac'}
        cat=mapping.get(slug,'khac')
        return catalogue(n,[x for x in PRODUCTS if cat in [c['slug'] for c in x['categories']]],local(p['link']),'Khám phá các hồ sơ loài được giới thiệu tại Đồng Tâm.',ANIMAL_GROUPS)
    if slug in ['thuoc','thuc-pham-chuc-nang']:
        return catalogue(n,[x for x in PRODUCTS if slug in [c['slug'] for c in x['categories']]],local(p['link']),'Các sản phẩm được giới thiệu tại Trại rắn Đồng Tâm.',SHOP_GROUPS)
    if slug=='nha-bao-tang-ran':
        return intro(n,'Dừng chân để tìm hiểu thế giới loài rắn, tư liệu về bảo tồn và nghiên cứu tại Đồng Tâm.',SNAKE)+ '<section class="section"><div class="container prose"><h2>Một góc nhìn khác về loài rắn</h2><p>Nhà bảo tàng rắn là một trong những điểm tham quan được giới thiệu tại Trại rắn Đồng Tâm. Kết hợp chuyến ghé bảo tàng với việc khám phá khu động vật và không gian sinh thái.</p>'+btn('Hỏi thông tin tham quan','/contact/#len-lich')+'</div></section>'+scene_block()+cta()
    if slug=='san-pham-ocop':
        items=[x for x in PRODUCTS if not is_animal(x)]
        return intro(n,'Khám phá không gian trưng bày, giới thiệu sản phẩm OCOP của Đồng Tâm.')+'<section class="section"><div class="container"><p class="intro-description">Tìm hiểu thông tin về không gian sản phẩm OCOP trong bài viết của trung tâm. Liên hệ để được tư vấn chứng nhận và các sản phẩm hiện có.</p>'+btn('Xem bài giới thiệu','/khong-gian-trung-bay-gioi-thieu-san-pham-ocop-cua-trai-ran-dong-tam/')+'<div class="cards-grid four spaced">'+cards(items[:8])+'</div></div></section>'
    return intro(n,'Thông tin từ Trại rắn Đồng Tâm.')+'<section class="section"><div class="container source-empty"><span class="empty-icon">'+icon('leaf')+'</span><h2>Hẹn bạn với những thông tin mới.</h2><p>Chuyên mục này chưa có nội dung chi tiết trên website gốc. Bạn có thể liên hệ Đồng Tâm hoặc tiếp tục khám phá những hoạt động khác.</p><div class="inline-actions">'+btn('Liên hệ Đồng Tâm','/contact/')+btn('Khám phá sinh thái','/du-lich-sinh-thai/','outline')+'</div></div></section>'

def general_page(p):
    n=title(p['title']['rendered']);slug=p['slug']
    if slug=='contact':return contact()
    if slug=='tin-tuc':return news_page(n,POSTS)
    if slug in ['su-kien','thong-bao','tuyen-dung','thong-tin']:
        posts=[x for x in POSTS if 69 in x['categories']] if slug=='su-kien' else []
        return news_page(n,posts)
    if slug=='san-pham':return catalogue(n,[p for p in PRODUCTS if not is_animal(p)],'/san-pham/','Khám phá các sản phẩm dược liệu, chăm sóc và quà tặng được giới thiệu tại Đồng Tâm.',SHOP_GROUPS)
    if slug=='du-lich-sinh-thai':
        return intro(n,'Gặp những loài vật đặc biệt, ghé nhà bảo tàng rắn và tận hưởng một ngày giữa không gian xanh của Đồng Tâm.',HERO)+visit_strip()+'<section class="section"><div class="container"><h2>Chọn hành trình của bạn.</h2><div class="cards-grid four spaced">'+cards([product_find('ran-ho-chua'),product_find('chim-cong'),product_find('vuon-den'),product_find('ca-sau-xiem')])+'</div><div class="destination-grid">'+''.join('<a href="'+h+'"><h3>'+l+'</h3>'+icon('diagonal')+'</a>' for l,h in CONTENT_NAV[0][2])+'</div></div></section>'+scene_block()+cta()+faq()
    content=clean(p['content']['rendered'])
    if len(plain(content))<30:return empty_page(p)
    if slug=='ruou-ran':return catalogue(n,[x for x in PRODUCTS if 'ruou' in [c['slug'] for c in x['categories']]],'/ruou-ran/','Các sản phẩm rượu được giới thiệu tại Đồng Tâm.',SHOP_GROUPS)
    return intro(n,{'gioi-thieu':'Từ năm 1977, một hành trình gắn kết thiên nhiên, nghiên cứu và sự sống.','nghien-cuu-khoa-hoc':'Những hoạt động nghiên cứu tại Trung tâm Nuôi trồng, nghiên cứu, chế biến dược liệu.','to-chuc':'Tìm hiểu các bộ phận và tổ chức của Trại rắn Đồng Tâm.','nha-hang-dong-tam':'Thêm một điểm dừng trong chuyến khám phá Đồng Tâm.'}.get(slug,'Khám phá thông tin và hoạt động của Trại rắn Đồng Tâm.'))+'<section class="section"><div class="container article-layout"><aside class="article-aside"><p>Khám phá thêm</p>'+''.join('<a href="'+h+'">'+l+'</a>' for l,h in (CONTENT_NAV[1][2] if slug in ['gioi-thieu','to-chuc'] else CONTENT_NAV[0][2]))+'</aside><article class="prose">'+content+'</article></div></section>'+cta()

def write(path,name,body,kind='page',source='',desc=''):
    dest=OUT/path.lstrip('/')/'index.html'
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(shell(name,body,path,desc),encoding='utf-8')
    RECORDS.append({'path':path,'title':name,'kind':kind,'source':source,'description':desc or plain(body)[:180]})

def main():
    OUT.mkdir(exist_ok=True)
    shutil.copytree(str(ROOT/'public'),str(OUT),dirs_exist_ok=True) if __import__('sys').version_info>=(3,8) else copy_public()
    write('/','Trang chủ',home(),'home','https://trairandongtam.vn/','Khám phá Trại rắn Đồng Tâm: thế giới động vật, du lịch sinh thái, bảo tàng rắn, nghiên cứu và các sản phẩm dược liệu tại Kim Sơn, Đồng Tháp.')
    for p in PAGES:
        path=local(p['link'])
        if path=='/':continue
        write(path,title(p['title']['rendered']),general_page(p),'page',p['link'])
    for p in POSTS:write(local(p['link']),title(p['title']['rendered']),post_page(p),'post',p['link'])
    for p in PRODUCTS:write(local(p['permalink']),title(p['name']),product_page(p),'animal' if is_animal(p) else 'product',p['permalink'])
    for c in PRODUCT_CATS:
        items=[p for p in PRODUCTS if c['id'] in [cat['id'] for cat in p['categories']]]
        path=local(c['permalink'])
        write(path,c['name'],catalogue(c['name'],items,path,'Khám phá '+c['name'].lower()+' được giới thiệu tại Trại rắn Đồng Tâm.',ANIMAL_GROUPS if c['id'] in ANIMAL_IDS else SHOP_GROUPS),'category',c['permalink'])
    for c in CATEGORIES:write(local(c['link']),c['name'],news_page(c['name'],[p for p in POSTS if c['id'] in p['categories']]),'category',c['link'])
    searchbody=intro('Bạn muốn khám phá điều gì?','Tìm loài vật, sản phẩm, trang thông tin hoặc câu chuyện từ Đồng Tâm.')+'<section class="section"><div class="container search-page"><form action="/tim-kiem/" class="search-form" role="search"><label class="sr-only" for="results-query">Tìm kiếm toàn website</label><input id="results-query" name="q" type="search" placeholder="Nhập từ khóa tìm kiếm…" autocomplete="off"><button class="button primary">Tìm kiếm '+icon('search')+'</button></form><p id="search-count" role="status" aria-live="polite">Nhập từ khóa để khám phá website.</p><div id="search-results" class="search-results"></div><nav class="pagination" id="search-pagination" aria-label="Phân trang kết quả tìm kiếm"></nav></div></section>'
    write('/tim-kiem/','Tìm kiếm',searchbody,'utility')
    sitemapbody=intro('Mọi lối dẫn đến Đồng Tâm','Toàn bộ trang, hồ sơ loài, sản phẩm và bài viết trong một nơi.')+'<section class="section"><div class="container sitemap-groups">'+''.join('<section><h2>'+label+'</h2><ul>'+''.join('<li><a href="'+r['path']+'">'+ESC(r['title'])+'</a></li>' for r in RECORDS if r['kind'] in kinds)+'</ul></section>' for label,kinds in [('Thông tin & trải nghiệm',{'page','home'}),('Danh mục',{'category'}),('Thế giới động vật',{'animal'}),('Sản phẩm',{'product'}),('Tin tức',{'post'})])+'</div></section>'
    write('/so-do-website/','Sơ đồ website',sitemapbody,'utility')
    notfound=intro('Lối này chưa có trên bản đồ.','Trang bạn tìm không tồn tại hoặc đã thay đổi đường dẫn.')+'<section class="section"><div class="container inline-actions">'+btn('Về trang chủ','/')+btn('Tìm nội dung','/tim-kiem/','outline')+'</div></section>'
    (OUT/'404.html').write_text(shell('Không tìm thấy trang',notfound,'/404/'),encoding='utf-8')
    (OUT/'search-index.json').write_text(json.dumps(RECORDS,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    (ROOT/'data/route-inventory.json').write_text(json.dumps(RECORDS,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>https://trairandongtam.vn'+ESC(r['path'])+'</loc></url>' for r in RECORDS if r['kind']!='utility')+'</urlset>',encoding='utf-8')
    (OUT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://trairandongtam.vn/sitemap.xml\n',encoding='utf-8')
    print('Built '+str(len(RECORDS))+' routes in '+str(OUT))

def copy_public():
    for src in (ROOT/'public').rglob('*'):
        if src.is_file():
            target=OUT/src.relative_to(ROOT/'public')
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(str(src),str(target))

if __name__=='__main__':main()
