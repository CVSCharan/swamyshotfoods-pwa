# Swamy's Hot Foods - PWA Admin Portal

A lightweight, premium, real-time Progressive Web Application (PWA) Admin Portal built to manage shop status, notice boards, holiday modes, and food menu operations for Swamy's Hot Foods.

Designed with a high-fidelity, dark-mode obsidian interface featuring saffron orange highlights, smooth transition states, and a clean frameless responsive layout.

---

## 🚀 Key Features

*   **Real-time Event Broadcasting (SSE)**: Automatically syncs shop status updates, notice boards, and timing configurations across all active dashboards in real-time.
*   **Dual-Channel Reliable Loading (HTTP GET + SSE)**: Avoids infinite loader screens on slow networks by fetching initial configurations immediately via a standard HTTP GET call, then opening an EventSource stream for subsequent updates.
*   **Leak-Proof Connection Lifecycle**: Utilizes custom connection tracking refs to cancel stale API updates and abort/clean up EventSource connections, preventing memory leaks during fast page navigations or React StrictMode double mounts.
*   **Premium Frameless Layout**: Relocates user account controls to a compact dropdown in the top header navbar, completely eliminating borders, dividers, and sidebar clutter for a modern, seamless design.
*   **Complete Offline Resilience**: Detects network disconnections, dynamically switches to a secure cached state, showing an `OFFLINE` status dot, and initiates an automatic reconnection loop.

---

## 🛠 Tech Stack

*   **Frontend**: React (v18) + TypeScript
*   **Build Tool**: Vite (v8)
*   **State Management**: Zustand
*   **Icons**: Lucide React
*   **Styling**: Tailwind CSS (obsidian base `#0c0a09` + gold/saffron accents `#d97706`)
*   **Offline/Service Workers**: Vite PWA Plugin (`vite-plugin-pwa` generating service workers)

---

## 📦 Project Setup

### 1. Environment Configuration
Create a `.env.development` or `.env.production` file in the root of the project to set the API endpoints:

```env
VITE_API_URL=http://localhost:5001/api
```

*(Note: `.env*` files are ignored by git to keep credentials and local environment configs secure.)*

### 2. Install Dependencies
Run the package installation:
```bash
npm install
```

### 3. Run Development Server
Start the Vite development server (typically launches on port `5173`):
```bash
npm run dev
```

### 4. Build for Production
Compiles the TypeScript application and packages the static assets along with service worker scripts into the `dist/` directory:
```bash
npm run build
```

---

## 💡 Architecture Notes

### EventSource Lifecycle & Race Condition Protection
Under the hood, real-time sync is managed by the `useStoreConfigSSE` hook. To ensure React's async operations don't leak, connection IDs are tracked:
*   When `connect()` is fired, an internal `connectionIdRef` is incremented.
*   If the hook unmounts or `disconnect()` is called during the HTTP GET fetch, the callback detects the ID change (`currentId !== connectionIdRef.current`) and cancels further setup.
*   This prevents duplicate background EventSources and guarantees that memory is cleaned up correctly during rapid page toggles.

### Authentication Response Interceptors
The global client interceptor in `api.ts` filters out authentication requests (like `/auth/login`) from general `401 Unauthorized` handling. This allows invalid credentials to throw validation errors back to the login page (displaying "Invalid credentials" in the UI) rather than falsely triggering a "session has expired" alert-reload loop.
