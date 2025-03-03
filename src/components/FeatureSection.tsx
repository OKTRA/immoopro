
import { useRef } from "react";
import { useInView } from "framer-motion";
import { AnimatedCard } from "./ui/AnimatedCard";
import { BarChart3, Building2, Briefcase, Shield, Users2, FileText } from "lucide-react";
import { Feature, UserTypeOption } from "@/assets/types";

export default function FeatureSection() {
  const features: Feature[] = [
    {
      title: "Gestion des Biens",
      description: "Gérez facilement votre portefeuille immobilier, du studio à l'immeuble entier.",
      icon: "Building2"
    },
    {
      title: "Gestion Locative",
      description: "Simplifiez vos relations avec les locataires et automatisez les tâches répétitives.",
      icon: "Users2"
    },
    {
      title: "Finances & Comptabilité",
      description: "Suivez vos revenus, dépenses et générez des rapports financiers détaillés.",
      icon: "Briefcase"
    },
    {
      title: "Reporting & Analytics",
      description: "Analysez les performances de votre patrimoine avec des tableaux de bord personnalisés.",
      icon: "BarChart3"
    },
    {
      title: "Documents & Contrats",
      description: "Créez, signez et archivez tous vos documents juridiques en quelques clics.",
      icon: "FileText"
    },
    {
      title: "Sécurité & Conformité",
      description: "Protection de vos données et mise en conformité avec les réglementations en vigueur.",
      icon: "Shield"
    }
  ];

  const userTypes: UserTypeOption[] = [
    {
      type: "agency",
      label: "Espace Agence",
      path: "/agence",
      description: "Optimisez votre gestion locative, suivez vos biens et locataires, et automatisez vos processus."
    },
    {
      type: "owner",
      label: "Espace Propriétaire",
      path: "/owner",
      description: "Visualisez vos revenus, suivez l'occupation de vos biens et communiquez avec votre agence."
    },
    {
      type: "admin",
      label: "Super Admin",
      path: "/admin",
      description: "Gérez vos agences partenaires, configurez le système et accédez aux statistiques globales."
    }
  ];

  const featureRef = useRef(null);
  const userTypeRef = useRef(null);
  const isFeatureInView = useInView(featureRef, { once: true, amount: 0.3 });
  const isUserTypeInView = useInView(userTypeRef, { once: true, amount: 0.3 });

  // Map icon string to icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Building2: <Building2 className="h-full w-full" />,
      Users2: <Users2 className="h-full w-full" />,
      Briefcase: <Briefcase className="h-full w-full" />,
      BarChart3: <BarChart3 className="h-full w-full" />,
      FileText: <FileText className="h-full w-full" />,
      Shield: <Shield className="h-full w-full" />
    };
    
    return iconMap[iconName] || null;
  };

  return (
    <section className="py-24 bg-muted/50" id="features">
      <div className="container mx-auto px-4">
        {/* Features */}
        <div 
          ref={featureRef}
          className="max-w-4xl mx-auto text-center mb-16"
          style={{
            opacity: isFeatureInView ? 1 : 0,
            transform: isFeatureInView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
          }}
        >
          <p className="text-sm font-medium text-primary mb-3">Modules intégrés</p>
          <h2 className="text-3xl font-bold mb-6">Toutes les fonctionnalités dont vous avez besoin</h2>
          <p className="text-muted-foreground mb-12">
            Une solution complète pour simplifier et optimiser la gestion de votre patrimoine immobilier
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <AnimatedCard
                key={index}
                highlightOnHover={true}
                className="p-6 h-full"
                style={{
                  transitionDelay: `${index * 100}ms`,
                  opacity: isFeatureInView ? 1 : 0,
                  transform: isFeatureInView ? "translateY(0)" : "translateY(20px)"
                }}
              >
                <div className="flex flex-col h-full text-left">
                  <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {getIconComponent(feature.icon)}
                  </div>
                  <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* User Types */}
        <div 
          ref={userTypeRef}
          className="max-w-6xl mx-auto mt-24"
          style={{
            opacity: isUserTypeInView ? 1 : 0,
            transform: isUserTypeInView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
            transitionDelay: "0.2s"
          }}
        >
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary mb-3">Pour chaque besoin</p>
            <h2 className="text-3xl font-bold mb-6">Un espace dédié pour chaque utilisateur</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {userTypes.map((userType, index) => (
              <a 
                key={index} 
                href={userType.path}
                className="block h-full"
              >
                <AnimatedCard
                  highlightOnHover={true}
                  depthEffect={true}
                  className="p-8 h-full border border-border/50 hover:border-primary/20 transition-all"
                  style={{
                    transitionDelay: `${index * 100 + 300}ms`,
                    opacity: isUserTypeInView ? 1 : 0,
                    transform: isUserTypeInView ? "translateY(0)" : "translateY(20px)"
                  }}
                >
                  <div className="flex flex-col h-full">
                    <h3 className="text-xl font-semibold mb-3">{userType.label}</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      {userType.description}
                    </p>
                    <div className="mt-auto">
                      <span className="text-sm font-medium text-primary flex items-center">
                        Découvrir
                        <svg className="w-4 h-4 ml-1" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </AnimatedCard>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
