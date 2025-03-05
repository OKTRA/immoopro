
import { useNavigate } from "react-router-dom";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { Search, LogOut } from "lucide-react";
import { UserType } from "./types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NavbarDesktopMenuProps {
  navLinks: { name: string; path: string }[];
  userTypes: UserType[];
  user: any;
  userRole: string | null;
  location: any;
  handleLogout: () => void;
}

export function NavbarDesktopMenu({
  navLinks,
  userTypes,
  user,
  userRole,
  location,
  handleLogout
}: NavbarDesktopMenuProps) {
  const navigate = useNavigate();

  const handleNavigationClick = (path: string) => {
    // Pour les liens d'ancrage
    if (path.startsWith('#')) {
      // Si nous sommes déjà sur la page d'accueil, utiliser smooth scroll
      if (location.pathname === '/') {
        const element = document.querySelector(path);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          toast.error("Section introuvable");
        }
      } else {
        // Sinon, naviguer vers la page d'accueil avec le fragment
        navigate('/');
        // Attendre que la navigation soit terminée avant de scroller
        setTimeout(() => {
          const element = document.querySelector(path);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          } else {
            toast.error("Section introuvable");
          }
        }, 100);
      }
    } else {
      // Pour les autres chemins, utiliser navigate
      navigate(path);
    }
  };

  return (
    <div className="hidden md:flex items-center space-x-4">
      <div className="hidden md:flex">
        <ButtonEffects 
          variant="ghost" 
          size="sm"
          className="mr-2 group"
          onClick={() => navigate('/search')}
        >
          <Search 
            className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" 
          />
        </ButtonEffects>

        <div className="h-6 w-px bg-border mx-2"></div>

        {/* Direct Admin link for testing */}
        <ButtonEffects 
          variant="ghost" 
          size="sm"
          className={cn(
            "mx-1",
            location.pathname === '/admin' && "bg-primary/10 text-primary"
          )}
          onClick={() => navigate('/admin')}
        >
          Admin Dashboard
        </ButtonEffects>

        {userTypes.map((type) => (
          <ButtonEffects 
            key={type.name}
            variant="ghost" 
            size="sm"
            className={cn(
              "mx-1",
              (location.pathname.includes(type.path.split("?")[0].toLowerCase()) ||
               (user && userRole === type.role)) && 
              "bg-primary/10 text-primary"
            )}
            onClick={() => handleNavigationClick(type.path)}
          >
            {type.name}
          </ButtonEffects>
        ))}

        {user ? (
          <div className="flex space-x-1">
            <ButtonEffects
              variant="ghost"
              size="sm"
              className="mx-1"
              onClick={() => navigate("/profile")}
            >
              Mon Profil
            </ButtonEffects>
            <ButtonEffects
              variant="ghost"
              size="sm"
              className="mx-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Déconnexion
            </ButtonEffects>
          </div>
        ) : (
          <ButtonEffects
            variant="ghost"
            size="sm"
            className="mx-1"
            onClick={() => navigate(`/auth?redirectTo=${encodeURIComponent(location.pathname)}`)}
          >
            Connexion
          </ButtonEffects>
        )}
      </div>

      <ButtonEffects 
        variant="primary"
        className="hidden md:flex"
        onClick={() => handleNavigationClick("#contact")}
      >
        Contact
      </ButtonEffects>
    </div>
  );
}
