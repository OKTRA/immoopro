
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { User, LogIn, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: "public" | "agency" | "owner" | "admin";
  description?: string;
}

/**
 * Wrapper component that renders children only if user is authenticated
 * and has the required role if specified.
 */
export default function AuthRequired({ 
  children, 
  fallback, 
  requiredRole,
  description
}: AuthRequiredProps) {
  const { user, isLoading, userRole } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    // Include current path as redirectTo query parameter
    navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="animate-pulse p-4 flex items-center justify-center">
        <div className="h-5 w-24 bg-muted rounded"></div>
      </div>
    );
  }

  // If user is logged in and either no specific role is required, or user has the required role
  if (user && (!requiredRole || userRole === requiredRole)) {
    return <>{children}</>;
  }

  // If user is logged in but doesn't have the required role
  if (user && requiredRole && userRole !== requiredRole) {
    const roleDisplay = {
      'agency': 'agence',
      'owner': 'propriétaire',
      'admin': 'administrateur',
      'public': 'utilisateur standard'
    };
    
    return (
      <Alert variant="destructive" className="my-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Accès restreint</AlertTitle>
        <AlertDescription>
          {description || `Cette fonctionnalité est réservée aux comptes ${roleDisplay[requiredRole] || requiredRole}.`}
          {fallback || (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                Retour à l'accueil
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Default fallback for unauthenticated users
  return (
    <div className="p-4 text-center border border-muted rounded-lg bg-muted/10">
      <p className="text-muted-foreground mb-3">
        {description || "Connectez-vous pour accéder à cette fonctionnalité"}
      </p>
      {fallback || (
        <Button onClick={handleLogin} size="sm">
          <LogIn className="mr-2 h-4 w-4" />
          Se connecter
        </Button>
      )}
    </div>
  );
}
