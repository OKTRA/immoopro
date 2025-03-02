
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import DatabaseStatus from './pages/DatabaseStatus';
import Dashboard from '@/components/Dashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
    errorElement: <NotFound />
  },
  {
    path: '/login',
    element: <Auth />
  },
  {
    path: '/register',
    element: <Auth isRegister />
  },
  {
    path: '/profile',
    element: <Profile />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/database-status',
    element: <DatabaseStatus />
  }
]);

export default router;
