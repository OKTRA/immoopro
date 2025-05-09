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
  Building2,
  CheckCircle,
  XCircle,
  ChevronDown,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { getAllAgencies } from '@/services/agency';

interface Agency {
  id: string;
  name: string;
  location: string;
  properties: number;
  verified: boolean;
  rating: number;
  createdAt: string;
  contact_email?: string;
  contact_phone?: string;
  description?: string;
}

export default function AgenciesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5); // Mock total pages
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    fetchAgencies();
  }, [currentPage, statusFilter, locationFilter, dateFilter]);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      // Appel réel à la base de données
      const { agencies, error } = await getAllAgencies(50, (currentPage - 1) * 50);
      if (error) {
        toast.error("Impossible de charger les agences : " + error);
        setAgencies([]);
      } else {
        setAgencies(agencies);
      }
    } catch (error) {
      console.error("Error fetching agencies:", error);
      toast.error("Impossible de charger les agences");
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAgency = async (agency: Agency) => {
    try {
      // Update agency status in Supabase
      await supabase.from("agencies").update({ verified: true }).eq("id", agency.id);
      // Placeholder: send notification to agency
      // await sendNotification(agency.id, "Votre agence a été approuvée.");
      toast.success(`L'agence ${agency.name} a été approuvée avec succès`);
      setAgencies(agencies.map((a) => a.id === agency.id ? { ...a, verified: true } : a));
      setShowApprovalDialog(false);
    } catch (error) {
      console.error("Error approving agency:", error);
      toast.error("Erreur lors de l'approbation de l'agence");
    }
  };

  const handleRejectAgency = async (agency: Agency) => {
    if (!rejectionReason) {
      toast.error("Veuillez fournir une raison pour le rejet");
      return;
    }
    try {
      // Update agency status in Supabase
      await supabase.from("agencies").update({ verified: false, rejection_reason: rejectionReason }).eq("id", agency.id);
      // Placeholder: send notification to agency
      // await sendNotification(agency.id, `Votre agence a été rejetée: ${rejectionReason}`);
      toast.success(`L'agence ${agency.name} a été rejetée`);
      setAgencies(agencies.map((a) => a.id === agency.id ? { ...a, verified: false } : a));
      setShowRejectionDialog(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting agency:", error);
      toast.error("Erreur lors du rejet de l'agence");
    }
  };

  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch =
      !searchTerm ||
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "verified" && agency.verified) ||
      (statusFilter === "pending" && !agency.verified);
    const matchesLocation = !locationFilter || agency.location === locationFilter;
    const matchesDate = !dateFilter || agency.createdAt === dateFilter;
    return matchesSearch && matchesStatus && matchesLocation && matchesDate;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Agences</h1>
        <Button>
          <Building2 className="h-4 w-4 mr-2" />
          Nouvelle Agence
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une agence..."
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
                  {statusFilter && (
                    <Badge
                      variant="secondary"
                      className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center"
                    >
                      1
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtrer par</h4>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Statut</h5>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: null, label: "Tous" },
                        { id: "verified", label: "Vérifiées" },
                        { id: "pending", label: "En attente" },
                      ].map((status) => (
                        <Badge
                          key={String(status.id)}
                          variant={
                            statusFilter === status.id ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => setStatusFilter(status.id)}
                        >
                          {status.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Localisation</h5>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(agencies.map(a => a.location))].map(loc => (
                        <Badge
                          key={loc}
                          variant={locationFilter === loc ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setLocationFilter(locationFilter === loc ? null : loc)}
                        >
                          {loc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Date de création</h5>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(agencies.map(a => a.createdAt))].map(date => (
                        <Badge
                          key={date}
                          variant={dateFilter === date ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setDateFilter(dateFilter === date ? null : date)}
                        >
                          {date}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStatusFilter(null);
                        setLocationFilter(null);
                        setDateFilter(null);
                        setIsFiltersOpen(false);
                      }}
                    >
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
          <CardTitle>Liste des Agences</CardTitle>
          <CardDescription>
            Gérez toutes les agences immobilières sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Propriétés</TableHead>
                  <TableHead>Évaluation</TableHead>
                  <TableHead>Vérification</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgencies.map((agency) => (
                  <TableRow key={agency.id}>
                    <TableCell className="font-medium">{agency.name}</TableCell>
                    <TableCell>{agency.location}</TableCell>
                    <TableCell>{agency.properties}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                        <span>{agency.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {agency.verified ? (
                        <div className="flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>Vérifiée</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-500">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span>En attente</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{agency.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAgency(agency);
                              setShowDetailsDialog(true);
                            }}
                          >
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>Modifier</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!agency.verified ? (
                            <>
                              <DropdownMenuItem
                                className="text-green-500"
                                onClick={() => {
                                  setSelectedAgency(agency);
                                  setShowApprovalDialog(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Vérifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => {
                                  setSelectedAgency(agency);
                                  setShowRejectionDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejeter
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem className="text-yellow-500">
                              <XCircle className="h-4 w-4 mr-2" />
                              Retirer vérification
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

          {!loading && totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((prev) => Math.max(prev - 1, 1));
                      }}
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPages),
                        );
                      }}
                      aria-disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agency Details Dialog */}
      {selectedAgency && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedAgency.name}</DialogTitle>
              <DialogDescription>
                Détails de l'agence immobilière
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Localisation</h4>
                  <p className="text-sm">{selectedAgency.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Propriétés</h4>
                  <p className="text-sm">{selectedAgency.properties}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Email</h4>
                  <p className="text-sm">
                    {selectedAgency.contact_email || "Non spécifié"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Téléphone</h4>
                  <p className="text-sm">
                    {selectedAgency.contact_phone || "Non spécifié"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm">
                  {selectedAgency.description ||
                    "Aucune description disponible"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Évaluation</h4>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                    <span>{selectedAgency.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Date de création</h4>
                  <p className="text-sm">{selectedAgency.createdAt}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium">Statut</h4>
                {selectedAgency.verified ? (
                  <Badge variant="success">Vérifiée</Badge>
                ) : (
                  <Badge variant="outline">En attente</Badge>
                )}
              </div>
            </div>

            <DialogFooter>
              {!selectedAgency.verified && (
                <div className="flex gap-2 mr-auto">
                  <Button
                    variant="outline"
                    className="text-red-500"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      setShowRejectionDialog(true);
                    }}
                  >
                    Rejeter
                  </Button>
                  <Button
                    variant="outline"
                    className="text-green-500"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      setShowApprovalDialog(true);
                    }}
                  >
                    Approuver
                  </Button>
                </div>
              )}
              <Button onClick={() => setShowDetailsDialog(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Approval Dialog */}
      {selectedAgency && (
        <AlertDialog
          open={showApprovalDialog}
          onOpenChange={setShowApprovalDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approuver l'agence</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir approuver l'agence{" "}
                {selectedAgency.name}? Cette action permettra à l'agence de
                publier des propriétés sur la plateforme.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleApproveAgency(selectedAgency)}
              >
                Approuver
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Rejection Dialog */}
      {selectedAgency && (
        <Dialog
          open={showRejectionDialog}
          onOpenChange={setShowRejectionDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter l'agence</DialogTitle>
              <DialogDescription>
                Veuillez fournir une raison pour le rejet de l'agence{" "}
                {selectedAgency.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="reason" className="text-sm font-medium">
                  Raison du rejet
                </label>
                <textarea
                  id="reason"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Veuillez expliquer pourquoi cette agence est rejetée..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectionDialog(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRejectAgency(selectedAgency)}
                disabled={!rejectionReason.trim()}
              >
                Rejeter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
