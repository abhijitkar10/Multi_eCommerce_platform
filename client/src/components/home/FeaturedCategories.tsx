import React from 'react';
import { Link } from 'wouter';
import { Category } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  return (
    <Link href={`/products/${category.slug}`}>
      <a className="group">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
            <img 
              src={category.image || ''} 
              alt={`${category.name} category`} 
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4 text-center">
            <h3 className="font-medium text-gray-900">{category.name}</h3>
          </div>
        </div>
      </a>
    </Link>
  );
};

const CategorySkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Skeleton className="w-full h-40" />
      <div className="p-4 flex justify-center">
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
};

const FeaturedCategories: React.FC = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center mb-8">Shop by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading ? (
            // Show skeletons while loading
            [...Array(4)].map((_, index) => (
              <CategorySkeleton key={index} />
            ))
          ) : (
            // Show categories when loaded
            categories?.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
