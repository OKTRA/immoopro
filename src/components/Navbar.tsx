import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { getCurrentUser, signOut } from "@/services/authService";
import { toast } from "sonner";
import { NavbarDesktopMenu } from "./navbar/NavbarDesktopMenu";
import { NavbarMobileMenu } from "./navbar/NavbarMobileMenu";
import { UserType } from "./navbar/types";
import { supabase } from "@/lib/supabase";
import MarketplaceLink from "./navbar/MarketplaceLink";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch the current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user || null;

        if (currentUser) {
          setUser(currentUser);

          // Fetch user profile to get role
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single();

          setUserRole(profileData?.role || null);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);

        if (session?.user) {
          setUser(session.user);

          // Fetch user profile to get role
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          setUserRole(profileData?.role || null);
        } else {
          setUser(null);
          setUserRole(null);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Recherche", path: "/search" },
    { name: "Propriétés", path: "/#properties" },
    { name: "Agences", path: "/#agencies" },
    { name: "Tarifs", path: "/#pricing" },
  ];

  const userTypes: UserType[] = [
    {
      name: "Espace Agence",
      path: user
        ? "/agencies"
        : `/auth?redirectTo=${encodeURIComponent("/agencies")}`,
      role: "agency",
    },
    {
      name: "Espace Propriétaire",
      path: user
        ? "/owner"
        : `/auth?redirectTo=${encodeURIComponent("/owner")}`,
      role: "owner",
    },
    {
      name: "Admin",
      path: user
        ? "/admin"
        : `/auth?redirectTo=${encodeURIComponent("/admin")}`,
      role: "admin",
    },
  ];

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setUserRole(null);
    navigate("/");
    toast.success("Vous avez été déconnecté avec succès");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-200 ease-in-out",
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className="text-2xl font-semibold tracking-tight text-foreground mr-8 flex items-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <span className="text-primary">immo</span>
              <span>connect</span>
            </div>

            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative link-underline cursor-pointer"
                  onClick={() => {
                    if (link.path.startsWith("#")) {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.querySelector(link.path);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }, 100);
                    } else {
                      navigate(link.path);
                    }
                  }}
                >
                  {link.name}
                </div>
              ))}
              <MarketplaceLink />
            </div>
          </div>

          <NavbarDesktopMenu
            navLinks={navLinks}
            userTypes={userTypes}
            user={user}
            userRole={userRole}
            location={location}
            handleLogout={handleLogout}
          />

          <button
            className="md:hidden text-foreground p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>
      </div>

      <NavbarMobileMenu
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navLinks={navLinks}
        userTypes={userTypes}
        handleLogout={handleLogout}
        user={user}
        location={location}
      />
    </header>
  );
}
