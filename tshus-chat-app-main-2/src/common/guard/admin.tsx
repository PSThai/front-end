import { useAuth } from '@/client/hooks/use-auth';
import { FC } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { RolesEnum } from '../enum/roles.enum';

const AdminGuard: FC = () => {
  // Get roles
  const { roles } = useAuth()?.get;

  // Check roles
  if (roles?.[0] === RolesEnum.USER) {
    // Return
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
};
export default AdminGuard;
