import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketplaceLink() {
  return (
    <Button variant="ghost" asChild className="flex items-center">
      <Link to="/marketplace" className="flex items-center">
        <Store className="h-4 w-4 mr-2" />
        Marketplace
      </Link>
    </Button>
  );
}
