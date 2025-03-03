
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { format } from 'date-fns';

interface LeaseData {
  id: string;
  tenant_id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
  tenant?: {
    first_name: string;
    last_name: string;
  };
  property?: {
    title: string;
  };
}

interface LeaseListProps {
  leases: LeaseData[];
  loading: boolean;
  onViewLeaseDetails: (leaseId: string) => void;
}

const LeaseList: React.FC<LeaseListProps> = ({ leases, loading, onViewLeaseDetails }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Propriété
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Locataire
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date de début
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date de fin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loyer mensuel
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={7}>
                Chargement des baux...
              </td>
            </tr>
          ) : leases.length > 0 ? (
            leases.map((lease) => (
              <tr key={lease.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {lease.property?.title || "Propriété non spécifiée"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lease.tenant ? `${lease.tenant.first_name} ${lease.tenant.last_name}` : "Non assigné"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lease.start_date ? format(new Date(lease.start_date), 'dd/MM/yyyy') : "Non défini"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lease.end_date ? format(new Date(lease.end_date), 'dd/MM/yyyy') : "Non défini"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(lease.monthly_rent)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={
                    lease.status === 'active' ? 'bg-green-100 text-green-800' : 
                    lease.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }>
                    {lease.status === 'active' ? 'Actif' : 
                     lease.status === 'pending' ? 'En attente' : 
                     lease.status === 'expired' ? 'Expiré' : lease.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onViewLeaseDetails(lease.id)}>
                      <CreditCard className="h-4 w-4 mr-2" /> Paiements
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={7}>
                Aucun bail n'a été trouvé. Créez votre premier bail!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaseList;
