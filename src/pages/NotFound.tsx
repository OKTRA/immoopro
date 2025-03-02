
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-primary/10 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl font-bold tracking-tight">404</div>
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold mb-4">Page introuvable</h1>
        
        <p className="text-muted-foreground mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
          Veuillez vérifier l'URL ou retourner à la page d'accueil.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <ButtonEffects variant="primary" className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </ButtonEffects>
          </Link>
          
          <Link to="/#search">
            <ButtonEffects variant="outline" className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Rechercher un bien
            </ButtonEffects>
          </Link>
        </div>
        
        <div className="mt-12">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); window.history.back(); }}
            className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour à la page précédente
          </a>
        </div>
      </div>
      
      {/* Abstract shape */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </div>
  );
};

export default NotFound;
