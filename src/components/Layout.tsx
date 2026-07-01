import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store, ChefHat, UserPlus, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useStoreConfigStore } from '../stores/useStoreConfigStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isConnected } = useStoreConfigStore();

  const handleLogoutClick = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout().then(() => {
        navigate('/login');
      });
    }
  };

  const navItems = [
    { path: '/', label: 'Shop Status', icon: Store, role: ['admin', 'staff', 'user'] },
    { path: '/menu', label: 'Menu', icon: ChefHat, role: ['admin', 'staff', 'user'] },
    { path: '/users', label: 'Add User', icon: UserPlus, role: ['admin'] },
  ];

  const filteredNavItems = navItems.filter((item) =>
    user ? item.role.includes(user.role) : false
  );

  return (
    <div className="h-screen w-full flex overflow-hidden bg-neutral-50 text-neutral-900 font-sans">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 shrink-0 h-full">
        {/* Brand Header */}
        <div className="h-16 shrink-0 flex items-center gap-3 px-6 border-b border-neutral-200">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-50 border border-saffron-500/20 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-neutral-900 text-sm tracking-wide leading-tight">
              Swamy's Hot Foods
            </h1>
            <p className="text-[10px] text-saffron-500 font-display font-semibold tracking-widest uppercase">
              Pure Veg
            </p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold font-display transition-all duration-200 ${
                  isActive
                    ? 'bg-saffron-500 text-white shadow-[0_4px_12px_rgba(255,149,0,0.15)]'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Connection Status placed at bottom of Sidebar for clean UI */}
        <div className="p-4 shrink-0 border-t border-neutral-200">
           <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-center gap-2">
                {isConnected ? <Wifi size={14} className="text-emerald-500" /> : <WifiOff size={14} className="text-red-500" />}
                <span className={`text-[10px] font-bold uppercase tracking-wider font-display ${isConnected ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isConnected ? 'System Live' : 'Offline'}
                </span>
              </div>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse-slow' : 'bg-red-500'}`} />
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-50 h-full relative">
        
        {/* Top Header bar */}
        <header className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Brand indicator */}
            <div className="flex md:hidden items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-50 border border-saffron-500/20">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-display font-extrabold text-sm text-saffron-500">
                Swamy's
              </span>
            </div>
            
            {/* Page title placeholder */}
            <span className="hidden md:inline-block text-xs font-semibold text-neutral-500 font-display uppercase tracking-wider">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Portal'}
            </span>
          </div>

          {/* Profile section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end leading-none gap-1">
                <span className="text-xs font-bold text-neutral-900">{user?.username}</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider border border-neutral-200">
                  {user?.role}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center font-display font-bold text-saffron-500 text-sm shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>

              <button
                onClick={handleLogoutClick}
                className="p-1.5 rounded-xl text-neutral-500 hover:text-red-500 hover:bg-neutral-100 border border-neutral-200 cursor-pointer transition-colors duration-200"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 pb-content-safe">
          <div className="max-w-5xl w-full mx-auto">
            {children}
          </div>
        </main>

        {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-nav-safe pb-safe bg-white/90 backdrop-blur-lg border-t border-neutral-200 flex items-center justify-around px-2 z-40">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-saffron-500' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <Icon size={20} className={isActive ? 'scale-110' : ''} />
                <span className="text-[9px] font-bold font-display mt-1 tracking-wide">
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
