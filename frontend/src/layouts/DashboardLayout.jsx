import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Menu, ChefHat, Bike, Activity, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNotifications } from '@/services/notificationService';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize SSE notifications globally for dashboard users
  useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getSidebarLinks = () => {
    if (user?.role === 'restaurant_owner') {
      return [
        { path: '/restaurant', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/restaurant/menu', icon: ChefHat, label: 'Manage Menu' },
        { path: '/restaurant/orders', icon: ClipboardList, label: 'Live Orders' },
        { path: '/restaurant/settings', icon: Settings, label: 'Canteen Settings' },
      ];
    }
    if (user?.role === 'delivery_partner') {
      return [
        { path: '/delivery', icon: Bike, label: 'Delivery Hub' },
        { path: '/delivery/history', icon: ClipboardList, label: 'History' },
      ];
    }
    if (user?.role === 'admin') {
      return [
        { path: '/admin', icon: Activity, label: 'System Overview' },
        { path: '/admin/canteens', icon: ChefHat, label: 'Canteens' },
        { path: '/admin/users', icon: Users, label: 'Campus Users' },
      ];
    }
    return [];
  };

  const links = getSidebarLinks();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16171d] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-[#1f2028]">
        <div className="h-16 flex items-center px-6 border-b">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            Campus Bite
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role?.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 border-b bg-white dark:bg-[#1f2028]">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="h-16 flex items-center px-6 border-b">
                <span className="text-xl font-bold text-primary">Campus Bite</span>
              </div>
              <div className="py-4 px-3 space-y-1">
                {links.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-xl font-bold text-primary">Dashboard</span>
          <div className="w-8" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
