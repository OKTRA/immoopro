
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { UserType } from "./types";
import { toast } from "sonner";

interface NavbarMobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  navLinks: { name: string; path: string }[];
  userTypes: UserType[];
  handleLogout: () => void;
  user: any;
  location: any;
}

export function NavbarMobileMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
  navLinks,
  userTypes,
  handleLogout,
  user,
  location,
}: NavbarMobileMenuProps) {
  const navigate = useNavigate();

  const handleNavigationClick = (path: string) => {
    // Fermer le menu mobile d'abord
    setMobileMenuOpen(false);
    
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
    <div 
      className={cn(
        "fixed inset-0 top-[58px] bg-background/95 backdrop-blur-sm z-40 md:hidden transform transition-transform duration-200 ease-in-out", 
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <nav className="container px-4 py-8 flex flex-col">
        <div className="space-y-4 mb-8">
          {navLinks.map((link) => (
            <div
              key={link.name}
              className="block px-4 py-2 text-lg font-medium text-foreground hover:bg-muted rounded-md cursor-pointer"
              onClick={() => handleNavigationClick(link.path)}
            >
              {link.name}
            </div>
          ))}
          
          {/* Direct Admin Link for testing */}
          <div
            className="block px-4 py-2 text-lg font-medium text-foreground hover:bg-muted rounded-md cursor-pointer"
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/admin');
            }}
          >
            Admin Dashboard
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <p className="px-4 text-sm font-medium text-muted-foreground mb-2">Espaces</p>
          {userTypes.map((type) => (
            <div
              key={type.name}
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
              onClick={() => handleNavigationClick(type.path)}
            >
              {type.name}
            </div>
          ))}
          
          {user ? (
            <>
              <div
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/profile');
                }}
              >
                Mon Profil
              </div>
              <div
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Déconnexion
              </div>
            </>
          ) : (
            <div
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(`/auth?redirectTo=${encodeURIComponent(location.pathname)}`);
              }}
            >
              Connexion
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-6">
          <ButtonEffects 
            variant="primary"
            fullWidth
            onClick={() => handleNavigationClick("#contact")}
          >
            Contact
          </ButtonEffects>
        </div>
      </nav>
    </div>
  );
}
