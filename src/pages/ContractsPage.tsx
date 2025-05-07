import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ContractsPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Mock data for contracts - would be replaced with actual data from API
  const mockContracts = [
    {
      id: "1",
      title: "Contrat de location - Appartement 101",
      tenant: "Jean Dupont",
      property: "Appartement 101, Résidence Les Fleurs",
      createdAt: "2023-10-15",
      status: "active",
      type: "lease",
    },
    {
      id: "2",
      title: "Contrat de bail commercial - Local 3B",
      tenant: "Entreprise ABC",
      property: "Local commercial 3B, Centre d'affaires",
      createdAt: "2023-09-22",
      status: "draft",
      type: "commercial",
    },
    {
      id: "3",
      title: "Contrat de location saisonnière - Villa Azur",
      tenant: "Marie Martin",
      property: "Villa Azur, Bord de mer",
      createdAt: "2023-11-05",
      status: "expired",
      type: "seasonal",
    },
  ];

  // Filter contracts based on search query and active tab
  const filteredContracts = mockContracts.filter((contract) => {
    const matchesSearch =
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.property.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active")
      return matchesSearch && contract.status === "active";
    if (activeTab === "draft")
      return matchesSearch && contract.status === "draft";
    if (activeTab === "expired")
      return matchesSearch && contract.status === "expired";

    return matchesSearch;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des contrats</h1>
          <p className="text-muted-foreground">
            Créez, modifiez et gérez vos contrats de location
          </p>
        </div>
        <Button
          onClick={() => navigate(`/agencies/${agencyId}/contracts/create`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau contrat
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Rechercher des contrats</CardTitle>
          <CardDescription>
            Filtrez les contrats par titre, locataire ou propriété
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contrat..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous les contrats</TabsTrigger>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="draft">Brouillons</TabsTrigger>
          <TabsTrigger value="expired">Expirés</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredContracts.length > 0 ? (
            <div className="space-y-4">
              {filteredContracts.map((contract) => (
                <Card key={contract.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{contract.title}</h3>
                          <div className="text-sm text-muted-foreground">
                            <span>Locataire: {contract.tenant}</span>
                            <span className="mx-2">•</span>
                            <span>Propriété: {contract.property}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeClass(contract.status)}`}
                            >
                              {contract.status === "active" && "Actif"}
                              {contract.status === "draft" && "Brouillon"}
                              {contract.status === "expired" && "Expiré"}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              Créé le {contract.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" /> Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" /> Télécharger
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Aucun contrat trouvé
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery
                    ? "Aucun contrat ne correspond à votre recherche."
                    : "Vous n'avez pas encore créé de contrat."}
                </p>
                <Button
                  onClick={() =>
                    navigate(`/agencies/${agencyId}/contracts/create`)
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un contrat
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
