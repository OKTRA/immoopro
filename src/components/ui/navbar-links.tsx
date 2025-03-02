
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/services/authService';
import { User, LogOut, Settings, UserIcon } from 'lucide-react';

export function NavbarLinks() {
  const { user, profile, isLoading } = useUser();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = () => {
    if (profile && profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex items-center space-x-4">
      <Link to="/" className="text-foreground hover:text-primary transition-colors">
        Accueil
      </Link>
      <Link to="/properties" className="text-foreground hover:text-primary transition-colors">
        Propriétés
      </Link>
      <Link to="/agencies" className="text-foreground hover:text-primary transition-colors">
        Agences
      </Link>
      
      {isLoading ? (
        <Button variant="ghost" size="sm" disabled>
          Chargement...
        </Button>
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.first_name || 'User'} />
                ) : (
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard" className="cursor-pointer flex items-center">
                <UserIcon className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center space-x-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Connexion</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/register">Inscription</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
