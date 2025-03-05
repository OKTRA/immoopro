
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { FileText, Clock, Users, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { PageVisits } from '@/services/analytics/types';

interface ContentTabProps {
  isLoading: boolean;
  topPages: PageVisits[];
}

export function ContentTab({ isLoading, topPages }: ContentTabProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Pages les plus visitées
        </CardTitle>
        <CardDescription>
          Analyse des pages les plus populaires de votre site
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : topPages.length === 0 ? (
          <EmptyState 
            icon={<FileText className="h-12 w-12" />}
            title="Aucune donnée disponible" 
            description="Il n'y a pas encore de données sur les pages visitées."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="hidden sm:table-cell">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Visiteurs uniques
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Visites
                  </div>
                </TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  <div className="flex items-center justify-end">
                    <Clock className="h-4 w-4 mr-1" />
                    Durée moyenne
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPages.map((page, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{page.page}</TableCell>
                  <TableCell className="hidden sm:table-cell">{page.unique_visitors.toLocaleString()}</TableCell>
                  <TableCell>{page.visits.toLocaleString()}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">{formatDuration(page.average_duration)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
