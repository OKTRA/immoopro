
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { UserType } from "./types";

interface NavbarMobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  navLinks: { name: string; path: string }[];
  userTypes: UserType[];
  handleNavigation: (path: string) => void;
  handleLogout: () => void;
  user: any;
  location: any;
}

export function NavbarMobileMenu({
  mobileMenuOpen,
  navLinks,
  userTypes,
  handleNavigation,
  handleLogout,
  user,
  location,
}: NavbarMobileMenuProps) {
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
            <a
              key={link.name}
              href={link.path}
              className="block px-4 py-2 text-lg font-medium text-foreground hover:bg-muted rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <p className="px-4 text-sm font-medium text-muted-foreground mb-2">Espaces</p>
          {userTypes.map((type) => (
            <div
              key={type.name}
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
              onClick={() => handleNavigation(type.path)}
            >
              {type.name}
            </div>
          ))}
          
          {user ? (
            <>
              <div
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
                onClick={() => handleNavigation('/profile')}
              >
                Mon Profil
              </div>
              <div
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
                onClick={handleLogout}
              >
                Déconnexion
              </div>
            </>
          ) : (
            <div
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
              onClick={() => handleNavigation(`/login?redirectTo=${encodeURIComponent(location.pathname)}`)}
            >
              Connexion
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-6">
          <Link 
            to="#contact"
            className="block w-full"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ButtonEffects 
              variant="primary"
              fullWidth
            >
              Contact
            </ButtonEffects>
          </Link>
        </div>
      </nav>
    </div>
  );
}
