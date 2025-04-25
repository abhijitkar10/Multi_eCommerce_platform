import { createContext, ReactNode, useContext, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CartItemWithProduct, Cart, Product, OrderItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./use-auth";

interface CartContextType {
  // Cart items in current active cart
  cartItems: CartItemWithProduct[];
  // Multiple carts support
  carts: Cart[];
  activeCartId: number | null;
  isLoading: boolean;
  error: Error | null;
  // Cart operations
  addToCart: (product: Product, quantity?: number, cartId?: number) => void;
  addOrderItemsToCart: (orderItems: (OrderItem & { product: Product })[], cartId?: number) => void;
  updateQuantity: (cartItemId: number, quantity: number) => void;
  removeItem: (cartItemId: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  // Multiple carts operations
  createNewCart: (name: string) => void;
  switchCart: (cartId: number) => void;
  getActiveCart: () => Cart | undefined;
  getAllCarts: () => Cart[];
}

const CartContext = createContext<CartContextType | null>(null);

interface CreateCartResponse {
  id: number;
  name: string;
  userId: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeCartId, setActiveCartId] = useState<number | null>(null);
  
  // Get all user carts
  const {
    data: carts = [],
    isLoading: cartsLoading,
    error: cartsError,
  } = useQuery<Cart[], Error>({
    queryKey: ["/api/carts"],
    enabled: !!user
  });
  
  // Set active cart when carts change
  const setInitialActiveCart = useCallback(() => {
    if (!activeCartId && carts.length > 0) {
      const defaultCart = carts.find(cart => cart.isDefault);
      if (defaultCart) {
        setActiveCartId(defaultCart.id);
      } else if (carts[0]) {
        setActiveCartId(carts[0].id);
      }
    }
  }, [carts, activeCartId]);
  
  // Call when carts change
  if (carts.length > 0 && !activeCartId) {
    setInitialActiveCart();
  }
  
  // Get cart items for the active cart
  const {
    data: cartItems = [],
    isLoading: itemsLoading,
    error: itemsError,
  } = useQuery<CartItemWithProduct[], Error>({
    queryKey: ["/api/cart", activeCartId],
    queryFn: async () => {
      if (!activeCartId) return [];
      // Use the query parameter to specify which cart's items to get
      const res = await fetch(`/api/cart?cartId=${activeCartId}`);
      if (!res.ok) throw new Error("Failed to fetch cart items");
      return res.json();
    },
    enabled: !!user && !!activeCartId,
  });
  
  // Create a new cart
  const createCartMutation = useMutation<CreateCartResponse, Error, string>({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/carts", { 
        name,
        isDefault: carts.length === 0 // Make default if first cart
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/carts"] });
      toast({
        title: "Cart created",
        description: `New cart "${data.name}" has been created`,
      });
      // Switch to the new cart
      setActiveCartId(data.id);
    },
    onError: () => {
      toast({
        title: "Failed to create cart",
        description: "There was an error creating the new cart",
        variant: "destructive",
      });
    },
  });
  
  // Set a cart as default
  const setDefaultCartMutation = useMutation<CreateCartResponse, Error, number>({
    mutationFn: async (cartId: number) => {
      const res = await apiRequest("POST", `/api/carts/${cartId}/default`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/carts"] });
      toast({
        title: "Default cart updated",
        description: `Cart "${data.name}" is now your default cart`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to update default cart",
        description: "There was an error updating your default cart",
        variant: "destructive",
      });
    },
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity, cartId }: { productId: number; quantity: number; cartId?: number }) => {
      // Use the specified cart ID or fall back to the active cart
      const targetCartId = cartId || activeCartId;
      
      // Send the cart ID to the server so it knows which cart to add to
      return apiRequest("POST", "/api/cart", { 
        productId, 
        quantity,
        cartId: targetCartId 
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific cart's items that was modified
      const targetCartId = variables.cartId || activeCartId;
      if (targetCartId) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart", targetCartId] });
      }
      
      // Always update the carts list since a cart might have been created
      queryClient.invalidateQueries({ queryKey: ["/api/carts"] });
      
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add item",
        description: "There was an error adding the item to your cart",
        variant: "destructive",
      });
    },
  });
  
  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      // Invalidate the currently active cart
      if (activeCartId) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart", activeCartId] });
      }
    },
    onError: () => {
      toast({
        title: "Failed to update quantity",
        description: "There was an error updating the quantity",
        variant: "destructive",
      });
    },
  });
  
  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      // Invalidate the currently active cart
      if (activeCartId) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart", activeCartId] });
      }
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove item",
        description: "There was an error removing the item from your cart",
        variant: "destructive",
      });
    },
  });
  
  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      // Invalidate the currently active cart
      if (activeCartId) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart", activeCartId] });
      }
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: () => {
      toast({
        title: "Failed to clear cart",
        description: "There was an error clearing your cart",
        variant: "destructive",
      });
    },
  });
  
  // Helper functions
  const addToCart = (product: Product, quantity: number = 1, cartId?: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    
    // If we're adding to a specific cart other than the active one,
    // we need to specify it
    addToCartMutation.mutate({ 
      productId: product.id, 
      quantity,
      cartId: cartId || activeCartId || undefined
    });
  };
  
  const updateQuantity = (cartItemId: number, quantity: number) => {
    updateQuantityMutation.mutate({ id: cartItemId, quantity });
  };
  
  const removeItem = (cartItemId: number) => {
    removeItemMutation.mutate(cartItemId);
  };
  
  const clearCart = () => {
    clearCartMutation.mutate();
  };
  
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };
  
  const getCartCount = () => {
    return cartItems.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  };
  
  // Multiple carts functions
  const createNewCart = (name: string) => {
    createCartMutation.mutate(name);
  };
  
  const switchCart = (cartId: number) => {
    // Set this cart as active
    setActiveCartId(cartId);
    
    // Set this cart as default (this affects /api/cart endpoint behavior)
    setDefaultCartMutation.mutate(cartId);
    
    // After switching, refresh cart items for the new active cart
    // This will show the items in the newly selected cart
    queryClient.invalidateQueries({ queryKey: ["/api/cart", cartId] });
  };
  
  const getActiveCart = () => {
    return carts.find(cart => cart.id === activeCartId);
  };
  
  const getAllCarts = () => {
    return carts;
  };
  
  // Add all items from an order to cart
  const addOrderItemsToCart = (orderItems: (OrderItem & { product: Product })[], cartId?: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    
    // Use the specified cart ID or active cart
    const targetCartId = cartId || activeCartId || undefined;
    
    if (!targetCartId && carts.length === 0) {
      // Create a new cart first since none exists
      createCartMutation.mutate("My Cart", {
        onSuccess: (newCart) => {
          // Then add each item from the order to this new cart
          orderItems.forEach(item => {
            if (item.product) {
              addToCartMutation.mutate({
                productId: item.product.id,
                quantity: item.quantity,
                cartId: newCart.id
              });
            }
          });
        }
      });
    } else {
      // Add each item from the order to the existing cart
      orderItems.forEach(item => {
        if (item.product) {
          addToCartMutation.mutate({
            productId: item.product.id,
            quantity: item.quantity,
            cartId: targetCartId || undefined
          });
        }
      });
    }
    
    toast({
      title: "Items added to cart",
      description: "All items from your previous order have been added to your cart",
    });
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        carts,
        activeCartId,
        isLoading: itemsLoading || cartsLoading,
        error: itemsError || cartsError,
        addToCart,
        addOrderItemsToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getCartTotal,
        getCartCount,
        createNewCart,
        switchCart,
        getActiveCart,
        getAllCarts
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
