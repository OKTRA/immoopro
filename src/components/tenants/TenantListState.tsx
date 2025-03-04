
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface TenantListStateProps {
  loading: boolean;
  empty: boolean;
  searchQuery: string;
  propertyId?: string;
}

const TenantListState: React.FC<TenantListStateProps> = ({
  loading,
  empty,
  searchQuery,
  propertyId
}) => {
  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Chargement des locataires...</p>
        </CardContent>
      </Card>
    );
  }

  if (empty) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">
            {searchQuery ? 
              "Aucun locataire ne correspond à votre recherche." : 
              propertyId ? 
                "Aucun locataire n'a encore été ajouté à cette propriété." :
                "Aucun locataire n'a encore été ajouté à cette agence."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default TenantListState;
