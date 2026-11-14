import { COOKIE_REVISIONE } from '../lib/revisione-comune';

if (window.self === window.top && document.cookie.split('; ').includes(`${COOKIE_REVISIONE}=1`)) import('./revisione');
