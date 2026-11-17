export const icons = {
  bars: {
    outline: '<path d="M3 7h18"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17h15"/></g>',
    monochrome: true,
  },
  xmark: {
    outline: '<path d="m6 6 12 12M18 6 6 18"/>',
    accent: '',
    monochrome: true,
  },
  'arrow-right': {
    outline: '<path d="M4 12h15m-4.75-4.75L19 12l-4.75 4.75"/>',
    accent: '',
    monochrome: true,
  },
  'arrow-left': {
    outline: '<g transform="rotate(180 12 12)"><path d="M4 12h15m-4.75-4.75L19 12l-4.75 4.75"/></g>',
    accent: '',
    monochrome: true,
  },
  'arrow-up': {
    outline: '<g transform="rotate(-90 12 12)"><path d="M4 12h15m-4.75-4.75L19 12l-4.75 4.75"/></g>',
    accent: '',
    monochrome: true,
  },
  'arrow-down': {
    outline: '<g transform="rotate(90 12 12)"><path d="M4 12h15m-4.75-4.75L19 12l-4.75 4.75"/></g>',
    accent: '',
    monochrome: true,
  },
  'chevron-right': {
    outline: '<path d="m8 5 7 7"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-7 7"/></g>',
    monochrome: true,
  },
  'chevron-left': {
    outline: '<path d="m16 5-7 7"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 7 7"/></g>',
    monochrome: true,
  },
  'chevron-down': {
    outline: '<path d="m5 8 7 7"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 15 7-7"/></g>',
    monochrome: true,
  },
  'arrow-up-right-from-square': {
    outline: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3M12.5 4H20v7.5m-.5-7-9 9"/>',
    accent: '',
    monochrome: true,
  },
  'arrows-left-right': {
    outline: '<path d="m7 8-4 4 4 4m10-8 4 4-4 4"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/></g>',
    monochrome: true,
  },
  'arrows-up-down-left-right': {
    outline: '<path d="m9 6 3-3 3 3m-6 12 3 3 3-3M6 9l-3 3 3 3m12-6 3 3-3 3"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18"/></g>',
    monochrome: true,
  },
  'arrow-trend-up': {
    outline: '<path d="M14 5h6v6"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 17 6-6 4 3 7-9"/></g>',
    monochrome: true,
  },
  expand: {
    outline: '<path d="M9 3.5H3.5V9m11 11.5H20V15"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3.5h5.5V9M3.5 15V20H9"/></g>',
    monochrome: true,
  },
  compress: {
    outline: '<path d="M3.5 9H9V3.5M15 20.5V15h5.5"/>',
    accent:
      '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3.5V9h5.5M9 20.5V15H3.5"/></g>',
    monochrome: true,
  },
  'arrows-rotate': {
    outline: '<path d="M20 9a8 8 0 0 0-13.5-3M4 15a8 8 0 0 0 13.5 3"/>',
    accent:
      '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6-3 3M3 4v5h5m9.5 9 3-3M21 20v-5h-5"/></g>',
    monochrome: true,
  },
  'redo-alt': {
    outline: '<path d="M19.5 8.5a8 8 0 1 0 0 7"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 8.5h5v-5"/></g>',
    monochrome: true,
  },
  'rotate-left': {
    outline: '<path d="M4.5 8.5a8 8 0 1 1 0 7"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8.5H4v-5"/></g>',
    monochrome: true,
  },
  shuffle: {
    outline: '<path d="M4 7h16m-3-3 3 3-3 3m3 7H4m3-3-3 3 3 3"/>',
    accent: '',
    monochrome: true,
  },
  check: {
    outline: '<path d="m9 17 11-11"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5"/></g>',
    monochrome: true,
  },
  'check-circle': {
    outline: '<circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-6"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="12" r="9"/></g>',
  },
  'times-circle': {
    outline: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="12" r="9"/></g>',
  },
  'exclamation-circle': {
    outline: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 3.5v.1"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="12" r="9"/></g>',
  },
  'exclamation-triangle': {
    outline: '<path d="m10.5 4.5-8 14A1.6 1.6 0 0 0 4 21h16a1.6 1.6 0 0 0 1.5-2.5l-8-14a1.7 1.7 0 0 0-3 0ZM12 9v5m0 3.5v.1"/>',
    accent: '<g opacity=".32"><path d="m10.5 4.5-8 14A1.6 1.6 0 0 0 4 21h16a1.6 1.6 0 0 0 1.5-2.5l-8-14a1.7 1.7 0 0 0-3 0ZM12 9v5m0 3.5v.1"/></g>',
  },
  circle: {
    outline: '<circle cx="12" cy="12" r="6"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="12" r="6"/></g>',
    monochrome: true,
  },
  plus: {
    outline: '<path d="M12 4v16"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/></g>',
    monochrome: true,
  },
  star: {
    outline: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
    accent: '<g opacity=".32"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/></g>',
  },
  phone: {
    outline: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 5h4m-3 13.5h2"/>',
    accent: '',
    monochrome: true,
  },
  envelope: {
    outline: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="m4 6 6.5 5.3a2.4 2.4 0 0 0 3 0L20 6"/>',
    accent: '',
    monochrome: true,
  },
  comments: {
    outline: '<path d="M20.5 11.5A8.5 8.5 0 0 1 8 19l-5 1.5 1.5-5a8.5 8.5 0 1 1 16-4Z"/><path d="M8 10h8m-8 4h5"/>',
    accent: '<g opacity=".32"><path d="M20.5 11.5A8.5 8.5 0 0 1 8 19l-5 1.5 1.5-5a8.5 8.5 0 1 1 16-4Z"/></g>',
  },
  'paper-plane': {
    outline: '<path d="m3 10 18-7-7 18-3.2-7.8L3 10Zm7.8 3.2L21 3"/>',
    accent: '<g opacity=".32"><path d="m3 10 18-7-7 18-3.2-7.8L3 10Zm7.8 3.2L21 3"/></g>',
  },
  'share-alt': {
    outline: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.7 7.6-4.4m-7.6 7 7.6 4.4"/>',
    accent: '<g opacity=".32"><circle cx="18" cy="5" r="2.5"/></g>',
  },
  'location-dot': {
    outline: '<path d="M20 9.5c0 4.9-5.9 10.7-7.3 11.9a1 1 0 0 1-1.4 0C9.9 20.2 4 14.4 4 9.5a8 8 0 0 1 16 0Z"/><circle cx="12" cy="9.5" r="3"/>',
    accent: '',
    monochrome: true,
  },
  'map-location-dot': {
    outline:
      '<path d="m2 7 6-2 5 2M2 7v14l6-2 6 2 8-3v-7M8 5v14m6-4v6"/><path d="M21 6c0 3.5-4 7.5-4 7.5S13 9.5 13 6a4 4 0 1 1 8 0Z"/><circle cx="17" cy="6" r="1.3"/>',
    accent: '<g opacity=".32"><path d="m2 7 6-2v14l-6 2Z"/></g>',
  },
  clock: {
    outline: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5V12l4 2.5"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="12" r="9"/></g>',
  },
  'calendar-days': {
    outline: '<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7.5 3v5m9-5v5m-13 3h17"/><path d="M7.5 14.5h1m3 0h1m3 0h1m-9 3h1m3 0h1"/>',
    accent: '<g opacity=".32"><rect x="3.5" y="5.5" width="17" height="15" rx="2"/></g>',
  },
  download: {
    outline: '<path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-5-5 5 5 5-5"/></g>',
    monochrome: true,
  },
  'cloud-upload-alt': {
    outline: '<path d="M7 17H6a4 4 0 0 1-1-7.9A7 7 0 0 1 18.5 8 4.5 4.5 0 0 1 18 17h-1"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V11m-4 4 4-4 4 4"/></g>',
  },
  'file-pdf': {
    outline:
      '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Zm0 0v6h6"/><path d="M7 18v-5h1.2a1.3 1.3 0 0 1 0 2.6H7m4-2.6v5h1a2.5 2.5 0 0 0 0-5Zm5 5v-5h2m-2 2.5h1.7" stroke-width="1.2"/>',
    accent: '<g opacity=".32"><path d="M14 3v6h6Z"/></g>',
  },
  lock: {
    outline: '<rect x="5" y="10" width="14" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2"/>',
    accent: '<g opacity=".32"><rect x="5" y="10" width="14" height="11" rx="2.5"/></g>',
  },
  'sign-out-alt': {
    outline: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12h11m-4-4 4 4-4 4"/></g>',
    monochrome: true,
  },
  gear: {
    outline:
      '<path d="m10 3-.7 2.5-2 .9-2.3-.7-2 3.5L5 11v2l-2 1.8 2 3.5 2.3-.7 2 .9.7 2.5h4l.7-2.5 2-.9 2.3.7 2-3.5-2-1.8v-2l2-1.8-2-3.5-2.3.7-2-.9L14 3Z"/><circle cx="12" cy="12" r="3"/>',
    accent:
      '<g opacity=".32"><path d="m10 3-.7 2.5-2 .9-2.3-.7-2 3.5L5 11v2l-2 1.8 2 3.5 2.3-.7 2 .9.7 2.5h4l.7-2.5 2-.9 2.3.7 2-3.5-2-1.8v-2l2-1.8-2-3.5-2.3.7-2-.9L14 3Z"/></g>',
  },
  pen: {
    outline: '<path d="m14.5 5.5 4 4M4 20l4.5-1 12-12a2.8 2.8 0 0 0-4-4l-12 12Z"/>',
    accent: '<g opacity=".32"><path d="m14.5 5.5 4 4M4 20l4.5-1 12-12a2.8 2.8 0 0 0-4-4l-12 12Z"/></g>',
    monochrome: true,
  },
  'trash-alt': {
    outline:
      '<path d="M3.5 6.5h17M9 6.5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.5M5.5 6.5l1 13a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5l1-13M10 10.5v6m4-6v6"/>',
    accent: '<g opacity=".32"><path d="M5.5 6.5h13l-1 13a1.5 1.5 0 0 1-1.5 1.5H8a1.5 1.5 0 0 1-1.5-1.5Z"/></g>',
    monochrome: true,
  },
  image: {
    outline: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-7 5 8"/>',
    accent: '<g opacity=".32"><rect x="3" y="3" width="18" height="18" rx="2.5"/></g>',
  },
  film: {
    outline: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4m-4 6h4m10-6h4m-4 6h4"/>',
    accent: '<g opacity=".32"><rect x="3" y="4" width="18" height="16" rx="2"/></g>',
  },
  'magnifying-glass': {
    outline: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    accent: '<g opacity=".32"><circle cx="10.5" cy="10.5" r="6.5"/></g>',
    monochrome: true,
  },
  eye: {
    outline: '<path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/><circle cx="12" cy="12" r="3"/>',
    accent: '<g opacity=".32"><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/></g>',
  },
  list: {
    outline: '<path d="M9 6h12M9 12h12M9 18h12"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h.1M3 12h.1M3 18h.1"/></g>',
    monochrome: true,
  },
  'list-check': {
    outline: '<path d="M10 6h11M10 12h11M10 18h11"/>',
    accent:
      '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m2.5 6 1.5 1.5 3-3m-4.5 7.5L4 13.5l3-3m-4.5 7.5L4 19.5l3-3"/></g>',
    monochrome: true,
  },
  'grip-lines': {
    outline: '<path d="M5 9h14"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15h14"/></g>',
    monochrome: true,
  },
  bold: {
    outline: '<path d="M7 4h6a4 4 0 0 1 0 8H7m0-8v16h7a4 4 0 0 0 0-8H7"/>',
    accent: '<g opacity=".32"><path d="M7 4h6a4 4 0 0 1 0 8H7Z"/></g>',
    monochrome: true,
  },
  italic: {
    outline: '<path d="M10 4h9M5 20h9"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4 9 20"/></g>',
    monochrome: true,
  },
  flask: {
    outline: '<path d="M9 3h6M10 3v6l-6 10a1.4 1.4 0 0 0 1.2 2h13.6a1.4 1.4 0 0 0 1.2-2L14 9V3M7 15h10"/>',
    accent: '<g opacity=".32"><path d="M7 15h10l3 6H4Z"/></g>',
  },
  book: {
    outline: '<path d="M12 6v14M3.5 4.5c3.5-.5 6 .2 8.5 2 2.5-1.8 5-2.5 8.5-2v14c-3.5-.5-6 .2-8.5 2-2.5-1.8-5-2.5-8.5-2Z"/>',
    accent: '<g opacity=".32"><path d="M12 6v14M3.5 4.5c3.5-.5 6 .2 8.5 2 2.5-1.8 5-2.5 8.5-2v14c-3.5-.5-6 .2-8.5 2-2.5-1.8-5-2.5-8.5-2Z"/></g>',
  },
  'book-open-reader': {
    outline: '<path d="M12 10v11M3.5 8c3.5-.5 6 .2 8.5 2 2.5-1.8 5-2.5 8.5-2v11c-3.5-.5-6 .2-8.5 2-2.5-1.8-5-2.5-8.5-2Z"/><circle cx="12" cy="4" r="2"/>',
    accent: '<g opacity=".32"><path d="M12 10v11M3.5 8c3.5-.5 6 .2 8.5 2 2.5-1.8 5-2.5 8.5-2v11c-3.5-.5-6 .2-8.5 2-2.5-1.8-5-2.5-8.5-2Z"/></g>',
  },
  music: {
    outline: '<path d="M10 17V5l10-2v12M10 8l10-2"/><ellipse cx="7" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/>',
    accent: '<g opacity=".32"><ellipse cx="7" cy="18" rx="3" ry="2.5"/></g>',
  },
  heart: {
    outline: '<path d="M12 20s-8-4.8-8-10a4.4 4.4 0 0 1 8-2.5A4.4 4.4 0 0 1 20 10c0 5.2-8 10-8 10Z"/>',
    accent: '<g opacity=".32"><path d="M12 20s-8-4.8-8-10a4.4 4.4 0 0 1 8-2.5A4.4 4.4 0 0 1 20 10c0 5.2-8 10-8 10Z"/></g>',
  },
  'hand-holding-heart': {
    outline:
      '<path d="M2.5 14.5h3l3-2c.5-.4 1.2-.6 1.8-.6h3.2c1.2 0 2 1 2 2v.6l3.6-1.9c1.3-.7 2.7.7 1.8 1.9l-4.7 5.2c-.5.6-1.3.9-2.1.9H2.5Zm3 0v6.1m4-4.6h4a2 2 0 0 0 2-2"/><path d="M13 9.5 9.5 6A2.3 2.3 0 0 1 13 3a2.3 2.3 0 0 1 3.5 3Z"/>',
    accent: '<g opacity=".32"><path d="M13 9.5 9.5 6A2.3 2.3 0 0 1 13 3a2.3 2.3 0 0 1 3.5 3Z"/></g>',
  },
  'hands-holding': {
    outline: '<path d="M3 10v7l5 4h8l5-4v-7M7 9v6l3 2m7-8v6l-3 2M3 10a2 2 0 0 1 4 0m10 0a2 2 0 0 1 4 0M10 17h4"/><path d="m9 7 3-4 3 4"/>',
    accent: '<g opacity=".32"><path d="m9 7 3-4 3 4-3 4Z"/></g>',
  },
  handshake: {
    outline: '<path d="m2 7 4-2 3 7-3 5-4-2Zm20 0-4-2-3 7 3 5 4-2ZM7 7l3-2h4l3 2m-7-2-3 5 2 2 4-3 5 6-5 6-7-5m4-3 4 4m-6-1 3 3"/>',
    accent: '<g opacity=".32"><path d="m2 7 4-2 3 7-3 5-4-2Zm20 0-4-2-3 7 3 5 4-2Z"/></g>',
  },
  person: {
    outline: '<circle cx="12" cy="5" r="2"/><path d="M12 9v6m-5-4 5 1 5-1m-5 4-4 6m4-6 4 6"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="5" r="2"/></g>',
  },
  child: {
    outline: '<circle cx="12" cy="5" r="2.3"/><path d="m5 10 7 2 7-2m-7 0v4m0 0-4 6m4-6 4 6"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="5" r="2.3"/></g>',
  },
  baby: {
    outline: '<circle cx="12" cy="12" r="8"/><path d="M12 4c3-3 5 1 2 2M4 11a2 2 0 0 0 0 4m16-4a2 2 0 0 1 0 4M9 11v.1m6-.1v.1m-6 4c2 2 4 2 6 0"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="12" r="8"/></g>',
  },
  users: {
    outline: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 4v3"/>',
    accent: '<g opacity=".32"><circle cx="9" cy="7" r="3"/></g>',
  },
  'universal-access': {
    outline: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="7" r="1.2"/><path d="m6.5 10 5.5 1 5.5-1M12 11v4m0 0-3 4m3-4 3 4"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="12" r="9"/></g>',
  },
  school: {
    outline: '<path d="M3 21V10h4V7l5-4 5 4v3h4v11ZM7 10v11m10-11v11m-7 0v-5h4v5M5 13v2m14-2v2"/><circle cx="12" cy="9" r="1.5"/>',
    accent: '<g opacity=".32"><path d="M7 21V7l5-4 5 4v14Z"/></g>',
  },
  'graduation-cap': {
    outline: '<path d="m2 8 10-5 10 5-10 5ZM6 10v7c4 3 8 3 12 0v-7m4-2v9"/>',
    accent: '<g opacity=".32"><path d="m2 8 10-5 10 5-10 5ZM6 10v7c4 3 8 3 12 0v-7m4-2v9"/></g>',
  },
  'chalkboard-user': {
    outline: '<path d="M10 3h11v13H11m2-9h4m-4 4h2m1 5v5m-2 0h4"/><circle cx="4.5" cy="10" r="2.5"/><path d="M1 21v-3a4 4 0 0 1 4-4h2c3 0 4-3 6-5"/>',
    accent: '<g opacity=".32"><rect x="10" y="3" width="11" height="13" rx="2"/></g>',
  },
  'house-user': {
    outline: '<path d="m2.5 11 9.5-8 9.5 8M5 9v12h14V9"/><circle cx="12" cy="12" r="2"/><path d="M8.5 20a3.5 3.5 0 0 1 7 0"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="12" r="2"/></g>',
  },
  'masks-theater': {
    outline:
      '<path d="M2.5 3.5c3.5 1 7.5 1 11 0v7c0 4-5.5 7-5.5 7s-5.5-3-5.5-7ZM5 8h1m4 0h1m-5.5 3.5c1.2 1.5 3.8 1.5 5 0M16.5 7c1.6 0 3-.3 5-1v7.5c0 4-5.5 7.5-5.5 7.5l-3-2m4-7.5h1m-3 5.5c1-1.3 3-1.3 4 0"/>',
    accent: '<g opacity=".32"><path d="M2.5 3.5c3.5 1 7.5 1 11 0v7c0 4-5.5 7-5.5 7s-5.5-3-5.5-7Z"/></g>',
  },
  'champagne-glasses': {
    outline:
      '<g transform="rotate(13 6.5 10)"><path d="M3.5 3h6v7a3 3 0 0 1-6 0Zm3 10v8m-3 0h6"/></g><g transform="rotate(-13 17.5 10)"><path d="M14.5 3h6v7a3 3 0 0 1-6 0Zm3 10v8m-3 0h6"/></g>',
    accent:
      '<g transform="rotate(13 6.5 10)"><g opacity=".32"><path d="M3.5 7h6v3a3 3 0 0 1-6 0Z"/></g></g><g transform="rotate(-13 17.5 10)"><g opacity=".32"><path d="M14.5 7h6v3a3 3 0 0 1-6 0Z"/></g></g>',
  },
  'shoe-prints': {
    outline: '<path d="M8 3C4 2 2 8 4 12l4 1 2-6c.6-2-.5-3.5-2-4ZM4 15l4 1-1 4-4-1ZM17 5c4 0 5 6 2 9h-4l-1-6c-.3-2 1.5-3 3-3Zm-2 12h4v4h-4Z"/>',
    accent:
      '<g opacity=".32"><path d="M8 3C4 2 2 8 4 12l4 1 2-6c.6-2-.5-3.5-2-4ZM4 15l4 1-1 4-4-1ZM17 5c4 0 5 6 2 9h-4l-1-6c-.3-2 1.5-3 3-3Zm-2 12h4v4h-4Z"/></g>',
  },
  dumbbell: {
    outline: '<path d="M3 9v6m3-9v12M6 12h12m0-6v12m3-9v6"/>',
    accent: '<g opacity=".32"><rect x="3" y="8" width="4" height="8" rx="2"/><rect x="17" y="8" width="4" height="8" rx="2"/></g>',
  },
  spa: {
    outline: '<path d="M12 21C5 20 3 15 3 10c4 0 7 2 9 5 2-3 5-5 9-5 0 5-2 10-9 11Zm0-6C7 10 9 6 12 3c3 3 5 7 0 12Z"/>',
    accent: '<g opacity=".32"><path d="M12 21C5 20 3 15 3 10c4 0 7 2 9 5 2-3 5-5 9-5 0 5-2 10-9 11Zm0-6C7 10 9 6 12 3c3 3 5 7 0 12Z"/></g>',
  },
  seedling: {
    outline: '<path d="M12 21v-8C5 14 3 9 3 5c6 0 9 2 9 8m0 2c0-6 3-10 9-10 0 6-2 10-9 10"/>',
    accent: '<g opacity=".32"><path d="M12 13C5 14 3 9 3 5c6 0 9 2 9 8Z"/></g>',
  },
  leaf: {
    outline: '<path d="M4 20C0 9 8 3 21 3c0 12-6 20-17 17Zm0 0L17 7"/>',
    accent: '<g opacity=".32"><path d="M4 20C0 9 8 3 21 3c0 12-6 20-17 17Zm0 0L17 7"/></g>',
  },
  feather: {
    outline: '<path d="M4 21 18 5M7 17C0 8 12 1 19 3c4 7-1 15-9 15m0-6h6m-3-5v4"/>',
    accent: '<g opacity=".32"><path d="M7 17C0 8 12 1 19 3c4 7-1 15-9 15Z"/></g>',
  },
  wind: {
    outline: '<path d="M3 12h15a3 3 0 1 1-3 3M3 16h6a2.5 2.5 0 1 1-2.5 2.5"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h11a3 3 0 1 0-3-3"/></g>',
  },
  fire: {
    outline: '<path d="M13 2c1 5-3 5-2 9 1 1 3-1 3-3 4 3 6 6 5 9a7 7 0 0 1-14 0c-1-4 2-7 4-10 0 3 2 3 2 3-2-3 0-6 2-8Z"/>',
    accent: '<g opacity=".32"><path d="M13 2c1 5-3 5-2 9 1 1 3-1 3-3 4 3 6 6 5 9a7 7 0 0 1-14 0c-1-4 2-7 4-10 0 3 2 3 2 3-2-3 0-6 2-8Z"/></g>',
  },
  bolt: {
    outline: '<path d="m14 2-11 12h8l-1 8 11-12h-8Z"/>',
    accent: '<g opacity=".32"><path d="m14 2-11 12h8l-1 8 11-12h-8Z"/></g>',
  },
  lightbulb: {
    outline: '<path d="M8 16a7 7 0 1 1 8 0v3H8Zm0 3h8m-6 3h4M12 12v4m-3-6 3 2 3-2"/>',
    accent: '<g opacity=".32"><path d="M8 16a7 7 0 1 1 8 0v3H8Zm0 3h8m-6 3h4M12 12v4m-3-6 3 2 3-2"/></g>',
  },
  brain: {
    outline:
      '<path d="M12 5a3 3 0 0 0-6-1A4 4 0 0 0 3 11a4 4 0 0 0 2 7 3.5 3.5 0 0 0 7 1V5Zm0 0a3 3 0 0 1 6-1 4 4 0 0 1 3 7 4 4 0 0 1-2 7 3.5 3.5 0 0 1-7 1M6 8l3 1m-5 4 4-1m-1 5 2-3m9-6-3 1m5 4-4-1m1 5-2-3"/>',
    accent:
      '<g opacity=".32"><path d="M12 5a3 3 0 0 0-6-1A4 4 0 0 0 3 11a4 4 0 0 0 2 7 3.5 3.5 0 0 0 7 1V5Zm0 0a3 3 0 0 1 6-1 4 4 0 0 1 3 7 4 4 0 0 1-2 7 3.5 3.5 0 0 1-7 1M6 8l3 1m-5 4 4-1m-1 5 2-3m9-6-3 1m5 4-4-1m1 5-2-3"/></g>',
  },
  bullseye: {
    outline: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="12" r="9"/></g>',
  },
  compass: {
    outline: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="12" r="9"/></g>',
  },
  route: {
    outline: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M9 5h8a4 4 0 0 1 0 8H7a4 4 0 0 0 0 8h6"/>',
    accent: '<g opacity=".32"><circle cx="5" cy="5" r="2"/></g>',
  },
  'scale-balanced': {
    outline: '<path d="M12 3v18M5 5h14M3 21h18M5 5l-4 9h8Zm14 0-4 9h8ZM1 14a4 4 0 0 0 8 0m6 0a4 4 0 0 0 8 0"/>',
    accent: '<g opacity=".32"><path d="M12 3v18M5 5h14M3 21h18M5 5l-4 9h8Zm14 0-4 9h8ZM1 14a4 4 0 0 0 8 0m6 0a4 4 0 0 0 8 0"/></g>',
  },
  'ruler-combined': {
    outline: '<path d="M3 3h6v12h12v6H3ZM6 7h3M6 11h3m4 7v3m4-3v3"/>',
    accent: '<g opacity=".32"><path d="M3 3h6v12h12v6H3ZM6 7h3M6 11h3m4 7v3m4-3v3"/></g>',
  },
  'layer-group': {
    outline: '<path d="m2 8 10-5 10 5-10 5Zm0 5 10 5 10-5M2 17l10 5 10-5"/>',
    accent: '<g opacity=".32"><path d="m2 8 10-5 10 5-10 5Zm0 5 10 5 10-5M2 17l10 5 10-5"/></g>',
  },
  'puzzle-piece': {
    outline: '<path d="M9 3H3v6h2a2 2 0 1 1 0 4H3v8h7v-2a2 2 0 1 1 4 0v2h7v-7h-2a2 2 0 1 1 0-4h2V3h-8v2a2 2 0 1 1-4 0Z"/>',
    accent: '<g opacity=".32"><path d="M9 3H3v6h2a2 2 0 1 1 0 4H3v8h7v-2a2 2 0 1 1 4 0v2h7v-7h-2a2 2 0 1 1 0-4h2V3h-8v2a2 2 0 1 1-4 0Z"/></g>',
  },
  hand: {
    outline:
      '<path d="M7 12V5a1.5 1.5 0 0 1 3 0m0 7V3.5a1.5 1.5 0 0 1 3 0V12m0-7a1.5 1.5 0 0 1 3 0v7m0-5a1.5 1.5 0 0 1 3 0v9a6 6 0 0 1-11 3l-4-6a1.5 1.5 0 0 1 2-2Z"/>',
    accent:
      '<g opacity=".32"><path d="M7 12V5a1.5 1.5 0 0 1 3 0m0 7V3.5a1.5 1.5 0 0 1 3 0V12m0-7a1.5 1.5 0 0 1 3 0v7m0-5a1.5 1.5 0 0 1 3 0v9a6 6 0 0 1-11 3l-4-6a1.5 1.5 0 0 1 2-2Z"/></g>',
  },
  'ear-listen': {
    outline: '<path d="M8 17c0 5 6 5 6 0 0-3 4-3 4-8A6 6 0 0 0 6 9m3 1a3 3 0 0 1 6 0c0 2-3 2-3 4M21 5c2 3 2 6 0 9"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="10" r="3"/></g>',
  },
  headphones: {
    outline: '<path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/>',
    accent: '<g opacity=".32"><rect x="3" y="12" width="4" height="8" rx="2"/></g>',
  },
  fingerprint: {
    outline: '<path d="M7 10a5 5 0 0 1 10 0v5c0 2 1 3 2 4M10 21c2-3 3-6 3-11a1 1 0 0 0-2 0c0 4-.5 7-3 9m-1-5v-3m9 10-2-4"/>',
    accent:
      '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10a8 8 0 0 1 16 0v3m-16 1v3"/></g>',
  },
  instagram: {
    outline:
      '<rect x="3" y="3" width="18" height="18" rx="5.25"/><circle cx="12" cy="12" r="3.75"/><circle cx="17.25" cy="6.75" r="1" fill="currentColor" stroke="none"/>',
    accent: '',
    monochrome: true,
  },
  facebook: {
    outline:
      '<g transform="translate(7 4) scale(.03125)"><path fill="currentColor" stroke="none" d="M80 299.3l0 212.7 116 0 0-212.7 86.5 0 18-97.8-104.5 0 0-34.6c0-51.7 20.3-71.5 72.7-71.5 16.3 0 29.4 .4 37 1.2l0-88.7C291.4 4 256.4 0 236.2 0 129.3 0 80 50.5 80 159.4l0 42.1-66 0 0 97.8 66 0z"/></g>',
    accent: '',
    monochrome: true,
  },
  whatsapp: {
    outline:
      '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.4 7.6L3 20.7l1.4-5.1A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M9.1 8.8h1.5l.7 1.8-.9.8a5 5 0 0 0 2.3 2.3l.8-.9 1.8.7v1.4c-3.5.3-6.8-3-6.5-6.5Z" stroke-width="1.4"/>',
    accent: '',
    monochrome: true,
  },
  google: {
    outline: '<path d="M20 7a8.5 8.5 0 1 0 1 5"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 12h8v6"/></g>',
  },
  apple: {
    outline: '<path d="M12 7c-3-3-8-1-8 4 0 5 3 10 5 10 1.5 0 2-1 3-1s1.5 1 3 1c2 0 4-3 5-6-4-2-4-5 0-7-3-3-6-3-8-1Zm0-3c0-2 2-3 4-3 0 2-2 4-4 4Z"/>',
    accent:
      '<g opacity=".32"><path d="M12 7c-3-3-8-1-8 4 0 5 3 10 5 10 1.5 0 2-1 3-1s1.5 1 3 1c2 0 4-3 5-6-4-2-4-5 0-7-3-3-6-3-8-1Zm0-3c0-2 2-3 4-3 0 2-2 4-4 4Z"/></g>',
  },
  paypal: {
    outline:
      '<path d="m6 21 3-18h6.2c4.1 0 6 2.2 5.3 5.7-.7 3.6-3.2 5.8-7.2 5.8h-3L9.2 21Z"/><path d="M11.1 6.5h3.5c1.7 0 2.4.8 2.1 2.2-.3 1.6-1.5 2.3-3.2 2.3h-3.1Z"/>',
    accent: '',
    monochrome: true,
  },
  'ballet-shoes': {
    outline:
      '<path d="M7 2C4 2 2 9 2 15c0 4 2 6 4 6s4-3 4-7V5c0-2-1-3-3-3Zm10 1c-3 0-4 2-3 5l1 9c.5 4 3 6 5 5s3-4 2-8l-2-8c-.5-2-1-3-3-3ZM4 10l5 2m6-1 5-1M5 7l4 2m6-2 4-1"/>',
    accent:
      '<g opacity=".32"><path d="M7 2C4 2 2 9 2 15c0 4 2 6 4 6s4-3 4-7V5c0-2-1-3-3-3Zm10 1c-3 0-4 2-3 5l1 9c.5 4 3 6 5 5s3-4 2-8l-2-8c-.5-2-1-3-3-3ZM4 10l5 2m6-1 5-1M5 7l4 2m6-2 4-1"/></g>',
  },
  barre: {
    outline: '<path d="M5 4v18M19 4v18"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9h20"/></g>',
  },
  'body-posture': {
    outline: '<circle cx="10" cy="4" r="2.5"/><path d="M10 8c-3 4 2 6 1 10l-2 4m2-4 4 4M6 10l8 2"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 3v3m0 3v3m0 3v3m0 3v1"/></g>',
  },
  floorwork: {
    outline: '<circle cx="4.5" cy="13" r="2.5"/><path d="M8 14h5l4-6 5 4M12 14l5 4h5"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21h20"/></g>',
  },
  balance: {
    outline: '<circle cx="12" cy="4" r="2.5"/><path d="M12 8v7l-4 7m4-7 8-3"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 8 8 3 8-5"/></g>',
  },
  'dance-turn': {
    outline: '<circle cx="12" cy="4" r="2.5"/><path d="M12 8v8m-5-5h10m-5 5-3 5m3-5 3 5"/>',
    accent:
      '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14a9 9 0 0 1 3-7m-4 0h4v4M21 10a9 9 0 0 1-3 7m4 0h-4v-4"/></g>',
  },
  choreography: {
    outline:
      '<path d="M8 5h6a3.5 3.5 0 0 1 0 7h-3a3.5 3.5 0 0 0 0 7h9"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="12" r="2"/><circle cx="4" cy="19" r="2"/>',
    accent: '<g opacity=".32"><circle cx="4" cy="5" r="2"/><circle cx="20" cy="12" r="2"/><circle cx="4" cy="19" r="2"/></g>',
  },
  heels: {
    outline: '<path d="M4 8c3 0 4 2 7 6 1.3 1.7 3 2 5 2h3a2 2 0 0 1 2 2v1h-9c-1.5 0-2.7-.7-3.5-2L6 13l-1 8H3V11a3 3 0 0 1 1-3Z"/>',
    accent: '<g opacity=".32"><path d="M12 16h7a2 2 0 0 1 2 2v1h-9Z"/></g>',
  },
  stage: {
    outline: '<path d="M2 21h20M2 5V2h20v3M3 5v13h3V5m12 0v13h3V5"/><circle cx="12" cy="8.5" r="2"/><path d="M12 12v4m-4-4 4 1 4-1m-4 4-3 3m3-3 3 3"/>',
    accent:
      '<g opacity=".32"><rect x="2" y="2" width="20" height="3" rx="2"/><rect x="3" y="5" width="3" height="13" rx="0"/><rect x="18" y="5" width="3" height="13" rx="0"/></g>',
  },
  rhythm: {
    outline: '<path d="M14 18V5l7-2v5l-7 2"/><circle cx="11" cy="18" r="3"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h5m-5 5h3m-3 5h5"/></g>',
  },
  'core-strength': {
    outline: '<path d="m3 6 4-3c3 2 7 2 10 0l4 3-4 4-1 12H8L7 10Z"/><path d="M12 10v8m-2-4h4"/>',
    accent: '<g opacity=".32"><path d="M10 9h4v11h-4Z"/></g>',
  },
  flexibility: {
    outline: '<circle cx="14" cy="4" r="2.5"/><path d="m12 8-4 6-5 6m5-6 9 6h5M12 8l7 4 3-2"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a6 6 0 0 1 5-4"/></g>',
  },
  breathing: {
    outline:
      '<path d="M9 7C5.5 8.8 3 13.5 3 18.5c0 1.3 1 2 2.2 2 2.3 0 4.8-1 4.8-3V9q0-2.5-1-2Zm6 0c3.5 1.8 6 6.5 6 11.5 0 1.3-1 2-2.2 2-2.3 0-4.8-1-4.8-3V9q0-2.5 1-2Z"/><path d="M12 2.5V8m0 0-5 6m5-6 5 6"/>',
    accent: '<g opacity=".24"><path d="M9 7C5.5 8.8 3 13.5 3 18.5c0 1.3 1 2 2.2 2 2.3 0 4.8-1 4.8-3V9q0-2.5-1-2Z"/></g>',
  },
  'partner-contact': {
    outline: '<circle cx="5" cy="4.5" r="2.3"/><circle cx="19" cy="4.5" r="2.3"/><path d="M5 10l2 6-4 6m4-6 4 6m8-12-2 6 4 6m-4-6-4 6"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 9 4 4 4-4 4 4 4-4"/></g>',
  },
  jump: {
    outline: '<circle cx="11" cy="4" r="2.3"/><path d="m4 8 7 2 7-5m-7 5 3 4-8 4m8-4 8 4"/>',
    accent: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h18"/></g>',
  },
  'yoga-pose': {
    outline: '<circle cx="12" cy="4" r="2.5"/><path d="M12 8v6m-6-4 6 2 6-2M8 15l-5 3c-2 2 1 4 5 3l8-3m0-3 5 3c2 2-1 4-5 3l-8-3"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="4" r="2.5"/></g>',
  },
  'warm-up': {
    outline: '<circle cx="12" cy="4.5" r="2"/><path d="M12 8v5M6 6l6 3 6-3m-6 7-4 7m4-7 4 7"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="4.5" r="2"/></g>',
  },
  krump: {
    outline:
      '<circle cx="12" cy="4" r="2"/><path d="M12 8v7m0-6-5 3-3-4m8 1 5 3 3-4m-8 7-4 2-3 4m7-6 4 2 3 4"/><rect x="3" y="6" width="2" height="2" rx=".6"/><rect x="19" y="6" width="2" height="2" rx=".6"/>',
    accent: '<g opacity=".32"><circle cx="12" cy="4" r="2"/></g>',
  },
  moon: {
    outline: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.75 6.75 0 0 0 10.5 10.5Z"/>',
    accent: '',
    monochrome: true,
  },
  sun: {
    outline: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2m0 15v2M2.5 12h2m15 0h2M5.3 5.3l1.4 1.4m10.6 10.6 1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    accent: '',
    monochrome: true,
  },
};

export const aliases = {
  times: 'xmark',
  'external-link-alt': 'arrow-up-right-from-square',
  'calendar-alt': 'calendar-days',
  'map-marker-alt': 'location-dot',
  search: 'magnifying-glass',
  'book-open': 'book',
  'list-ul': 'list',
};

const canonical = (name) => {
  const key = aliases[name] ?? name;
  if (!icons[key]) throw new Error(`Icona InBallet sconosciuta: ${name}`);
  return key;
};

const ink = (content, color = 'currentColor') =>
  `<g fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${content}</g>`;

const monochrome = ({ outline, accent }) => ink(outline + (accent.includes('stroke="currentColor"') ? accent : ''));

export function drawing(name) {
  const data = icons[canonical(name)];
  if (data.monochrome) return monochrome(data);
  return `<g color="var(--ib-tone, #87ceeb)" fill="currentColor" stroke="none">${data.accent}</g>${ink(data.outline, 'var(--ib-ink, currentColor)')}`;
}

export function svg(name, { layer } = {}) {
  const data = icons[canonical(name)];
  const content =
    layer === 'monochrome' || (layer === 'outline' && data.monochrome)
      ? monochrome(data)
      : layer === 'outline'
        ? ink(data.outline)
        : layer === 'accent'
          ? `<g fill="currentColor" stroke="none">${data.monochrome ? '' : data.accent}</g>`
          : drawing(name);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color="#3b72a0">${content}</svg>`;
}
