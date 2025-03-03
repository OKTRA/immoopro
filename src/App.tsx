
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import DatabaseStatus from "./pages/DatabaseStatus";
import Dashboard from "./components/Dashboard";
import Agencies from "./pages/Agencies";
import AgencyDetails from "./pages/AgencyDetails";
import AgencyForm from "./pages/AgencyForm";
import AuthRequired from "./components/AuthRequired";
import { useUser } from "./contexts/UserContext";

// Route protection component for role-based access
const RoleProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole: "public" | "agency" | "owner" | "admin" }) => {
  const { user, userRole, isLoading } = useUser();
  
  // Show loading state while checking auth
  if (isLoading) return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  
  // Redirect to login if no user
  if (!user) return <Navigate to="/login" replace />;
  
  // Redirect to home if user doesn't have required role
  if (userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth isRegister={true} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={
              <AuthRequired>
                <Dashboard />
              </AuthRequired>
            } />
            <Route path="/database-status" element={
              <AuthRequired requiredRole="admin">
                <DatabaseStatus />
              </AuthRequired>
            } />
            
            {/* Agency Routes - Restricted to agency role */}
            <Route path="/agencies" element={<Agencies />} />
            <Route path="/agencies/:id" element={<AgencyDetails />} />
            <Route path="/agencies/create" element={
              <AuthRequired requiredRole="agency" description="Seules les agences peuvent créer un profil d'agence">
                <AgencyForm />
              </AuthRequired>
            } />
            <Route path="/agencies/:id/edit" element={
              <AuthRequired requiredRole="agency" description="Seules les agences peuvent modifier un profil d'agence">
                <AgencyForm />
              </AuthRequired>
            } />
            
            {/* Owner Routes - To be implemented */}
            <Route path="/owner" element={
              <AuthRequired requiredRole="owner" description="Espace réservé aux propriétaires">
                <NotFound />
              </AuthRequired>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AuthRequired requiredRole="admin" description="Espace réservé aux administrateurs">
                <NotFound />
              </AuthRequired>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
