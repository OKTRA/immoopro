
import { useState, useEffect } from "react";
import { AnimatedCard } from "../ui/AnimatedCard";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Building, BadgeCheck, ArrowRight } from "lucide-react";
import AgencyCard from "../AgencyCard";
import { ButtonEffects } from "../ui/ButtonEffects";
import { Agency } from "@/assets/types";
import { getFeaturedAgencies } from "@/services/agencyService";
import { useQuery } from "@tanstack/react-query";

export default function FeaturedAgenciesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const { data: agenciesResult, error, isLoading } = useQuery({
    queryKey: ['featured-agencies'],
    queryFn: () => getFeaturedAgencies(6),
  });

  const agencies = agenciesResult?.agencies || [];

  return (
    <section 
      id="agencies" 
      className="py-24"
      ref={sectionRef}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3">Nos agences partenaires</p>
          <h2 className="text-3xl font-bold mb-6">Les meilleures agences immobilières</h2>
          <p className="text-muted-foreground mb-12">
            Découvrez notre réseau d'agences immobilières de confiance, sélectionnées pour leur professionnalisme et leur expertise
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <AnimatedCard key={index} className="p-6 h-48">
                <div className="animate-pulse flex flex-col h-full">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-muted/50 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-muted/50 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="h-4 bg-muted/50 rounded w-full"></div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        ) : error ? (
          <AnimatedCard className="p-6 text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Impossible de charger les agences</h3>
            <p className="text-muted-foreground">Veuillez réessayer ultérieurement</p>
          </AnimatedCard>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agencies.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <ButtonEffects variant="outline">
                <div className="flex items-center">
                  Voir toutes les agences
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </ButtonEffects>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
