
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PropertyStatusFixer from './PropertyStatusFixer';

export default function PropertyStatusFixPage() {
  const { agencyId } = useParams<{ agencyId: string }>();
  
  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Correction des statuts de propriété</h1>
        <Link to={`/agencies/${agencyId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'agence
          </Button>
        </Link>
      </div>
      
      <PropertyStatusFixer />
    </div>
  );
}
