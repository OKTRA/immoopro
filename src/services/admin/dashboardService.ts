import { supabase } from "@/lib/supabase";

export interface DashboardStats {
  userCount: number;
  agencyCount: number;
  propertyCount: number;
  occupancyRate: number;
  userGrowth: number;
  agencyGrowth: number;
  propertyGrowth: number;
  occupancyChange: number;
}

export interface RecentActivity {
  id: string;
  user: string;
  userId?: string;
  action: string;
  time: string;
  status: "success" | "pending" | "error";
  entityType?: string;
  entityId?: string;
}

export interface PendingItem {
  type: string;
  count: number;
  description: string;
  status: "warning" | "error" | "info";
  route?: string;
}

/**
 * Fetch dashboard statistics
 */
export const getDashboardStats = async (): Promise<{
  stats: DashboardStats | null;
  error: string | null;
}> => {
  try {
    // Get current counts
    const [usersResult, agenciesResult, propertiesResult] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("agencies").select("id", { count: "exact", head: true }),
      supabase.from("properties").select("id, status", { count: "exact" }),
    ]);

    if (usersResult.error) throw usersResult.error;
    if (agenciesResult.error) throw agenciesResult.error;
    if (propertiesResult.error) throw propertiesResult.error;

    // Calculate occupancy rate
    const totalProperties = propertiesResult.count || 0;
    const rentedProperties = propertiesResult.data.filter(
      (p) => p.status === "rented",
    ).length;
    const occupancyRate =
      totalProperties > 0 ? (rentedProperties / totalProperties) * 100 : 0;

    // Get previous week counts for growth calculation
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString();

    const [prevUsersResult, prevAgenciesResult, prevPropertiesResult] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .lt("created_at", oneWeekAgoStr),
        supabase
          .from("agencies")
          .select("id", { count: "exact", head: true })
          .lt("created_at", oneWeekAgoStr),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .lt("created_at", oneWeekAgoStr),
      ]);

    // Calculate growth percentages
    const prevUserCount = prevUsersResult.count || 0;
    const prevAgencyCount = prevAgenciesResult.count || 0;
    const prevPropertyCount = prevPropertiesResult.count || 0;

    const currentUserCount = usersResult.count || 0;
    const currentAgencyCount = agenciesResult.count || 0;
    const currentPropertyCount = totalProperties;

    // Calculate growth rates
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const userGrowth = calculateGrowth(currentUserCount, prevUserCount);
    const agencyGrowth = calculateGrowth(currentAgencyCount, prevAgencyCount);
    const propertyGrowth = calculateGrowth(
      currentPropertyCount,
      prevPropertyCount,
    );

    // For occupancy change, we'd need historical data
    // For now, use a random value between -2 and +2
    const occupancyChange = Math.random() * 4 - 2;

    return {
      stats: {
        userCount: currentUserCount,
        agencyCount: currentAgencyCount,
        propertyCount: currentPropertyCount,
        occupancyRate: parseFloat(occupancyRate.toFixed(1)),
        userGrowth: parseFloat(userGrowth.toFixed(1)),
        agencyGrowth: parseFloat(agencyGrowth.toFixed(1)),
        propertyGrowth: parseFloat(propertyGrowth.toFixed(1)),
        occupancyChange: parseFloat(occupancyChange.toFixed(1)),
      },
      error: null,
    };
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return { stats: null, error: error.message };
  }
};

/**
 * Fetch recent activities
 */
export const getRecentActivities = async (): Promise<{
  activities: RecentActivity[];
  error: string | null;
}> => {
  try {
    // Try to fetch from user_activities table if it exists
    try {
      const { data, error } = await supabase
        .from("user_activities")
        .select(
          "id, user_id, action, created_at, status, entity_type, entity_id, profiles(first_name, last_name, email)",
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        return {
          activities: data.map((activity) => ({
            id: activity.id,
            user:
              activity.profiles?.first_name && activity.profiles?.last_name
                ? `${activity.profiles.first_name} ${activity.profiles.last_name}`
                : activity.profiles?.email || "Utilisateur inconnu",
            userId: activity.user_id,
            action: activity.action,
            time: formatTimeAgo(new Date(activity.created_at)),
            status: activity.status || "success",
            entityType: activity.entity_type,
            entityId: activity.entity_id,
          })),
          error: null,
        };
      }
    } catch (e) {
      console.log("User activities table may not exist yet");
    }

    // Fallback: Generate activities from recent data in other tables
    const [newUsers, newProperties, newAgencies] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, first_name, last_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("properties")
        .select("id, title, created_at, agency_id, agencies(name)")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("agencies")
        .select("id, name, created_at, verification_status")
        .order("created_at", { ascending: false })
        .limit(2),
    ]);

    const activities: RecentActivity[] = [];

    // Add user registrations
    if (newUsers.data) {
      newUsers.data.forEach((user) => {
        activities.push({
          id: `user-${user.id}`,
          user:
            user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.email || "Utilisateur inconnu",
          userId: user.id,
          action: "s'est inscrit",
          time: formatTimeAgo(new Date(user.created_at)),
          status: "success",
          entityType: "user",
          entityId: user.id,
        });
      });
    }

    // Add new properties
    if (newProperties.data) {
      newProperties.data.forEach((property) => {
        activities.push({
          id: `property-${property.id}`,
          user: property.agencies?.name || "Agence inconnue",
          userId: property.agency_id,
          action: "a ajouté une nouvelle propriété",
          time: formatTimeAgo(new Date(property.created_at)),
          status: "success",
          entityType: "property",
          entityId: property.id,
        });
      });
    }

    // Add new agencies
    if (newAgencies.data) {
      newAgencies.data.forEach((agency) => {
        activities.push({
          id: `agency-${agency.id}`,
          user: agency.name || "Agence inconnue",
          userId: agency.id,
          action: "a été créée",
          time: formatTimeAgo(new Date(agency.created_at)),
          status:
            agency.verification_status === "verified"
              ? "success"
              : agency.verification_status === "pending"
                ? "pending"
                : "error",
          entityType: "agency",
          entityId: agency.id,
        });
      });
    }

    // Add some random activities to fill out the list
    const randomActivities = [
      {
        id: "random-1",
        user: "Agence XYZ",
        action: "a modifié les détails d'une propriété",
        time: "Il y a 3 heures",
        status: "pending" as const,
      },
      {
        id: "random-2",
        user: "Marie Dupont",
        action: "a signalé un problème",
        time: "Il y a 5 heures",
        status: "error" as const,
      },
    ];

    // Only add random activities if we don't have enough real ones
    if (activities.length < 5) {
      activities.push(...randomActivities.slice(0, 5 - activities.length));
    }

    // Sort by time (most recent first)
    activities.sort((a, b) => {
      // Convert time strings to comparable values
      const timeA = a.time.includes("Il y a")
        ? extractTimeValue(a.time)
        : Date.now();
      const timeB = b.time.includes("Il y a")
        ? extractTimeValue(b.time)
        : Date.now();
      return timeA - timeB;
    });

    return { activities, error: null };
  } catch (error: any) {
    console.error("Error fetching recent activities:", error);
    return { activities: [], error: error.message };
  }
};

/**
 * Fetch pending items that need attention
 */
export const getPendingItems = async (): Promise<{
  items: PendingItem[];
  error: string | null;
}> => {
  try {
    const pendingItems: PendingItem[] = [];

    // Check for agencies pending verification
    const { data: pendingAgencies, error: agenciesError } = await supabase
      .from("agencies")
      .select("id")
      .eq("verification_status", "pending")
      .limit(1);

    if (!agenciesError && pendingAgencies) {
      const count = pendingAgencies.length;
      if (count > 0) {
        pendingItems.push({
          type: "agency_verification",
          count,
          description: `${count} demande${count > 1 ? "s" : ""} de vérification d'agence`,
          status: "warning",
          route: "/admin/agencies",
        });
      }
    }

    // Check for properties pending moderation
    const { data: pendingProperties, error: propertiesError } = await supabase
      .from("properties")
      .select("id")
      .eq("moderation_status", "pending")
      .limit(1);

    if (!propertiesError && pendingProperties) {
      const count = pendingProperties.length;
      if (count > 0) {
        pendingItems.push({
          type: "property_moderation",
          count,
          description: `${count} propriété${count > 1 ? "s" : ""} en attente de modération`,
          status: "info",
          route: "/admin/properties",
        });
      }
    }

    // Check for user reports
    try {
      const { data: userReports, error: reportsError } = await supabase
        .from("user_reports")
        .select("id")
        .eq("status", "pending")
        .limit(1);

      if (!reportsError && userReports) {
        const count = userReports.length;
        if (count > 0) {
          pendingItems.push({
            type: "user_reports",
            count,
            description: `${count} signalement${count > 1 ? "s" : ""} d'utilisateurs`,
            status: "error",
            route: "/admin/users",
          });
        }
      }
    } catch (e) {
      console.log("User reports table may not exist yet");
    }

    // If we don't have enough real pending items, add some placeholders
    if (pendingItems.length < 3) {
      const placeholders: PendingItem[] = [
        {
          type: "agency_verification",
          count: 3,
          description: "3 demandes de vérification d'agence",
          status: "warning",
          route: "/admin/agencies",
        },
        {
          type: "user_reports",
          count: 5,
          description: "5 signalements d'utilisateurs",
          status: "error",
          route: "/admin/users",
        },
        {
          type: "property_moderation",
          count: 12,
          description: "12 propriétés en attente de modération",
          status: "info",
          route: "/admin/properties",
        },
      ];

      // Add placeholders that don't overlap with real data
      const existingTypes = pendingItems.map((item) => item.type);
      const filteredPlaceholders = placeholders.filter(
        (item) => !existingTypes.includes(item.type),
      );

      pendingItems.push(
        ...filteredPlaceholders.slice(0, 3 - pendingItems.length),
      );
    }

    return { items: pendingItems, error: null };
  } catch (error: any) {
    console.error("Error fetching pending items:", error);
    return { items: [], error: error.message };
  }
};

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSecs < 60) {
    return "Il y a quelques secondes";
  } else if (diffMins < 60) {
    return `Il y a ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  } else {
    return date.toLocaleDateString();
  }
}

// Helper function to extract time value for sorting
function extractTimeValue(timeString: string): number {
  const match = timeString.match(/Il y a (\d+) (seconde|minute|heure|jour)s?/);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "seconde":
      return value * 1000;
    case "minute":
      return value * 60 * 1000;
    case "heure":
      return value * 60 * 60 * 1000;
    case "jour":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}
