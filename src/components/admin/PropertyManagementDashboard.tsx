import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
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
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Search, Filter, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getProperties } from '@/services/property/propertyQueries';

export default function PropertyManagementDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const { properties, error } = await getProperties();
      if (error) {
        toast.error("Impossible de charger les propriétés : " + error);
        setProperties([]);
      } else {
        setProperties(properties);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des propriétés");
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Approval/rejection handlers
  const handleApprove = async (property: any) => {
    setIsLoading(true);
    try {
      // await supabase.from("properties").update({ status: "approved" }).eq("id", property.id);
      // Placeholder: send notification to owner
      // await sendNotification(property.ownerId, "Votre propriété a été approuvée.");
      setProperties((prev) => prev.map((p) => p.id === property.id ? { ...p, status: "approved" } : p));
      toast.success(`Propriété '${property.title}' approuvée`);
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
    } finally {
      setIsLoading(false);
    }
  };
  const handleReject = async (property: any) => {
    setIsLoading(true);
    try {
      // await supabase.from("properties").update({ status: "rejected" }).eq("id", property.id);
      // Placeholder: send notification to owner
      // await sendNotification(property.ownerId, "Votre propriété a été rejetée.");
      setProperties((prev) => prev.map((p) => p.id === property.id ? { ...p, status: "rejected" } : p));
      toast.success(`Propriété '${property.title}' rejetée`);
    } catch (error) {
      toast.error("Erreur lors du rejet");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering and search
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      !searchTerm ||
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || property.status === statusFilter;
    const matchesOwner = !ownerFilter || property.owner === ownerFilter;
    const matchesDate = !dateFilter || property.createdAt === dateFilter;
    return matchesSearch && matchesStatus && matchesOwner && matchesDate;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Propriétés</h1>
      </div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une propriété..."
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
                  {(statusFilter || ownerFilter || dateFilter) && (
                    <Badge
                      variant="secondary"
                      className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center"
                    >
                      {[statusFilter, ownerFilter, dateFilter].filter(Boolean).length}
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
                      {["pending", "approved", "rejected"].map((status) => (
                        <Badge
                          key={status}
                          variant={statusFilter === status ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                        >
                          {status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Propriétaire</h5>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(properties.map((p) => p.owner))].map((owner) => (
                        <Badge
                          key={owner}
                          variant={ownerFilter === owner ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setOwnerFilter(ownerFilter === owner ? null : owner)}
                        >
                          {owner}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Date de création</h5>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(properties.map((p) => p.createdAt))].map((date) => (
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
                        setOwnerFilter(null);
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
          <CardTitle>Liste des Propriétés</CardTitle>
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
                  <TableHead>Titre</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.owner}</TableCell>
                    <TableCell>
                      {property.status === "approved" && (
                        <Badge variant="success">Approuvée</Badge>
                      )}
                      {property.status === "pending" && (
                        <Badge variant="outline">En attente</Badge>
                      )}
                      {property.status === "rejected" && (
                        <Badge variant="destructive">Rejetée</Badge>
                      )}
                    </TableCell>
                    <TableCell>{property.type}</TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>{property.price.toLocaleString()} FCFA</TableCell>
                    <TableCell>{property.createdAt}</TableCell>
                    <TableCell className="text-right">
                      {property.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 mr-2"
                            onClick={() => handleApprove(property)}
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleReject(property)}
                            disabled={isLoading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 