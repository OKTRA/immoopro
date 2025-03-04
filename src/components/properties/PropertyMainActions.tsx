
import React from 'react';
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

interface PropertyMainActionsProps {
  hasActiveLeases: boolean;
  activeLeaseId?: string;
  handleViewPayments: (leaseId: string) => void;
}

export default function PropertyMainActions({ 
  hasActiveLeases, 
  activeLeaseId, 
  handleViewPayments 
}: PropertyMainActionsProps) {
  if (!hasActiveLeases || !activeLeaseId) return null;
  
  return (
    <div className="my-4 flex justify-center">
      <Button 
        size="lg" 
        className="px-8 py-6 text-lg"
        onClick={() => handleViewPayments(activeLeaseId)}
      >
        <DollarSign className="h-6 w-6 mr-2" />
        Accéder à la gestion des paiements
      </Button>
    </div>
  );
}
