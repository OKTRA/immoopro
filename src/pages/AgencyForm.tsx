import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAgencyById, createAgency, updateAgency, uploadAgencyLogo } from "@/services/agencyService";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Building2, 
  Upload, 
  Save,
  X,
  Plus,
  ChevronLeft
} from "lucide-react";
import { Agency } from "@/assets/types";

const AgencyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userRole } = useUser();
  const isEditing = !!id;
  
  // Form state
  const [formData, setFormData] = useState<Partial<Agency>>({
    name: "",
    location: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    verified: false,
    specialties: [],
    serviceAreas: [],
  });
  
  // Logo upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Specialty and service area input
  const [specialty, setSpecialty] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  
  // Fetch agency data if in edit mode
  const { data: agencyData, isLoading } = useQuery({
    queryKey: ['agency', id],
    queryFn: () => getAgencyById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (agencyData?.agency) {
      setFormData({
        name: agencyData.agency.name,
        location: agencyData.agency.location,
        description: agencyData.agency.description,
        email: agencyData.agency.email,
        phone: agencyData.agency.phone,
        website: agencyData.agency.website,
        verified: agencyData.agency.verified,
        specialties: agencyData.agency.specialties || [],
        serviceAreas: agencyData.agency.serviceAreas || [],
      });
      
      if (agencyData.agency.logoUrl) {
        setLogoPreview(agencyData.agency.logoUrl);
      }
    }
  }, [agencyData]);

  // Create agency mutation
  const createMutation = useMutation({
    mutationFn: createAgency,
    onSuccess: async (data) => {
      if (data.agency) {
        toast.success("Agence créée avec succès");
        
        // Upload logo if selected
        if (logoFile && data.agency.id) {
          await handleLogoUpload(data.agency.id);
        }
        
        queryClient.invalidateQueries({ queryKey: ["agencies"] });
        navigate(`/agencies/${data.agency.id}`);
      }
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création de l'agence", {
        description: error.message
      });
    },
  });

  // Update agency mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agency> }) => 
      updateAgency(id, data),
    onSuccess: async (data) => {
      if (data.agency) {
        toast.success("Agence mise à jour avec succès");
        
        // Upload logo if selected and changed
        if (logoFile && id) {
          await handleLogoUpload(id);
        }
        
        queryClient.invalidateQueries({ queryKey: ["agencies"] });
        queryClient.invalidateQueries({ queryKey: ["agency", id] });
        navigate(`/agencies/${id}`);
      }
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la mise à jour de l'agence", {
        description: error.message
      });
    },
  });

  // Logo upload handling
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async (agencyId: string) => {
    if (!logoFile) return;
    
    try {
      const { logoUrl, error } = await uploadAgencyLogo(agencyId, logoFile);
      
      if (error) {
        toast.error("Erreur lors du téléchargement du logo", {
          description: error
        });
      } else if (logoUrl) {
        toast.success("Logo téléchargé avec succès");
      }
    } catch (err: any) {
      toast.error("Erreur lors du téléchargement du logo", {
        description: err.message
      });
    }
  };

  // Form input handling
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, verified: checked }));
  };

  // Add specialty or service area
  const handleAddSpecialty = () => {
    if (specialty.trim() && !formData.specialties?.includes(specialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), specialty.trim()]
      }));
      setSpecialty("");
    }
  };

  const handleAddServiceArea = () => {
    if (serviceArea.trim() && !formData.serviceAreas?.includes(serviceArea.trim())) {
      setFormData(prev => ({
        ...prev,
        serviceAreas: [...(prev.serviceAreas || []), serviceArea.trim()]
      }));
      setServiceArea("");
    }
  };

  // Remove specialty or service area
  const handleRemoveSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: (prev.specialties || []).filter((_, i) => i !== index)
    }));
  };

  const handleRemoveServiceArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: (prev.serviceAreas || []).filter((_, i) => i !== index)
    }));
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name) {
      toast.error("Le nom de l'agence est requis");
      return;
    }
    
    if (isEditing && id) {
      updateMutation.mutate({ id, data: formData });
    } else {
      createMutation.mutate(formData as Omit<Agency, 'id'>);
    }
  };

  // Check permissions
  useEffect(() => {
    if (!["admin", "agency"].includes(userRole || "")) {
      toast.error("Accès refusé", {
        description: "Vous n'avez pas les permissions nécessaires pour gérer les agences."
      });
      navigate("/");
    }
  }, [userRole, navigate]);

  const isLoading = isEditing ? isLoading : false;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        onClick={() => navigate(isEditing ? `/agencies/${id}` : "/agencies")} 
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> 
        {isEditing ? "Retour à l'agence" : "Retour aux agences"}
      </Button>
      
      <h1 className="text-3xl font-bold mb-8">
        {isEditing ? "Modifier l'agence" : "Créer une nouvelle agence"}
      </h1>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informations principales</CardTitle>
                  <CardDescription>
                    Entrez les informations de base de l'agence immobilière
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de l'agence *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nom de l'agence"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location || ""}
                        onChange={handleChange}
                        placeholder="Ville, Pays"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      placeholder="Description de l'agence, ses valeurs, son historique..."
                      rows={5}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        placeholder="contact@agence.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website || ""}
                      onChange={handleChange}
                      placeholder="www.agence.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Logo Upload Card */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Logo</CardTitle>
                  <CardDescription>
                    Téléchargez un logo pour l'agence
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div className="w-40 h-40 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-16 w-16 text-muted-foreground/50" />
                    )}
                  </div>
                  
                  <Label 
                    htmlFor="logo-upload" 
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview ? "Changer le logo" : "Télécharger un logo"}
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  
                  {logoPreview && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                      }}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" /> Supprimer
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              {/* Admin Settings Card */}
              {userRole === "admin" && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Paramètres administratifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="verified">Agence vérifiée</Label>
                        <p className="text-sm text-muted-foreground">
                          Indiquer que cette agence est officiellement vérifiée
                        </p>
                      </div>
                      <Switch
                        id="verified"
                        checked={formData.verified || false}
                        onCheckedChange={handleSwitchChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Specialties & Service Areas Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Spécialités & Zones de service</CardTitle>
              <CardDescription>
                Ajoutez les spécialités et les zones géographiques couvertes par l'agence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specialties */}
                <div>
                  <Label htmlFor="specialty">Spécialités</Label>
                  <div className="flex mt-1.5 mb-3">
                    <Input
                      id="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="Ex: Appartements de luxe"
                      className="flex-1 mr-2"
                    />
                    <Button type="button" size="sm" onClick={handleAddSpecialty}>
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specialties?.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="py-1.5">
                        {spec}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialty(index)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {formData.specialties?.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Aucune spécialité ajoutée
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Service Areas */}
                <div>
                  <Label htmlFor="serviceArea">Zones de service</Label>
                  <div className="flex mt-1.5 mb-3">
                    <Input
                      id="serviceArea"
                      value={serviceArea}
                      onChange={(e) => setServiceArea(e.target.value)}
                      placeholder="Ex: Paris 8ème"
                      className="flex-1 mr-2"
                    />
                    <Button type="button" size="sm" onClick={handleAddServiceArea}>
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.serviceAreas?.map((area, index) => (
                      <Badge key={index} variant="outline" className="py-1.5">
                        {area}
                        <button
                          type="button"
                          onClick={() => handleRemoveServiceArea(index)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {formData.serviceAreas?.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Aucune zone de service ajoutée
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(isEditing ? `/agencies/${id}` : "/agencies")}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Spinner className="mr-2" size="sm" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Mettre à jour" : "Créer l'agence"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
};

export default AgencyForm;
