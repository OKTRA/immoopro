
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { User, LogIn } from "lucide-react";

interface AuthRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: "public" | "agency" | "owner" | "admin";
}

/**
 * Wrapper component that renders children only if user is authenticated
 * Otherwise shows a login button or custom fallback
 */
export default function AuthRequired({ 
  children, 
  fallback, 
  requiredRole 
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
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground mb-3">
          Cette fonctionnalité nécessite un compte {requiredRole === "agency" ? "agence" : requiredRole === "owner" ? "propriétaire" : "administrateur"}.
        </p>
        {fallback || (
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Retour à l'accueil
          </Button>
        )}
      </div>
    );
  }

  // Default fallback for unauthenticated users
  return (
    <div className="p-4 text-center">
      <p className="text-muted-foreground mb-3">
        Connectez-vous pour accéder à cette fonctionnalité
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
