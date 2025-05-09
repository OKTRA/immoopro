import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Check,
  X,
  ChevronDown,
  Loader2,
  Shield,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { UserRoleDialog } from "./UserRoleDialog";
import { AdminRoleDialog } from "./AdminRoleDialog";
import { AdminUserAttributes } from "@supabase/supabase-js";
import { assignAdminRole, revokeAdminRole } from "@/services/adminRoleService";
import { Pagination } from "@/components/ui/pagination";
import { UserCreationDialog } from "./UserCreationDialog";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  joinDateRaw: Date;
  isAdmin?: boolean;
  adminRole?: string;
  firstName?: string;
  lastName?: string;
}

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showAdminRoleDialog, setShowAdminRoleDialog] = useState(false);
  const [showUserCreationDialog, setShowUserCreationDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Try to get users from auth with pagination
      let authUsers;
      let authError;

      try {
        const result = await supabase.auth.admin.listUsers({
          page: currentPage,
          perPage: usersPerPage,
        });
        authUsers = result.data;
        authError = result.error;
      } catch (e) {
        console.error("Error accessing auth.admin.listUsers:", e);
        authError = e;
      }

      if (authError) {
        console.warn(
          "Could not use auth.admin.listUsers, falling back to profiles table",
          authError,
        );
        // Fallback: Get users from profiles table instead
        const {
          data: profileUsers,
          error: profilesError,
          count,
        } = await supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .range(
            (currentPage - 1) * usersPerPage,
            currentPage * usersPerPage - 1,
          );

        if (profilesError) {
          throw profilesError;
        }

        // Create a compatible structure to match what we'd get from auth.admin.listUsers
        authUsers = {
          users: profileUsers.map((profile) => ({
            id: profile.id,
            email: profile.email,
            created_at: profile.created_at,
            confirmed_at: true, // Assume confirmed since they're in profiles
            banned: profile.banned || false,
          })),
          count: count,
        };
      }

      // Get profiles to match with roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role, created_at");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue with what we have, we'll handle missing profiles gracefully
      }

      // Get admin roles
      let adminRoles = [];
      try {
        const { data, error: adminRolesError } = await supabase
          .from("admin_roles")
          .select("user_id, role_level");

        if (!adminRolesError) {
          adminRoles = data || [];
        } else if (adminRolesError.code !== "PGRST116") {
          // PGRST116 means the table doesn't exist, which is fine
          console.error("Error fetching admin roles:", adminRolesError);
        }
      } catch (e) {
        console.error("Exception fetching admin roles:", e);
        // Continue without admin roles
      }

      // Create a map of profiles for quick lookup
      const profileMap = new Map();
      (profiles || []).forEach((profile) => {
        profileMap.set(profile.id, profile);
      });

      // Create a map of admin roles for quick lookup
      const adminRoleMap = new Map();
      (adminRoles || []).forEach((adminRole) => {
        adminRoleMap.set(adminRole.user_id, adminRole.role_level);
      });

      // Set total pages
      if (authUsers) {
        setTotalUsers(authUsers.count || 0);
        setTotalPages(Math.ceil((authUsers.count || 0) / usersPerPage));
      }

      // Transform auth users and match with profiles
      const transformedUsers: User[] =
        (authUsers?.users || []).map((user) => {
          const profile = profileMap.get(user.id);
          const firstName = profile?.first_name || "";
          const lastName = profile?.last_name || "";
          const name = profile
            ? `${firstName} ${lastName}`.trim()
            : user.email?.split("@")[0] || "Unknown User";

          // Explicitly cast status to one of the allowed values
          let userStatus: "active" | "inactive" | "suspended";
          if (user.banned) {
            userStatus = "suspended";
          } else if (user.confirmed_at) {
            userStatus = "active";
          } else {
            userStatus = "inactive";
          }

          const adminRole = adminRoleMap.get(user.id);
          const joinDateRaw = new Date(
            user.created_at || profile?.created_at || Date.now(),
          );

          return {
            id: user.id,
            name: name,
            firstName,
            lastName,
            email: user.email || profile?.email || "",
            role: profile?.role || "public",
            status: userStatus,
            joinDate: joinDateRaw.toLocaleDateString(),
            joinDateRaw: joinDateRaw,
            isAdmin: !!adminRole,
            adminRole: adminRole,
          };
        }) || [];

      setUsers(transformedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(
        `Impossible de charger les utilisateurs: ${error.message || error}`,
      );

      // Fallback to mock data with correct typing
      const mockUsers: User[] = [
        {
          id: "1",
          name: "John Doe",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          role: "owner",
          status: "active",
          joinDate: "12/05/2023",
          joinDateRaw: new Date("2023-05-12"),
          isAdmin: false,
        },
        {
          id: "2",
          name: "Jane Smith",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          role: "agent",
          status: "active",
          joinDate: "23/06/2023",
          joinDateRaw: new Date("2023-06-23"),
          isAdmin: false,
        },
        {
          id: "3",
          name: "Robert Johnson",
          firstName: "Robert",
          lastName: "Johnson",
          email: "robert.j@example.com",
          role: "admin",
          status: "active",
          joinDate: "05/01/2023",
          joinDateRaw: new Date("2023-01-05"),
          isAdmin: true,
          adminRole: "admin",
        },
      ];
      setUsers(mockUsers);
      setTotalUsers(mockUsers.length);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );

      toast.success("Rôle mis à jour avec succès");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }

    setShowRoleDialog(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const updateData: AdminUserAttributes = {};

      if (currentStatus === "active") {
        // Deactivate user - use user_metadata to track banned status
        updateData.user_metadata = { banned: true };

        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          updateData,
        );

        if (error) throw error;

        setUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, status: "suspended" as const }
              : user,
          ),
        );

        toast.success("Utilisateur désactivé");
      } else {
        // Activate user
        updateData.user_metadata = { banned: false };

        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          updateData,
        );

        if (error) throw error;

        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, status: "active" as const } : user,
          ),
        );

        toast.success("Utilisateur activé");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Erreur lors de la modification du statut");
    }
  };

  const handleAdminRoleUpdate = async (userId: string, adminRole: string) => {
    try {
      const { success, error } = await assignAdminRole(userId, adminRole);

      if (!success) throw error;

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, isAdmin: true, adminRole, role: adminRole }
            : user,
        ),
      );

      toast.success("Rôle administrateur attribué avec succès");
    } catch (error) {
      console.error("Error updating admin role:", error);
      toast.error("Erreur lors de l'attribution du rôle administrateur");
    }

    setShowAdminRoleDialog(false);
    setSelectedUser(null);
  };

  const handleRevokeAdminRole = async (userId: string) => {
    try {
      const { success, error } = await revokeAdminRole(userId);

      if (!success) throw error;

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, isAdmin: false, adminRole: undefined, role: "public" }
            : user,
        ),
      );

      toast.success("Rôle administrateur révoqué avec succès");
    } catch (error) {
      console.error("Error revoking admin role:", error);
      toast.error("Erreur lors de la révocation du rôle administrateur");
    }
  };

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const openAdminRoleDialog = (user: User) => {
    setSelectedUser(user);
    setShowAdminRoleDialog(true);
  };

  // Reset to first page when search term or filters change
  useEffect(() => {
    if (searchTerm || roleFilter || statusFilter || dateFilter) {
      setCurrentPage(1);
    }
  }, [searchTerm, roleFilter, statusFilter, dateFilter]);

  const clearFilters = () => {
    setRoleFilter(null);
    setStatusFilter(null);
    setDateFilter(null);
  };

  const filteredUsers = users.filter((user) => {
    // Search term filter
    const matchesSearch =
      !searchTerm ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = !roleFilter || user.role === roleFilter;

    // Status filter
    const matchesStatus = !statusFilter || user.status === statusFilter;

    // Date filter
    const matchesDate =
      !dateFilter ||
      (user.joinDateRaw &&
        user.joinDateRaw.getDate() === dateFilter.getDate() &&
        user.joinDateRaw.getMonth() === dateFilter.getMonth() &&
        user.joinDateRaw.getFullYear() === dateFilter.getFullYear());

    return matchesSearch && matchesRole && matchesStatus && matchesDate;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <Button onClick={() => setShowUserCreationDialog(true)}>
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

            <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtres
                  {(roleFilter || statusFilter || dateFilter) && (
                    <Badge
                      variant="secondary"
                      className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center"
                    >
                      {
                        [roleFilter, statusFilter, dateFilter].filter(Boolean)
                          .length
                      }
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtrer par</h4>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Rôle</h5>
                    <div className="flex flex-wrap gap-2">
                      {["public", "owner", "agent", "tenant", "admin"].map(
                        (role) => (
                          <Badge
                            key={role}
                            variant={
                              roleFilter === role ? "default" : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                              setRoleFilter(roleFilter === role ? null : role)
                            }
                          >
                            {role}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Statut</h5>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "active", label: "Actif" },
                        { id: "inactive", label: "Inactif" },
                        { id: "suspended", label: "Suspendu" },
                      ].map((status) => (
                        <Badge
                          key={status.id}
                          variant={
                            statusFilter === status.id ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            setStatusFilter(
                              statusFilter === status.id ? null : status.id,
                            )
                          }
                        >
                          {status.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Date d'inscription</h5>
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      className="rounded-md border"
                      locale={fr}
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Réinitialiser
                    </Button>
                    <Button size="sm" onClick={() => setIsFiltersOpen(false)}>
                      Appliquer
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
                  <TableHead>Admin</TableHead>
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
                        {user.role || "Non défini"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <div className="flex items-center text-green-600">
                          <Shield className="h-4 w-4 mr-1" />
                          <span>{user.adminRole}</span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => openAdminRoleDialog(user)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Promouvoir
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.status === "active" && (
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span>Actif</span>
                        </div>
                      )}
                      {user.status === "inactive" && (
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
                          <span>Inactif</span>
                        </div>
                      )}
                      {user.status === "suspended" && (
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
                          <DropdownMenuItem
                            onClick={() => openRoleDialog(user)}
                          >
                            Modifier le rôle
                          </DropdownMenuItem>
                          {user.isAdmin ? (
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => handleRevokeAdminRole(user.id)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Révoquer admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => openAdminRoleDialog(user)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Promouvoir en admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>Voir détails</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === "active" ? (
                            <DropdownMenuItem
                              className="text-yellow-500"
                              onClick={() =>
                                toggleUserStatus(user.id, user.status)
                              }
                            >
                              <X className="h-4 w-4 mr-2" />
                              Désactiver
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-green-500"
                              onClick={() =>
                                toggleUserStatus(user.id, user.status)
                              }
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

          {!isLoading && totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * usersPerPage + 1} à{" "}
                {Math.min(currentPage * usersPerPage, totalUsers)} sur{" "}
                {totalUsers} utilisateurs
              </div>
              <Pagination>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageToShow;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageToShow}
                        variant={
                          currentPage === pageToShow ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageToShow)}
                        className="w-8 h-8"
                      >
                        {pageToShow}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Pagination>
            </div>
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

      {/* Admin Role Dialog */}
      {selectedUser && (
        <AdminRoleDialog
          isOpen={showAdminRoleDialog}
          onClose={() => setShowAdminRoleDialog(false)}
          user={selectedUser}
          onRoleUpdate={handleAdminRoleUpdate}
        />
      )}

      {/* User Creation Dialog */}
      <UserCreationDialog
        isOpen={showUserCreationDialog}
        onClose={() => setShowUserCreationDialog(false)}
        onUserCreated={fetchUsers}
      />
    </>
  );
}
