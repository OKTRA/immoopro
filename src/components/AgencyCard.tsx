import { AnimatedCard } from "./ui/AnimatedCard";
import { Badge } from "./ui/badge";
import { Agency } from "@/assets/types";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  MapPin,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { getPropertiesByAgencyId, deleteAgency } from "@/services/agency";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "sonner";

interface AgencyCardProps {
  agency: Agency;
  onDelete?: () => void;
}

export default function AgencyCard({ agency, onDelete }: AgencyCardProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch actual property count for this agency
  const { data: propertiesData, isError } = useQuery({
    queryKey: ["agency-properties", agency.id],
    queryFn: () => getPropertiesByAgencyId(agency.id),
    enabled: !!agency.id,
    retry: 2,
  });

  if (isError) {
    console.error(`Failed to fetch properties for agency ${agency.id}`);
  }

  // Get the actual count from the query
  const actualPropertyCount = propertiesData?.count || 0;

  const handleDelete = async () => {
    try {
      const { success, error } = await deleteAgency(agency.id);

      if (success) {
        toast.success("Agence supprimée avec succès");
        if (onDelete) onDelete();
      } else {
        toast.error(`Erreur: ${error}`);
      }
    } catch (err) {
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <AnimatedCard className="p-6 flex flex-col h-full overflow-hidden group">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full border overflow-hidden bg-background">
              {agency.logoUrl ? (
                <img
                  src={agency.logoUrl}
                  alt={agency.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            {agency.verified && (
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                <BadgeCheck className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link to={`/agencies/${agency.id}`}>
              <h3 className="text-lg font-medium truncate group-hover:text-primary transition-colors">
                {agency.name}
              </h3>
            </Link>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3 w-3 mr-1 inline-block" />
              <span className="truncate">{agency.location}</span>
            </div>
          </div>
        </div>

        {agency.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {agency.description}
          </p>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {actualPropertyCount}{" "}
              {actualPropertyCount > 1 ? "propriétés" : "propriété"}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">
                {typeof agency.rating === "number"
                  ? agency.rating.toFixed(1)
                  : "0.0"}
              </span>
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>

          {agency.specialties && agency.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agency.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {agency.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{agency.specialties.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/agencies/${agency.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/agencies/edit/${agency.id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </AnimatedCard>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer l'agence"
        description={`Êtes-vous sûr de vouloir supprimer l'agence "${agency.name}"? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="destructive"
      />
    </>
  );
}
