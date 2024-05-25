import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { adminRoute, publicClientRoutes } from './common/routes/routes';
import Page404 from './common/error/404';
import Base from '@/common/layout/base';
import Page403 from '@/common/error/403';
import Page500 from '@/common/error/500';
import Main from '@/common/layout';
import Login from '@/client/pages/login';
import '@/client/styles/client.css';
import Register from '@/client/pages/register';
import AuthGuard from '@/common/guard/auth';
import GuestGuard from '@/common/guard/guest';
import { RouteType } from '@/common/types/route/route.type';
import UserGuard from './common/guard/user';
import AdminGuard from './common/guard/admin';
import Forgot from './client/pages/forgot';

const App: FC = () => {
  // Return
  return (
    <Routes>
      <Route element={<AuthGuard />}>
        <Route path="/" element={<Main />}>
          <Route element={<UserGuard />}>
            {publicClientRoutes.map((route: RouteType) => (
              <Route
                key={route.name}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Route>
          <Route path="admin/*" element={<AdminGuard />}>
            {adminRoute.map((route: RouteType) => (
              <Route
                key={route.name}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Route>
        </Route>
      </Route>
      <Route path="/" element={<Base />}>
        <Route path="auth/" element={<GuestGuard />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot" element={<Forgot />} />
        </Route>
        <Route path="403" element={<Page403 />} />
        <Route path="403" element={<Page403 />} />
        <Route path="500" element={<Page500 />} />
        <Route path="*" element={<Page404 />} />
      </Route>
    </Routes>
  );
};

export default App;
