
import { Link } from "react-router-dom";
import { Button } from "./button";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "@/services/authService";
import { toast } from "sonner";
import { LogOut, LogIn, UserCircle } from "lucide-react";

export function NavbarLinks() {
  const { user, isLoading } = useUser();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error(`Erreur de déconnexion: ${error}`);
      } else {
        toast.success("Vous avez été déconnecté avec succès");
      }
    } catch (error: any) {
      toast.error(`Erreur de déconnexion: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link to="/" className="text-sm font-medium mr-2">
        Accueil
      </Link>
      <Link to="/properties" className="text-sm font-medium mr-2">
        Propriétés
      </Link>
      <Link to="/agencies" className="text-sm font-medium mr-2">
        Agences
      </Link>
      
      {isLoading ? (
        <div className="animate-pulse w-20 h-8 bg-muted rounded" />
      ) : user ? (
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <UserCircle className="h-4 w-4" />
              <span className="hidden md:inline">Mon compte</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-destructive">
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Déconnexion</span>
          </Button>
        </div>
      ) : (
        <Link to="/auth">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <LogIn className="h-4 w-4" />
            <span>Connexion</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
