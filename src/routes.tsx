import { createBrowserRouter } from "react-router-dom";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AgenciesPage from "./pages/AgenciesPage";
import CreateAgencyPage from "./pages/CreateAgencyPage";
import AgencyDetailPage from "./pages/AgencyDetailPage";
import EditAgencyPage from "./pages/EditAgencyPage";
import AgencyPaymentsPage from "./pages/AgencyPaymentsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import CreatePropertyPage from "./pages/property/CreatePropertyPage";
import PropertyLeasePaymentsPage from "./pages/PropertyLeasePaymentsPage";
import AgencySettingsPage from "./pages/AgencySettingsPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <NotFound />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/register",
    element: <Auth isRegister={true} />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/agencies",
    element: <AgenciesPage />,
  },
  {
    path: "/agencies/create",
    element: <CreateAgencyPage />,
  },
  {
    path: "/agencies/:id",
    element: <AgencyDetailPage />,
  },
  {
    path: "/agencies/:id/edit",
    element: <EditAgencyPage />,
  },
  {
    path: "/agencies/:id/payments",
    element: <AgencyPaymentsPage />,
  },
  {
    path: "/properties/:id",
    element: <PropertyDetailPage />,
  },
  {
    path: "/properties/create",
    element: <CreatePropertyPage />,
  },
  {
    path: "/properties/:id/payments",
    element: <PropertyLeasePaymentsPage />,
  },
  {
    path: "/agency/settings",
    element: <AgencySettingsPage />,
  },
  {
    path: "/payment/success",
    element: <PaymentSuccessPage />,
  },
  {
    path: "/payment/cancel",
    element: <PaymentCancelPage />,
  },
]);

export default router;
