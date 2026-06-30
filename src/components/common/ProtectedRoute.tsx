import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../../services/api';

type GuardStatus = 'checking' | 'allowed' | 'login' | 'denied';

interface ProtectedRouteProps {
  allowedRoles: string[];
  unauthorizedPath?: string;
}

const ProtectedRoute = ({ allowedRoles, unauthorizedPath = '/login' }: ProtectedRouteProps) => {
  const location = useLocation();
  const [status, setStatus] = useState<GuardStatus>('checking');

  useEffect(() => {
    let mounted = true;

    const validateSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setStatus('login');
        return;
      }

      try {
        const response = await api.get('/users/profile');
        const role = response.data?.role;

        if (role) {
          localStorage.setItem('role', role);
        }

        if (!mounted) return;

        setStatus(allowedRoles.includes(role) ? 'allowed' : 'denied');
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        if (mounted) {
          setStatus('login');
        }
      }
    };

    validateSession();

    return () => {
      mounted = false;
    };
  }, [allowedRoles, location.pathname]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0] text-[#3D2512] font-sans">
        Validando sesion...
      </div>
    );
  }

  if (status === 'login') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (status === 'denied') {
    return <Navigate to={unauthorizedPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
