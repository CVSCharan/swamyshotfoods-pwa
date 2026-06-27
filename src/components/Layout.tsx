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
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-stone-950 flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex md:w-64 bg-stone-900 flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-950 border border-gold-500/20 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-display font-bold text-stone-100 text-sm tracking-wide">
              Swamy's Hot Foods
            </h1>
            <p className="text-[10px] text-gold-500 font-display font-semibold tracking-widest uppercase">
              Pure Veg
            </p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold font-display transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-500 text-stone-950 shadow-[0_4px_12px_rgba(244,196,48,0.15)]'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header bar */}
        <header className="h-16 bg-stone-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Brand indicator */}
            <div className="flex md:hidden items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-950 border border-gold-500/20">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-display font-extrabold text-sm text-gold-500">
                Swamy's
              </span>
            </div>
            
            {/* Page title placeholder */}
            <span className="hidden md:inline-block text-xs font-semibold text-stone-400 font-display uppercase tracking-wider">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Portal'}
            </span>
          </div>

          {/* Real-time Connection status & User Profile */}
          <div className="flex items-center gap-4">
            {/* Connection Dot */}
            <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-full border border-stone-800">
              {isConnected ? (
                <>
                  <Wifi size={14} className="text-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider font-display hidden sm:inline">
                    Live
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow" />
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-red-500" />
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider font-display hidden sm:inline">
                    Offline
                  </span>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                </>
              )}
            </div>

            {/* Profile section */}
            <div className="flex items-center gap-3 pl-1">
              {/* User text (hidden on small viewports, visible on md+) */}
              <div className="hidden md:flex flex-col items-end leading-none gap-1">
                <span className="text-xs font-bold text-stone-200">{user?.username}</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-stone-800 text-stone-400 font-semibold uppercase tracking-wider border border-stone-700">
                  {user?.role}
                </span>
              </div>

              {/* Avatar circle */}
              <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center font-display font-bold text-gold-500 text-sm shrink-0">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogoutClick}
                className="p-1.5 rounded-xl text-stone-400 hover:text-red-400 hover:bg-stone-800 border border-stone-800 cursor-pointer transition-colors duration-200"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Container (full width) */}
        <div className="flex-1 overflow-y-auto">
          {/* Content area */}
          <main className="p-6 md:p-8 max-w-5xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-stone-900/90 backdrop-blur-lg flex items-center justify-around px-2 z-40">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-200 ${
                isActive ? 'text-gold-500' : 'text-stone-500'
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
  );
};
