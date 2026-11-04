export const base = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
export function siteUrl(path = '/') {
  if (!path.startsWith('/') || path.startsWith('//') || (base && (path === base || path.startsWith(base + '/')))) return path;
  return base + path;
}
export const repository = { owner: 'CodeEzforme', name: 'trai-ran-dong-tam', branch: 'main', file: 'content/content.json' };
export const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
export const slugify = (s) => fold(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
