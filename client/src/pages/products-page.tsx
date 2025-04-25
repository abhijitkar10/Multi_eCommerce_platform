import { useRoute } from "wouter";
import ProductGrid from "@/components/products/product-grid";

export default function ProductsPage() {
  // Get the search params from the window location
  const searchParams = window.location.search;
  const params = new URLSearchParams(searchParams);
  
  const category = params.get('category') || undefined;
  const searchQuery = params.get('search') || undefined;
  const featured = params.get('featured') === 'true';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGrid 
        category={category} 
        searchQuery={searchQuery}
        featured={featured}
      />
    </div>
  );
}
