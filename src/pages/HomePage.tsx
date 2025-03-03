
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPopularProperties, getFeaturedProperties } from "@/services/propertyService";
import { Property } from "@/assets/types";
import { Home, Building2, User, LogIn } from "lucide-react";
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyList from '@/components/properties/PropertyList';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const { properties } = await getFeaturedProperties(6);
        setFeaturedProperties(properties || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Propriétés en vedette</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <PropertyList properties={featuredProperties} />
            )}
            
            <div className="mt-12 text-center">
              <Button asChild size="lg">
                <Link to="/properties">Voir toutes les propriétés</Link>
              </Button>
            </div>
          </div>
        </section>
        
        <FeatureSection />
        
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Accédez à votre espace</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connectez-vous à votre espace pour gérer vos propriétés, locataires et baux.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button className="flex items-center gap-2" asChild size="lg">
                <Link to="/agencies">
                  <Building2 className="w-5 h-5" />
                  Espace Agence
                </Link>
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2" asChild size="lg">
                <Link to="/auth">
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
