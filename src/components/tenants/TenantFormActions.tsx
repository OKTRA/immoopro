
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, X, UserPlus } from "lucide-react";

interface TenantFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

const TenantFormActions = ({ onCancel, isSubmitting }: TenantFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button variant="outline" onClick={onCancel} type="button">
        <X className="mr-2 h-4 w-4" /> Annuler
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )}
        Ajouter le locataire
      </Button>
    </div>
  );
};

export default TenantFormActions;
