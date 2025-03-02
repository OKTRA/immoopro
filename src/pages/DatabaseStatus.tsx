
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { checkDatabaseConnection, listDatabaseTables, checkUserPermissions } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DatabaseStatus() {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [tables, setTables] = useState<any>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState({
    connection: false,
    tables: false,
    permissions: false
  });

  const checkConnection = async () => {
    setLoading(prev => ({ ...prev, connection: true }));
    try {
      const status = await checkDatabaseConnection();
      setConnectionStatus(status);
      if (!status.connected) {
        toast({
          title: 'Connection Failed',
          description: status.error || 'Could not connect to Supabase',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, connection: false }));
    }
  };

  const getTables = async () => {
    setLoading(prev => ({ ...prev, tables: true }));
    try {
      const result = await listDatabaseTables();
      setTables(result);
      if (result.error) {
        toast({
          title: 'Failed to Retrieve Tables',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, tables: false }));
    }
  };

  const getPermissions = async () => {
    setLoading(prev => ({ ...prev, permissions: true }));
    try {
      const result = await checkUserPermissions();
      setPermissions(result);
      if (result.error) {
        toast({
          title: 'Failed to Check Permissions',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, permissions: false }));
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Database Status</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Connection Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>Check if your app can connect to Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              {connectionStatus && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span>Status:</span>
                    {connectionStatus.connected ? (
                      <Badge className="bg-green-500">Connected</Badge>
                    ) : (
                      <Badge variant="destructive">Disconnected</Badge>
                    )}
                  </div>
                  
                  {!connectionStatus.connected && connectionStatus.error && (
                    <div className="border rounded p-3 text-sm bg-red-50 text-red-800">
                      <p className="font-bold">Error:</p>
                      <p>{connectionStatus.error}</p>
                      
                      {connectionStatus.details && (
                        <div className="mt-2">
                          <p>Code: {connectionStatus.details.code}</p>
                          {connectionStatus.details.hint && <p>Hint: {connectionStatus.details.hint}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={checkConnection} disabled={loading.connection}>
                {loading.connection ? 'Checking...' : 'Check Connection'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Tables Card */}
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>View accessible tables in your database</CardDescription>
            </CardHeader>
            <CardContent>
              {tables ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tables Found:</span>
                    <Badge variant="outline">{tables.tables?.length || 0}</Badge>
                  </div>
                  
                  {tables.tables && tables.tables.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto border rounded p-3">
                      <ul className="space-y-1">
                        {tables.tables.map((table: string, index: number) => (
                          <li key={index} className="text-sm">{table}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-amber-600 text-sm">
                      {tables.error ? 'Error retrieving tables' : 'No tables found or accessible'}
                    </div>
                  )}
                  
                  {tables.tableDetails && (
                    <div className="mt-4 border-t pt-4">
                      <p className="font-medium mb-2">Table Accessibility:</p>
                      <div className="text-xs space-y-2 max-h-40 overflow-y-auto">
                        {tables.tableDetails.map((t: any, i: number) => (
                          <div key={i} className="flex justify-between items-center">
                            <span>{t.name}</span>
                            {t.exists ? (
                              <Badge className="bg-green-500">Accessible</Badge>
                            ) : (
                              <Badge variant="destructive">Inaccessible</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Click the button below to check tables
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={getTables} disabled={loading.tables}>
                {loading.tables ? 'Loading...' : 'Check Tables'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Permissions Card */}
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
              <CardDescription>Check your current user permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {permissions ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">User:</p>
                    {permissions.user ? (
                      <div className="text-sm ml-2 mt-1 space-y-1">
                        <p>ID: {permissions.user.id}</p>
                        <p>Email: {permissions.user.email}</p>
                        <p>Role: {permissions.user.role}</p>
                      </div>
                    ) : (
                      <p className="text-amber-600 text-sm">Not authenticated</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="font-medium mb-2">Table Access:</p>
                    {permissions.tableAccess && permissions.tableAccess.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        {permissions.tableAccess.map((access: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>{access.table}</span>
                            {access.hasAccess ? (
                              <Badge className="bg-green-500">Access</Badge>
                            ) : (
                              <Badge variant="destructive">No Access</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No table access data available</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Click the button below to check permissions
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={getPermissions} disabled={loading.permissions}>
                {loading.permissions ? 'Checking...' : 'Check Permissions'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-8 text-gray-600 bg-gray-100 p-4 rounded">
          <h3 className="font-medium text-lg mb-2">Troubleshooting Tips</h3>
          <ul className="list-disc ml-5 space-y-2">
            <li>Make sure your Supabase URL and anon key are correct in the environment variables.</li>
            <li>Check if you're properly authenticated if the tables require authentication.</li>
            <li>Verify that Row Level Security (RLS) policies allow your current user to access the tables.</li>
            <li>Ensure the tables exist in your Supabase project.</li>
            <li>Try signing in if you're seeing permission errors.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
