import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import StarRating from "@/components/ui/star-rating";
import ProductCard from "@/components/products/product-card";
import CartSelector from "@/components/cart/cart-selector";
import { MinusCircle, PlusCircle, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const [match, params] = useRoute<{ id: string }>("/product/:id");
  const [quantity, setQuantity] = useState(1);
  const [cartSelectionOpen, setCartSelectionOpen] = useState(false);
  
  const id = match ? parseInt(params.id) : 0;
  
  const { data: product, isLoading: isProductLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });
  
  const { data: relatedProducts, isLoading: isRelatedLoading } = useQuery<Product[]>({
    queryKey: [product ? `/api/products?category=${encodeURIComponent(product.category)}&limit=4` : null],
    enabled: !!product,
  });
  
  const { 
    addToCart, 
    carts, 
    activeCartId
  } = useCart();
  
  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    // Always show cart selector with CartSelector component
    setCartSelectionOpen(true);
  };
  
  const handleCartSelected = (cartId: number) => {
    if (!product) return;
    
    // Add to selected cart
    addToCart(product, quantity, cartId);
    setCartSelectionOpen(false);
  };
  
  if (isProductLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-8">The product you are looking for does not exist or has been removed.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/products">
          <Button variant="outline" className="gap-2 mb-4">
            <ArrowLeft size={16} /> Back to Products
          </Button>
        </Link>
      </div>
      
      {/* Product details */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Product image */}
        <div className="md:w-1/2">
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <img 
              src={product.mainImage} 
              alt={product.name} 
              className="w-full h-auto object-cover aspect-square"
            />
          </div>
        </div>
        
        {/* Product info */}
        <div className="md:w-1/2">
          {product.onSale && (
            <div className="bg-red-500 text-white text-sm px-3 py-1 rounded w-fit mb-3">
              Sale
            </div>
          )}
          {product.isNew && (
            <div className="bg-orange-500 text-white text-sm px-3 py-1 rounded w-fit mb-3">
              New
            </div>
          )}
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          
          <div className="mb-4 flex items-center">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-lg text-gray-500 line-through ml-3">
                  {formatCurrency(product.oldPrice)}
                </span>
              )}
              {product.onSale && product.oldPrice && (
                <span className="ml-3 text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded">
                  Save {formatCurrency(product.oldPrice - product.price)}
                </span>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600">{product.description}</p>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="text-sm font-medium text-gray-700 mr-3">Quantity:</span>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <MinusCircle size={16} />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-16 mx-2 text-center h-10"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  <PlusCircle size={16} />
                </Button>
              </div>
            </div>
            
            <Button className="w-full md:w-auto min-w-[180px] flex items-center gap-2" onClick={handleAddToCart}>
              <ShoppingCart size={18} />
              Add to Cart
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            <p className="flex items-center mb-1">
              <span className={`mr-2 w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </p>
            <p>Category: <span className="font-medium">{product.category}</span></p>
          </div>
        </div>
      </div>
      
      {/* Product details tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="mb-6">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="p-4 bg-white rounded-lg shadow-sm">
          <div className="prose max-w-none">
            <h3 className="text-xl font-bold mb-4">Product Description</h3>
            <p className="mb-4">{product.description}</p>
          </div>
        </TabsContent>
        <TabsContent value="specifications" className="p-4 bg-white rounded-lg shadow-sm">
          <div className="prose max-w-none">
            <h3 className="text-xl font-bold mb-4">Product Specifications</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Brand</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">ShopEase</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Model</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Category</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.category}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Weight</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">0.5 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Warranty</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">1 Year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="p-4 bg-white rounded-lg shadow-sm">
          <div className="prose max-w-none">
            <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
            <div className="flex items-center mb-6">
              <div className="mr-4">
                <span className="text-3xl font-bold">{product.rating.toFixed(1)}</span>
                <div className="mt-1">
                  <StarRating rating={product.rating} />
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Based on {product.reviewCount} reviews
                </div>
              </div>
            </div>
            
            {/* Sample reviews */}
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="font-bold mr-2">John D.</span>
                  <StarRating rating={5} />
                  <span className="text-sm text-gray-500 ml-2">1 month ago</span>
                </div>
                <p className="text-gray-700">
                  Great product! Exactly as described and arrived quickly. Very happy with my purchase.
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="font-bold mr-2">Sarah M.</span>
                  <StarRating rating={4} />
                  <span className="text-sm text-gray-500 ml-2">2 months ago</span>
                </div>
                <p className="text-gray-700">
                  Good quality for the price. Would recommend to others looking for a similar product.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Cart Selection Dialog */}
      <Dialog open={cartSelectionOpen} onOpenChange={setCartSelectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a Cart</DialogTitle>
            <DialogDescription>
              Select which cart you want to add this item to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <CartSelector 
              onCartSelected={handleCartSelected}
              showCreateCart={true}
              title="Choose a Cart"
              description="Select which cart you want to add this item to"
              buttonText="Add to this Cart"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCartSelectionOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Related products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          {isRelatedLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                relatedProduct.id !== product.id && (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}