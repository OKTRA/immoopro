
import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, PlusCircle, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { userRoleService, UserRole } from '@/services/userRoleService';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserRolesManagerProps {
  userId: string;
  userName: string;
}

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'agent', label: 'Agent' },
  { value: 'propriétaire', label: 'Propriétaire' },
  { value: 'locataire', label: 'Locataire' },
  { value: 'public', label: 'Utilisateur Public' },
];

export function UserRolesManager({ userId, userName }: UserRolesManagerProps) {
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRole, setNewRole] = useState<string>('');
  const [isAddingRole, setIsAddingRole] = useState(false);
  
  useEffect(() => {
    loadUserRoles();
  }, [userId]);
  
  const loadUserRoles = async () => {
    setIsLoading(true);
    try {
      const { roles, error } = await userRoleService.getUserRoles(userId);
      
      if (error) throw new Error(error);
      
      setUserRoles(roles);
    } catch (error) {
      console.error('Failed to load user roles:', error);
      toast.error('Impossible de charger les rôles');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddRole = async () => {
    if (!newRole) return;
    
    setIsAddingRole(true);
    try {
      const { success, error } = await userRoleService.assignRole(userId, newRole);
      
      if (!success) throw new Error(error);
      
      toast.success(`Rôle ${getRoleLabel(newRole)} ajouté`);
      setUserRoles([...userRoles, newRole]);
      setNewRole('');
    } catch (error) {
      console.error('Failed to add role:', error);
      toast.error('Impossible d\'ajouter le rôle');
    } finally {
      setIsAddingRole(false);
    }
  };
  
  const handleRemoveRole = async (role: string) => {
    try {
      const { success, error } = await userRoleService.removeRole(userId, role);
      
      if (!success) throw new Error(error);
      
      toast.success(`Rôle ${getRoleLabel(role)} retiré`);
      setUserRoles(userRoles.filter(r => r !== role));
    } catch (error) {
      console.error('Failed to remove role:', error);
      toast.error('Impossible de retirer le rôle');
    }
  };
  
  const getRoleLabel = (roleValue: string): string => {
    const role = AVAILABLE_ROLES.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };
  
  const getAvailableRoles = () => {
    return AVAILABLE_ROLES.filter(role => !userRoles.includes(role.value));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Rôles</CardTitle>
        <CardDescription>
          Gérer les rôles de {userName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="text-sm font-medium">Rôles actuels:</div>
              {userRoles.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  Aucun rôle spécifique (utilisateur public par défaut)
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userRoles.map(role => (
                    <Badge key={role} variant="secondary" className="px-3 py-1">
                      {getRoleLabel(role)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                        onClick={() => handleRemoveRole(role)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="text-sm font-medium">Ajouter un rôle:</div>
              
              <div className="flex items-center gap-2">
                <Select
                  value={newRole}
                  onValueChange={setNewRole}
                  disabled={isAddingRole || getAvailableRoles().length === 0}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRoles().map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleAddRole} 
                  disabled={!newRole || isAddingRole}
                  size="sm"
                >
                  {isAddingRole ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <PlusCircle className="h-4 w-4 mr-2" />
                  )}
                  Ajouter
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground">
          Les rôles déterminent les permissions de l'utilisateur sur la plateforme
        </div>
      </CardFooter>
    </Card>
  );
}
