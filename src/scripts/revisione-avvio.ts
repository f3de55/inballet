import { COOKIE_REVISIONE } from '../lib/revisione-comune';

const attiva = document.cookie.split('; ').includes(`${COOKIE_REVISIONE}=1`);
const anteprima = window.self !== window.top && new URLSearchParams(location.search).has('revisione');
if ((attiva && window.self === window.top) || anteprima) import('./revisione');
