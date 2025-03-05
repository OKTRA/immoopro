
import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, MoreHorizontal, Building2, CheckCircle, 
  XCircle, ChevronDown, Star 
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

export default function AgenciesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for agencies
  const agencies = [
    { 
      id: '1', 
      name: 'Immobilier Premium', 
      location: 'Dakar, Sénégal', 
      properties: 45,
      verified: true,
      rating: 4.8,
      createdAt: '15/01/2023'
    },
    { 
      id: '2', 
      name: 'Habitat Confort', 
      location: 'Abidjan, Côte d\'Ivoire', 
      properties: 32,
      verified: true,
      rating: 4.5,
      createdAt: '03/03/2023'
    },
    { 
      id: '3', 
      name: 'Maisons Modernes', 
      location: 'Lomé, Togo', 
      properties: 28,
      verified: false,
      rating: 4.2,
      createdAt: '22/04/2023'
    },
    { 
      id: '4', 
      name: 'Afrique Habitation', 
      location: 'Cotonou, Bénin', 
      properties: 18,
      verified: false,
      rating: 3.9,
      createdAt: '10/06/2023'
    },
    { 
      id: '5', 
      name: 'Résidences Élégantes', 
      location: 'Dakar, Sénégal', 
      properties: 37,
      verified: true,
      rating: 4.7,
      createdAt: '05/02/2023'
    },
  ];

  const filteredAgencies = agencies.filter(agency => 
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    agency.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Agences</h1>
        <Button>
          <Building2 className="h-4 w-4 mr-2" />
          Nouvelle Agence
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une agence..."
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
          <CardTitle>Liste des Agences</CardTitle>
          <CardDescription>
            Gérez toutes les agences immobilières sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Propriétés</TableHead>
                <TableHead>Évaluation</TableHead>
                <TableHead>Vérification</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgencies.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell className="font-medium">{agency.name}</TableCell>
                  <TableCell>{agency.location}</TableCell>
                  <TableCell>{agency.properties}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                      <span>{agency.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {agency.verified ? (
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Vérifiée</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-500">
                        <XCircle className="h-4 w-4 mr-1" />
                        <span>Non vérifiée</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{agency.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Voir détails</DropdownMenuItem>
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {agency.verified ? (
                          <DropdownMenuItem className="text-yellow-500">
                            <XCircle className="h-4 w-4 mr-2" />
                            Retirer vérification
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-500">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Vérifier
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
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
