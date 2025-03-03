
import { Link } from "react-router-dom";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { Search, LogOut } from "lucide-react";
import { UserType } from "./types";
import { cn } from "@/lib/utils";

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
  return (
    <div className="hidden md:flex items-center space-x-4">
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
                (window.location.pathname.includes(type.path.split("?")[0].toLowerCase()) ||
                 (user && userRole === type.role)) && 
                "bg-primary/10 text-primary"
              )}
            >
              {type.name}
            </ButtonEffects>
          </Link>
        ))}

        {user ? (
          <div className="flex space-x-1">
            <Link to="/profile">
              <ButtonEffects
                variant="ghost"
                size="sm"
                className="mx-1"
              >
                Mon Profil
              </ButtonEffects>
            </Link>
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
          <Link to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`}>
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
    </div>
  );
}
