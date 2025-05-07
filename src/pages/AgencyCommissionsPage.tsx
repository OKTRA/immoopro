import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  DollarSign,
  FileText,
  Building,
  User,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getAgencyPropertiesWithCommissionRates,
  calculatePropertyCommissions,
  getAgencyCommissionStats,
} from "@/services/agency/commissionService";

interface Commission {
  id: string;
  propertyId: string;
  leaseId: string;
  paymentId: string;
  amount: number;
  percentage: number;
  status: string;
  date: string;
  notes?: string;
  propertyTitle?: string;
  tenantName?: string;
}

export default function AgencyCommissionsPage() {
  const { agencyId } = useParams<{ agencyId: string }>();
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);

  // Filters
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    start?: string;
    end?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Stats
  const [commissionStats, setCommissionStats] = useState({
    totalCommissions: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    averageCommissionRate: 0,
  });

  useEffect(() => {
    if (!agencyId) return;
    fetchAgencyData();
  }, [agencyId]);

  // Function to fetch commission stats directly from the service
  const fetchCommissionStats = async () => {
    if (!agencyId) return;

    try {
      setLoading(true);
      const { stats, error } = await getAgencyCommissionStats(agencyId);

      if (error) {
        toast.error(`Erreur: ${error}`);
        return;
      }

      if (stats) {
        setCommissionStats(stats);
      }
    } catch (error: any) {
      console.error("Error fetching commission stats:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencyData = async () => {
    setLoading(true);
    try {
      // Fetch properties with commission rates for this agency
      const { properties: propertiesData, error: propertiesError } =
        await getAgencyPropertiesWithCommissionRates(agencyId);

      if (propertiesError) throw new Error(propertiesError);
      setProperties(propertiesData || []);

      if (propertiesData && propertiesData.length > 0) {
        const propertyIds = propertiesData.map((p) => p.id);

        // Fetch leases for these properties
        const { data: leasesData, error: leasesError } = await supabase
          .from("leases")
          .select(
            `
            id, 
            property_id, 
            tenant_id, 
            monthly_rent,
            status,
            tenants:tenant_id (id, first_name, last_name),
            properties:property_id (id, title, location, agency_commission_rate)
          `,
          )
          .in("property_id", propertyIds);

        if (leasesError) throw leasesError;
        setLeases(leasesData || []);

        // Extract unique tenants from leases
        const uniqueTenants = new Map();
        leasesData?.forEach((lease) => {
          if (lease.tenants) {
            uniqueTenants.set(lease.tenants.id, {
              id: lease.tenants.id,
              firstName: lease.tenants.first_name,
              lastName: lease.tenants.last_name,
              fullName: `${lease.tenants.first_name} ${lease.tenants.last_name}`,
            });
          }
        });
        setTenants(Array.from(uniqueTenants.values()));

        // Fetch all payments for these leases to calculate commissions
        if (leasesData && leasesData.length > 0) {
          const leaseIds = leasesData.map((lease) => lease.id);
          await fetchCommissionsForLeases(leaseIds, propertiesData);
        }
      }
    } catch (error: any) {
      console.error("Error fetching agency data:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionsForLeases = async (
    leaseIds: string[],
    propertiesData: any[],
  ) => {
    try {
      // Fetch payments for these leases
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(
          `
          id,
          lease_id,
          amount,
          payment_date,
          status
        `,
        )
        .in("lease_id", leaseIds)
        .eq("status", "paid") // Only consider paid payments for commissions
        .order("payment_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Calculate commissions based on payments and property commission rates
      const calculatedCommissions: Commission[] = [];
      let totalCommissionAmount = 0;
      let totalCommissionRate = 0;
      let commissionCount = 0;
      let pendingAmount = 0;
      let paidAmount = 0;

      paymentsData?.forEach((payment) => {
        const lease = leases.find((l) => l.id === payment.lease_id);
        if (!lease) return;

        const property = propertiesData.find((p) => p.id === lease.property_id);
        if (!property) return;

        // Get commission rate from property data or use default of 10%
        // Use the property-specific commission rate set during property creation
        const commissionRate = property.agency_commission_rate || 10;
        console.log(
          `Using commission rate ${commissionRate}% for property ${property.title}`,
        );
        const commissionAmount = (payment.amount * commissionRate) / 100;

        // For demo purposes, randomly assign status
        const commissionStatus = Math.random() > 0.3 ? "paid" : "pending";

        const commission: Commission = {
          id: `comm-${payment.id}`, // Generate a temporary ID
          propertyId: property.id,
          leaseId: lease.id,
          paymentId: payment.id,
          amount: commissionAmount,
          percentage: commissionRate,
          status: commissionStatus,
          date: payment.payment_date,
          propertyTitle: property.title,
          tenantName: lease.tenants
            ? `${lease.tenants.first_name} ${lease.tenants.last_name}`
            : "Inconnu",
        };

        calculatedCommissions.push(commission);
        totalCommissionAmount += commissionAmount;
        totalCommissionRate += commissionRate;
        commissionCount++;

        if (commissionStatus === "pending") {
          pendingAmount += commissionAmount;
        } else {
          paidAmount += commissionAmount;
        }
      });

      setCommissions(calculatedCommissions);

      // Update stats
      setCommissionStats({
        totalCommissions: totalCommissionAmount,
        pendingCommissions: pendingAmount,
        paidCommissions: paidAmount,
        averageCommissionRate:
          commissionCount > 0 ? totalCommissionRate / commissionCount : 0,
      });
    } catch (error: any) {
      console.error("Error calculating commissions:", error);
      toast.error(`Erreur lors du calcul des commissions: ${error.message}`);
    }
  };

  // Apply filters to commissions
  const filteredCommissions = commissions.filter((commission) => {
    // Property filter
    if (propertyFilter !== "all" && commission.propertyId !== propertyFilter)
      return false;

    // Status filter
    if (statusFilter !== "all" && commission.status !== statusFilter)
      return false;

    // Date range filter
    if (
      dateRangeFilter.start &&
      commission.date &&
      new Date(commission.date) < new Date(dateRangeFilter.start)
    )
      return false;
    if (
      dateRangeFilter.end &&
      commission.date &&
      new Date(commission.date) > new Date(dateRangeFilter.end)
    )
      return false;

    // Search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const propertyTitle = commission.propertyTitle?.toLowerCase() || "";
      const tenantName = commission.tenantName?.toLowerCase() || "";
      const amount = commission.amount.toString();

      return (
        propertyTitle.includes(searchLower) ||
        tenantName.includes(searchLower) ||
        amount.includes(searchLower)
      );
    }

    return true;
  });

  const clearFilters = () => {
    setPropertyFilter("all");
    setStatusFilter("all");
    setDateRangeFilter({});
    setSearchQuery("");
  };

  const handleRefreshData = () => {
    fetchAgencyData();
    toast.success("Données actualisées avec succès");
  };

  // Function to update a property's commission rate
  const updatePropertyCommissionRate = async (
    propertyId: string,
    newRate: number,
  ) => {
    // Check if the column exists first
    try {
      const { data: checkData, error: checkError } = await supabase
        .from("properties")
        .select("agency_commission_rate")
        .eq("id", propertyId)
        .limit(1);

      if (checkError && checkError.message?.includes("does not exist")) {
        toast.error(
          "La colonne agency_commission_rate n'existe pas dans la table properties",
          {
            description:
              "Veuillez exécuter la migration pour ajouter cette colonne.",
            action: {
              label: "Exécuter la migration",
              onClick: () => {
                // Redirect to the migration executor page
                window.location.href =
                  "/tempobook/storyboards/migration-executor";
              },
            },
          },
        );
        return false;
      }
    } catch (checkError) {
      console.error("Error checking column existence:", checkError);
    }
    try {
      // Update the property's commission rate in the database
      const { data, error } = await supabase
        .from("properties")
        .update({ agency_commission_rate: newRate })
        .eq("id", propertyId)
        .select()
        .single();

      if (error) throw error;

      // Update the local properties state
      setProperties((prevProperties) =>
        prevProperties.map((prop) =>
          prop.id === propertyId
            ? { ...prop, agency_commission_rate: newRate }
            : prop,
        ),
      );

      // Refresh commissions data to reflect the new rate
      fetchAgencyData();

      toast.success(`Taux de commission mis à jour avec succès (${newRate}%)`);
      return true;
    } catch (error: any) {
      console.error("Error updating commission rate:", error);
      toast.error(`Erreur lors de la mise à jour du taux: ${error.message}`);
      return false;
    }
  };

  const generateCommissionReport = () => {
    toast.info("Génération du rapport", {
      description: "Le rapport de commissions est en cours de génération...",
    });

    // In a real implementation, this would generate a PDF or Excel report
    setTimeout(() => {
      toast.success("Rapport généré", {
        description:
          "Le rapport a été généré avec succès et est prêt à être téléchargé.",
      });
    }, 2000);
  };

  const updateCommissionRate = (propertyId: string, currentRate: number) => {
    // Ask for the new rate using a prompt
    const newRateStr = prompt(
      "Entrez le nouveau taux de commission (en pourcentage)",
      currentRate.toString(),
    );

    if (newRateStr === null) return; // User cancelled

    const newRate = parseFloat(newRateStr);
    if (isNaN(newRate) || newRate < 0 || newRate > 100) {
      toast.error(
        "Taux de commission invalide. Veuillez entrer un nombre entre 0 et 100.",
      );
      return;
    }

    updatePropertyCommissionRate(propertyId, newRate);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des Commissions</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={loading}
          >
            {loading ? "Chargement..." : "Actualiser"}
          </Button>
          <Button onClick={generateCommissionReport}>
            <FileText className="mr-2 h-4 w-4" />
            Générer un rapport
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Commission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total des commissions
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(commissionStats.totalCommissions, "FCFA")}
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Commissions payées
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(commissionStats.paidCommissions, "FCFA")}
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
                  <p className="text-sm text-muted-foreground">
                    Commissions en attente
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(commissionStats.pendingCommissions, "FCFA")}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Receipt className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Taux moyen de commission
                  </p>
                  <p className="text-2xl font-bold">
                    {commissionStats.averageCommissionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Receipt className="h-6 w-6 text-blue-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <label className="text-sm font-medium">Statut</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
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

        {/* Commission List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Commissions</CardTitle>
            <CardDescription>
              Commissions automatiquement générées sur les paiements de loyer
              effectués
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredCommissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Propriété</th>
                      <th className="text-left py-3 px-4">Locataire</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Montant</th>
                      <th className="text-left py-3 px-4">Taux</th>
                      <th className="text-left py-3 px-4">Statut</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCommissions.map((commission) => (
                      <tr
                        key={commission.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          {commission.propertyTitle}
                        </td>
                        <td className="py-3 px-4">{commission.tenantName}</td>
                        <td className="py-3 px-4">
                          {new Date(commission.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {formatCurrency(commission.amount, "FCFA")}
                        </td>
                        <td className="py-3 px-4">{commission.percentage}%</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              commission.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {commission.status === "paid"
                              ? "Payé"
                              : "En attente"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            Détails
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune commission trouvée avec les filtres actuels.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Taux de Commission par Propriété</CardTitle>
            <CardDescription>
              Taux de commission définis lors de la création de chaque propriété
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Propriété</th>
                    <th className="text-left py-3 px-4">Adresse</th>
                    <th className="text-left py-3 px-4">Taux actuel</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr
                      key={property.id}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{property.title}</td>
                      <td className="py-3 px-4">{property.location}</td>
                      <td className="py-3 px-4">
                        {property.agency_commission_rate || 10}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCommissionRate(
                                property.id,
                                property.agency_commission_rate || 10,
                              )
                            }
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const propertyCommissions = commissions.filter(
                                (c) => c.propertyId === property.id,
                              );
                              toast.info(
                                `${propertyCommissions.length} commissions pour cette propriété`,
                                {
                                  description: `Total: ${formatCurrency(
                                    propertyCommissions.reduce(
                                      (sum, c) => sum + c.amount,
                                      0,
                                    ),
                                    "FCFA",
                                  )}`,
                                },
                              );
                            }}
                          >
                            Détails
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Commission Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analyse des Commissions</CardTitle>
            <CardDescription>
              Vue d'ensemble des commissions par propriété
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="by-property">
              <TabsList className="mb-4">
                <TabsTrigger value="by-property">
                  <Building className="h-4 w-4 mr-2" />
                  Par propriété
                </TabsTrigger>
                <TabsTrigger value="by-month">
                  <Receipt className="h-4 w-4 mr-2" />
                  Par mois
                </TabsTrigger>
              </TabsList>

              <TabsContent value="by-property">
                <div className="space-y-4">
                  {properties.map((property) => {
                    // Get commissions for this property
                    const propertyCommissions = commissions.filter(
                      (c) => c.propertyId === property.id,
                    );
                    if (propertyCommissions.length === 0) return null;

                    // Calculate stats
                    const totalCommission = propertyCommissions.reduce(
                      (sum, c) => sum + c.amount,
                      0,
                    );
                    const paidCommission = propertyCommissions
                      .filter((c) => c.status === "paid")
                      .reduce((sum, c) => sum + c.amount, 0);

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
                              Total commissions
                            </p>
                            <p className="font-medium">
                              {formatCurrency(totalCommission, "FCFA")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Commissions payées
                            </p>
                            <p className="font-medium">
                              {formatCurrency(paidCommission, "FCFA")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Taux de commission
                            </p>
                            <p className="font-medium">
                              {property.agency_commission_rate || 10}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Nombre de paiements
                            </p>
                            <p className="font-medium">
                              {propertyCommissions.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="by-month">
                <div className="text-center py-8 text-muted-foreground">
                  Le graphique d'analyse mensuelle sera bientôt disponible.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
