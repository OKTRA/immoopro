
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

export default function Index() {
  const { user, isLoading, userRole } = useUser();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
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
