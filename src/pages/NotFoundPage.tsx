
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-bold mt-6 mb-4">Page non trouvée</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/search">Rechercher une propriété</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
}
