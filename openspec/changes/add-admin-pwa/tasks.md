## 1. Assets & Configuration
- [x] 1.1 Create app icons (192x192 and 512x512 PNGs) in `public/icons/`
- [x] 1.2 Create `public/manifest.json` with app name, icons, display mode (`standalone`), start URL (`/dashboard`), theme/background colors, and scope

## 2. Meta Tags
- [x] 2.1 Add manifest link and PWA meta tags (`theme-color`, `apple-mobile-web-app-capable`, `apple-touch-icon`) to the admin layout metadata

## 3. Service Worker
- [x] 3.1 Create `public/sw.js` with static asset caching (cache-first) and API route handling (network-first)
- [x] 3.2 Create an offline fallback page served by the service worker when the network is unavailable
- [x] 3.3 Add service worker registration script to the admin layout (client component)

## 4. Validation
- [ ] 4.1 Run Lighthouse PWA audit and verify installability criteria are met
- [ ] 4.2 Test offline fallback page renders when network is disconnected
