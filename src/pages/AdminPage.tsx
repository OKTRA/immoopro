
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { isUserAdmin } from '@/services/adminRoleService';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch current session and check admin status
    const fetchUserAndCheckAdmin = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user;
        
        if (currentUser) {
          setUser(currentUser);
          
          // Check if user has admin role
          const { isAdmin: adminStatus } = await isUserAdmin(currentUser.id);
          setIsAdmin(adminStatus);
          
          if (!adminStatus) {
            navigate('/admin-auth');
          }
        } else {
          // No user logged in, redirect to admin auth
          navigate('/admin-auth');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/admin-auth');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndCheckAdmin();
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    return null; // Will redirect via useEffect
  }
  
  return <AdminLayout />;
}
