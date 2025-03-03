
import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthPage from "./pages/Auth";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import AgenciesPage from "./pages/AgenciesPage";
import CreateAgencyPage from "./pages/CreateAgencyPage";
import EditAgencyPage from "./pages/EditAgencyPage";
import AgencyLayout from "./components/agency/AgencyLayout";
import AgencyDetailPage from "./pages/AgencyDetailPage";
import CreatePropertyPage from "./pages/CreatePropertyPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import ManageTenantsPage from "./pages/ManageTenantsPage";
import CreateLeasePage from "./pages/CreateLeasePage";
import PropertyLeasePaymentsPage from "./pages/PropertyLeasePaymentsPage";
import AgencyPaymentsPage from "./pages/AgencyPaymentsPage";
import AgencySettingsPage from "./pages/AgencySettingsPage";
import AdminPage from "./pages/AdminPage";
import OwnerPage from "./pages/OwnerPage";
import AuthRequired from "./components/AuthRequired";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/profile",
    element: (
      <AuthRequired>
        <ProfilePage />
      </AuthRequired>
    ),
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/agencies",
    element: (
      <AuthRequired>
        <AgenciesPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/create",
    element: (
      <AuthRequired>
        <CreateAgencyPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/edit/:agencyId",
    element: (
      <AuthRequired>
        <EditAgencyPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId",
    element: (
      <AuthRequired>
        <AgencyLayout />
      </AuthRequired>
    ),
    children: [
      {
        index: true,
        element: <AgencyDetailPage />,
      },
      {
        path: "properties/create",
        element: <CreatePropertyPage />,
      },
      {
        path: "properties/:propertyId",
        element: <PropertyDetailPage />,
      },
      {
        path: "tenants",
        element: <ManageTenantsPage />,
      },
      {
        path: "leases/create",
        element: <CreateLeasePage />,
      },
      {
        path: "properties/:propertyId/payments",
        element: <PropertyLeasePaymentsPage />,
      },
      {
        path: "payments",
        element: <AgencyPaymentsPage />,
      },
      {
        path: "settings",
        element: <AgencySettingsPage />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthRequired>
        <AdminPage />
      </AuthRequired>
    ),
  },
  {
    path: "/owner",
    element: (
      <AuthRequired>
        <OwnerPage />
      </AuthRequired>
    ),
  },
]);
