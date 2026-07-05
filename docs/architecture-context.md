# PWA Implementation Context & Architecture

## Overview
This repository (`swamyshotfoods-pwa`) acts as the Admin Dashboard. It is a Progressive Web App (PWA) used by the shop owner to manage menus, toggle shop status, and upload active cooking images.

## Key Technologies
- **Vite + React (SPA)**: Fast, client-side only application.
- **Zustand**: Global state management.
- **Tailwind CSS**: UI and styling.
- **Axios / Fetch ApiClient**: HTTP networking.

## System Architecture

### 1. Admin Management Flow
- Admins log in (handled by `useAuthStore.ts`) and receive a JWT token.
- The `apiClient.ts` automatically attaches this JWT to all `PUT`, `POST`, and `DELETE` requests.
- Unauthorized responses (401) trigger a forced logout and redirect.

### 2. Optimistic vs Server-Truth Updating
- **Best Practice implemented**: When the admin toggles a switch (e.g., `isShopOpen`), the PWA sends a `PUT` request to the API. 
- It waits for the **server's response** (`const updatedConfig = await storeConfigService.update(...)`) and updates the local Zustand state using the validated HTTP response.
- **Avoiding SSE Loops**: By relying on the HTTP response for actions it initiates, it avoids race conditions with the SSE broadcast (which it also listens to in order to sync if *another* admin makes a change).

### 3. File Uploads
- Modifying the shop's avatar or active cooking image involves converting files to Data URLs or Form Data and pushing them securely via the `apiClient.upload` interface.

## Context Retrieval for AI Assistants
- **Routing**: Client-side routing with React Router. Protected routes require active auth.
- **State Updates**: When modifying `ShopStatus.tsx`, ensure any UI state accurately reflects the `config` object from the Zustand store. Do not decouple local React state from the global store unless strictly necessary for form inputs.

### Mobile Caching & Lifecycle Optimization
- **Page Visibility API (`document.hidden`)**: Implemented in SSE hooks (`useStoreConfigSSE`) to automatically pause and resume network requests when the app enters or leaves the background. This guarantees data freshness when an admin re-opens the app.
- **Vite PWA Service Worker Auto-Update**: Integrated `virtual:pwa-register` in `main.tsx` with a polling interval. The app periodically checks the server for new Service Worker versions and automatically triggers an update to clear aggressive mobile caching and load the newest assets.
