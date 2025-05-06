import {
  BrowserRouter as Router,
  Routes,
  Route,
  useRoutes,
} from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "@/pages/HomePage";
import AgenciesPage from "@/pages/AgenciesPage";
import AgencyDetailPage from "@/pages/AgencyDetailPage";
import CreateAgencyPage from "@/pages/CreateAgencyPage";
import PropertyDetailPage from "@/pages/PropertyDetailPage";
import CreatePropertyPage from "@/pages/property/CreatePropertyPage";
import CreateLeasePage from "@/pages/CreateLeasePage";
import LeaseDetailsPage from "@/pages/LeaseDetailsPage";
import ManageTenantsPage from "@/pages/ManageTenantsPage";
import PropertyLeasePaymentsPage from "@/pages/PropertyLeasePaymentsPage";
import AgencyPaymentsPage from "@/pages/AgencyPaymentsPage";
import AgencyCommissionsPage from "@/pages/AgencyCommissionsPage";
import PropertyExpensesPage from "@/pages/PropertyExpensesPage";
import AgencySettingsPage from "@/pages/AgencySettingsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AgencyLayout from "@/components/agency/AgencyLayout";
import Auth from "@/pages/Auth";
import AdminAuth from "@/pages/AdminAuth";
import SearchPage from "@/pages/SearchPage";
import ProfilePage from "@/pages/ProfilePage";
import OwnerPage from "@/pages/OwnerPage";
import AdminPage from "@/pages/AdminPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { VisitorTracker } from "./components/analytics/VisitorTracker";
import routes from "tempo-routes";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const createBucketIfNotExists = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(
          (bucket) => bucket.name === "tenant-photos",
        );

        if (!bucketExists) {
          const { error } = await supabase.storage.createBucket(
            "tenant-photos",
            {
              public: true,
              fileSizeLimit: 5242880, // 5MB
            },
          );

          if (error) {
            console.error("Error creating tenant-photos bucket:", error);
          } else {
            console.log("Created tenant-photos bucket");
          }
        }
      } catch (error) {
        console.error("Error checking/creating bucket:", error);
      }
    };

    createBucketIfNotExists();
  }, []);

  // Create a component to handle Tempo routes
  const TempoRoutes = () => {
    return import.meta.env.VITE_TEMPO &&
      typeof useRoutes === "function" &&
      routes
      ? useRoutes(routes)
      : null;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {/* Tempo routes */}
            <TempoRoutes />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin-auth" element={<AdminAuth />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/owner" element={<OwnerPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/agencies" element={<AgenciesPage />} />
              <Route path="/agencies/create" element={<CreateAgencyPage />} />

              <Route element={<AgencyLayout />}>
                <Route
                  path="/agencies/:agencyId"
                  element={<AgencyDetailPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties"
                  element={<AgencyDetailPage />}
                />
                <Route
                  path="/agencies/:agencyId/tenants"
                  element={<ManageTenantsPage />}
                />
                <Route
                  path="/agencies/:agencyId/leases"
                  element={<ManageTenantsPage leaseView={true} />}
                />
                <Route
                  path="/agencies/:agencyId/payments"
                  element={<AgencyPaymentsPage />}
                />
                <Route
                  path="/agencies/:agencyId/commissions"
                  element={<AgencyCommissionsPage />}
                />
                <Route
                  path="/agencies/:agencyId/expenses"
                  element={<PropertyExpensesPage />}
                />
                <Route
                  path="/agencies/:agencyId/settings"
                  element={<AgencySettingsPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/create"
                  element={<CreatePropertyPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId"
                  element={<PropertyDetailPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/edit"
                  element={<CreatePropertyPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/lease"
                  element={<CreateLeasePage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/lease/create"
                  element={<CreateLeasePage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/leases/:leaseId"
                  element={<LeaseDetailsPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/tenants"
                  element={<ManageTenantsPage />}
                />
                <Route
                  path="/agencies/:agencyId/properties/:propertyId/leases/:leaseId/payments"
                  element={<PropertyLeasePaymentsPage />}
                />
              </Route>

              <Route path="/login" element={<Auth />} />

              {/* Add this before the catchall route */}
              {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
        <Toaster />
        <VisitorTracker />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
