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
import ContractsPage from "@/pages/ContractsPage";
import CreateContractPage from "@/pages/CreateContractPage";
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
// Marketplace imports
import MarketplaceHome from "@/marketplace/pages/MarketplaceHome";
import ProductDetail from "@/marketplace/pages/ProductDetail";
import ShopDashboard from "@/marketplace/pages/ShopDashboard";
import CreateShopPage from "@/marketplace/pages/CreateShopPage";
import { MarketplaceProvider } from "@/marketplace/context/MarketplaceContext";
import { VisitorTracker } from "./components/analytics/VisitorTracker";
import routes from "tempo-routes";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const createRequiredBuckets = async () => {
      try {
        // Get all existing buckets
        const { data: buckets, error: listError } =
          await supabase.storage.listBuckets();

        if (listError) {
          console.error("Error listing buckets:", listError);
          return;
        }

        // Define required buckets with their configurations
        const requiredBuckets = [
          { name: "tenant-photos", public: true, fileSizeLimit: 5242880 }, // 5MB
          { name: "agency-logos", public: true, fileSizeLimit: 5242880 }, // 5MB
          { name: "agency-banners", public: true, fileSizeLimit: 10485760 }, // 10MB
          { name: "agency-media", public: true, fileSizeLimit: 10485760 }, // 10MB
          { name: "expense-media", public: true, fileSizeLimit: 10485760 }, // 10MB
        ];

        // Create each bucket if it doesn't exist
        for (const bucket of requiredBuckets) {
          const bucketExists = buckets?.some((b) => b.name === bucket.name);

          if (!bucketExists) {
            console.log(`Creating ${bucket.name} bucket...`);
            const { error } = await supabase.storage.createBucket(bucket.name, {
              public: bucket.public,
              fileSizeLimit: bucket.fileSizeLimit,
            });

            if (error) {
              console.error(`Error creating ${bucket.name} bucket:`, error);
            } else {
              console.log(`Created ${bucket.name} bucket successfully`);
            }
          } else {
            console.log(`Bucket ${bucket.name} already exists`);
          }
        }
      } catch (error) {
        console.error("Error checking/creating buckets:", error);
      }
    };

    createRequiredBuckets();
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
      <MarketplaceProvider>
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

                {/* Marketplace Routes */}
                <Route path="/marketplace" element={<MarketplaceHome />} />
                <Route
                  path="/marketplace/products/:productId"
                  element={<ProductDetail />}
                />
                <Route
                  path="/marketplace/shops/:shopId"
                  element={<ShopDashboard />}
                />
                <Route
                  path="/marketplace/shops/create"
                  element={<CreateShopPage />}
                />

                {/* Agency Routes with Layout */}
                <Route path="/agencies/:agencyId" element={<AgencyLayout />}>
                  <Route index element={<AgencyDetailPage />} />
                  <Route path="properties" element={<AgencyDetailPage />} />
                  <Route path="tenants" element={<ManageTenantsPage />} />
                  <Route
                    path="leases"
                    element={<ManageTenantsPage leaseView={true} />}
                  />
                  <Route path="payments" element={<AgencyPaymentsPage />} />
                  <Route
                    path="commissions"
                    element={<AgencyCommissionsPage />}
                  />
                  <Route path="expenses" element={<PropertyExpensesPage />} />
                  <Route path="contracts" element={<ContractsPage />} />
                  <Route
                    path="contracts/create"
                    element={<CreateContractPage />}
                  />
                  <Route path="settings" element={<AgencySettingsPage />} />
                  <Route
                    path="properties/create"
                    element={<CreatePropertyPage />}
                  />
                  <Route
                    path="properties/:propertyId"
                    element={<PropertyDetailPage />}
                  />
                  <Route
                    path="properties/:propertyId/edit"
                    element={<CreatePropertyPage />}
                  />
                  <Route
                    path="properties/:propertyId/lease"
                    element={<CreateLeasePage />}
                  />
                  <Route
                    path="properties/:propertyId/lease/create"
                    element={<CreateLeasePage />}
                  />
                  <Route
                    path="properties/:propertyId/leases/:leaseId"
                    element={<LeaseDetailsPage />}
                  />
                  <Route
                    path="properties/:propertyId/tenants"
                    element={<ManageTenantsPage />}
                  />
                  <Route
                    path="properties/:propertyId/leases/:leaseId/payments"
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
      </MarketplaceProvider>
    </QueryClientProvider>
  );
}

export default App;
