import { useAuth } from '@/client/hooks/use-auth';
import { FC } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard: FC = () => {
  const { isAuthenticated, isInitialized } = useAuth()?.get;

  if (!isInitialized) return null;

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  return <Outlet/>;
};

export default AuthGuard;
