import React, { useState } from 'react';
import { Link } from 'wouter';
import { Product } from '@shared/schema';
import { Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isWishlist, setIsWishlist] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlist(!isWishlist);
    toast({
      title: isWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlist
        ? "Item has been removed from your wishlist"
        : "Item has been added to your wishlist",
      duration: 3000,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product.id,
      quantity: 1,
    });
  };

  // Generate star rating
  const renderRating = () => {
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex text-yellow-400 text-sm items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={`star-full-${i}`} className="h-4 w-4 fill-current" />;
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={`star-half-${i}`} className="relative">
                <Star className="h-4 w-4 text-gray-300" />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </div>
            );
          } else {
            return <Star key={`star-empty-${i}`} className="h-4 w-4 text-gray-300" />;
          }
        })}
        <span className="text-gray-500 ml-1">({product.reviews || 0})</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link href={`/product/${product.slug}`}>
        <a className="block">
          <div className="relative pb-[100%] bg-gray-100">
            <img
              src={product.imageUrl || ''}
              alt={product.name || 'Product image'}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {(product.isNew || product.isSale) && (
              <div className="absolute top-2 right-2">
                {product.isNew && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    NEW
                  </span>
                )}
                {product.isSale && (
                  <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded ml-1">
                    SALE
                  </span>
                )}
              </div>
            )}
          </div>
        </a>
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-900 font-medium text-sm hover:text-primary transition-colors">
              <Link href={`/product/${product.slug}`}>
                <a>{product.name}</a>
              </Link>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {product.description?.substring(0, 30) || 'No description available'}
              {product.description && product.description.length > 30 ? '...' : ''}
            </p>
          </div>
          <button
            className={`ml-2 transition-colors ${
              isWishlist ? 'text-primary' : 'text-gray-400 hover:text-primary'
            }`}
            onClick={toggleWishlist}
            aria-label={isWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-5 w-5 ${isWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <div>
            <span className="text-gray-900 font-medium">{formatCurrency(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-500 text-sm line-through ml-2">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          {renderRating()}
        </div>

        <Button className="mt-4 w-full" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;