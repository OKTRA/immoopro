import { createBrowserRouter } from "react-router-dom";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import AgenciesPage from "./pages/AgenciesPage";
import AgencyDetailPage from "./pages/AgencyDetailPage";
import AgencyForm from "./pages/AgencyForm";
import CreateAgencyPage from "./pages/CreateAgencyPage";
import EditAgencyPage from "./pages/EditAgencyPage";
import AgencyPaymentsPage from "./pages/AgencyPaymentsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import CreatePropertyPage from "./pages/CreatePropertyPage";
import PropertyLeasePaymentsPage from "./pages/PropertyLeasePaymentsPage";
import AgencySettingsPage from "./pages/AgencySettingsPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import AdminPage from "./pages/AdminPage";
import ManageTenantsPage from "./pages/ManageTenantsPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentsManagement from "./components/admin/PaymentsManagement";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/agencies",
    element: <AgenciesPage />,
  },
  {
    path: "/agencies/:agencyId",
    element: <AgencyDetailPage />,
  },
  {
    path: "/agencies/create",
    element: <CreateAgencyPage />,
  },
  {
    path: "/agencies/:agencyId/edit",
    element: <EditAgencyPage />,
  },
  {
    path: "/agencies/:agencyId/payments",
    element: <AgencyPaymentsPage />,
  },
  {
    path: "/agencies/:agencyId/settings",
    element: <AgencySettingsPage />,
  },
  {
    path: "/agencies/:agencyId/properties/:propertyId",
    element: <PropertyDetailPage />,
  },
  {
    path: "/agencies/:agencyId/properties/:propertyId/lease/create",
    element: <CreatePropertyPage />,
  },
  {
    path: "/agencies/:agencyId/properties/:propertyId/lease/:leaseId/payments",
    element: <PropertyLeasePaymentsPage />,
  },
  {
    path: "/manage/tenants",
    element: <ManageTenantsPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },

  // Payment result pages
  {
    path: "/payment/success",
    element: <PaymentSuccessPage />,
  },
  {
    path: "/payment/cancel",
    element: <PaymentCancelPage />,
  },

  // Admin routes
  {
    path: "/admin",
    element: <AdminPage />,
    children: [
      {
        path: "agencies",
        element: <AgencyForm />,
      },
      {
        path: "payments",
        element: <PaymentsManagement />,
      },
    ],
  },

  // Fallback route
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
