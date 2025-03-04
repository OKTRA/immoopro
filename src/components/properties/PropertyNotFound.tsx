
import { useParams, useNavigate } from "react-router-dom";

export default function PropertyNotFound() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center p-8 max-w-md mx-auto border rounded-lg shadow-sm">
        <div className="mx-auto bg-muted rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Propriété non trouvée</h2>
        <p className="text-muted-foreground mb-6">
          Cette propriété n'existe pas ou a été supprimée
        </p>
        <button 
          onClick={() => navigate(`/agencies/${agencyId}`)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Retour à l'agence
        </button>
      </div>
    </div>
  );
}
