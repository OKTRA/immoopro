
import CreateAgencyForm from "@/components/agencies/CreateAgencyForm";
import { useEffect } from "react";

export default function CreateAgencyPage() {
  useEffect(() => {
    // Mettre à jour le titre de la page
    document.title = "Créer une agence | Immobilier";
  }, []);

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <CreateAgencyForm />
    </div>
  );
}
