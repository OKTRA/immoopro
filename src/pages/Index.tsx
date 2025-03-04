import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import FeaturedAgenciesSection from '@/components/sections/FeaturedAgenciesSection';
import FeaturedPropertiesSection from '@/components/sections/FeaturedPropertiesSection';
import TestimonialSection from '@/components/sections/TestimonialSection';
import PricingSection from '@/components/sections/PricingSection';
import CTASection from '@/components/sections/CTASection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
// Fix the Dashboard import to use named import
import { Dashboard } from '@/components/Dashboard';
import { useUser } from '@/contexts/UserContext';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, userRole } = useUser();

  useEffect(() => {
    if (user && userRole === 'admin') {
      toast.success("Bienvenue Administrateur !");
      navigate('/admin');
    }
  }, [user, userRole, navigate]);

  return (
    <>
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <FeaturedAgenciesSection />
      <FeaturedPropertiesSection />
      <TestimonialSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </>
  );
};

export default Index;
