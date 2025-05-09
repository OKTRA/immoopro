import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, MoreHorizontal, Home, ChevronDown, MapPin,
  Eye, Edit, Trash
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { getProperties } from '@/services/property/propertyQueries';

export default function PropertiesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const { properties, error } = await getProperties();
      if (error) {
        setProperties([]);
      } else {
        setProperties(properties);
      }
    } catch (error) {
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Propriétés</h1>
        <Button>
          <Home className="h-4 w-4 mr-2" />
          Ajouter une Propriété
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une propriété..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtres
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Propriétés</CardTitle>
          <CardDescription>
            Gérez toutes les propriétés sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{property.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(property.price)}</TableCell>
                  <TableCell>
                    {property.status === 'active' && (
                      <Badge variant="default" className="bg-green-500">Actif</Badge>
                    )}
                    {property.status === 'pending' && (
                      <Badge variant="default" className="bg-yellow-500">En attente</Badge>
                    )}
                    {property.status === 'inactive' && (
                      <Badge variant="default" className="bg-red-500">Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell>{property.agencyName}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                          <Trash className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
