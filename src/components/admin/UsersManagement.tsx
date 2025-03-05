
import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Search, Filter, MoreHorizontal, UserPlus, Check, X, ChevronDown, Loader2
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { UserRoleDialog } from './UserRoleDialog';
import { AdminUserAttributes } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
}

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get users from auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }
      
      // Get profiles to match with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, created_at');
      
      if (profilesError) {
        throw profilesError;
      }
      
      // Create a map of profiles for quick lookup
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      
      // Transform auth users and match with profiles
      const transformedUsers: User[] = authUsers?.users.map(user => {
        const profile = profileMap.get(user.id);
        const name = profile ? 
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
          'Unknown User';
          
        // Explicitly cast status to one of the allowed values
        let userStatus: 'active' | 'inactive' | 'suspended';
        if (user.banned) {
          userStatus = 'suspended';
        } else if (user.confirmed_at) {
          userStatus = 'active';
        } else {
          userStatus = 'inactive';
        }
        
        return {
          id: user.id,
          name: name || user.email?.split('@')[0] || 'Unknown',
          email: user.email || '',
          role: profile?.role || 'user',
          status: userStatus,
          joinDate: new Date(user.created_at).toLocaleDateString()
        };
      }) || [];
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Impossible de charger les utilisateurs');
      
      // Fallback to mock data with correct typing
      setUsers([
        { 
          id: '1', 
          name: 'John Doe', 
          email: 'john.doe@example.com', 
          role: 'propriétaire',
          status: 'active',
          joinDate: '12/05/2023'
        },
        { 
          id: '2', 
          name: 'Jane Smith', 
          email: 'jane.smith@example.com', 
          role: 'agent',
          status: 'active',
          joinDate: '23/06/2023'
        },
        { 
          id: '3', 
          name: 'Robert Johnson', 
          email: 'robert.j@example.com', 
          role: 'admin',
          status: 'active',
          joinDate: '05/01/2023'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast.success('Rôle mis à jour avec succès');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
    
    setShowRoleDialog(false);
    setSelectedUser(null);
  };
  
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const updateData: AdminUserAttributes = {};
      
      if (currentStatus === 'active') {
        // Deactivate user - use user_metadata to track banned status
        updateData.user_metadata = { banned: true };
        
        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          updateData
        );
        
        if (error) throw error;
        
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: 'suspended' as const } : user
        ));
        
        toast.success('Utilisateur désactivé');
      } else {
        // Activate user
        updateData.user_metadata = { banned: false };
        
        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          updateData
        );
        
        if (error) throw error;
        
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: 'active' as const } : user
        ));
        
        toast.success('Utilisateur activé');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };
  
  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un utilisateur..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtres
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>
            Gérez tous les utilisateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openRoleDialog(user)}
                      >
                        {user.role || 'Non défini'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {user.status === 'active' && (
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span>Actif</span>
                        </div>
                      )}
                      {user.status === 'inactive' && (
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
                          <span>Inactif</span>
                        </div>
                      )}
                      {user.status === 'suspended' && (
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                          <span>Suspendu</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                            Modifier le rôle
                          </DropdownMenuItem>
                          <DropdownMenuItem>Voir détails</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <DropdownMenuItem 
                              className="text-yellow-500"
                              onClick={() => toggleUserStatus(user.id, user.status)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Désactiver
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-green-500"
                              onClick={() => toggleUserStatus(user.id, user.status)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Activer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Dialog */}
      {selectedUser && (
        <UserRoleDialog
          isOpen={showRoleDialog}
          onClose={() => setShowRoleDialog(false)}
          user={selectedUser}
          onRoleUpdate={handleRoleUpdate}
        />
      )}
    </>
  );
}
