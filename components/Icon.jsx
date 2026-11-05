const paths = {
  arrow: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
  diagonal: <><path d="M6 18 18 6M6 6h12v12" /></>,
  leaf: <><path d="M20 3C5 2 1 10 7 17c7 6 15 1 13-14ZM5 20 16 9" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m5 5 14 14M19 5 5 19" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  cube: <path d="m12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5M12 12v10" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  file: <><path d="M14 2H5v20h14V7ZM14 2v5h5M8 12h8M8 16h8" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  photo: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 5-5 4 4 4-6 5 6" /></>,
  settings: <><circle cx="12" cy="12" r="4" /><path d="m9 3 1-2h4l1 2 3 2 2 1v4l-1 2 1 3v3l-3 2-3-1-2 2-3-1-3-1-3-2v-4l1-2-1-3 2-3Z" /></>,
  plus: <path d="M12 4v16M4 12h16" />,
  check: <path d="m5 12 4 4L20 5" />,
  upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" /></>,
};
export default function Icon({ name = 'leaf', ...props }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.leaf}</svg>;
}
