
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { fixPropertyStatus } from '@/services/tenant/leaseService';

interface FixPropertyStatusButtonProps {
  propertyId: string;
  leaseId?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export default function FixPropertyStatusButton({
  propertyId,
  leaseId,
  variant = 'secondary',
  size = 'sm',
  className = '',
  children
}: FixPropertyStatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFixStatus = async () => {
    if (!propertyId) {
      toast.error("Identifiant de propriété invalide");
      return;
    }

    setIsLoading(true);
    try {
      const { success, message, error } = await fixPropertyStatus(propertyId, leaseId);
      
      if (success) {
        toast.success(message);
      } else {
        toast.error(`Erreur: ${error}`);
      }
    } catch (error: any) {
      console.error('Error fixing property status:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleFixStatus} 
      variant={variant} 
      size={size}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? 'Correction...' : children || 'Corriger le statut'}
    </Button>
  );
}
