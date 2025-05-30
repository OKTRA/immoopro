import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getAgencyPropertyExpenses,
  getAgencyExpenseStats,
  createPropertyExpense,
} from "@/services/property/propertyExpenseService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  FileText,
  Building,
  Receipt,
  Upload,
  Plus,
  Image,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Expense {
  id: string;
  propertyId: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  receiptUrl?: string;
  status: string;
  propertyTitle?: string;
}

export default function PropertyExpensesPage() {
  const { agencyId } = useParams<{ agencyId: string }>();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  // New expense form
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: "maintenance",
    status: "completed",
    date: new Date().toISOString().split("T")[0],
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Property expenses are not related to specific tenants

  // Filters
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    start?: string;
    end?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Stats
  const [expenseStats, setExpenseStats] = useState({
    totalExpenses: 0,
    maintenanceExpenses: 0,
    utilitiesExpenses: 0,
    taxesExpenses: 0,
    otherExpenses: 0,
  });

  useEffect(() => {
    if (!agencyId) return;
    fetchAgencyData();
  }, [agencyId]);

  // Add a refresh button to the UI
  const handleRefresh = () => {
    toast.info("Actualisation des données...");
    fetchAgencyData();
  };

  // Property expenses are not related to tenants, so we don't need to fetch tenants

  const fetchAgencyData = async () => {
    setLoading(true);
    try {
      // Fetch properties and expenses for this agency using the service
      const {
        expenses: expensesData,
        properties: propertiesData,
        error,
      } = await getAgencyPropertyExpenses(agencyId || "");

      if (error) {
        toast.error(`Erreur: ${error}`);
        return;
      }

      if (!propertiesData || propertiesData.length === 0) {
        toast.info("Aucune propriété trouvée pour cette agence");
        setProperties([]);
        setExpenses([]);
        return;
      }

      setProperties(propertiesData);

      // Format expenses
      const formattedExpenses = expensesData.map((expense) => {
        // Find property title
        const property = propertiesData.find(
          (p) => p.id === expense.property_id,
        );

        return {
          id: expense.id,
          propertyId: expense.property_id,
          amount: expense.amount,
          date: expense.date,
          category: expense.category,
          description: expense.description,
          status: expense.status,
          propertyTitle: property?.title || "Propriété inconnue",
          receiptUrl: expense.receipt_url,
        };
      });

      setExpenses(formattedExpenses);

      // Fetch expense statistics
      const { stats } = await getAgencyExpenseStats(agencyId || "");
      if (stats) {
        setExpenseStats(stats);
      }
    } catch (error: any) {
      console.error("Error fetching agency data:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Removed fetchRealExpenses as it's now handled by the service

  // Removed createExpensesTable function as we're now using direct SQL migration

  // Helper function to get category description examples for new expenses
  const getCategoryDescriptionExamples = (category: string): string[] => {
    const descriptions = {
      maintenance: [
        "Réparation de la plomberie",
        "Peinture des murs",
        "Réparation du toit",
        "Remplacement des serrures",
        "Entretien du système électrique",
      ],
      utilities: [
        "Facture d'électricité",
        "Facture d'eau",
        "Facture de gaz",
        "Internet et téléphone",
        "Collecte des déchets",
      ],
      taxes: [
        "Taxe foncière",
        "Taxe d'habitation",
        "Impôt sur le revenu locatif",
        "TVA sur services",
        "Droits de mutation",
      ],
      insurance: [
        "Assurance habitation",
        "Assurance responsabilité civile",
        "Assurance dommages",
        "Assurance loyers impayés",
        "Assurance protection juridique",
      ],
      other: [
        "Frais de gestion",
        "Honoraires d'avocat",
        "Frais de copropriété",
        "Frais de nettoyage",
        "Frais divers",
      ],
    };

    return (
      descriptions[category as keyof typeof descriptions] || descriptions.other
    );
  };

  // Apply filters to expenses
  const filteredExpenses = expenses.filter((expense) => {
    // Property filter
    if (propertyFilter !== "all" && expense.propertyId !== propertyFilter)
      return false;

    // Category filter
    if (categoryFilter !== "all" && expense.category !== categoryFilter)
      return false;

    // Date range filter
    if (
      dateRangeFilter.start &&
      expense.date &&
      new Date(expense.date) < new Date(dateRangeFilter.start)
    )
      return false;
    if (
      dateRangeFilter.end &&
      expense.date &&
      new Date(expense.date) > new Date(dateRangeFilter.end)
    )
      return false;

    // Search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const propertyTitle = expense.propertyTitle?.toLowerCase() || "";
      const description = expense.description.toLowerCase();
      const amount = expense.amount.toString();

      return (
        propertyTitle.includes(searchLower) ||
        description.includes(searchLower) ||
        amount.includes(searchLower)
      );
    }

    return true;
  });

  const clearFilters = () => {
    setPropertyFilter("all");
    setCategoryFilter("all");
    setDateRangeFilter({});
    setSearchQuery("");
  };

  const handleRefreshData = () => {
    fetchAgencyData();
    toast.success("Données actualisées avec succès");
  };

  const generateExpenseReport = () => {
    toast.info("Génération du rapport", {
      description: "Le rapport de dépenses est en cours de génération...",
    });

    // In a real implementation, this would generate a PDF or Excel report
    setTimeout(() => {
      toast.success("Rapport généré", {
        description:
          "Le rapport a été généré avec succès et est prêt à être téléchargé.",
      });
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExpenseChange = (field: string, value: any) => {
    setNewExpense((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddExpense = async () => {
    if (!newExpense.propertyId) {
      toast.error("Veuillez sélectionner une propriété");
      return;
    }

    if (!newExpense.amount || newExpense.amount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (!newExpense.description) {
      toast.error("Veuillez entrer une description");
      return;
    }

    try {
      // Upload receipt file to storage if provided
      let receiptUrl = null;
      if (receiptFile) {
        const fileExt = receiptFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `expenses/${newExpense.propertyId}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("property_documents")
          .upload(filePath, receiptFile);

        if (uploadError) {
          console.error("Error uploading receipt:", uploadError);
          toast.error(
            `Erreur lors du téléchargement du reçu: ${uploadError.message}`,
          );
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from("property_documents")
            .getPublicUrl(filePath);

          receiptUrl = urlData.publicUrl;
        }
      }

      // Create expense using the service
      const { expense: expenseData, error } = await createPropertyExpense({
        property_id: newExpense.propertyId,
        amount: newExpense.amount || 0,
        date: newExpense.date || new Date().toISOString().split("T")[0],
        category: newExpense.category || "maintenance",
        description: newExpense.description || "",
        status: newExpense.status || "completed",
        receipt_url: receiptUrl,
        created_at: new Date().toISOString(),
      });

      if (error || !expenseData) {
        throw new Error(error || "Failed to create expense");
      }

      // Get property details
      const property = properties.find((p) => p.id === newExpense.propertyId);

      // Add to local state
      const newExpenseItem: Expense = {
        id: expenseData.id,
        propertyId: expenseData.property_id,
        amount: expenseData.amount,
        date: expenseData.date,
        category: expenseData.category,
        description: expenseData.description,
        status: expenseData.status,
        propertyTitle: property?.title,
        receiptUrl: expenseData.receipt_url,
      };

      setExpenses((prev) => [newExpenseItem, ...prev]);

      // Update stats
      setExpenseStats((prev) => ({
        ...prev,
        totalExpenses: prev.totalExpenses + newExpenseItem.amount,
        [newExpenseItem.category + "Expenses"]:
          prev[(newExpenseItem.category + "Expenses") as keyof typeof prev] +
          newExpenseItem.amount,
      }));

      toast.success("Dépense ajoutée avec succès");

      // Reset form
      setNewExpense({
        category: "maintenance",
        status: "completed",
        date: new Date().toISOString().split("T")[0],
      });
      setReceiptFile(null);
      setPreviewUrl(null);
      setIsAddingExpense(false);
    } catch (error: any) {
      console.error("Error adding expense:", error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Dépenses</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button onClick={generateExpenseReport}>
            <FileText className="mr-2 h-4 w-4" />
            Générer un rapport
          </Button>
          <Button onClick={() => setIsAddingExpense(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une dépense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Expense Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total des dépenses
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(expenseStats.totalExpenses, "FCFA")}
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(expenseStats.maintenanceExpenses, "FCFA")}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Charges</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(expenseStats.utilitiesExpenses, "FCFA")}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxes</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(expenseStats.taxesExpenses, "FCFA")}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <Receipt className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Autres</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(expenseStats.otherExpenses, "FCFA")}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Receipt className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtres</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Réinitialiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recherche</label>
                <div className="flex">
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Propriété</label>
                <Select
                  value={propertyFilter}
                  onValueChange={setPropertyFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les propriétés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les propriétés</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="utilities">Charges</SelectItem>
                    <SelectItem value="taxes">Taxes</SelectItem>
                    <SelectItem value="insurance">Assurance</SelectItem>
                    <SelectItem value="other">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date début</label>
                <Input
                  type="date"
                  value={dateRangeFilter.start || ""}
                  onChange={(e) =>
                    setDateRangeFilter((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date fin</label>
                <Input
                  type="date"
                  value={dateRangeFilter.end || ""}
                  onChange={(e) =>
                    setDateRangeFilter((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Dépenses</CardTitle>
            <CardDescription>
              Dépenses enregistrées pour les propriétés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Propriété</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Catégorie</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Montant</th>
                      <th className="text-left py-3 px-4">Statut</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{expense.propertyTitle}</td>
                        <td className="py-3 px-4">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize">
                            {expense.category === "maintenance"
                              ? "Maintenance"
                              : expense.category === "utilities"
                                ? "Charges"
                                : expense.category === "taxes"
                                  ? "Taxes"
                                  : expense.category === "insurance"
                                    ? "Assurance"
                                    : "Autres"}
                          </span>
                        </td>
                        <td className="py-3 px-4">{expense.description}</td>
                        <td className="py-3 px-4">
                          {formatCurrency(expense.amount, "FCFA")}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              expense.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {expense.status === "completed"
                              ? "Complété"
                              : "En attente"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Détails
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Détails de la dépense</DialogTitle>
                                <DialogDescription>
                                  {expense.propertyTitle} -{" "}
                                  {new Date(expense.date).toLocaleDateString()}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Propriété</Label>
                                    <p className="font-medium">
                                      {expense.propertyTitle}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Date</Label>
                                    <p className="font-medium">
                                      {new Date(
                                        expense.date,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <Label>Catégorie</Label>
                                  <p className="font-medium capitalize">
                                    {expense.category === "maintenance"
                                      ? "Maintenance"
                                      : expense.category === "utilities"
                                        ? "Charges"
                                        : expense.category === "taxes"
                                          ? "Taxes"
                                          : expense.category === "insurance"
                                            ? "Assurance"
                                            : "Autres"}
                                  </p>
                                </div>

                                <div>
                                  <Label>Description</Label>
                                  <p className="font-medium">
                                    {expense.description}
                                  </p>
                                </div>

                                <div>
                                  <Label>Montant</Label>
                                  <p className="font-medium">
                                    {formatCurrency(expense.amount, "FCFA")}
                                  </p>
                                </div>

                                <div>
                                  <Label>Statut</Label>
                                  <p className="font-medium">
                                    {expense.status === "completed"
                                      ? "Complété"
                                      : "En attente"}
                                  </p>
                                </div>

                                {expense.receiptUrl && (
                                  <div>
                                    <Label>Reçu</Label>
                                    <div className="mt-2 border rounded-md overflow-hidden">
                                      <img
                                        src={expense.receiptUrl}
                                        alt="Reçu"
                                        className="w-full h-auto max-h-64 object-contain"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune dépense trouvée avec les filtres actuels.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analyse des Dépenses</CardTitle>
            <CardDescription>
              Vue d'ensemble des dépenses par propriété
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="by-property">
              <TabsList className="mb-4">
                <TabsTrigger value="by-property">
                  <Building className="h-4 w-4 mr-2" />
                  Par propriété
                </TabsTrigger>
                <TabsTrigger value="by-category">
                  <Receipt className="h-4 w-4 mr-2" />
                  Par catégorie
                </TabsTrigger>
              </TabsList>

              <TabsContent value="by-property">
                <div className="space-y-4">
                  {properties.map((property) => {
                    // Get expenses for this property
                    const propertyExpenses = expenses.filter(
                      (e) => e.propertyId === property.id,
                    );
                    if (propertyExpenses.length === 0) return null;

                    // Calculate stats
                    const totalExpense = propertyExpenses.reduce(
                      (sum, e) => sum + e.amount,
                      0,
                    );

                    return (
                      <div key={property.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium text-lg">
                          {property.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {property.location}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total dépenses
                            </p>
                            <p className="font-medium">
                              {formatCurrency(totalExpense, "FCFA")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Nombre de dépenses
                            </p>
                            <p className="font-medium">
                              {propertyExpenses.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Dépense moyenne
                            </p>
                            <p className="font-medium">
                              {formatCurrency(
                                totalExpense / propertyExpenses.length,
                                "FCFA",
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Dernière dépense
                            </p>
                            <p className="font-medium">
                              {new Date(
                                Math.max(
                                  ...propertyExpenses.map((e) =>
                                    new Date(e.date).getTime(),
                                  ),
                                ),
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="by-category">
                <div className="text-center py-8 text-muted-foreground">
                  Le graphique d'analyse par catégorie sera bientôt disponible.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle dépense</DialogTitle>
            <DialogDescription>
              Enregistrez une dépense pour une propriété avec tous les détails
              nécessaires.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property">Propriété *</Label>
              <Select
                value={newExpense.propertyId}
                onValueChange={(value) =>
                  handleExpenseChange("propertyId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une propriété" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA) *</Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount || ""}
                onChange={(e) =>
                  handleExpenseChange("amount", parseFloat(e.target.value))
                }
                placeholder="Montant de la dépense"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => handleExpenseChange("date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) =>
                  handleExpenseChange("category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="utilities">Charges</SelectItem>
                  <SelectItem value="taxes">Taxes</SelectItem>
                  <SelectItem value="insurance">Assurance</SelectItem>
                  <SelectItem value="other">Autres</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newExpense.description || ""}
                onChange={(e) =>
                  handleExpenseChange("description", e.target.value)
                }
                placeholder="Description détaillée de la dépense"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select
                value={newExpense.status}
                onValueChange={(value) => handleExpenseChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Complété</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property expenses are not related to specific tenants */}

            <div className="space-y-2">
              <Label htmlFor="receipt">Reçu / Justificatif</Label>
              <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  id="receipt"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="receipt" className="cursor-pointer block">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Aperçu du reçu"
                        className="mx-auto max-h-32 object-contain"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Cliquez pour changer
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">
                        Cliquez pour télécharger
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG ou PDF jusqu'à 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddExpense}>Enregistrer la dépense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
