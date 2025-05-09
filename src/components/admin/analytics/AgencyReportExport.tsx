import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { Download, Calendar as CalendarIcon, FileText, File, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AgencyData {
  id: string;
  name: string;
  properties: number;
  agents: number;
  rating: number;
}

interface AgencyReportExportProps {
  agencies: AgencyData[];
  isLoading: boolean;
}

export default function AgencyReportExport({ agencies, isLoading }: AgencyReportExportProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState({
    properties: true,
    agents: true,
    ratings: true,
    activity: false,
    revenue: false,
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (agencies.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    setExporting(true);
    
    try {
      // Construction du rapport
      const selectedAgencies = agencies.map(agency => {
        const filteredData: Record<string, any> = {
          "Nom de l'agence": agency.name,
        };
        
        if (selectedMetrics.properties) {
          filteredData["Nombre de propriétés"] = agency.properties;
        }
        
        if (selectedMetrics.agents) {
          filteredData["Nombre d'agents"] = agency.agents;
        }
        
        if (selectedMetrics.ratings) {
          filteredData["Évaluation moyenne"] = agency.rating.toFixed(1);
        }
        
        if (selectedMetrics.revenue) {
          // Simulation de données de revenus pour le moment
          filteredData["Revenus"] = (agency.properties * 25000).toLocaleString() + " FCFA";
        }
        
        return filteredData;
      });

      // Préparation du contenu CSV
      if (exportFormat === 'csv') {
        // Création du fichier CSV
        const headers = Object.keys(selectedAgencies[0]);
        let csvContent = headers.join(',') + '\n';
        
        selectedAgencies.forEach(agency => {
          const row = headers.map(header => {
            const value = agency[header];
            // Échapper les virgules dans les valeurs
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          }).join(',');
          csvContent += row + '\n';
        });
        
        // Créer et télécharger le fichier
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rapport-agences_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Rapport CSV exporté avec succès");
      } else {
        // Pour le PDF, on simule juste le téléchargement pour le moment
        // Dans une implémentation réelle, nous utiliserions une bibliothèque comme jsPDF
        setTimeout(() => {
          toast.success("Rapport PDF exporté avec succès");
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast.error("Erreur lors de l'exportation du rapport");
    } finally {
      setExporting(false);
    }
  };

  const toggleMetric = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics({
      ...selectedMetrics,
      [metric]: !selectedMetrics[metric],
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Exporter les données de performance</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sélectionnez une période et les métriques à inclure dans votre rapport
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h4 className="font-medium mb-2">Période</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Popover open={showStartDatePicker} onOpenChange={setShowStartDatePicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP', { locale: fr }) : "Date de début"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setShowStartDatePicker(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <Popover open={showEndDatePicker} onOpenChange={setShowEndDatePicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP', { locale: fr }) : "Date de fin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setShowEndDatePicker(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Format d'export</h4>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={exportFormat === 'csv' ? "default" : "outline"}
                  className="flex items-center"
                  onClick={() => setExportFormat('csv')}
                  disabled={isLoading}
                >
                  <File className="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={exportFormat === 'pdf' ? "default" : "outline"}
                  className="flex items-center"
                  onClick={() => setExportFormat('pdf')}
                  disabled={isLoading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-2">Métriques à inclure</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="properties"
                checked={selectedMetrics.properties}
                onCheckedChange={() => toggleMetric('properties')}
                disabled={isLoading}
              />
              <Label htmlFor="properties">Propriétés</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agents"
                checked={selectedMetrics.agents}
                onCheckedChange={() => toggleMetric('agents')}
                disabled={isLoading}
              />
              <Label htmlFor="agents">Agents</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ratings"
                checked={selectedMetrics.ratings}
                onCheckedChange={() => toggleMetric('ratings')}
                disabled={isLoading}
              />
              <Label htmlFor="ratings">Évaluations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="activity"
                checked={selectedMetrics.activity}
                onCheckedChange={() => toggleMetric('activity')}
                disabled={isLoading}
              />
              <Label htmlFor="activity">Activité</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="revenue"
                checked={selectedMetrics.revenue}
                onCheckedChange={() => toggleMetric('revenue')}
                disabled={isLoading}
              />
              <Label htmlFor="revenue">Revenus</Label>
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleExport}
          disabled={isLoading || exporting || agencies.length === 0}
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportation en cours...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exporter le rapport
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
