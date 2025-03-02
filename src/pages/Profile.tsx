
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { updateUserProfile, uploadProfileAvatar } from '@/services/profileService';
import { signOut } from '@/services/authService';
import { toast } from 'sonner';

const Profile = () => {
  const { user, profile, isLoading, refreshUser } = useUser();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
    
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [isLoading, user, profile, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      await updateUserProfile(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address
      });
      
      refreshUser();
      setIsEditing(false);
      toast('Profil mis à jour', {
        description: 'Vos informations ont été mises à jour avec succès'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast('Erreur', {
        description: 'Impossible de mettre à jour le profil'
      });
    }
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    try {
      await uploadProfileAvatar(user.id, file);
      refreshUser();
      toast('Avatar mis à jour', {
        description: 'Votre photo de profil a été mise à jour avec succès'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast('Erreur', {
        description: 'Impossible de télécharger l\'avatar'
      });
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Déconnexion
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {formData.firstName && formData.lastName ? (
                    `${formData.firstName[0]}${formData.lastName[0]}`
                  ) : (
                    'U'
                  )}
                </div>
              )}
            </div>
            
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-gray-600">{profile?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Rôle: {profile?.role || 'Utilisateur'}
            </p>
          </div>
        </div>
        
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          
          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Enregistrer
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
