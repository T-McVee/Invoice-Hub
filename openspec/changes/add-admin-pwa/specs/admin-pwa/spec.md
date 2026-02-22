## ADDED Requirements

### Requirement: Web App Manifest
The admin portal SHALL serve a web app manifest that enables installation as a standalone PWA.

#### Scenario: Manifest is discoverable
- **WHEN** a user visits any admin portal page
- **THEN** the HTML contains a `<link rel="manifest" href="/manifest.json">` tag
- **AND** the manifest includes `name`, `short_name`, `icons` (192x192, 512x512), `start_url` set to `/dashboard`, and `display` set to `standalone`

#### Scenario: Client portal does not reference manifest
- **WHEN** a user visits a client portal page (`/portal/*`)
- **THEN** the HTML SHALL NOT contain a manifest link or PWA meta tags

### Requirement: PWA Meta Tags
The admin portal SHALL include PWA meta tags for cross-browser and iOS compatibility.

#### Scenario: Meta tags present on admin pages
- **WHEN** a user visits any admin portal page
- **THEN** the HTML contains `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, and `<link rel="apple-touch-icon">`

### Requirement: Service Worker
The admin portal SHALL register a service worker that caches static assets and provides an offline fallback.

#### Scenario: Service worker registers on admin pages
- **WHEN** a user visits any admin portal page in a supported browser
- **THEN** a service worker is registered at `/sw.js`

#### Scenario: Static assets served from cache
- **WHEN** the service worker is active and a previously cached static asset is requested
- **THEN** the asset is served from cache without a network request

#### Scenario: Offline fallback
- **WHEN** the user is offline and navigates to an admin page that is not cached
- **THEN** the service worker responds with an offline fallback page indicating the user is offline
