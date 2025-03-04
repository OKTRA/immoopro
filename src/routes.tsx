
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

import HomePage from './pages/HomePage';
import AgenciesPage from './pages/AgenciesPage';
import AgencyDetailsPage from './pages/AgencyDetailPage';
import CreateAgencyPage from './pages/CreateAgencyPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import CreatePropertyPage from './pages/property/CreatePropertyPage';
import CreateLeasePage from './pages/CreateLeasePage';
import ManageTenantsPage from './pages/ManageTenantsPage';
import AgencyLayout from './components/agency/AgencyLayout';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import ProfilePage from './pages/ProfilePage';

// Define routes
const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/agencies',
    element: <AgenciesPage />,
  },
  {
    path: '/agencies/create',
    element: <CreateAgencyPage />,
  },
  {
    path: '/agencies/:agencyId',
    element: <AgencyLayout />,
    children: [
      {
        index: true,
        element: <AgencyDetailsPage />,
      },
      {
        path: 'properties',
        element: <AgencyDetailsPage />,
      },
      {
        path: 'properties/create',
        element: <CreatePropertyPage />,
      },
      {
        path: 'properties/:propertyId',
        element: <PropertyDetailPage />,
      },
      {
        path: 'properties/:propertyId/edit',
        element: <CreatePropertyPage />,
      },
      {
        path: 'properties/:propertyId/lease/create',
        element: <CreateLeasePage />,
      },
      {
        path: 'tenants',
        element: <ManageTenantsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
