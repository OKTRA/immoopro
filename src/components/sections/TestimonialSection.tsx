
import { useRef } from "react";
import { useInView } from "framer-motion";
import { AnimatedCard } from "../ui/AnimatedCard";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatarUrl: string;
}

export default function TestimonialSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const testimonials: Testimonial[] = [
    {
      name: "Sophie Martin",
      role: "Propriétaire",
      content: "ImmoConnect m'a permis de simplifier considérablement la gestion de mes biens locatifs. Les quittances automatiques et le suivi des paiements m'ont fait gagner un temps précieux !",
      rating: 5,
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Marc Dubois",
      role: "Directeur d'agence",
      content: "Depuis que nous utilisons ImmoConnect, nous avons réduit de 40% le temps consacré aux tâches administratives. Nos agents peuvent ainsi se concentrer sur l'essentiel : le conseil et l'accompagnement client.",
      rating: 5,
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Audrey Leroy",
      role: "Gestionnaire locatif",
      content: "La plateforme est intuitive et complète. Le support client est toujours réactif pour répondre à nos questions. Je recommande vivement ImmoConnect à toutes les agences.",
      rating: 4,
      avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  return (
    <section 
      className="py-20 bg-primary/5"
      ref={sectionRef}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3">Témoignages</p>
          <h2 className="text-3xl font-bold mb-6">Ce que nos utilisateurs disent</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <AnimatedCard
              key={index}
              highlightOnHover={true}
              className="p-6 h-full"
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.avatarUrl} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 flex-grow">
                  "{testimonial.content}"
                </p>
                
                <div className="flex mt-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-muted'}`}
                    />
                  ))}
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
