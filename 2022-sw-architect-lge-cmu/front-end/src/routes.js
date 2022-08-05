import { useState } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Blog from './pages/Blog';
import User from './pages/User';
import History from './pages/History';
import Server from './pages/Server';
import Login from './pages/Login';
import NotFound from './pages/Page404';
import Register from './pages/Register';
import Products from './pages/Products';
import DashboardApp from './pages/DashboardApp';
import SideOnlyLayout from './layouts/dashboard/SideOnlyLayout';

// ----------------------------------------------------------------------

export default function Router() {
  const [isLoggedIn,] = useState(false);

  return useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [{ path: 'app', element: <DashboardApp /> },
      { path: 'user', element: <User /> },
      { path: 'history', element: <History /> },
      { path: 'products', element: <Products /> },
      { path: 'blog', element: <Blog /> },
      ],
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: '/', element: (isLoggedIn ? <Navigate to="/dashboard/app" /> : <Navigate to="/login" />) },
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '/server',
      element: <SideOnlyLayout />,
      children: [
        { path: '', element: <Server /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
