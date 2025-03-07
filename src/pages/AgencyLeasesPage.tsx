
import { useParams } from "react-router-dom";
import AgencyLeasesDisplay from "@/components/leases/AgencyLeasesDisplay";

export default function AgencyLeasesPage() {
  const { agencyId } = useParams<{ agencyId: string }>();

  if (!agencyId) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p>Identifiant d'agence manquant ou invalide.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des Baux</h1>
      <AgencyLeasesDisplay agencyId={agencyId} />
    </div>
  );
}
