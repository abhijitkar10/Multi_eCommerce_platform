import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@shared/schema';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onSortChange: (value: string) => void;
  sortBy: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  isLoading,
  onSortChange,
  sortBy
}) => {
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="w-full py-10 text-center">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold">Products</h2>
        
        <div className="flex items-center mt-4 sm:mt-0">
          <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="best-selling">Best Selling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
