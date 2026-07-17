import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Moon, Sun, User, LogOut, Settings, Bell, Search, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useSearchStore } from '@/store/searchStore';
import { useNotifications } from '@/services/notificationService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { notifications, isConnected } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-4 py-4">
                <Link to="/" className="text-xl font-bold text-primary mb-4">Campus Bite</Link>
                <Link to="/canteens" className="text-sm font-medium hover:text-primary transition-colors">Canteens</Link>
                <Link to="/offers" className="text-sm font-medium hover:text-primary transition-colors">Offers</Link>
                <Link to="/help" className="text-sm font-medium hover:text-primary transition-colors">Help</Link>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              Campus Bite
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 mx-6">
          <Link to="/canteens" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Canteens</Link>
          <Link to="/offers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Offers</Link>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search food or canteens..."
              className="w-full bg-muted pl-9 rounded-full border-none focus-visible:ring-1"
              value={useSearchStore((state) => state.searchQuery)}
              onChange={(e) => {
                useSearchStore.getState().setSearchQuery(e.target.value);
                if (window.location.pathname !== '/canteens') {
                  navigate('/canteens');
                }
              }}
            />
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px]">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal flex items-center justify-between">
                    <span className="font-bold">Notifications</span>
                    {isConnected && <span className="text-[10px] text-green-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live</span>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3 border-b last:border-0 focus:bg-primary/5">
                          <span className="font-semibold text-sm">{n.event || "Update"}</span>
                          <span className="text-xs text-muted-foreground">{n.message || JSON.stringify(n)}</span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px]">
                    2
                  </Badge>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden border border-primary/20 hover:border-primary/50 transition-colors">
                    <Avatar className="h-9 w-9 bg-primary/5">
                      <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.registrationNumber || user?.full_name || 'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="Profile Avatar" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.full_name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.registrationNumber || user?.email}
                      </p>
                      {user?.department && (
                        <p className="text-[10px] leading-none text-muted-foreground mt-1">
                          {user.department} • {user.year}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-primary text-white hover:bg-primary/90">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
