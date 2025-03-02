import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import PropertyCard from "@/components/PropertyCard";
import AgencyCard from "@/components/AgencyCard";
import Footer from "@/components/Footer";
import { Property, Agency } from "@/assets/types";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { Search, ArrowRight, Building, Home, BarChart, BedDouble, Bath, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Sample properties data
  const propertiesData: Property[] = [
    {
      id: "prop1",
      title: "Appartement Moderne",
      type: "apartment",
      price: 320000,
      location: "Paris, 8ème",
      area: 65,
      bedrooms: 2,
      bathrooms: 1,
      features: ["Balcon", "Parquet", "Ascenseur"],
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "prop2",
      title: "Villa avec Jardin",
      type: "house",
      price: 850000,
      location: "Bordeaux",
      area: 180,
      bedrooms: 4,
      bathrooms: 3,
      features: ["Piscine", "Jardin", "Garage"],
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "prop3",
      title: "Espace de Bureau",
      type: "office",
      price: 450000,
      location: "Lyon, Part-Dieu",
      area: 120,
      bedrooms: 0,
      bathrooms: 1,
      features: ["Open Space", "Fibre", "Alarme"],
      imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "prop4",
      title: "Loft Industriel",
      type: "apartment",
      price: 420000,
      location: "Marseille",
      area: 95,
      bedrooms: 2,
      bathrooms: 2,
      features: ["Hauteur sous plafond", "Parking", "Vue"],
      imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60"
    }
  ];

  // Sample agencies data
  const agenciesData: Agency[] = [
    {
      id: "ag1",
      name: "Luxury Immobilier",
      logoUrl: "https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=200&auto=format&fit=crop&q=60",
      location: "Paris",
      properties: 48,
      rating: 4.8,
      verified: true
    },
    {
      id: "ag2",
      name: "Urban Habitat",
      logoUrl: "https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=200&auto=format&fit=crop&q=60",
      location: "Lyon",
      properties: 36,
      rating: 4.6,
      verified: true
    },
    {
      id: "ag3",
      name: "Méditerranée Immo",
      logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=60",
      location: "Marseille",
      properties: 29,
      rating: 4.3,
      verified: false
    },
    {
      id: "ag4",
      name: "Atlantique Properties",
      logoUrl: "https://images.unsplash.com/photo-1561069934-eee225952461?w=200&auto=format&fit=crop&q=60",
      location: "Bordeaux",
      properties: 42,
      rating: 4.5,
      verified: true
    }
  ];

  // Pricing tiers
  const pricingTiers = [
    {
      name: "Essentiel",
      price: "29",
      description: "Idéal pour les petites agences ou propriétaires individuels",
      features: [
        "Jusqu'à 20 propriétés",
        "Gestion des locataires",
        "Documents essentiels",
        "Support par email"
      ]
    },
    {
      name: "Professionnel",
      price: "79",
      description: "Pour les agences immobilières en pleine croissance",
      features: [
        "Jusqu'à 100 propriétés",
        "Gestion complète des baux",
        "Comptabilité avancée",
        "Rapports personnalisés",
        "Support prioritaire"
      ],
      popular: true
    },
    {
      name: "Entreprise",
      price: "199",
      description: "Solution complète pour les grandes agences et réseaux",
      features: [
        "Propriétés illimitées",
        "Multi-agences",
        "API complète",
        "Intégrations personnalisées",
        "Gestionnaire de compte dédié"
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Feature Section */}
        <FeatureSection />
        
        {/* Properties Section */}
        <section className="py-24" id="properties">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <p className="text-sm font-medium text-primary mb-3">Découvrez</p>
              <h2 className="text-3xl font-bold mb-6">Propriétés sélectionnées</h2>
              <p className="text-muted-foreground mb-8">
                Des biens de qualité vérifiés par nos experts immobiliers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {propertiesData.map((property, index) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  featured={index === 0}
                />
              ))}
            </div>
            
            <div className="flex justify-center">
              <a href="#search">
                <ButtonEffects variant="outline" className="group">
                  Voir toutes les propriétés
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </ButtonEffects>
              </a>
            </div>
          </div>
        </section>
        
        {/* Search Section */}
        <section className="py-16 bg-primary/5" id="search">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <p className="text-sm font-medium text-primary mb-3">Recherche avancée</p>
                <h2 className="text-3xl font-bold mb-4">Trouvez le bien idéal</h2>
                <p className="text-muted-foreground mb-6">
                  Utilisez nos filtres avancés pour cibler exactement le type de bien qui correspond à vos besoins.
                </p>
                
                <div className="space-y-4 mt-8">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-primary mr-3" />
                    <span>Plus de 1500 propriétés disponibles</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-5 w-5 text-primary mr-3" />
                    <span>Tous types de biens immobiliers</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 text-primary mr-3" />
                    <span>Données de marché actualisées</span>
                  </div>
                </div>
                
                <div className="mt-8">
                  <ButtonEffects variant="primary" className="mr-3">
                    <Search className="h-4 w-4 mr-2" />
                    Lancer une recherche
                  </ButtonEffects>
                </div>
              </div>
              
              <div className="lg:col-span-3 glass-card p-8">
                <div className="flex flex-wrap -mx-2 mb-4">
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Localisation
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="text"
                        className="w-full rounded-md border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ville, code postal..."
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Type de bien
                    </label>
                    <select className="w-full rounded-md border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Tous les types</option>
                      <option value="apartment">Appartement</option>
                      <option value="house">Maison</option>
                      <option value="office">Bureau</option>
                      <option value="land">Terrain</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-wrap -mx-2">
                  <div className="w-full md:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Budget max
                    </label>
                    <select className="w-full rounded-md border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Tous prix</option>
                      <option value="100000">100 000 €</option>
                      <option value="250000">250 000 €</option>
                      <option value="500000">500 000 €</option>
                      <option value="1000000">1 000 000 €</option>
                    </select>
                  </div>
                  <div className="w-full md:w-1/3 px-2 mb-4">
                    <label className="flex items-center text-sm font-medium mb-1 text-foreground">
                      <BedDouble className="w-4 h-4 mr-1" />
                      Chambres
                    </label>
                    <select className="w-full rounded-md border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Indifférent</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  <div className="w-full md:w-1/3 px-2 mb-4">
                    <label className="flex items-center text-sm font-medium mb-1 text-foreground">
                      <Bath className="w-4 h-4 mr-1" />
                      Salles de bain
                    </label>
                    <select className="w-full rounded-md border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Indifférent</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap -mx-1">
                  <div className="px-1 mb-2">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                      <Tag className="w-3 h-3 mr-1" /> Balcon
                    </span>
                  </div>
                  <div className="px-1 mb-2">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                      <Tag className="w-3 h-3 mr-1" /> Parking
                    </span>
                  </div>
                  <div className="px-1 mb-2">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                      <Tag className="w-3 h-3 mr-1" /> Meublé
                    </span>
                  </div>
                  <div className="px-1 mb-2">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                      <Tag className="w-3 h-3 mr-1" /> Ascenseur
                    </span>
                  </div>
                  <div className="px-1 mb-2">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                      <Tag className="w-3 h-3 mr-1" /> Terrasse
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Agencies Section */}
        <section className="py-24" id="agencies">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <p className="text-sm font-medium text-primary mb-3">Nos partenaires</p>
              <h2 className="text-3xl font-bold mb-6">Agences certifiées</h2>
              <p className="text-muted-foreground mb-8">
                Un réseau d'agences professionnelles pour vous accompagner dans vos projets immobiliers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {agenciesData.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} />
              ))}
            </div>
            
            <div className="flex justify-center">
              <a href="#agencies-more">
                <ButtonEffects variant="outline" className="group">
                  Voir toutes les agences
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </ButtonEffects>
              </a>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section className="py-24 bg-muted/30" id="pricing">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <p className="text-sm font-medium text-primary mb-3">Tarifs</p>
              <h2 className="text-3xl font-bold mb-6">Des formules adaptées à vos besoins</h2>
              <p className="text-muted-foreground mb-8">
                Choisissez le plan qui correspond à votre activité et bénéficiez d'une période d'essai gratuite
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <div key={index} className="relative flex flex-col">
                  {tier.popular && (
                    <div className="absolute -top-4 left-0 right-0 w-full flex justify-center">
                      <span className="bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-full">
                        Le plus populaire
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className={cn(
                      "h-full rounded-lg border bg-card p-8 flex flex-col",
                      tier.popular 
                        ? "border-primary shadow-md shadow-primary/5 relative z-10" 
                        : "border-border"
                    )}
                  >
                    <div className="mb-5">
                      <h3 className="text-xl font-semibold">{tier.name}</h3>
                      <p className="text-muted-foreground text-sm mt-2">{tier.description}</p>
                    </div>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-bold">{tier.price}€</span>
                      <span className="text-muted-foreground"> /mois</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8 flex-grow">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="h-5 w-5 text-primary flex-shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <ButtonEffects
                      variant={tier.popular ? "primary" : "outline"}
                      fullWidth
                    >
                      Essai gratuit de 14 jours
                    </ButtonEffects>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden" id="contact">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Prêt à révolutionner votre gestion immobilière ?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Rejoignez les professionnels qui font confiance à ImmoConnect pour optimiser 
                leur gestion immobilière au quotidien.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <ButtonEffects variant="primary" size="lg">
                  Commencer gratuitement
                </ButtonEffects>
                <ButtonEffects variant="outline" size="lg">
                  Demander une démo
                </ButtonEffects>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6">
                Aucune carte de crédit requise • Annulation à tout moment
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl opacity-50" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-30" />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
