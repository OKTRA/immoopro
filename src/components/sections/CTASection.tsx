
import { useRef } from "react";
import { useInView } from "framer-motion";
import { ButtonEffects } from "../ui/ButtonEffects";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 });

  return (
    <section 
      className="py-20"
      ref={sectionRef}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl opacity-30 transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Prêt à optimiser votre gestion immobilière ?
              </h2>
              <p className="text-lg text-muted-foreground">
                Commencez dès aujourd'hui avec un essai gratuit de 14 jours.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <ButtonEffects 
                variant="primary"
                size="lg"
              >
                <div className="flex items-center">
                  Essai gratuit
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </ButtonEffects>
              
              <ButtonEffects 
                variant="outline"
                size="lg"
              >
                Nous contacter
              </ButtonEffects>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
