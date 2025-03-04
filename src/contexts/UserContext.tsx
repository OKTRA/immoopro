
  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user) {
        setUser(null);
        setSession(null);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Erreur lors de la mise à jour du profil:", error.message);
        return;
      }
      
      if (data) {
        const userProfile = {
          id: userId,
          email: data.email,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          role: data.role || 'public',
          avatarUrl: data.avatar_url,
          agencyId: data.agency_id,
          // Add snake_case properties for backward compatibility
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          avatar_url: data.avatar_url,
          // Add these for Profile.tsx
          phone: data.phone || null,
          address: data.address || null,
          // Add these as required fields for compatibility with User type
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du profil:", error);
    } finally {
      setIsLoading(false);
    }
  };
