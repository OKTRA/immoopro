
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Search, MessageSquare, MoreHorizontal, CheckCircle, Clock, AlertCircle, HelpCircle
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogFooter, DialogTrigger 
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

export default function SupportManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  
  // Mock data for support tickets
  const tickets = [
    { 
      id: '1', 
      userId: 'U001',
      userName: 'Jean Dupont',
      subject: 'Problème de connexion à mon compte',
      message: 'Bonjour, je n\'arrive pas à me connecter à mon compte depuis hier. J\'ai essayé de réinitialiser mon mot de passe mais je ne reçois pas d\'email.',
      status: 'open',
      priority: 'high',
      createdAt: '15/03/2023 14:30',
      lastUpdated: '15/03/2023 14:30',
      responses: []
    },
    { 
      id: '2', 
      userId: 'U015',
      userName: 'Marie Lambert',
      subject: 'Comment ajouter une nouvelle propriété ?',
      message: 'Bonjour, je souhaite ajouter une nouvelle propriété à mon portfolio mais je ne trouve pas où le faire. Pouvez-vous m\'aider ?',
      status: 'in_progress',
      priority: 'medium',
      createdAt: '14/03/2023 10:15',
      lastUpdated: '14/03/2023 16:45',
      responses: [
        {
          id: 'R1',
          from: 'support',
          name: 'Support Technique',
          message: 'Bonjour Marie, pour ajouter une nouvelle propriété, vous devez vous rendre dans la section "Mes propriétés" et cliquer sur le bouton "Ajouter une propriété". Avez-vous besoin d\'aide supplémentaire ?',
          createdAt: '14/03/2023 16:45'
        }
      ]
    },
    { 
      id: '3', 
      userId: 'U042',
      userName: 'Pierre Martin',
      subject: 'Demande de remboursement',
      message: 'Bonjour, j\'ai été débité deux fois pour mon abonnement ce mois-ci. Je souhaite obtenir un remboursement pour le deuxième prélèvement.',
      status: 'closed',
      priority: 'high',
      createdAt: '10/03/2023 09:20',
      lastUpdated: '12/03/2023 11:30',
      responses: [
        {
          id: 'R2',
          from: 'support',
          name: 'Service Facturation',
          message: 'Bonjour Pierre, nous avons vérifié votre compte et effectivement nous constatons un double prélèvement. Nous allons procéder au remboursement dans les 5 jours ouvrés. Nous nous excusons pour ce désagrément.',
          createdAt: '11/03/2023 14:15'
        },
        {
          id: 'R3',
          from: 'user',
          name: 'Pierre Martin',
          message: 'Merci pour votre réponse rapide. J\'attendrai le remboursement.',
          createdAt: '11/03/2023 15:40'
        },
        {
          id: 'R4',
          from: 'support',
          name: 'Service Facturation',
          message: 'Le remboursement a été effectué aujourd\'hui. Vous devriez le voir apparaître sur votre compte bancaire d\'ici 2-3 jours ouvrés. N\'hésitez pas à nous contacter si vous ne le recevez pas d\'ici là.',
          createdAt: '12/03/2023 11:30'
        }
      ]
    },
    { 
      id: '4', 
      userId: 'U078',
      userName: 'Sophie Leclerc',
      subject: 'Bug dans le calendrier de réservation',
      message: 'Bonjour, je constate un bug dans le calendrier de réservation. Certaines dates apparaissent comme disponibles alors qu\'elles sont réservées et vice-versa.',
      status: 'open',
      priority: 'medium',
      createdAt: '15/03/2023 11:05',
      lastUpdated: '15/03/2023 11:05',
      responses: []
    },
    { 
      id: '5', 
      userId: 'U103',
      userName: 'Thomas Dubois',
      subject: 'Suggestion d\'amélioration',
      message: 'Bonjour, j\'utilise votre plateforme depuis plusieurs mois et j\'ai une suggestion d\'amélioration : serait-il possible d\'ajouter une fonctionnalité pour comparer plusieurs propriétés côte à côte ?',
      status: 'in_progress',
      priority: 'low',
      createdAt: '13/03/2023 16:20',
      lastUpdated: '14/03/2023 09:10',
      responses: [
        {
          id: 'R5',
          from: 'support',
          name: 'Équipe Produit',
          message: 'Bonjour Thomas, merci pour votre suggestion ! Nous la trouvons très pertinente et l\'avons transmise à notre équipe de développement pour évaluation. Nous prévoyons d\'ajouter de nouvelles fonctionnalités dans les prochains mois et nous tiendrons compte de votre retour.',
          createdAt: '14/03/2023 09:10'
        }
      ]
    },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 mr-1.5" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 mr-1.5" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 mr-1.5" />;
      default:
        return null;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Ouvert';
      case 'in_progress':
        return 'En cours';
      case 'closed':
        return 'Résolu';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Élevée';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Faible';
      default:
        return priority;
    }
  };

  // Filter tickets based on search term and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatusFilter = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriorityFilter = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatusFilter && matchesPriorityFilter;
  });

  const handleReply = () => {
    // In a real app, this would send the reply to the backend
    console.log(`Replying to ticket ${selectedTicket.id}: ${replyText}`);
    setReplyText('');
    // Here you would update the ticket with the new response
  };

  const handleUpdateStatus = (ticketId: string, newStatus: string) => {
    // In a real app, this would update the ticket status in the backend
    console.log(`Updating ticket ${ticketId} status to ${newStatus}`);
    // Here you would update the ticket status
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Support Utilisateur</h1>
        <Button>
          <CheckCircle className="h-4 w-4 mr-2" />
          Marquer tout comme lu
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un ticket..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="open">Ouvert</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="closed">Résolu</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={setPriorityFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Tickets</CardTitle>
          <CardDescription>
            Gérez les demandes d'assistance des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell className="font-medium">{ticket.userName}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getStatusBadgeClass(ticket.status)
                      )}>
                        {getStatusIcon(ticket.status)}
                        {getStatusLabel(ticket.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getPriorityBadgeClass(ticket.priority)
                      )}>
                        {getPriorityLabel(ticket.priority)}
                      </div>
                    </TableCell>
                    <TableCell>{ticket.createdAt}</TableCell>
                    <TableCell>{ticket.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          {selectedTicket && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                  <span>Ticket #{selectedTicket.id}: {selectedTicket.subject}</span>
                                  <div className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                    getStatusBadgeClass(selectedTicket.status)
                                  )}>
                                    {getStatusIcon(selectedTicket.status)}
                                    {getStatusLabel(selectedTicket.status)}
                                  </div>
                                </DialogTitle>
                                <DialogDescription>
                                  De {selectedTicket.userName} • {selectedTicket.createdAt}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 my-4">
                                <div className="bg-muted p-4 rounded-lg">
                                  <p className="whitespace-pre-line">{selectedTicket.message}</p>
                                </div>
                                
                                {selectedTicket.responses.length > 0 && (
                                  <div className="space-y-4 pt-4 border-t">
                                    <h4 className="font-medium">Conversation</h4>
                                    
                                    {selectedTicket.responses.map((response: any) => (
                                      <div 
                                        key={response.id} 
                                        className={cn(
                                          "p-4 rounded-lg",
                                          response.from === 'support' 
                                            ? "bg-primary/10 ml-4" 
                                            : "bg-muted mr-4"
                                        )}
                                      >
                                        <div className="flex justify-between mb-2">
                                          <span className="font-medium">{response.name}</span>
                                          <span className="text-xs text-muted-foreground">{response.createdAt}</span>
                                        </div>
                                        <p className="whitespace-pre-line">{response.message}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {selectedTicket.status !== 'closed' && (
                                  <div className="pt-4 border-t">
                                    <h4 className="font-medium mb-2">Répondre</h4>
                                    <Textarea 
                                      rows={4}
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      placeholder="Entrez votre réponse ici..."
                                      className="mb-2"
                                    />
                                    <div className="flex justify-end">
                                      <Button onClick={handleReply}>Envoyer la réponse</Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'open')}
                                    disabled={selectedTicket.status === 'open'}
                                  >
                                    Marquer comme ouvert
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                                    disabled={selectedTicket.status === 'in_progress'}
                                  >
                                    Marquer en cours
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                                    disabled={selectedTicket.status === 'closed'}
                                  >
                                    Résoudre
                                  </Button>
                                </div>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(ticket.id, 'open')}
                            disabled={ticket.status === 'open'}
                          >
                            Marquer comme ouvert
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                            disabled={ticket.status === 'in_progress'}
                          >
                            Marquer en cours
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                            disabled={ticket.status === 'closed'}
                          >
                            Résoudre
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Assigner à</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={<HelpCircle className="h-10 w-10 text-muted-foreground" />}
              title="Aucun ticket trouvé"
              description="Aucun ticket ne correspond à vos critères de recherche."
              action={
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
