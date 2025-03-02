
import { Link } from "react-router-dom";
import { ButtonEffects } from "./ui/ButtonEffects";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  Mail
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Plateforme",
      links: [
        { name: "Accueil", href: "/" },
        { name: "Recherche", href: "#search" },
        { name: "Propriétés", href: "#properties" },
        { name: "Agences", href: "#agencies" },
        { name: "Tarifs", href: "#pricing" }
      ]
    },
    {
      title: "Espaces",
      links: [
        { name: "Espace Agence", href: "/agence" },
        { name: "Espace Propriétaire", href: "/owner" },
        { name: "Admin", href: "/admin" }
      ]
    },
    {
      title: "Ressources",
      links: [
        { name: "Centre d'aide", href: "#help" },
        { name: "Blog", href: "#blog" },
        { name: "Documentation API", href: "#api" },
        { name: "Partenaires", href: "#partners" }
      ]
    },
    {
      title: "Légal",
      links: [
        { name: "Conditions d'utilisation", href: "#terms" },
        { name: "Politique de confidentialité", href: "#privacy" },
        { name: "Mentions légales", href: "#legal" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" }
  ];

  return (
    <footer className="bg-muted/30 border-t border-border/60">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-semibold tracking-tight text-foreground inline-flex items-center mb-4">
              <span className="text-primary">immo</span>
              <span>connect</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              La première plateforme immobilière intégrée pour les agences, 
              propriétaires et locataires.
            </p>
            
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4 className="font-medium text-base mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-border/60">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © {currentYear} ImmoConnect. Tous droits réservés.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center">
              <div className="flex items-center space-x-4">
                <a href="#terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Conditions
                </a>
                <a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Confidentialité
                </a>
                <a href="#cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookies
                </a>
              </div>
              
              <a href="#contact" className="group flex items-center text-sm text-primary">
                <Mail className="w-4 h-4 mr-1" />
                Contact 
                <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
