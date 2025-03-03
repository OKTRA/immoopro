
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import PropertiesPage from '@/pages/PropertiesPage';
import PropertyDetailsPage from '@/pages/PropertyDetailsPage';
import AgenciesPage from '@/pages/AgenciesPage';
import AgencyDetailsPage from '@/pages/AgencyDetailsPage';
import CreateAgencyPage from '@/pages/CreateAgencyPage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';
import CreatePropertyPage from '@/pages/CreatePropertyPage';
import CreateLeasePage from '@/pages/CreateLeasePage';
import ManageTenantsPage from '@/pages/ManageTenantsPage';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/agencies" element={<AgenciesPage />} />
          <Route path="/agencies/:id" element={<AgencyDetailsPage />} />
          <Route path="/agencies/create" element={<CreateAgencyPage />} />
          <Route path="/agencies/:agencyId/properties/create" element={<CreatePropertyPage />} />
          <Route path="/agencies/:agencyId/properties/:propertyId/lease" element={<CreateLeasePage />} />
          <Route path="/agencies/:agencyId/properties/:propertyId/tenants" element={<ManageTenantsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;
