# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CatchUp is an Electron-based desktop application built with Vue 3 that automates content summarization for subscribed channels. The application features user authentication, subscription management, media playback, and a tiered subscription system.

## Tech Stack

- **Desktop Framework**: Electron (v38.3.0)
- **Frontend**: Vue 3 (Composition API) with Vite
- **State Management**: Pinia
- **Routing**: Vue Router (hash mode for Electron compatibility)
- **UI Components**: Font Awesome icons
- **Video Player**: Plyr
- **API Client**: Axios with automatic token refresh
- **Payment Integration**: Paddle.js
- **Localization**: vue-i18n
- **Build Tools**: Vite, Electron Builder, Electron Forge

## Development Commands

```bash
# Start development server (concurrent Vite + Electron)
npm start

# Run Vite dev server only
npm run dev

# Run Electron in development mode
npm run electron:dev

# Build Vue app
npm run build

# Preview production build
npm run preview

# Package application (Electron Forge)
npm run package

# Create installers
npm run make

# Build for specific platforms
npm run build:win    # Windows x64
npm run build:mac    # macOS x64
npm run build:linux  # Linux x64
```

## Architecture Overview

### Electron Architecture

- **Main Process** (`electron/main.js`): Manages window creation, IPC communication, and OAuth flows
- **Preload Script** (`electron/preload.js`): Exposes limited IPC APIs to renderer via contextBridge
- **Renderer Process**: Vue 3 application running in BrowserWindow

The app uses `nodeIntegration: true` and `contextIsolation: false` for development convenience, but preload script provides a safer IPC bridge.

### Vue Application Structure

#### Entry Points
- `src/main.js`: Vue app initialization, plugin registration, Font Awesome setup
- `src/App.vue`: Root component, handles auth initialization
- `src/router/index.js`: Route definitions with auth guards

#### Configuration Management

**CRITICAL**: The app uses a centralized configuration system in `src/config/app.js`:

```javascript
export const APP_CONFIG = {
  name: "CatchUp",
  slogan: { zh: "...", en: "..." },
  description: "...",
  // ...
}
```

**When changing app name, slogan, or branding:**
1. Edit `src/config/app.js` only
2. All components importing from this file will automatically update
3. Also update `electron/main.js` constants (APP_NAME, APP_DESCRIPTION) for Electron window title

#### State Management (Pinia Stores)

Located in `src/stores/`:

- **auth.js**: User authentication, token management, OAuth flows
  - `initAuth()`: Validates stored token on startup, fetches user data
  - `login()`, `register()`, `oauthLogin()`: Authentication methods
  - `updateToken()`: Syncs token after refresh

- **plans.js**: Subscription plan management
  - Transforms API plan data to app format
  - Tracks user's current subscription and usage limits
  - `canAddChannel()`, `canAddMedia()`, `canChat()`: Permission checks

- **subscriptions.js**: Channel subscriptions (YouTube, Spotify, etc.)
  - Manages subscriptions per media source
  - Enforces subscription limits via plans store

- **media.js**: Media content (videos, podcasts)
  - Handles pagination per media source
  - Fetches media lists with range filters (all, today, week, month)

#### API Client (`src/api/index.js`)

Axios client with advanced features:
- Base URL from `VITE_API_URL` env variable or defaults to `http://localhost:3000/api`
- **Request interceptor**: Adds Bearer token and Accept-Language header
- **Response interceptor**:
  - Handles 401 by automatically refreshing tokens
  - Implements request queuing during token refresh
  - Clears auth state on refresh failure
- API endpoints organized by domain: auth, user, rss, media, subscription

#### Routing (`src/router/index.js`)

Uses `createWebHashHistory()` for Electron compatibility (no server-side routing needed).

**Route guards**:
- Electron environment detection: Auto-redirects `/` to `/login` in Electron
- Auth protection: Routes with `meta: { requiresAuth: true }` require authentication
- Redirect logic: Logged-in users can't access `/login`

**Key routes**:
- `/`: Home (web only, redirects to login in Electron)
- `/login`: Login/registration
- `/dashboard`: Main content view (requires auth)
- `/player`: Media player (requires auth)
- `/settings`: User settings (requires auth)
- `/subscription`: Subscription management

### Views Organization

- **Login.vue**: Combined login/registration with OAuth support
- **Dashboard.vue**: Main content dashboard with media sources
- **Player.vue**: Video/audio player with subtitles and chat
- **Settings.vue**: User profile and preferences
- **Subscription.vue**: Plan selection and payment (Paddle integration)
- **Home.vue**: Landing page (web version)
- Legal pages: PrivacyPolicy, TermsOfService, CookiePolicy, RefundPolicy, Faq

### IPC Communication

The app uses Electron IPC for OAuth flows:

**Main process handlers** (`electron/main.js`):
- `oauth-login`: Opens OAuth window for Google/Facebook login
- Monitors redirects to extract authorization codes
- Sends results back via `oauth-result` event

**Renderer side** (`src/stores/auth.js`):
- `oauthLogin()` sends provider to main process
- Listens for `oauth-result` to complete authentication

### Environment Detection

The app detects Electron environment using:
```javascript
const isElectron = typeof process !== 'undefined' && process.versions && !!process.versions.electron
```

This is used for:
- Conditional routing (force login in Electron)
- Feature toggles (IPC availability)
- Environment-specific behavior

## Build Process

### Development Build
1. Vite serves Vue app on `http://localhost:5173`
2. Electron loads from dev server
3. Hot reload enabled for Vue components

### Production Build
1. `vite build` compiles Vue app to `dist/`
2. Electron Builder packages with `dist/` and `electron/` directories
3. `forge.config.js` runs `npm run build` as prePackage hook

### Electron Forge Configuration

- **Packager**: Ignores src/, vite.config.js, node_modules during packaging
- **Makers**: Squirrel (Windows), ZIP (macOS), DEB/RPM (Linux), WIX (Windows installer)
- **Fuses**: Security options enabled (cookie encryption, ASAR integrity, etc.)

## Important Development Notes

### Path Aliasing
Vite configured with `@` alias pointing to `src/`:
```javascript
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
```

### Styling
- Global styles: `src/assets/styles/main.css`
- CSS variables: `src/assets/styles/variables.css`
- Component styles: Scoped styles in `.vue` files

### Token Management
- Tokens stored in localStorage
- Axios interceptor handles automatic refresh on 401
- Auth store syncs token state across app
- Token validation occurs on app initialization via `initAuth()`

### OAuth Integration
OAuth is partially implemented:
- Frontend flow complete (Electron IPC, window handling)
- Requires backend API endpoints:
  - `POST /v1/auth/oauth/callback` to exchange code for token
- Update `electron/main.js` with real OAuth client IDs (currently uses placeholders)

### Testing
No test framework currently configured. The package.json test script exits with error.

### Known Patterns

1. **Store initialization**: Auth store's `initAuth()` is called in App.vue on mount to restore session
2. **Lazy loading**: All routes use dynamic imports for code splitting
3. **Font Awesome**: Icons imported explicitly in main.js, not tree-shaken automatically
4. **Error handling**: API errors return as rejected promises with response object
5. **Circular dependencies**: Plans store dynamically imported in auth/subscriptions stores to avoid cycles

## Common Tasks

### Adding a new media source
1. Add source to `currentSource` and `mediaData` in `src/stores/media.js`
2. Add pagination info to `paginationInfo`
3. Update Dashboard.vue UI to include new source tab
4. Ensure backend API supports the new type parameter

### Modifying subscription limits
Limits are fetched from backend via `/v1/plans`. The plans store transforms them into:
```javascript
limits: {
  channels: apiPlan.channel_limit,
  media: apiPlan.video_limit,
  chat: apiPlan.chat_limit,
}
```

### Adding new API endpoints
Edit `src/api/index.js` and add to the appropriate domain object (auth, user, rss, media, subscription).

### Changing app branding
1. Edit `src/config/app.js` for Vue components
2. Edit constants in `electron/main.js` (APP_NAME, APP_DESCRIPTION)
3. Update `package.json` (name, productName, description)
4. Update `forge.config.js` maker configurations
5. Replace icon assets in `src/assets/`
