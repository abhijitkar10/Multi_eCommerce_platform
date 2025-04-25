import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, X, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import CartSelector from "./cart-selector";

export default function CartDropdown() {
  const { user } = useAuth();
  const { 
    cartItems, 
    removeItem, 
    getCartTotal, 
    getCartCount, 
    carts,
    activeCartId,
    switchCart,
    getActiveCart
  } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get the active cart name
  const activeCart = getActiveCart();
  
  const handleRemoveItem = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem(id);
  };

  const handleCartSelected = (cartId: number) => {
    switchCart(cartId);
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5 text-gray-700" />
          {getCartCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium">Your Cart ({getCartCount()})</h3>
          {user && carts.length > 0 && (
            <CartSelector 
              onCartSelected={handleCartSelected}
              trigger={
                <Button variant="ghost" size="sm" className="h-8 text-xs flex items-center gap-1">
                  {activeCart?.name || "Select Cart"}
                  <ChevronDown size={14} />
                </Button>
              }
              title="Select Cart to View"
              description="Choose which cart you want to view"
              buttonText="View This Cart"
            />
          )}
        </div>
        
        {user ? (
          <>
            {cartItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {activeCart ? `Your cart "${activeCart.name}" is empty` : "Your cart is empty"}
              </div>
            ) : (
              <>
                <div className="max-h-72 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-3 border-b border-gray-100 flex">
                      <a href={`/product/${item.product.id}`} className="flex-shrink-0">
                        <img 
                          src={item.product.mainImage} 
                          alt={item.product.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      </a>
                      <div className="ml-3 flex-grow">
                        <div className="flex justify-between">
                          <a 
                            href={`/product/${item.product.id}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {item.product.name}
                          </a>
                          <div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5"
                              onClick={(e) => handleRemoveItem(item.id, e)}
                            >
                              <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × {formatCurrency(item.product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-b border-gray-200 flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(getCartTotal())}</span>
                </div>
                <div className="p-3 flex flex-col">
                  <Button asChild className="mb-2">
                    <a href="/checkout">Checkout</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/cart">View Cart</a>
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="p-4 text-center">
            <p className="mb-3 text-gray-600">Sign in to view your cart</p>
            <Button asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
