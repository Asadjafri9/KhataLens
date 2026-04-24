import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Users, FileSpreadsheet, MessageCircle, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/customers', label: 'Customers', icon: Users },
  { to: '/dashboard/import', label: 'Import Sheet', icon: FileSpreadsheet },
  { to: '/dashboard/chatbot', label: 'Chatbot', icon: MessageCircle },
];

export const DashboardLayout = () => {
  const { shopkeeper, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen w-64
          bg-primary-darker text-background flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-background/10">
          <img src="/khatalens-logo.png" alt="KhataLens" className="h-8 w-auto brightness-0 invert" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-background/70 hover:text-background"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-background'
                    : 'text-background/60 hover:text-background hover:bg-background/10'
                }`
              }
            >
              <item.icon className="size-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-background/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            {shopkeeper?.avatar_url ? (
              <img
                src={shopkeeper.avatar_url}
                alt={shopkeeper.name}
                className="size-9 rounded-full border-2 border-primary"
              />
            ) : (
              <div className="size-9 rounded-full bg-primary grid place-items-center text-sm font-bold text-background">
                {shopkeeper?.name?.[0]?.toUpperCase() || 'S'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-background truncate">{shopkeeper?.name || 'Shopkeeper'}</div>
              <div className="text-[11px] text-background/50 truncate">{shopkeeper?.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-background/60 hover:text-background hover:bg-background/10 transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-background border-b border-border flex items-center px-4 sm:px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-ink hover:text-primary transition-colors"
          >
            <Menu className="size-6" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-ink-soft">
            {shopkeeper?.shop_name || shopkeeper?.name || 'My Shop'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
