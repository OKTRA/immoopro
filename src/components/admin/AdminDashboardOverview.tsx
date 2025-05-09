import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Users,
  Building2,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getDashboardStats,
  getRecentActivities,
  getPendingItems,
} from "@/services/admin/dashboardService";
import type {
  DashboardStats,
  RecentActivity,
  PendingItem,
} from "@/services/admin/dashboardService";

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [statsResult, activitiesResult, pendingItemsResult] =
        await Promise.all([
          getDashboardStats(),
          getRecentActivities(),
          getPendingItems(),
        ]);

      // Handle errors
      if (statsResult.error) {
        console.error("Error fetching stats:", statsResult.error);
        setError(statsResult.error);
      } else {
        setStats(statsResult.stats);
      }

      if (activitiesResult.error) {
        console.error("Error fetching activities:", activitiesResult.error);
      } else {
        setActivities(activitiesResult.activities);
      }

      if (pendingItemsResult.error) {
        console.error(
          "Error fetching pending items:",
          pendingItemsResult.error,
        );
      } else {
        setPendingItems(pendingItemsResult.items);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Dashboard data fetch error:", err);
      setError(
        err.message || "Une erreur est survenue lors du chargement des données",
      );
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les données du tableau de bord.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh data every 5 minutes
    const interval = setInterval(
      () => {
        fetchDashboardData();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    toast.info("Actualisation des données...");
    fetchDashboardData();
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString("fr-FR");
  };

  const formatPercentage = (num: number): string => {
    const sign = num > 0 ? "+" : "";
    return `${sign}${num.toFixed(1)}%`;
  };

  // Generate stat cards based on real data
  const generateStatCards = () => {
    if (!stats) {
      // Return skeleton loaders if data is not available
      return Array(4)
        .fill(0)
        .map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <div className="mt-3">
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ));
    }

    const statCards = [
      {
        title: "Utilisateurs",
        value: formatNumber(stats.userCount),
        change: formatPercentage(stats.userGrowth),
        trend: stats.userGrowth >= 0 ? "up" : "down",
        icon: Users,
      },
      {
        title: "Agences",
        value: formatNumber(stats.agencyCount),
        change: formatPercentage(stats.agencyGrowth),
        trend: stats.agencyGrowth >= 0 ? "up" : "down",
        icon: Building2,
      },
      {
        title: "Propriétés",
        value: formatNumber(stats.propertyCount),
        change: formatPercentage(stats.propertyGrowth),
        trend: stats.propertyGrowth >= 0 ? "up" : "down",
        icon: Home,
      },
      {
        title: "Taux d'occupation",
        value: `${stats.occupancyRate}%`,
        change: formatPercentage(stats.occupancyChange),
        trend: stats.occupancyChange >= 0 ? "up" : "down",
        icon: BarChart3,
      },
    ];

    return statCards.map((stat, index) => (
      <Card key={index}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            {stat.trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={
                stat.trend === "up" ? "text-green-500" : "text-red-500"
              }
            >
              {stat.change}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              cette semaine
            </span>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <div className="text-sm text-muted-foreground">
            Dernière mise à jour: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-2"
          >
            Réessayer
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {generateStatCards()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
            <CardDescription>
              Les dernières activités sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !activities.length ? (
              <div className="space-y-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2"
                    >
                      <Skeleton className="h-5 w-[30%]" />
                      <Skeleton className="h-5 w-[40%]" />
                      <Skeleton className="h-5 w-[15%]" />
                      <Skeleton className="h-5 w-[15%]" />
                    </div>
                  ))}
              </div>
            ) : activities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">
                        {activity.user}
                      </TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {activity.time}
                      </TableCell>
                      <TableCell>
                        {activity.status === "success" && (
                          <div className="flex items-center text-green-500">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Complété</span>
                          </div>
                        )}
                        {activity.status === "pending" && (
                          <div className="flex items-center text-yellow-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>En attente</span>
                          </div>
                        )}
                        {activity.status === "error" && (
                          <div className="flex items-center text-red-500">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span>Problème</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune activité récente à afficher
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/admin/analytics")}
            >
              Voir toutes les activités
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En attente</CardTitle>
            <CardDescription>
              Éléments nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !pendingItems.length ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            ) : pendingItems.length > 0 ? (
              <div className="space-y-4">
                {pendingItems.map((item, index) => {
                  let borderColor =
                    "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20";
                  let textColor = "text-blue-800 dark:text-blue-500";
                  let textColorSecondary = "text-blue-700 dark:text-blue-400";

                  if (item.status === "warning") {
                    borderColor =
                      "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20";
                    textColor = "text-yellow-800 dark:text-yellow-500";
                    textColorSecondary = "text-yellow-700 dark:text-yellow-400";
                  } else if (item.status === "error") {
                    borderColor =
                      "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20";
                    textColor = "text-red-800 dark:text-red-500";
                    textColorSecondary = "text-red-700 dark:text-red-400";
                  }

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-md border ${borderColor} cursor-pointer hover:opacity-90 transition-opacity`}
                      onClick={() => item.route && navigate(item.route)}
                    >
                      <div className={`font-medium ${textColor}`}>
                        {item.description}
                      </div>
                      <div className={`text-sm ${textColorSecondary}`}>
                        {item.status === "warning"
                          ? "En attente de validation"
                          : item.status === "error"
                            ? "Nécessite une révision"
                            : "Publiés récemment"}
                      </div>
                    </div>
                  );
                })}

                <Button
                  variant="secondary"
                  className="w-full mt-2"
                  onClick={() => navigate("/admin/support")}
                >
                  Voir tous les éléments
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun élément en attente
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques globales</CardTitle>
          <CardDescription>
            Vue d'ensemble des performances de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-primary">
                    {stats?.userCount ? formatNumber(stats.userCount) : "0"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Utilisateurs inscrits
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-primary">
                    {stats?.propertyCount
                      ? formatNumber(stats.propertyCount)
                      : "0"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Propriétés enregistrées
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-primary">
                    {stats?.occupancyRate ? `${stats.occupancyRate}%` : "0%"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Taux d'occupation moyen
                  </div>
                </div>
              </div>
              <div className="mt-8 text-muted-foreground">
                Les graphiques détaillés seront disponibles dans la section
                Analytique
              </div>
              <Button
                className="mt-4"
                onClick={() => navigate("/admin/analytics")}
              >
                Voir les analytiques détaillées
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
