import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUser, getUserProfile } from "@/services/authService";

export function NavbarLinks() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Get user role from profile
          const { profile } = await getUserProfile(currentUser.id);
          setUserRole(profile?.role || null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  return null;
}
