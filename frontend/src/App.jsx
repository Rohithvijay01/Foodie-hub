import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';

// Layouts (to be created)
// import AuthLayout from '@/layouts/AuthLayout';
// import DashboardLayout from '@/layouts/DashboardLayout';

import CustomerLayout from '@/layouts/CustomerLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Home from '@/pages/customer/Home';
import Canteens from '@/pages/customer/Canteens';
import CanteenDetails from '@/pages/customer/CanteenDetails';
import Cart from '@/pages/customer/Cart';
import Profile from '@/pages/customer/Profile';
import Offers from '@/pages/customer/Offers';
import Orders from '@/pages/customer/Orders';
import Settings from '@/pages/customer/Settings';
import RestaurantDashboard from '@/pages/restaurant/Dashboard';
import DeliveryDashboard from '@/pages/delivery/Dashboard';
import AdminDashboard from '@/pages/admin/Dashboard';
import RegisterCanteen from '@/pages/public/RegisterCanteen';
import Landing from '@/pages/public/Landing';
import RoleLogin from '@/pages/auth/RoleLogin';
import RoleRegister from '@/pages/auth/RoleRegister';

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route path="/student/login" element={<RoleLogin roleType="student" />} />
        <Route path="/canteen/login" element={<RoleLogin roleType="canteen" />} />
        <Route path="/delivery/login" element={<RoleLogin roleType="delivery" />} />
        <Route path="/admin/login" element={<RoleLogin roleType="admin" />} />
        
        <Route path="/student/register" element={<RoleRegister roleType="student" />} />
        <Route path="/canteen/register" element={<RoleRegister roleType="canteen" />} />
        <Route path="/delivery/register" element={<RoleRegister roleType="delivery" />} />
        <Route path="/admin/register" element={<RoleRegister roleType="admin" />} />
        
        <Route path="/register-canteen" element={<RegisterCanteen />} />
        
        {/* Customer Routes (Public for preview) */}
        <Route element={<CustomerLayout />}>
          <Route path="/offers" element={<Offers />} />
        </Route>
        
        {/* Protected Routes - Consumer (Student) */}
        <Route element={<ProtectedRoute allowedRoles={['consumer']} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/canteens" element={<Canteens />} />
            <Route path="/canteens/:id" element={<CanteenDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<div className="p-12 text-center text-xl font-bold">Help & Support (Coming Soon)</div>} />
          </Route>
        </Route>

        {/* Dashboard Routes - Canteen Manager */}
        <Route element={<ProtectedRoute allowedRoles={['hotel_manager']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/restaurant" element={<RestaurantDashboard />} />
          </Route>
        </Route>

        {/* Dashboard Routes - Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Dashboard Routes - Delivery */}
        <Route element={<ProtectedRoute allowedRoles={['delivery']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/delivery" element={<DeliveryDashboard />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
