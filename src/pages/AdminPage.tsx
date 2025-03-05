
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Fetch current session for header user display
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    fetchUser();
  }, []);
  
  return <AdminLayout />;
}
