
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AccessDeniedCard() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Accès non autorisé</CardTitle>
          <CardDescription>
            Vous devez sélectionner une agence pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/agencies")}>
            Retour à la liste des agences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
