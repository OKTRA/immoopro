import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsSummaryCards } from "./AnalyticsSummaryCards";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Loader2 } from "lucide-react";

// Mock data for demonstration
const mockAgencies = [
  { id: "1", name: "Immobilier Premium", properties: 45, rating: 4.8, agents: 12 },
  { id: "2", name: "Habitat Confort", properties: 32, rating: 4.5, agents: 8 },
  { id: "3", name: "Maisons Modernes", properties: 28, rating: 4.2, agents: 6 },
  { id: "4", name: "Afrique Habitation", properties: 18, rating: 3.9, agents: 4 },
  { id: "5", name: "Résidences Élégantes", properties: 37, rating: 4.7, agents: 10 },
];

const mockAgentActivity = [
  { month: "Jan", activity: 120 },
  { month: "Feb", activity: 140 },
  { month: "Mar", activity: 180 },
  { month: "Apr", activity: 160 },
  { month: "May", activity: 200 },
  { month: "Jun", activity: 170 },
];

export default function AgencyPerformanceDashboard() {
  const [loading, setLoading] = useState(false);
  // In a real implementation, fetch data from Supabase here

  // Summary metrics
  const totalProperties = mockAgencies.reduce((sum, a) => sum + a.properties, 0);
  const avgRating = (mockAgencies.reduce((sum, a) => sum + a.rating, 0) / mockAgencies.length).toFixed(2);
  const totalAgents = mockAgencies.reduce((sum, a) => sum + a.agents, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Propriétés totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProperties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Note moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Agents actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAgents}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Propriétés par agence</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockAgencies} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="properties" fill="#8884d8" name="Propriétés" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution des notes</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockAgencies} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[3, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rating" fill="#82ca9d" name="Note moyenne" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activité des agents (par mois)</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockAgentActivity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activity" stroke="#8884d8" name="Activité" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 