import fs from 'node:fs';
import path from 'node:path';
fs.cpSync('generated', 'out', { recursive: true });
fs.writeFileSync('out/.nojekyll', '');
fs.writeFileSync('out/robots.txt', 'User-agent: *\nDisallow: /\n');
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const origin = process.env.SITE_ORIGIN || 'https://codeezforme.github.io';
const { entries } = await import('../lib/content.mjs');
fs.writeFileSync('out/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...entries.map(d=>d.path)].map(p=>`<url><loc>${origin}${base}${p}</loc></url>`).join('')}</urlset>`);
// All local assets are copied into a base-path-aware export; vendored modules remain untouched.
console.log('Next.js export ready in ' + path.resolve('out'));
