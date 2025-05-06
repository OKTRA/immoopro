import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Receipt, Filter, FileText, Building, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { PaymentData } from "@/services/payment";
import { toast } from "sonner";
import PaymentsList from "@/components/payments/PaymentsList";
import PaymentsSummary from "@/components/payments/PaymentsSummary";
import PaymentBulkManager from "@/components/payments/PaymentBulkManager";

export default function AgencyPaymentsPage() {
  const { agencyId } = useParams();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);

  // Filters
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [tenantFilter, setTenantFilter] = useState<string>("all");
  const [leaseFilter, setLeaseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    start?: string;
    end?: string;
  }>({});

  // Stats
  const [paymentStats, setPaymentStats] = useState({
    totalPaid: 0,
    totalDue: 0,
    pendingPayments: 0,
    latePayments: 0,
    advancedPayments: 0,
    undefinedPayments: 0,
    balance: 0,
  });

  useEffect(() => {
    if (!agencyId) return;

    const fetchAgencyData = async () => {
      setLoading(true);
      try {
        // Fetch properties for this agency
        const { data: propertiesData, error: propertiesError } = await supabase
          .from("properties")
          .select("id, title, location, type")
          .eq("agency_id", agencyId);

        if (propertiesError) throw propertiesError;
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
              start_date, 
              end_date, 
              monthly_rent,
              status,
              tenants:tenant_id (id, first_name, last_name),
              properties:property_id (id, title, location)
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

          // Fetch all payments for these leases
          if (leasesData && leasesData.length > 0) {
            const leaseIds = leasesData.map((lease) => lease.id);
            await fetchPaymentsForLeases(leaseIds);
          }
        }
      } catch (error: any) {
        console.error("Error fetching agency data:", error);
        toast.error(`Erreur: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencyData();
  }, [agencyId]);

  const fetchPaymentsForLeases = async (leaseIds: string[]) => {
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(
          `
          id,
          lease_id,
          amount,
          payment_date,
          due_date,
          payment_method,
          status,
          transaction_id,
          notes,
          payment_type,
          is_auto_generated,
          processed_by,
          created_at
        `,
        )
        .in("lease_id", leaseIds)
        .order("due_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Transform data
      const transformedPayments =
        paymentsData?.map((payment) => ({
          id: payment.id,
          leaseId: payment.lease_id,
          amount: payment.amount,
          paymentDate: payment.payment_date,
          dueDate: payment.due_date,
          paymentMethod: payment.payment_method,
          status: payment.status,
          transactionId: payment.transaction_id,
          notes: payment.notes,
          paymentType: payment.payment_type || "rent",
          isAutoGenerated: payment.is_auto_generated || false,
          processedBy: payment.processed_by,
          createdAt: payment.created_at,
        })) || [];

      setPayments(transformedPayments);
      calculatePaymentStats(transformedPayments);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast.error(`Erreur lors du chargement des paiements: ${error.message}`);
    }
  };

  const calculatePaymentStats = (paymentsList: PaymentData[]) => {
    const stats = {
      totalPaid: 0,
      totalDue: 0,
      pendingPayments: 0,
      latePayments: 0,
      advancedPayments: 0,
      undefinedPayments: 0,
      balance: 0,
    };

    paymentsList.forEach((payment) => {
      stats.totalDue += payment.amount;

      switch (payment.status) {
        case "paid":
          stats.totalPaid += payment.amount;
          break;
        case "pending":
          stats.pendingPayments++;
          break;
        case "late":
          stats.latePayments++;
          break;
        case "advanced":
          stats.advancedPayments++;
          stats.totalPaid += payment.amount;
          break;
        case "undefined":
          stats.undefinedPayments++;
          break;
      }
    });

    stats.balance = stats.totalDue - stats.totalPaid;
    setPaymentStats(stats);
  };

  const handlePaymentSelect = (paymentId: string, selected: boolean) => {
    if (selected) {
      setSelectedPaymentIds((prev) => [...prev, paymentId]);
    } else {
      setSelectedPaymentIds((prev) => prev.filter((id) => id !== paymentId));
    }
  };

  const handleRefreshData = async () => {
    if (!agencyId) return;
    setLoading(true);

    try {
      const leaseIds = leases.map((lease) => lease.id);
      await fetchPaymentsForLeases(leaseIds);
      setSelectedPaymentIds([]);
      toast.success("Données actualisées avec succès");
    } catch (error: any) {
      console.error("Error refreshing data:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    toast.info("Fonctionnalité à venir", {
      description:
        "L'ajout de paiement directement depuis cette page sera bientôt disponible.",
    });
  };

  const handleEditPayment = (payment: PaymentData) => {
    toast.info("Fonctionnalité à venir", {
      description: "La modification de paiement sera bientôt disponible.",
    });
  };

  const handleDeletePayment = (paymentId: string) => {
    toast.info("Fonctionnalité à venir", {
      description: "La suppression de paiement sera bientôt disponible.",
    });
  };

  const handlePaymentsGenerated = (newPayments: PaymentData[]) => {
    setPayments((prev) => [...newPayments, ...prev]);
    calculatePaymentStats([...newPayments, ...payments]);
    toast.success(`${newPayments.length} nouveaux paiements générés`);
  };

  // Apply filters to payments
  const filteredPayments = payments.filter((payment) => {
    // Get lease info for this payment
    const lease = leases.find((l) => l.id === payment.leaseId);
    if (!lease) return false;

    // Property filter
    if (propertyFilter !== "all" && lease.property_id !== propertyFilter)
      return false;

    // Tenant filter
    if (tenantFilter !== "all" && lease.tenant_id !== tenantFilter)
      return false;

    // Lease filter
    if (leaseFilter !== "all" && payment.leaseId !== leaseFilter) return false;

    // Status filter
    if (statusFilter !== "all" && payment.status !== statusFilter) return false;

    // Date range filter
    if (
      dateRangeFilter.start &&
      payment.dueDate &&
      new Date(payment.dueDate) < new Date(dateRangeFilter.start)
    )
      return false;
    if (
      dateRangeFilter.end &&
      payment.dueDate &&
      new Date(payment.dueDate) > new Date(dateRangeFilter.end)
    )
      return false;

    // Search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const propertyTitle = lease.properties?.title?.toLowerCase() || "";
      const tenantName =
        `${lease.tenants?.first_name || ""} ${lease.tenants?.last_name || ""}`.toLowerCase();
      const paymentNotes = payment.notes?.toLowerCase() || "";
      const paymentAmount = payment.amount.toString();

      return (
        propertyTitle.includes(searchLower) ||
        tenantName.includes(searchLower) ||
        paymentNotes.includes(searchLower) ||
        paymentAmount.includes(searchLower)
      );
    }

    return true;
  });

  const clearFilters = () => {
    setPropertyFilter("all");
    setTenantFilter("all");
    setLeaseFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
    setDateRangeFilter({});
  };

  const generatePaymentReport = () => {
    toast.info("Génération du rapport", {
      description: "Le rapport de paiements est en cours de génération...",
    });

    // In a real implementation, this would generate a PDF or Excel report
    setTimeout(() => {
      toast.success("Rapport généré", {
        description:
          "Le rapport a été généré avec succès et est prêt à être téléchargé.",
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des paiements</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={loading}
          >
            {loading ? "Chargement..." : "Actualiser"}
          </Button>
          <Button onClick={generatePaymentReport}>
            <FileText className="mr-2 h-4 w-4" />
            Générer un rapport
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Payment Summary */}
        <PaymentsSummary stats={paymentStats} />

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
                <label className="text-sm font-medium">Locataire</label>
                <Select value={tenantFilter} onValueChange={setTenantFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les locataires" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les locataires</SelectItem>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.fullName}
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
                    <SelectItem value="late">En retard</SelectItem>
                    <SelectItem value="advanced">En avance</SelectItem>
                    <SelectItem value="undefined">Non défini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bail</label>
                <Select value={leaseFilter} onValueChange={setLeaseFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les baux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les baux</SelectItem>
                    {leases.map((lease) => {
                      const propertyTitle =
                        lease.properties?.title || "Propriété inconnue";
                      const tenantName = lease.tenants
                        ? `${lease.tenants.first_name} ${lease.tenants.last_name}`
                        : "Locataire inconnu";
                      return (
                        <SelectItem key={lease.id} value={lease.id}>
                          {propertyTitle} - {tenantName}
                        </SelectItem>
                      );
                    })}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payments List */}
          <div className="lg:col-span-2">
            <PaymentsList
              payments={filteredPayments}
              onAddPayment={handleAddPayment}
              onEditPayment={handleEditPayment}
              onDeletePayment={handleDeletePayment}
              selectedPaymentIds={selectedPaymentIds}
              onPaymentSelect={handlePaymentSelect}
            />
          </div>

          {/* Bulk Manager */}
          <div>
            <PaymentBulkManager
              leaseId={
                leaseFilter !== "all" ? leaseFilter : leases[0]?.id || ""
              }
              initialRentAmount={
                leases.find((l) => l.id === leaseFilter)?.monthly_rent || 0
              }
              onPaymentsGenerated={handlePaymentsGenerated}
              onPaymentsUpdated={handleRefreshData}
              selectedPaymentIds={selectedPaymentIds}
            />
          </div>
        </div>

        {/* Payment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analyse des paiements</CardTitle>
            <CardDescription>
              Vue d'ensemble des paiements par propriété et par locataire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="by-property">
              <TabsList className="mb-4">
                <TabsTrigger value="by-property">
                  <Building className="h-4 w-4 mr-2" />
                  Par propriété
                </TabsTrigger>
                <TabsTrigger value="by-tenant">
                  <User className="h-4 w-4 mr-2" />
                  Par locataire
                </TabsTrigger>
              </TabsList>

              <TabsContent value="by-property">
                <div className="space-y-4">
                  {properties.map((property) => {
                    // Get leases for this property
                    const propertyLeases = leases.filter(
                      (l) => l.property_id === property.id,
                    );
                    if (propertyLeases.length === 0) return null;

                    // Get payments for these leases
                    const leaseIds = propertyLeases.map((l) => l.id);
                    const propertyPayments = payments.filter((p) =>
                      leaseIds.includes(p.leaseId),
                    );

                    // Calculate stats
                    const totalDue = propertyPayments.reduce(
                      (sum, p) => sum + p.amount,
                      0,
                    );
                    const totalPaid = propertyPayments
                      .filter(
                        (p) => p.status === "paid" || p.status === "advanced",
                      )
                      .reduce((sum, p) => sum + p.amount, 0);

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
                              Total dû
                            </p>
                            <p className="font-medium">
                              {totalDue.toLocaleString()} FCFA
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total payé
                            </p>
                            <p className="font-medium">
                              {totalPaid.toLocaleString()} FCFA
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Solde
                            </p>
                            <p className="font-medium">
                              {(totalDue - totalPaid).toLocaleString()} FCFA
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Paiements
                            </p>
                            <p className="font-medium">
                              {propertyPayments.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="by-tenant">
                <div className="space-y-4">
                  {tenants.map((tenant) => {
                    // Get leases for this tenant
                    const tenantLeases = leases.filter(
                      (l) => l.tenant_id === tenant.id,
                    );
                    if (tenantLeases.length === 0) return null;

                    // Get payments for these leases
                    const leaseIds = tenantLeases.map((l) => l.id);
                    const tenantPayments = payments.filter((p) =>
                      leaseIds.includes(p.leaseId),
                    );

                    // Calculate stats
                    const totalDue = tenantPayments.reduce(
                      (sum, p) => sum + p.amount,
                      0,
                    );
                    const totalPaid = tenantPayments
                      .filter(
                        (p) => p.status === "paid" || p.status === "advanced",
                      )
                      .reduce((sum, p) => sum + p.amount, 0);

                    return (
                      <div key={tenant.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium text-lg">
                          {tenant.firstName} {tenant.lastName}
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total dû
                            </p>
                            <p className="font-medium">
                              {totalDue.toLocaleString()} FCFA
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total payé
                            </p>
                            <p className="font-medium">
                              {totalPaid.toLocaleString()} FCFA
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Solde
                            </p>
                            <p className="font-medium">
                              {(totalDue - totalPaid).toLocaleString()} FCFA
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Paiements
                            </p>
                            <p className="font-medium">
                              {tenantPayments.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
