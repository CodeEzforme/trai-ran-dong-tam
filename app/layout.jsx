import './globals.css';
import { base, siteUrl } from '../lib/paths.mjs';
export const metadata = {
  title: { default: 'Trại rắn Đồng Tâm', template: '%s | Trại rắn Đồng Tâm' },
  description: 'Một ngày gần hơn với thiên nhiên tại Trại rắn Đồng Tâm.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }) {
  const imports = { imports: { three: siteUrl('/assets/vendor/three.module.js'), 'three/addons/': siteUrl('/assets/vendor/'), 'three/addons/controls/OrbitControls.js': siteUrl('/assets/vendor/OrbitControls.js') } };
  return <html lang="vi" id="top"><head>
    <link rel="icon" href={siteUrl('/assets/images/59ac3a66d469ee35.webp')} />
    <link rel="stylesheet" href={siteUrl('/assets/style.css?v=next1')} />
    <link rel="stylesheet" href={siteUrl('/assets/refinements.css?v=next1')} />
    <link rel="stylesheet" href={siteUrl('/assets/experience.css?v=next1')} />
    <link rel="stylesheet" href={siteUrl('/assets/garden.css?v=next1')} />
    <meta name="theme-color" content="#163e2d" />
    <script type="importmap" dangerouslySetInnerHTML={{ __html: JSON.stringify(imports) }} />
  </head><body data-next-site="true" data-base-path={base}>{children}</body></html>;
}
