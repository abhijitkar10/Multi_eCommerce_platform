import React from 'react';

const BrandPartners: React.FC = () => {
  return (
    <section className="py-8 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <p className="text-sm text-gray-500 mb-6 text-center">Trusted by leading brands</p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {[1, 2, 3, 4, 5].map(brand => (
            <div 
              key={brand}
              className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
            >
              <div className="h-8 w-24 bg-gray-400 rounded flex items-center justify-center text-white font-bold text-xs">
                BRAND {brand}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandPartners;
