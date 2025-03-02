
import React, { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
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
import { getCurrentUser } from "@/services/authService";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { user } = await getCurrentUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Show Dashboard for logged in users */}
        {!loading && user && (
          <div className="container mx-auto px-4 py-8">
            <Dashboard user={user} />
          </div>
        )}

        {/* Show normal landing page for non-logged in users */}
        {(!user) && (
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
