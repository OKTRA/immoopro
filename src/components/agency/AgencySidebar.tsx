import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  Building2,
  Home,
  Users,
  FileText,
  CreditCard,
  Settings,
  Menu,
  LogOut,
  Receipt,
  DollarSign,
  FileText as FileContract,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAgencyById } from "@/services/agency";

export default function AgencySidebar() {
  const { agencyId } = useParams();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Fetch agency details
  const { data: agencyData } = useQuery({
    queryKey: ["agency", agencyId],
    queryFn: () => getAgencyById(agencyId || ""),
    enabled: !!agencyId,
  });

  const agency = agencyData?.agency || null;

  const navigationItems = [
    {
      title: "Vue d'ensemble",
      icon: Building2,
      path: `/agencies/${agencyId}`,
      exact: true,
    },
    {
      title: "Propriétés",
      icon: Home,
      path: `/agencies/${agencyId}/properties`,
    },
    {
      title: "Locataires",
      icon: Users,
      path: `/agencies/${agencyId}/tenants`,
    },
    {
      title: "Baux",
      icon: FileText,
      path: `/agencies/${agencyId}/leases`,
    },
    {
      title: "Contrats",
      icon: FileContract,
      path: `/agencies/${agencyId}/contracts`,
    },
    {
      title: "Paiements",
      icon: CreditCard,
      path: `/agencies/${agencyId}/payments`,
    },
    {
      title: "Commissions",
      icon: DollarSign,
      path: `/agencies/${agencyId}/commissions`,
    },
    {
      title: "Dépenses",
      icon: Receipt,
      path: `/agencies/${agencyId}/expenses`,
    },
    {
      title: "Paramètres",
      icon: Settings,
      path: `/agencies/${agencyId}/settings`,
    },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col bg-background border-r transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[250px]",
      )}
    >
      {/* Sidebar header with logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && agency?.name && (
          <span className="font-semibold truncate">{agency.name}</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center py-2 px-3 rounded-md transition-colors",
                isActive(item.path, item.exact)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed ? "justify-center" : "justify-start",
              )}
            >
              <item.icon
                className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")}
              />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
