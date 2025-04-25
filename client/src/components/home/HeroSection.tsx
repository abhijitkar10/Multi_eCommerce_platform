import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gray-800 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Hero background" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Summer Sale is Here</h1>
          <p className="text-lg mb-8">
            Discover amazing deals with up to 50% off on selected items. Limited time offer.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products">
              <Button size="lg" className="font-medium">
                Shop Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="bg-white text-gray-800 font-medium">
              View Deals
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
