
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
}

interface AdminRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onRoleUpdate: (userId: string, newRole: string) => void;
}

const ADMIN_ROLES = [
  { value: 'super_admin', label: 'Super Administrateur' },
  { value: 'admin', label: 'Administrateur' },
  { value: 'moderator', label: 'Modérateur' },
];

export function AdminRoleDialog({ 
  isOpen, 
  onClose, 
  user, 
  onRoleUpdate 
}: AdminRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePromoteToAdmin = async () => {
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
          <DialogTitle>Promouvoir en administrateur</DialogTitle>
          <DialogDescription>
            Attribuer un rôle administratif à {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="admin-role" className="text-right">
              Niveau d'accès
            </Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={isUpdating}
            >
              <SelectTrigger id="admin-role" className="col-span-3">
                <SelectValue placeholder="Sélectionnez un niveau" />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_ROLES.map((role) => (
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
          <Button onClick={handlePromoteToAdmin} disabled={isUpdating}>
            {isUpdating ? 'Promotion en cours...' : 'Promouvoir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
