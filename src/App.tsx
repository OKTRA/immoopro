
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PropertyListPage from './pages/PropertyListPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import AgenciesPage from './pages/AgenciesPage';
import CreateAgencyPage from './pages/CreateAgencyPage';
import NotFoundPage from './pages/NotFoundPage';
import RootLayout from './layouts/RootLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Création du client de requête
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="properties" element={<PropertyListPage />} />
            <Route path="properties/:id" element={<PropertyDetailPage />} />
            <Route path="agencies" element={<AgenciesPage />} />
            <Route path="agencies/create" element={<CreateAgencyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
