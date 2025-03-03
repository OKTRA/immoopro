
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { UserType } from "./types";

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
    setMobileMenuOpen(false);
    
    // Si c'est un lien d'ancrage, utilisez window.location.href
    if (path.startsWith('#')) {
      if (window.location.pathname === '/') {
        window.location.href = path;
      } else {
        navigate('/');
        // Petit délai pour s'assurer que la page a chargé avant de scroller
        setTimeout(() => {
          window.location.href = path;
        }, 100);
      }
    } else {
      // Sinon, utilisez navigate pour la navigation de l'application
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
                navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`);
              }}
            >
              Connexion
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-6">
          <div 
            className="block w-full cursor-pointer"
            onClick={() => {
              setMobileMenuOpen(false);
              if (window.location.pathname === '/') {
                window.location.href = "#contact";
              } else {
                navigate('/#contact');
              }
            }}
          >
            <ButtonEffects 
              variant="primary"
              fullWidth
            >
              Contact
            </ButtonEffects>
          </div>
        </div>
      </nav>
    </div>
  );
}
