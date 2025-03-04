
import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import AgenciesPage from "./pages/AgenciesPage";
import AgencyDetailPage from "./pages/AgencyDetailPage";
import CreateAgencyPage from "./pages/CreateAgencyPage";
import EditAgencyPage from "./pages/EditAgencyPage";
import AgencySettingsPage from "./pages/AgencySettingsPage";
import AgencyPaymentsPage from "./pages/AgencyPaymentsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import CreatePropertyPage from "./pages/property/CreatePropertyPage";
import ProfilePage from "./pages/ProfilePage";
import AuthRequired from "./components/AuthRequired";
import ManageTenantsPage from "./pages/ManageTenantsPage";
import CreateLeasePage from "./pages/CreateLeasePage";
import LeaseDetailsPage from "./pages/LeaseDetailsPage";
import PropertyLeasePaymentsPage from "./pages/PropertyLeasePaymentsPage";
import PropertyStatusFixPage from "./pages/property/PropertyStatusFixPage"; // Import the new page

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
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
    path: "/agencies/:agencyId",
    element: (
      <AuthRequired>
        <AgencyDetailPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/edit",
    element: (
      <AuthRequired>
        <EditAgencyPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/settings",
    element: (
      <AuthRequired>
        <AgencySettingsPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/payments",
    element: (
      <AuthRequired>
        <AgencyPaymentsPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/properties/create",
    element: (
      <AuthRequired>
        <CreatePropertyPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/properties/:propertyId",
    element: (
      <AuthRequired>
        <PropertyDetailPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/properties/:propertyId/edit",
    element: (
      <AuthRequired>
        <CreatePropertyPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/properties/:propertyId/tenants",
    element: (
      <AuthRequired>
        <ManageTenantsPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/properties/:propertyId/lease/create",
    element: (
      <AuthRequired>
        <CreateLeasePage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/properties/:propertyId/leases/:leaseId",
    element: (
      <AuthRequired>
        <LeaseDetailsPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/properties/:propertyId/payments",
    element: (
      <AuthRequired>
        <PropertyLeasePaymentsPage />
      </AuthRequired>
    ),
  },
  {
    path: "/agencies/:agencyId/properties/:propertyId/status-fix",
    element: (
      <AuthRequired>
        <PropertyStatusFixPage />
      </AuthRequired>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
