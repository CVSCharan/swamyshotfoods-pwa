import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {
    console.log('Admin Panel ready to work offline')
  },
})

// Check for updates every 1 hour
setInterval(() => {
  updateSW(true)
}, 60 * 60 * 1000)

// Also check when tab becomes visible after backgrounding
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    updateSW(true)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
