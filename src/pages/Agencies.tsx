
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Building2, Search, ArrowUpDown, Check, X } from "lucide-react";
import { getAllAgencies } from "@/services/agencyService";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Agency } from "@/assets/types";

const Agencies = () => {
  const navigate = useNavigate();
  const { userRole } = useUser();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ["agencies", sortBy, sortOrder],
    queryFn: () => getAllAgencies(20, 0, sortBy, sortOrder),
  });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Explicitly type agencies as Agency[] to avoid type confusion
  const agencies = data?.agencies as Agency[] | undefined;
  
  const filteredAgencies = agencies?.filter(
    (agency) =>
      agency.name.toLowerCase().includes(search.toLowerCase()) ||
      agency.location?.toLowerCase().includes(search.toLowerCase())
  );

  const canAddAgency = userRole === "admin";

  if (isError && error) {
    toast.error("Erreur de chargement des agences", {
      description: error.toString(),
    });
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agences Immobilières</h1>
        {canAddAgency && (
          <Button onClick={() => navigate("/agencies/create")}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une agence
          </Button>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
          <CardDescription>
            Trouver l'agence immobilière qui vous convient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une agence..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <Spinner size="lg" />
        </div>
      ) : !agencies || agencies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Aucune agence trouvée</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Il n'y a pas encore d'agences immobilières enregistrées dans le système.
            </p>
            {canAddAgency && (
              <Button onClick={() => navigate("/agencies/create")}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter une agence
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Logo</TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("name")}
                  >
                    Nom
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("location")}
                  >
                    Localisation
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("properties_count")}
                  >
                    Propriétés
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("rating")}
                  >
                    Note
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Vérifié</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgencies?.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell>
                    {agency.logoUrl ? (
                      <img
                        src={agency.logoUrl}
                        alt={`${agency.name} logo`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{agency.name}</TableCell>
                  <TableCell>{agency.location || "N/A"}</TableCell>
                  <TableCell>{agency.properties || 0}</TableCell>
                  <TableCell>
                    {agency.rating ? `${agency.rating}/5.0` : "N/A"}
                  </TableCell>
                  <TableCell>
                    {agency.verified ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/agencies/${agency.id}`}>
                          Voir
                        </Link>
                      </Button>
                      {(userRole === "admin" || userRole === "agency") && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={`/agencies/${agency.id}/edit`}>
                            Modifier
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Agencies;
