import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If they are logged in but unauthorized for this specific dashboard,
    // push them to their correct dashboard.
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'hotel_manager') return <Navigate to="/restaurant" replace />;
    if (user.role === 'delivery') return <Navigate to="/delivery" replace />;
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
