
import { useParams } from 'react-router-dom';
import TenantListContainer from './TenantListContainer';
import LeaseListContainer from './LeaseListContainer';
import AccessDeniedCard from './AccessDeniedCard';

export default function ManageTenantsPage({ leaseView = false }) {
  const { agencyId, propertyId } = useParams();

  console.log(`ManageTenantsPage loaded with agencyId=${agencyId}, propertyId=${propertyId}, leaseView=${leaseView}`);

  if (!agencyId) {
    return <AccessDeniedCard />;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {leaseView ? "Gestion des Baux" : "Gestion des Locataires"}
        {propertyId && <span className="text-sm text-gray-500 ml-2">(Propriété ID: {propertyId})</span>}
      </h1>
      
      {leaseView ? (
        <LeaseListContainer agencyId={agencyId} propertyId={propertyId} />
      ) : (
        <TenantListContainer agencyId={agencyId} propertyId={propertyId} />
      )}
    </div>
  );
}
