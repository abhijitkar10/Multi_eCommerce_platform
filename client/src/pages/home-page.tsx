import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import ProductCard from "@/components/products/product-card";
import { Loader2, Laptop, ShoppingBag, Home, Smile, Book, Volleyball, Gift } from "lucide-react";
import Chatbot from '@/components/chatbot/Chatbot';

export default function HomePage() {
  const { data: featuredProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products?limit=8"],
  });
  
  // Categories with matching icons
  const categories = [
    { name: "Electronics", icon: <Laptop className="h-10 w-10 text-primary" /> },
    { name: "Clothing", icon: <ShoppingBag className="h-10 w-10 text-primary" /> },
    { name: "Home & Kitchen", icon: <Home className="h-10 w-10 text-primary" /> },
    { name: "Beauty", icon: <Smile className="h-10 w-10 text-primary" /> },
    { name: "Books", icon: <Book className="h-10 w-10 text-primary" /> },
    { name: "Sports", icon: <Volleyball className="h-10 w-10 text-primary" /> }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Summer Collection 2025</h1>
              <p className="text-indigo-100 mb-6">Discover the latest trends with up to 40% off on selected items. Limited time offer.</p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-white text-primary hover:bg-gray-100">
                  <Link href="/products?onSale=true">
                    <a>Shop Now</a>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&h=500&q=80&w=500" 
                alt="Summer Collection" 
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
              >
                <a className="group">
                  <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center aspect-square transition group-hover:bg-gray-200">
                    {category.icon}
                  </div>
                  <h3 className="mt-3 text-center font-medium">{category.name}</h3>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/products?featured=true">
              <a className="text-primary hover:underline mt-2 md:mt-0">
                View All
              </a>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sale Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Sale Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts
              ?.filter(product => product.isSale) // Filter products tagged with "sale"
              .map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Join Our Newsletter</h2>
            <p className="text-indigo-200 mb-6">Stay updated with the latest products, exclusive offers and promotions.</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-lg focus:outline-none"
                required
              />
              <Button type="submit" className="px-6 py-3 bg-orange-500 text-white font-medium hover:bg-orange-600">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-indigo-200 mt-4">By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.</p>
          </div>
        </div>
      </section>

      <Chatbot />
    </div>
  );
}
