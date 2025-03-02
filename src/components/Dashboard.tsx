
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  Database,
  BarChart3
} from 'lucide-react';
import { getCurrentUser } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [userRole, setUserRole] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        // Fetch user profile to determine role
        const { user: currentUser } = await getCurrentUser();
        if (currentUser) {
          // For demo purposes, set a default role
          setUserRole('admin');
        }
      }
    };
    
    fetchUserRole();
  }, [user]);
  
  const dashboardItems = [
    { 
      title: 'Properties', 
      description: 'Manage real estate properties',
      icon: <Building2 className="h-8 w-8 text-blue-500" />,
      link: '/properties',
      roles: ['admin', 'agency', 'owner']
    },
    { 
      title: 'Tenants', 
      description: 'Manage tenant information',
      icon: <Users className="h-8 w-8 text-green-500" />,
      link: '/tenants',
      roles: ['admin', 'owner']
    },
    { 
      title: 'Payments', 
      description: 'Track and manage payments',
      icon: <CreditCard className="h-8 w-8 text-purple-500" />,
      link: '/payments',
      roles: ['admin', 'owner', 'tenant']
    },
    { 
      title: 'Leases', 
      description: 'Manage lease agreements',
      icon: <FileText className="h-8 w-8 text-amber-500" />,
      link: '/leases',
      roles: ['admin', 'owner', 'tenant']
    },
    { 
      title: 'Settings', 
      description: 'Configure account settings',
      icon: <Settings className="h-8 w-8 text-slate-500" />,
      link: '/settings',
      roles: ['admin', 'owner', 'agency', 'tenant', 'public']
    },
    { 
      title: 'Analytics', 
      description: 'View property metrics and insights',
      icon: <BarChart3 className="h-8 w-8 text-red-500" />,
      link: '/analytics',
      roles: ['admin', 'owner', 'agency']
    },
    { 
      title: 'Database Status', 
      description: 'Check database connection',
      icon: <Database className="h-8 w-8 text-emerald-500" />,
      link: '/database-status',
      roles: ['admin']
    }
  ];
  
  // Filter dashboard items by role
  const filteredItems = userRole 
    ? dashboardItems.filter(item => item.roles.includes(userRole))
    : dashboardItems;
  
  // If user is not logged in, show public actions
  if (!user) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">Welcome to Property Management</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Please sign in to access your personalized dashboard
          </p>
          <div className="flex space-x-4 mt-6">
            <Button asChild variant="default">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => (
          <Link to={item.link} key={index}>
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
