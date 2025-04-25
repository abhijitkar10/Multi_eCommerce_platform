import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import CartDropdown from "@/components/cart/cart-dropdown";
import { Search, User, Menu, X } from "lucide-react";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { getCartCount } = useCart();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileSearchOpen(false);
    }
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const categories = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Beauty",
    "Books",
    "Sports",
    "Toys"
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <a className="text-2xl font-bold text-primary">ShopEase</a>
          </Link>
          
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-grow mx-8 relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full py-2 px-4 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </form>
          </div>
          
          {/* Nav Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon (Mobile Only) */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <Search className="h-5 w-5 text-gray-700" />
            </Button>
            
            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5 text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <div className="px-2 py-1.5 text-sm font-medium">
                      Hello, {user.name}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/my-orders">My Orders</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/account">Account Settings</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/create-product">Sell an Item</a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <a href="/auth">Sign In</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/auth">Create Account</a>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Cart Dropdown */}
            <CartDropdown />

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-700" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Search - Hidden by default */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full py-2 px-4 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Mobile Categories Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-3 pt-1">
            {user && (
              <div className="mb-3 space-y-2">
                <a href="/create-product" className="block bg-primary text-white text-center font-semibold px-4 py-2 rounded-md">
                  Sell an Item
                </a>
                <div className="flex space-x-2">
                  <a href="/my-orders" className="block flex-1 bg-gray-100 text-center font-medium px-3 py-2 rounded-md text-gray-700">
                    My Orders
                  </a>
                  <a href="/account" className="block flex-1 bg-gray-100 text-center font-medium px-3 py-2 rounded-md text-gray-700">
                    Settings
                  </a>
                </div>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              {categories.map((category) => (
                <a 
                  key={category} 
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className="px-2 py-1.5 hover:bg-gray-100 rounded text-gray-700"
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Category Navigation - Desktop Only */}
      <nav className="bg-gray-100 py-2 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center overflow-x-auto">
            {categories.map((category) => (
              <a 
                key={category} 
                href={`/products?category=${encodeURIComponent(category)}`}
                className="whitespace-nowrap px-3 py-1 text-gray-600 hover:text-primary text-sm font-medium"
              >
                {category}
              </a>
            ))}
          </div>
          
          {user && (
            <a href="/create-product" className="whitespace-nowrap px-4 py-1 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Sell an Item
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
