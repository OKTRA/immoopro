
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Home, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminDashboardOverview() {
  // Mock data for the dashboard
  const stats = [
    { 
      title: 'Utilisateurs', 
      value: '1,284', 
      change: '+12.5%', 
      trend: 'up',
      icon: Users 
    },
    { 
      title: 'Agences', 
      value: '47', 
      change: '+4.3%', 
      trend: 'up',
      icon: Building2 
    },
    { 
      title: 'Propriétés', 
      value: '638', 
      change: '+7.8%', 
      trend: 'up',
      icon: Home 
    },
    { 
      title: 'Taux d\'occupation', 
      value: '92%', 
      change: '-1.2%', 
      trend: 'down',
      icon: Home 
    },
  ];

  const recentActivities = [
    { 
      user: 'Agence ABC', 
      action: 'a ajouté une nouvelle propriété', 
      time: 'Il y a 10 minutes',
      status: 'success'
    },
    { 
      user: 'John Doe', 
      action: 's\'est inscrit', 
      time: 'Il y a 1 heure',
      status: 'success'
    },
    { 
      user: 'Agence XYZ', 
      action: 'a modifié les détails d\'une propriété', 
      time: 'Il y a 3 heures',
      status: 'pending'
    },
    { 
      user: 'Agence 123', 
      action: 'a demandé une vérification', 
      time: 'Il y a 4 heures',
      status: 'pending'
    },
    { 
      user: 'Marie Dupont', 
      action: 'a signalé un problème', 
      time: 'Il y a 5 heures',
      status: 'error'
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <div className="text-sm text-muted-foreground">
          Dernière mise à jour: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={stat.trend === 'up' ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground ml-1">cette semaine</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
            <CardDescription>
              Les dernières activités sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{activity.user}</TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell className="text-muted-foreground">{activity.time}</TableCell>
                    <TableCell>
                      {activity.status === 'success' && (
                        <div className="flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>Complété</span>
                        </div>
                      )}
                      {activity.status === 'pending' && (
                        <div className="flex items-center text-yellow-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>En attente</span>
                        </div>
                      )}
                      {activity.status === 'error' && (
                        <div className="flex items-center text-red-500">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span>Problème</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En attente</CardTitle>
            <CardDescription>
              Éléments nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-md border border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                <div className="font-medium text-yellow-800 dark:text-yellow-500">
                  3 demandes de vérification d'agence
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                  En attente depuis 2 jours
                </div>
              </div>
              
              <div className="p-3 rounded-md border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20">
                <div className="font-medium text-red-800 dark:text-red-500">
                  5 signalements d'utilisateurs
                </div>
                <div className="text-sm text-red-700 dark:text-red-400">
                  Nécessitent une révision
                </div>
              </div>
              
              <div className="p-3 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20">
                <div className="font-medium text-blue-800 dark:text-blue-500">
                  12 propriétés en attente de modération
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  Publiées récemment
                </div>
              </div>

              <Button variant="secondary" className="w-full mt-2">
                Voir tous les éléments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques globales</CardTitle>
          <CardDescription>
            Vue d'ensemble des performances de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            Les graphiques détaillés seront implémentés prochainement
          </div>
        </CardContent>
      </Card>
    </>
  );
}
