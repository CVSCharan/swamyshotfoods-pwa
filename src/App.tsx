import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { useStoreConfigSSE } from './hooks/useStoreConfigSSE';

// Layout & Pages
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ShopStatus } from './pages/ShopStatus';
import { MenuManagement } from './pages/MenuManagement';
import { AddUser } from './pages/AddUser';

// Route Guard for Authenticated Users
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-400 font-display">
        <svg className="animate-spin h-8 w-8 text-gold-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Loading Portal...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

// SSE Manager Wrapper to connect/disconnect based on Auth state and page visibility
const SSEManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const { connect, disconnect } = useStoreConfigSSE();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnect();
      return;
    }

    // Initial connection
    connect();

    // Battery Optimization: disconnect when tab is backgrounded, reconnect when active
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🔋 Visibility: hidden - pausing SSE connection');
        disconnect();
      } else {
        console.log('🔋 Visibility: visible - resuming SSE connection');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disconnect();
    };
  }, [isAuthenticated]);

  return <>{children}</>;
};

function App() {
  const { loadToken, isLoading, isAuthenticated } = useAuthStore();

  // Load auth state from storage on mount
  useEffect(() => {
    loadToken();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-400 font-display">
        <svg className="animate-spin h-8 w-8 text-gold-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <SSEManager>
        <Routes>
          {/* Public Login Route */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />

          {/* Protected Main Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ShopStatus />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <MenuManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddUser />
              </ProtectedRoute>
            }
          />

          {/* Catch All Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SSEManager>
    </BrowserRouter>
  );
}

export default App;
