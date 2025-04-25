import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart } from "lucide-react";
import StarRating from "@/components/ui/star-rating";
import { Product } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="relative">
        {/* We need to split the link from the add to cart button to avoid nested a tags */}
        <div className="relative cursor-pointer" onClick={() => window.location.href = `/product/${product.id}`}>
          {product.isNew && (
            <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
              New
            </Badge>
          )}
          {product.onSale && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Sale
            </Badge>
          )}
          <img 
            src={product.mainImage} 
            alt={product.name} 
            className="w-full h-48 md:h-56 object-cover"
          />
          <div className="p-4">
            <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-2">
              {product.name}
            </h3>
            
            <StarRating 
              rating={product.rating} 
              reviewCount={product.reviewCount} 
              className="mt-1"
            />
            
            <div className="mt-2 flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-900">
                  {formatCurrency(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-gray-500 text-sm line-through ml-1">
                    {formatCurrency(product.oldPrice)}
                  </span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-primary hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-full z-10"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
