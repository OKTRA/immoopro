
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Check } from "lucide-react";

interface TenantFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterAssigned: boolean;
  setFilterAssigned: (assigned: boolean) => void;
}

const TenantFilters: React.FC<TenantFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterAssigned,
  setFilterAssigned
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher un locataire..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button 
        variant={filterAssigned ? "default" : "outline"} 
        onClick={() => setFilterAssigned(!filterAssigned)}
        className="md:w-auto w-full"
      >
        <Check className={`mr-2 h-4 w-4 ${!filterAssigned && "opacity-50"}`} />
        Locataires attribués uniquement
      </Button>
    </div>
  );
};

export default TenantFilters;
