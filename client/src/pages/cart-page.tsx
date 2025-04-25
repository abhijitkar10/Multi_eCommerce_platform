import { useState, useRef } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MinusCircle, 
  PlusCircle, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  PlusSquare,
  ShoppingCart
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { user } = useAuth();
  const { 
    cartItems, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getCartTotal, 
    getCartCount,
    carts,
    activeCartId,
    switchCart,
    createNewCart,
    getAllCarts,
    getActiveCart
  } = useCart();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [createCartDialogOpen, setCreateCartDialogOpen] = useState(false);
  const [newCartName, setNewCartName] = useState("");
  const activeCart = getActiveCart();
  
  const handleQuantityChange = (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(cartItemId, newQuantity);
  };
  
  const handleRemoveItem = (cartItemId: number) => {
    removeItem(cartItemId);
  };
  
  const handleClearCart = () => {
    clearCart();
  };
  
  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would validate the promo code with the backend
    toast({
      title: "Invalid promo code",
      description: "The promo code you entered is not valid or has expired",
      variant: "destructive",
    });
    setPromoCode("");
  };
  
  const handleCreateCart = () => {
    if (!newCartName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your cart",
        variant: "destructive",
      });
      return;
    }
    
    createNewCart(newCartName);
    setNewCartName("");
    setCreateCartDialogOpen(false);
  };
  
  const handleSwitchCart = (cartId: string) => {
    switchCart(parseInt(cartId));
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your Shopping Cart</h1>
        <p className="mb-8">Please sign in to view your cart and continue shopping</p>
        <Button asChild>
          <Link href="/auth">
            <a>Sign In</a>
          </Link>
        </Button>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Shopping Cart (0 items)</h1>
          
          <div className="flex items-center gap-2">
            <Select value={activeCartId?.toString()} onValueChange={handleSwitchCart}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a cart" />
              </SelectTrigger>
              <SelectContent>
                {carts.map(cart => (
                  <SelectItem key={cart.id} value={cart.id.toString()}>
                    {cart.name} {cart.isDefault && '(Default)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={createCartDialogOpen} onOpenChange={setCreateCartDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <PlusSquare className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Cart</DialogTitle>
                  <DialogDescription>
                    Create a new cart to organize your shopping items separately.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    value={newCartName}
                    onChange={(e) => setNewCartName(e.target.value)}
                    placeholder="Cart name"
                    className="w-full"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateCartDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCart}>
                    Create Cart
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {activeCart && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Current Cart: {activeCart.name} {activeCart.isDefault && '(Default)'}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        )}
        
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-bold mb-4">This Cart is Empty</h2>
          <p className="mb-8">Add some products to your cart and start shopping!</p>
          <Button asChild>
            <Link href="/products">
              <a>Continue Shopping</a>
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Shopping Cart ({getCartCount()} items)</h1>
        
        <div className="flex items-center gap-2">
          <Select value={activeCartId?.toString()} onValueChange={handleSwitchCart}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a cart" />
            </SelectTrigger>
            <SelectContent>
              {carts.map(cart => (
                <SelectItem key={cart.id} value={cart.id.toString()}>
                  {cart.name} {cart.isDefault && '(Default)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={createCartDialogOpen} onOpenChange={setCreateCartDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <PlusSquare className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Cart</DialogTitle>
                <DialogDescription>
                  Create a new cart to organize your shopping items separately.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={newCartName}
                  onChange={(e) => setNewCartName(e.target.value)}
                  placeholder="Cart name"
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateCartDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCart}>
                  Create Cart
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {activeCart && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Current Cart: {activeCart.name} {activeCart.isDefault && '(Default)'}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <Card>
            <CardContent className="p-0">
              <div className="hidden md:flex items-center p-4 bg-gray-50 font-medium text-sm text-gray-600">
                <div className="w-16">Image</div>
                <div className="flex-1 ml-4">Product</div>
                <div className="w-28 text-center">Price</div>
                <div className="w-32 text-center">Quantity</div>
                <div className="w-28 text-center">Total</div>
                <div className="w-10"></div>
              </div>
              
              {cartItems.map((item) => (
                <div key={item.id} className="border-t border-gray-200 first:border-t-0">
                  <div className="flex flex-col md:flex-row md:items-center p-4">
                    <div className="w-full md:w-16 mb-4 md:mb-0">
                      <img 
                        src={item.product.mainImage} 
                        alt={item.product.name}
                        className="h-20 w-20 md:h-16 md:w-16 object-cover rounded"
                      />
                    </div>
                    
                    <div className="md:flex-1 md:ml-4">
                      <Link href={`/product/${item.product.id}`}>
                        <a className="font-medium text-gray-900 hover:text-primary">
                          {item.product.name}
                        </a>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        Category: {item.product.category}
                      </p>
                    </div>
                    
                    <div className="w-full md:w-28 mt-4 md:mt-0 md:text-center">
                      <div className="md:hidden text-sm font-medium text-gray-600 mb-1">Price:</div>
                      <div>{formatCurrency(item.product.price)}</div>
                    </div>
                    
                    <div className="w-full md:w-32 mt-4 md:mt-0 md:text-center">
                      <div className="md:hidden text-sm font-medium text-gray-600 mb-1">Quantity:</div>
                      <div className="flex items-center justify-start md:justify-center">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <MinusCircle size={16} />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-14 mx-2 text-center h-8"
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <PlusCircle size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-28 mt-4 md:mt-0 md:text-center font-medium">
                      <div className="md:hidden text-sm font-medium text-gray-600 mb-1">Total:</div>
                      <div>{formatCurrency(item.product.price * item.quantity)}</div>
                    </div>
                    
                    <div className="w-full md:w-10 mt-4 md:mt-0 text-right md:text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-500 hover:text-red-500"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <Button variant="outline" onClick={handleClearCart}>
                  Clear Cart
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/products">
                    <a>Continue Shopping</a>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(getCartTotal())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(getCartTotal() * 0.07)}</span>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(getCartTotal() * 1.07)}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <form onSubmit={handleApplyPromoCode} className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline">Apply</Button>
                </form>
              </div>
              
              <Button asChild className="w-full mt-6">
                <Link href="/checkout">
                  <a className="flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </a>
                </Link>
              </Button>
              
              <div className="mt-6 text-xs text-gray-500 space-y-2">
                <p>
                  <span className="font-medium">Secure Checkout:</span> All transactions are secure and encrypted.
                </p>
                <p>
                  <span className="font-medium">Shipping Policy:</span> Free standard shipping on all orders.
                </p>
                <p>
                  <span className="font-medium">Return Policy:</span> Easy returns within 30 days of purchase.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
