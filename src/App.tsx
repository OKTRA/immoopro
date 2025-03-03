
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import AgenciesPage from '@/pages/AgenciesPage';
import AgencyDetailPage from '@/pages/AgencyDetailPage';
import CreateAgencyPage from '@/pages/CreateAgencyPage';
import PropertyDetailPage from '@/pages/PropertyDetailPage';
import CreatePropertyPage from '@/pages/CreatePropertyPage';
import CreateLeasePage from '@/pages/CreateLeasePage';
import ManageTenantsPage from '@/pages/ManageTenantsPage';
import PropertyLeasePaymentsPage from '@/pages/PropertyLeasePaymentsPage';
import AgencyPaymentsPage from '@/pages/AgencyPaymentsPage';
import AgencySettingsPage from '@/pages/AgencySettingsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AgencyLayout from '@/components/agency/AgencyLayout';

// Create a client
const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Check if the tenant-photos bucket exists, if not create it
    const createBucketIfNotExists = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'tenant-photos');
        
        if (!bucketExists) {
          const { error } = await supabase.storage.createBucket('tenant-photos', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
          
          if (error) {
            console.error('Error creating tenant-photos bucket:', error);
          } else {
            console.log('Created tenant-photos bucket');
          }
        }
      } catch (error) {
        console.error('Error checking/creating bucket:', error);
      }
    };
    
    createBucketIfNotExists();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<AgenciesPage />} />
              <Route path="/agencies" element={<AgenciesPage />} />
              <Route path="/agencies/create" element={<CreateAgencyPage />} />
              
              {/* Agency routes with the Agency Layout */}
              <Route element={<AgencyLayout />}>
                <Route path="/agencies/:agencyId" element={<AgencyDetailPage />} />
                <Route path="/agencies/:agencyId/properties" element={<AgencyDetailPage />} />
                <Route path="/agencies/:agencyId/tenants" element={<ManageTenantsPage />} />
                <Route path="/agencies/:agencyId/leases" element={<ManageTenantsPage leaseView={true} />} />
                <Route path="/agencies/:agencyId/payments" element={<AgencyPaymentsPage />} />
                <Route path="/agencies/:agencyId/settings" element={<AgencySettingsPage />} />
                <Route path="/agencies/:agencyId/properties/create" element={<CreatePropertyPage />} />
                <Route path="/agencies/:agencyId/properties/:propertyId" element={<PropertyDetailPage />} />
                <Route path="/agencies/:agencyId/properties/:propertyId/lease" element={<CreateLeasePage />} />
                <Route path="/agencies/:agencyId/properties/:propertyId/lease/create" element={<CreateLeasePage />} />
                <Route path="/agencies/:agencyId/properties/:propertyId/tenants" element={<ManageTenantsPage />} />
                <Route path="/agencies/:agencyId/properties/:propertyId/leases/:leaseId/payments" element={<PropertyLeasePaymentsPage />} />
              </Route>
              
              <Route path="*" element={<AgenciesPage />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
