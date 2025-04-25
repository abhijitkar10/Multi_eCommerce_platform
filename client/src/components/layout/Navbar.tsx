import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { 
  Search, 
  ShoppingCart, 
  User,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Navbar: React.FC = () => {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { cart, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/">
              <a className="text-primary text-2xl font-bold">ShopEase</a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <a className="font-medium text-gray-700 hover:text-primary transition-colors">
                Home
              </a>
            </Link>
            <Link href="/products">
              <a className="font-medium text-gray-700 hover:text-primary transition-colors">
                Shop
              </a>
            </Link>
            <Link href="/products/electronics">
              <a className="font-medium text-gray-700 hover:text-primary transition-colors">
                Categories
              </a>
            </Link>
          </nav>

          {/* Search, Cart, and Account */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search products..."
                className="w-64 pl-10 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </form>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="relative group"
              onClick={toggleCart}
            >
              <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-primary transition-colors" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Button>
            
            {user ? (
              <div className="hidden md:block relative">
                <Button 
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <User className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <a className="hidden md:block">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Login</span>
                  </Button>
                </a>
              </Link>
            )}
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Search - Only visible on mobile */}
        <div className="pb-4 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </form>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <Link href="/">
              <a className="block font-medium text-gray-700 hover:text-primary transition-colors">
                Home
              </a>
            </Link>
            <Link href="/products">
              <a className="block font-medium text-gray-700 hover:text-primary transition-colors">
                Shop
              </a>
            </Link>
            <Link href="/products/electronics">
              <a className="block font-medium text-gray-700 hover:text-primary transition-colors">
                Categories
              </a>
            </Link>
            {user ? (
              <Button 
                variant="ghost"
                className="w-full justify-start p-0 h-auto font-medium text-gray-700 hover:text-primary transition-colors"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Link href="/auth">
                <a className="block font-medium text-gray-700 hover:text-primary transition-colors">
                  Login / Register
                </a>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
