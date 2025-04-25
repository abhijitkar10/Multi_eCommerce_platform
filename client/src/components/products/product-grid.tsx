import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/products/product-card";
import ProductFilters from "@/components/products/product-filters";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import { Loader2, Filter, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProductGridProps {
  category?: string;
  searchQuery?: string;
  featured?: boolean;
}

export default function ProductGrid({ category, searchQuery, featured }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [filterParams, setFilterParams] = useState({
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    ratings: [] as number[]
  });
  
  const productsPerPage = 8;
  
  // Construct API URL with filters
  const getQueryUrl = () => {
    // If we have a search query, use the dedicated search endpoint
    if (searchQuery) {
      return `/api/products/search?q=${encodeURIComponent(searchQuery)}`;
    }
    
    // Otherwise, use the main products endpoint with filters
    let url = `/api/products?`;
    
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (featured) url += `featured=true&`;
    
    if (filterParams.minPrice !== undefined) url += `minPrice=${filterParams.minPrice}&`;
    if (filterParams.maxPrice !== undefined) url += `maxPrice=${filterParams.maxPrice}&`;
    
    const sortParam = sortBy === "featured" ? "" :
                      sortBy === "price_asc" ? "sort=price_asc&" :
                      sortBy === "price_desc" ? "sort=price_desc&" :
                      sortBy === "rating" ? "sort=rating_desc&" : 
                      sortBy === "newest" ? "sort=newest&" : "";
    url += sortParam;
    
    url += `limit=${productsPerPage}&offset=${(currentPage - 1) * productsPerPage}`;
    
    return url;
  };

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [getQueryUrl()],
  });
  
  const handleApplyFilters = (newFilters: {
    minPrice?: number;
    maxPrice?: number;
    ratings: number[];
  }) => {
    setFilterParams(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
    setShowFilters(false); // Close mobile filter on apply
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page on sort change
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Mocked total pages for pagination
  const totalPages = 5;
  
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-2xl font-bold">
          {searchQuery ? `Search: "${searchQuery}"` : 
           category ? `${category}` : 
           featured ? "Featured Products" : "All Products"}
        </h2>
        
        {/* Filter & Sort (Desktop) */}
        <div className="hidden md:flex items-center space-x-4 mt-4 md:mt-0">
          <ProductFilters 
            initialFilters={filterParams}
            onApplyFilters={handleApplyFilters}
          />
          
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Customer Rating</SelectItem>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Filter & Sort (Mobile) */}
        <div className="flex items-center space-x-2 mt-4 md:hidden">
          <Button 
            variant="outline" 
            className="flex-1 justify-center"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="flex-1">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <span>Sort</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Customer Rating</SelectItem>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">Filter Products</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowFilters(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </Button>
            </div>
            <div className="p-4">
              <ProductFilters 
                initialFilters={filterParams}
                onApplyFilters={handleApplyFilters}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Product Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your filters or search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {products && products.length > 0 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
