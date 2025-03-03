
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAgencyById, updateAgency } from "@/services/agency";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Agency } from "@/assets/types";
import { ArrowLeft, Building, Save } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function EditAgencyPage() {
  const { agencyId } = useParams<{ agencyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [formData, setFormData] = useState<Partial<Agency>>({
    name: "",
    location: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    specialties: [],
    serviceAreas: []
  });

  // Fetch agency data
  const { data: agencyData, isLoading, error } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: () => getAgencyById(agencyId || ''),
    enabled: !!agencyId
  });

  // Set form data when agency data is loaded
  useEffect(() => {
    if (agencyData?.agency) {
      setFormData({
        name: agencyData.agency.name || "",
        location: agencyData.agency.location || "",
        description: agencyData.agency.description || "",
        email: agencyData.agency.email || "",
        phone: agencyData.agency.phone || "",
        website: agencyData.agency.website || "",
        specialties: agencyData.agency.specialties || [],
        serviceAreas: agencyData.agency.serviceAreas || []
      });
    }
  }, [agencyData]);

  // Update agency mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Agency>) => updateAgency(agencyId || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      toast.success("Agence mise à jour avec succès");
      navigate("/agencies");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'specialties' || name === 'serviceAreas') {
      // Transform comma-separated values to array
      setFormData(prev => ({ 
        ...prev, 
        [name]: value.split(',').map(item => item.trim()).filter(Boolean)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmSave(true);
  };

  const confirmUpdate = () => {
    updateMutation.mutate(formData);
    setShowConfirmSave(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[70vh]">Chargement...</div>;
  }

  if (error || !agencyData?.agency) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-xl font-semibold mb-2">Erreur</h2>
        <p className="text-muted-foreground">
          {error ? `${error}` : "Cette agence n'existe pas ou vous n'avez pas accès."}
        </p>
        <Button className="mt-4" onClick={() => navigate('/agencies')}>
          Retour aux agences
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12 px-4 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/agencies')} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Modifier l'agence</h1>
      </div>

      <Card>
        <CardHeader className="bg-primary text-white rounded-t-lg pb-6">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">{agencyData.agency.name}</CardTitle>
          </div>
          <CardDescription className="text-white/80 text-lg mt-1">
            Modifier les informations de l'agence
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Informations générales */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium">Informations générales</h3>
                  <Separator className="flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-md mb-1.5 block">Nom de l'agence *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nom de l'agence"
                      required
                      className="bg-gray-50/60"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location" className="text-md mb-1.5 block">Adresse *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Adresse complète"
                      required
                      className="bg-gray-50/60"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-md mb-1.5 block">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Description détaillée de l'agence et de ses services"
                      className="flex w-full rounded-md border border-input bg-gray-50/60 px-3 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium">Coordonnées</h3>
                  <Separator className="flex-1" />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-md mb-1.5 block">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email de contact professionnel"
                      className="bg-gray-50/60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-md mb-1.5 block">Téléphone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Numéro de téléphone professionnel"
                      className="bg-gray-50/60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-md mb-1.5 block">Site web</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="Site web de l'agence (avec https://)"
                      className="bg-gray-50/60"
                    />
                  </div>
                </div>
              </div>

              {/* Spécialités et zones */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium">Spécialités et zones</h3>
                  <Separator className="flex-1" />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specialties" className="text-md mb-1.5 block">Spécialités</Label>
                    <Input
                      id="specialties"
                      name="specialties"
                      value={formData.specialties?.join(', ')}
                      onChange={handleChange}
                      placeholder="Résidentiel, Commercial, Investissement..."
                      className="bg-gray-50/60"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Séparez les spécialités par des virgules
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="serviceAreas" className="text-md mb-1.5 block">Zones de service</Label>
                    <Input
                      id="serviceAreas"
                      name="serviceAreas"
                      value={formData.serviceAreas?.join(', ')}
                      onChange={handleChange}
                      placeholder="Paris, Boulogne, Neuilly..."
                      className="bg-gray-50/60"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Séparez les zones par des virgules
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-gray-50/80 px-6 py-4 flex justify-end space-x-4 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/agencies')}
              disabled={updateMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90 min-w-32"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ConfirmDialog
        isOpen={showConfirmSave}
        onClose={() => setShowConfirmSave(false)}
        onConfirm={confirmUpdate}
        title="Confirmer les modifications"
        description="Êtes-vous sûr de vouloir enregistrer ces modifications?"
        confirmLabel="Enregistrer"
        cancelLabel="Annuler"
      />
    </div>
  );
}
