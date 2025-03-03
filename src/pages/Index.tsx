
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import FeaturedPropertiesSection from "@/components/sections/FeaturedPropertiesSection";
import FeaturedAgenciesSection from "@/components/sections/FeaturedAgenciesSection";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialSection from "@/components/sections/TestimonialSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/Footer";
import Dashboard from "@/components/Dashboard";
import { useUser } from "@/contexts/UserContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Index() {
  const { user, isLoading, userRole } = useUser();
  const navigate = useNavigate();
  const [showRoleAlert, setShowRoleAlert] = useState(false);

  useEffect(() => {
    // Handle role-based redirections
    if (user && !isLoading) {
      if (userRole === 'agency') {
        navigate('/agencies');
      } else if (userRole === 'owner') {
        navigate('/owner');
      }
      // For 'public' role, stay on the home page but show Dashboard
    }
  }, [user, userRole, navigate, isLoading]);

  // Show a temporary role alert for 5 seconds when a user with a specific role logs in
  useEffect(() => {
    if (user && !isLoading && userRole) {
      setShowRoleAlert(true);
      const timer = setTimeout(() => setShowRoleAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, userRole]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Role-specific welcome alert */}
        {showRoleAlert && user && (
          <div className="fixed top-20 right-4 z-50 max-w-md">
            <Alert variant="default" className="border-primary/50 bg-primary/10">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                {userRole === 'public' && "Bienvenue dans votre espace utilisateur."}
                {userRole === 'agency' && "Redirection vers votre espace agence..."}
                {userRole === 'owner' && "Redirection vers votre espace propriétaire..."}
                {userRole === 'admin' && "Bienvenue dans votre espace administrateur."}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Show Dashboard for logged in users with public role */}
        {!isLoading && user && userRole === 'public' && (
          <div className="container mx-auto px-4 py-8 mt-24">
            <Dashboard user={user} />
          </div>
        )}

        {/* Show normal landing page for non-logged in users or users with public role */}
        {(!user || (user && userRole === 'public')) && (
          <>
            <HeroSection />
            <FeatureSection />
            <FeaturedPropertiesSection />
            <FeaturedAgenciesSection />
            <PricingSection />
            <TestimonialSection />
            <CTASection />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
