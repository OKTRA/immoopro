import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import AuthContainer from "@/components/auth/AuthContainer";
import LoginForm from "@/components/auth/LoginForm";
import { toast } from "sonner";
import { isUserAdmin } from "@/services/adminRoleService";

const AdminAuth: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        setAuthError(null);

        // Get current session
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setAuthError("Error retrieving session");
          setIsCheckingAuth(false);
          return;
        }

        const currentUser = data.session?.user;
        setUser(currentUser || null);

        // If user is logged in, check if they are an admin
        if (currentUser) {
          console.log("Checking admin status for user:", currentUser.id);
          try {
            const adminCheck = await isUserAdmin(currentUser.id);
            console.log("Admin check result:", adminCheck);

            if (adminCheck.error) {
              console.error("Admin check error:", adminCheck.error);
              setAuthError(`Error checking admin status: ${adminCheck.error}`);
              setIsAdmin(false);
            } else {
              setIsAdmin(adminCheck.isAdmin);

              if (adminCheck.isAdmin) {
                console.log(
                  `User is authenticated as admin with role: ${adminCheck.adminRole}`,
                );
                navigate("/admin");
              } else {
                toast.error("Accès restreint", {
                  description:
                    "Vous n'avez pas les droits d'administrateur nécessaires.",
                });
              }
            }
          } catch (adminError) {
            console.error("Error in admin check:", adminError);
            setAuthError(`Error in admin check: ${adminError}`);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthError(`Authentication error: ${error}`);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Setup auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Admin auth state changed:", event);
        const currentUser = session?.user;
        setUser(currentUser || null);

        if (currentUser) {
          // Check if the user is an admin
          try {
            const adminCheck = await isUserAdmin(currentUser.id);
            setIsAdmin(adminCheck.isAdmin);

            if (adminCheck.isAdmin) {
              navigate("/admin");
            } else {
              toast.error("Accès restreint", {
                description:
                  "Vous n'avez pas les droits d'administrateur nécessaires.",
              });
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
            toast.error("Erreur", {
              description:
                "Une erreur est survenue lors de la vérification des droits d'administrateur.",
            });
          }
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          Vérification de l'authentification...
        </p>
      </div>
    );
  }

  // Show error state if there was an error
  if (authError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-bold">Erreur d'authentification</p>
          <p className="text-sm">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-1 px-3 rounded text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Redirect if user is already logged in and is an admin
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleLoginSuccess = (session: any) => {
    // Manually check admin status after login
    const user = session?.user;
    if (user) {
      isUserAdmin(user.id)
        .then((result) => {
          if (result.isAdmin) {
            navigate("/admin");
          } else {
            toast.error("Accès restreint", {
              description:
                "Vous n'avez pas les droits d'administrateur nécessaires.",
            });
          }
        })
        .catch((error) => {
          console.error("Error checking admin status after login:", error);
          toast.error("Erreur", {
            description:
              "Une erreur est survenue lors de la vérification des droits d'administrateur.",
          });
        });
    }
  };

  return (
    <AuthContainer
      title="Administration"
      description="Connectez-vous à l'espace d'administration"
    >
      <LoginForm
        onSuccess={handleLoginSuccess}
        onSwitchMode={() => {}}
        disableRegistration={true}
      />
    </AuthContainer>
  );
};

export default AdminAuth;
