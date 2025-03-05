
import React from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users, 
  Home, 
  CreditCard
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useState } from 'react';

export default function AnalyticsManagement() {
  const [period, setPeriod] = useState('month');

  // Mock data for charts
  const userStats = [
    { name: 'Jan', count: 15 },
    { name: 'Fév', count: 22 },
    { name: 'Mar', count: 34 },
    { name: 'Avr', count: 45 },
    { name: 'Mai', count: 53 },
    { name: 'Juin', count: 60 },
  ];
  
  const propertyStats = [
    { name: 'Jan', count: 5 },
    { name: 'Fév', count: 12 },
    { name: 'Mar', count: 18 },
    { name: 'Avr', count: 25 },
    { name: 'Mai', count: 30 },
    { name: 'Juin', count: 38 },
  ];
  
  const revenueStats = [
    { name: 'Jan', amount: 1200 },
    { name: 'Fév', amount: 1800 },
    { name: 'Mar', amount: 2400 },
    { name: 'Avr', amount: 3100 },
    { name: 'Mai', amount: 3800 },
    { name: 'Juin', amount: 4500 },
  ];
  
  const userTypeStats = [
    { name: 'Propriétaires', value: 35 },
    { name: 'Locataires', value: 45 },
    { name: 'Agents', value: 15 },
    { name: 'Admin', value: 5 },
  ];
  
  const propertyTypeStats = [
    { name: 'Appartements', value: 55 },
    { name: 'Maisons', value: 25 },
    { name: 'Commerces', value: 10 },
    { name: 'Terrains', value: 10 },
  ];
  
  const paymentMethodStats = [
    { name: 'Carte bancaire', value: 65 },
    { name: 'Virement', value: 30 },
    { name: 'Autres', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const SUMMARY_DATA = [
    { title: "Utilisateurs totaux", value: "153", icon: Users, change: "+12% ce mois" },
    { title: "Propriétés listées", value: "38", icon: Home, change: "+8% ce mois" },
    { title: "Revenus mensuels", value: "4 500 €", icon: CreditCard, change: "+15% ce mois" },
    { title: "Taux d'occupation", value: "78%", icon: TrendingUp, change: "+5% ce mois" },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Rapports & Analyses</h1>
        <Select
          value={period}
          onValueChange={setPeriod}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="quarter">Ce trimestre</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {SUMMARY_DATA.map((item, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </p>
                <h3 className="text-2xl font-bold mt-2">{item.value}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.change}
                </p>
              </div>
              <item.icon className="h-8 w-8 text-muted-foreground opacity-50" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Croissance des utilisateurs
            </CardTitle>
            <CardDescription>Nombre de nouveaux utilisateurs par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Croissance des propriétés
            </CardTitle>
            <CardDescription>Nombre de nouvelles propriétés par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={propertyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Charts */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChartIcon className="h-5 w-5 mr-2" />
              Revenus mensuels
            </CardTitle>
            <CardDescription>Revenus générés par mois en euros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Types d'utilisateurs
            </CardTitle>
            <CardDescription>Répartition par type d'utilisateur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Types de propriétés
            </CardTitle>
            <CardDescription>Répartition par type de propriété</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Méthodes de paiement
            </CardTitle>
            <CardDescription>Répartition par méthode de paiement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
