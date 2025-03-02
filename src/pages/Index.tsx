
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import FeaturedPropertiesSection from "@/components/sections/FeaturedPropertiesSection";
import FeaturedAgenciesSection from "@/components/sections/FeaturedAgenciesSection";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialSection from "@/components/sections/TestimonialSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeatureSection />
        <FeaturedPropertiesSection />
        <FeaturedAgenciesSection />
        <PricingSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
