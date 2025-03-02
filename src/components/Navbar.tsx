
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ButtonEffects } from "./ui/ButtonEffects";
import { Search, Menu, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userRole } = useUser();
  const navigate = useNavigate();

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

  const navLinks = [
    { name: "Recherche", path: "#search" },
    { name: "Propriétés", path: "#properties" },
    { name: "Agences", path: "#agencies" },
    { name: "Tarifs", path: "#pricing" },
  ];

  const userTypes = [
    { name: "Espace Agence", path: "/agencies" },
    { name: "Espace Propriétaire", path: "/owner" },
    { name: "Admin", path: "/admin" },
  ];

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-200 ease-in-out",
        isScrolled 
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-2xl font-semibold tracking-tight text-foreground mr-8 flex items-center"
            >
              <span className="text-primary">immo</span>
              <span>connect</span>
            </Link>

            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative link-underline"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex">
              <ButtonEffects 
                variant="ghost" 
                size="sm"
                className="mr-2 group"
              >
                <Search 
                  className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" 
                />
              </ButtonEffects>

              <div className="h-6 w-px bg-border mx-2"></div>

              {userTypes.map((type) => (
                <Link to={type.path} key={type.name}>
                  <ButtonEffects 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "mx-1",
                      window.location.pathname.includes(type.path.toLowerCase()) && 
                      "bg-primary/10 text-primary"
                    )}
                  >
                    {type.name}
                  </ButtonEffects>
                </Link>
              ))}

              {user ? (
                <Link to="/profile">
                  <ButtonEffects
                    variant="ghost"
                    size="sm"
                    className="mx-1"
                  >
                    Mon Profil
                  </ButtonEffects>
                </Link>
              ) : (
                <Link to="/login">
                  <ButtonEffects
                    variant="ghost"
                    size="sm"
                    className="mx-1"
                  >
                    Connexion
                  </ButtonEffects>
                </Link>
              )}
            </div>

            <Link to="#contact">
              <ButtonEffects 
                variant="primary"
                className="hidden md:flex"
              >
                Contact
              </ButtonEffects>
            </Link>

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
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
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
              <div
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
                onClick={() => handleNavigation('/profile')}
              >
                Mon Profil
              </div>
            ) : (
              <div
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-md cursor-pointer"
                onClick={() => handleNavigation('/login')}
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
    </header>
  );
}
