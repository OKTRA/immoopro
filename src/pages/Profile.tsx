
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getUserProfile, updateProfile } from '@/services/profileService';
import { uploadProfileAvatar } from '@/services/profileService';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Upload, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, profile, refreshUser, isLoading } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by the effect
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const result = await updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
      });

      if (result.error) {
        toast.error(`Erreur lors de la mise à jour du profil: ${result.error}`);
      } else {
        toast.success('Profil mis à jour avec succès');
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Type de fichier non valide. Veuillez sélectionner une image (JPEG, PNG, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Le fichier est trop volumineux. Taille maximale: 5MB.');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadProfileAvatar(user.id, file);

      if (result.error) {
        toast.error(`Erreur lors du téléchargement de l'avatar: ${result.error}`);
      } else {
        setAvatarUrl(result.avatar as string);
        toast.success('Avatar mis à jour avec succès');
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-10">Mon profil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Photo de profil</CardTitle>
            <CardDescription>Votre photo de profil visible par les autres utilisateurs</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="w-32 h-32 border">
              <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
              <AvatarFallback className="text-2xl">
                {firstName?.charAt(0)}{lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="w-full">
              <Label htmlFor="avatar" className="flex items-center justify-center gap-2 cursor-pointer">
                <Button variant="outline" className="w-full" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Téléchargement...' : 'Changer ma photo'}
                </Button>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Gérez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={email}
                  readOnly
                  className="pl-10 bg-muted/30"
                  placeholder="votre@email.com"
                />
              </div>
              <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} disabled={saving} className="ml-auto">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
