
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AgenciesPage from './pages/AgenciesPage';
import CreateAgencyPage from './pages/CreateAgencyPage';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Create query client
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
          <Route path="/" element={<div className="min-h-screen">
            <Route index element={<Index />} />
            <Route path="agencies" element={<AgenciesPage />} />
            <Route path="agencies/create" element={<CreateAgencyPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
