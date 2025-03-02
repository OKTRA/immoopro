
import { useRef } from "react";
import { useInView } from "framer-motion";
import { AnimatedCard } from "../ui/AnimatedCard";
import { Check, AlertCircle } from "lucide-react";
import { ButtonEffects } from "../ui/ButtonEffects";

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export default function PricingSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const pricingTiers: PricingTier[] = [
    {
      name: "Propriétaires",
      price: "19€",
      description: "L'essentiel pour gérer vos biens immobiliers en toute simplicité",
      features: [
        "Gestion de jusqu'à 5 propriétés",
        "Suivi des paiements",
        "Génération de quittances",
        "Documents légaux de base",
        "Support par email"
      ],
      cta: "Commencer gratuitement"
    },
    {
      name: "Agences",
      price: "99€",
      description: "Solutions complètes pour les professionnels de l'immobilier",
      features: [
        "Gestion illimitée de propriétés",
        "Portail propriétaire et locataire",
        "Comptabilité intégrée",
        "Génération de documents avancée",
        "Module de visite virtuelle",
        "Support prioritaire 7j/7"
      ],
      cta: "Essai gratuit de 14 jours",
      popular: true
    },
    {
      name: "Entreprise",
      price: "Sur mesure",
      description: "Pour les grandes structures avec des besoins spécifiques",
      features: [
        "Intégration personnalisée",
        "API complète",
        "Tableau de bord analytique",
        "Conformité RGPD renforcée",
        "Support dédié 24/7",
        "Formation et onboarding"
      ],
      cta: "Contacter l'équipe commerciale"
    }
  ];

  return (
    <section 
      id="pricing" 
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
          <p className="text-sm font-medium text-primary mb-3">Tarification</p>
          <h2 className="text-3xl font-bold mb-6">Plans adaptés à vos besoins</h2>
          <p className="text-muted-foreground mb-6">
            Choisissez la formule qui correspond le mieux à votre activité
          </p>
          <div className="inline-flex items-center p-1 bg-muted/50 rounded-full">
            <span className="px-4 py-1.5 rounded-full bg-background shadow-sm text-sm font-medium">
              Mensuel
            </span>
            <span className="px-4 py-1.5 text-sm text-muted-foreground">
              Annuel (-20%)
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div 
              key={index} 
              className="flex"
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <AnimatedCard
                className={`flex flex-col p-8 h-full w-full ${tier.popular ? 'border-primary/50 shadow-md' : 'border-border/50'}`}
                depthEffect={tier.popular}
                highlightOnHover={true}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs py-1 px-3 rounded-full">
                    Recommandé
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.price !== "Sur mesure" && <span className="text-sm text-muted-foreground ml-1">/mois</span>}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>
                
                <ul className="mt-6 space-y-3 flex-grow">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <ButtonEffects
                    variant={tier.popular ? "primary" : "outline"}
                    fullWidth
                  >
                    {tier.cta}
                  </ButtonEffects>
                </div>
              </AnimatedCard>
            </div>
          ))}
        </div>
        
        <div className="max-w-3xl mx-auto mt-16 bg-muted/30 rounded-lg p-6 flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h4 className="text-base font-medium mb-2">Besoin d'aide pour choisir ?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Notre équipe est à votre disposition pour vous guider dans le choix de la formule la plus adaptée à vos besoins.
              Nous proposons également des solutions sur mesure pour répondre à des exigences spécifiques.
            </p>
            <a href="#contact" className="text-sm text-primary font-medium hover:underline">
              Contactez-nous
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
