
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { FileText, Clock, Users, Loader2, ChevronUp, ChevronDown, BarChart2, Percent, TrendingUp, TrendingDown } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { PageVisits } from '@/services/analytics/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  const getBounceRateBadge = (page: PageVisits) => {
    const bounceRate = page.bounce_rate || 0;
    
    if (bounceRate > 70) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className="ml-2">Élevé</Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Taux de rebond élevé - Les utilisateurs quittent rapidement cette page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else if (bounceRate < 30) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="success" className="ml-2 bg-green-600">Bas</Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excellent taux de rebond - Les utilisateurs restent sur cette page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return null;
  };

  const calculateTrend = (page: PageVisits) => {
    // Use trend_percentage if available, otherwise use heuristic based on visits
    const trendPercentage = page.trend_percentage || 0;
    const trending = trendPercentage > 0 || page.unique_visitors > 200;
    
    if (trendPercentage !== 0 || page.trend_percentage !== undefined) {
      // If we have actual trend data
      if (trendPercentage > 10) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-green-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+{Math.abs(trendPercentage).toFixed(1)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tendance en forte hausse</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } else if (trendPercentage > 0) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-green-500">
                  <ChevronUp className="h-4 w-4 mr-1" />
                  <span>+{Math.abs(trendPercentage).toFixed(1)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tendance en hausse</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } else if (trendPercentage < -10) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-red-500">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span>-{Math.abs(trendPercentage).toFixed(1)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tendance en forte baisse</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } else if (trendPercentage < 0) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-red-500">
                  <ChevronDown className="h-4 w-4 mr-1" />
                  <span>-{Math.abs(trendPercentage).toFixed(1)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tendance en baisse</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } else {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-gray-500">
                  <span>0%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pas de changement significatif</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    } else {
      // Fallback to basic up/down when no percentage is available
      if (trending) {
        return <ChevronUp className="h-4 w-4 text-green-500" />;
      }
      return <ChevronDown className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Pages les plus visitées
          </CardTitle>
          <CardDescription>
            Analyse des pages les plus populaires de votre site
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <BarChart2 className="h-4 w-4 mr-2" />
          Exporter
        </Button>
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
                <TableHead className="text-right hidden md:table-cell">
                  <div className="flex items-center justify-end">
                    <Percent className="h-4 w-4 mr-1" />
                    Tendance
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPages.map((page, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50/50" : ""}>
                  <TableCell className="font-medium">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">{page.page}</span>
                            {getBounceRateBadge(page)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{page.page}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{page.unique_visitors.toLocaleString()}</TableCell>
                  <TableCell>{page.visits.toLocaleString()}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">{formatDuration(page.average_duration)}</TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <div className="flex items-center justify-end">
                      {calculateTrend(page)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
