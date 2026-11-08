/// <reference types="google.maps" />
import { PUBLIC_GOOGLE_MAPS_KEY } from 'astro:env/client';

let loading: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (typeof google !== 'undefined' && google.maps?.places) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const callback = '__inballetMapsReady';
    Object.assign(window, { [callback]: () => resolve() });
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(PUBLIC_GOOGLE_MAPS_KEY)}&libraries=places&loading=async&callback=${callback}`;
    s.async = true;
    s.onerror = () => reject(new Error('Google Maps non raggiungibile'));
    document.head.appendChild(s);
  });
  return loading;
}

export function whenNear(el: Element, fn: () => void, margin = '600px 0px') {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      fn();
    },
    { rootMargin: margin },
  );
  io.observe(el);
}
