
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import AgenciesPage from '@/pages/AgenciesPage';
import CreateAgencyPage from '@/pages/CreateAgencyPage';
import CreatePropertyPage from '@/pages/CreatePropertyPage';
import CreateLeasePage from '@/pages/CreateLeasePage';
import ManageTenantsPage from '@/pages/ManageTenantsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<AgenciesPage />} />
            <Route path="/agencies" element={<AgenciesPage />} />
            <Route path="/agencies/create" element={<CreateAgencyPage />} />
            <Route path="/agencies/:agencyId/properties/create" element={<CreatePropertyPage />} />
            <Route path="/agencies/:agencyId/properties/:propertyId/lease" element={<CreateLeasePage />} />
            <Route path="/agencies/:agencyId/properties/:propertyId/tenants" element={<ManageTenantsPage />} />
            <Route path="*" element={<AgenciesPage />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
