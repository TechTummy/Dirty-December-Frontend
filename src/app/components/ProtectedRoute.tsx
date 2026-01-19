import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  redirectPath?: string;
  isAdmin?: boolean;
}

export const ProtectedRoute = ({ redirectPath = '/login', isAdmin = false }: ProtectedRouteProps) => {
  const token = localStorage.getItem(isAdmin ? 'admin_auth_token' : 'auth_token');
  const userDataStr = localStorage.getItem(isAdmin ? 'admin_data' : 'user_data');

  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }

  // Optional: Double check stored role if available
  if (userDataStr) {
    try {
      const user = JSON.parse(userDataStr);
      if (isAdmin && user.role !== 'admin') {
         return <Navigate to="/login" replace />; // Redirect non-admins trying to access admin
      }
      if (!isAdmin && user.role !== 'user') {
         // If an admin tries to access user dashboard, maybe redirect to admin dashboard?
         // For now, let's just stick to redirectPath or logout
         return <Navigate to="/admin/dashboard" replace />;
      }
    } catch (e) {
      // JSON parse error, invalid session
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <Outlet />;
};
