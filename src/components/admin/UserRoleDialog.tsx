
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onRoleUpdate: (userId: string, newRole: string) => void;
}

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'agent', label: 'Agent' },
  { value: 'propriétaire', label: 'Propriétaire' },
  { value: 'locataire', label: 'Locataire' },
  { value: 'public', label: 'Utilisateur Public' },
];

export function UserRoleDialog({ 
  isOpen, 
  onClose, 
  user, 
  onRoleUpdate 
}: UserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState(user.role || 'public');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateRole = async () => {
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      await onRoleUpdate(user.id, selectedRole);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le rôle utilisateur</DialogTitle>
          <DialogDescription>
            Changer le rôle de {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Rôle
            </Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={isUpdating}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Annuler
          </Button>
          <Button onClick={handleUpdateRole} disabled={isUpdating}>
            {isUpdating ? 'Mise à jour...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
