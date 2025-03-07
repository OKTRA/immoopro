
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";

interface LeaseHeaderProps {
  lease: any;
  onBack: () => void;
}

export default function LeaseHeader({ lease, onBack }: LeaseHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <CardTitle className="text-2xl font-bold">Gestion des paiements</CardTitle>
        <CardDescription>
          Bail pour la propriété "{lease?.properties?.title}"
        </CardDescription>
      </div>
      <Button 
        variant="outline" 
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la propriété
      </Button>
    </div>
  );
}
