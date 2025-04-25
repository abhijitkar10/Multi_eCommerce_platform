import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Lock, CreditCard, CheckCircle2, Loader2, ShoppingCart } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";

const shippingSchema = z.object({
  fullName: z.string().min(3, { message: "Full name is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  zipCode: z.string().min(5, { message: "Valid ZIP code required" }),
  country: z.string().min(2, { message: "Country is required" }),
  phone: z.string().min(10, { message: "Valid phone number required" }),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(16, { message: "Valid card number required" }).max(19),
  cardName: z.string().min(3, { message: "Name on card is required" }),
  expiryDate: z.string().min(5, { message: "Valid expiration date required (MM/YY)" })
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, { message: "Format must be MM/YY" }),
  cvv: z.string().min(3, { message: "Valid CVV required" }).max(4),
});

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { 
    cartItems, 
    getCartTotal, 
    clearCart, 
    carts, 
    activeCartId, 
    switchCart, 
    getActiveCart 
  } = useCart();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingInfo, setShippingInfo] = useState<z.infer<typeof shippingSchema> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'paypal'>('credit');
  const activeCart = getActiveCart();
  
  const shippingForm = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: user?.name || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phone: "",
    },
  });
  
  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      cardName: user?.name || "",
      expiryDate: "",
      cvv: "",
    },
  });
  
  const orderMutation = useMutation({
    mutationFn: async (orderData: {
      total: number,
      shippingAddress: string,
      paymentMethod: string,
      orderItems: {
        productId: number,
        quantity: number,
        price: number,
        sellerId: number
      }[]
    }) => {
      const res = await apiRequest("POST", "/api/orders", {
        orderData: {
          total: orderData.total,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          deliveryMethod: "pickup",
          contactPhone: shippingInfo?.phone || "",
        },
        orderItems: orderData.orderItems,
      });
      
      const responseData = await res.json();
      return responseData;
    },
    onSuccess: () => {
      clearCart();
      setCurrentStep('confirmation');
      
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
  
  const subtotal = getCartTotal();
  const shipping = 0;
  const tax = subtotal * 0.07;
  const total = subtotal + tax + shipping;
  
  const onShippingSubmit = (data: z.infer<typeof shippingSchema>) => {
    setShippingInfo(data);
    setCurrentStep('payment');
    window.scrollTo(0, 0);
  };
  
  const onPaymentSubmit = (data: z.infer<typeof paymentSchema>) => {
    if (!shippingInfo) return;
    
    const formattedAddress = `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`;
    
    orderMutation.mutate({
      total: total,
      shippingAddress: formattedAddress,
      paymentMethod: paymentMethod === 'credit' ? `Credit Card (${data.cardNumber.slice(-4)})` : 'PayPal',
      orderItems: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        sellerId: item.product.sellerId
      }))
    });
  };
  
  if (cartItems.length === 0 && currentStep !== ('confirmation' as CheckoutStep)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="mb-8">Add some products to your cart before proceeding to checkout.</p>
        <Button onClick={() => navigate('/cart')}>
          View Cart
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {currentStep !== ('confirmation' as CheckoutStep) && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
          
          <div className="flex items-center justify-center mb-8">
            <div className={`flex flex-col items-center ${currentStep === 'shipping' ? 'text-primary' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'shipping' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
                1
              </div>
              <span className="text-sm mt-1">Shipping</span>
            </div>
            
            <div className={`w-20 h-0.5 ${currentStep === 'shipping' ? 'bg-gray-300' : 'bg-primary'}`}></div>
            
            <div className={`flex flex-col items-center ${currentStep === 'payment' ? 'text-primary' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
                2
              </div>
              <span className="text-sm mt-1">Payment</span>
            </div>
            
            <div className={`w-20 h-0.5 ${currentStep === 'confirmation' as CheckoutStep ? 'bg-primary' : 'bg-gray-300'}`}></div>
            
            <div className={`flex flex-col items-center ${currentStep === 'confirmation' as CheckoutStep ? 'text-primary' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'confirmation' as CheckoutStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
                3
              </div>
              <span className="text-sm mt-1">Confirmation</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {currentStep === 'shipping' && (
          <>
            <div className="lg:w-2/3">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                  
                  <Form {...shippingForm}>
                    <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={shippingForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John Doe" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shippingForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="(123) 456-7890" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={shippingForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="1234 Main St" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={shippingForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Anytown" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shippingForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="CA" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={shippingForm.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="12345" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={shippingForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="United States" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end mt-6">
                        <Button type="submit">Continue to Payment</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:w-1/3">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  
                  {carts.length > 1 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Select Cart to Checkout:</h3>
                      <Select value={activeCartId?.toString()} onValueChange={(value) => switchCart(parseInt(value))}>
                        <SelectTrigger className="w-full">
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
                    </div>
                  )}
                  
                  {activeCart && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Checking out from: {activeCart.name}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={item.product.mainImage} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-sm">{item.product.name}</h3>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium mt-1">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span>Free</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (7%)</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        
        {currentStep === 'payment' && (
          <>
            <div className="lg:w-2/3">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                  
                  <Tabs defaultValue="credit" onValueChange={(v) => setPaymentMethod(v as 'credit' | 'paypal')}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="credit">Credit Card</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="credit">
                      <Form {...paymentForm}>
                        <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
                          <FormField
                            control={paymentForm.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card Number</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input {...field} placeholder="4242 4242 4242 4242" />
                                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={paymentForm.control}
                            name="cardName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name on Card</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="John Doe" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={paymentForm.control}
                              name="expiryDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiry Date (MM/YY)</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="MM/YY" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={paymentForm.control}
                              name="cvv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVV</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="123" type="password" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                            <Lock size={16} />
                            <span>Your payment information is secure and encrypted</span>
                          </div>
                          
                          <div className="flex justify-between mt-6">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep('shipping')}>
                              Back to Shipping
                            </Button>
                            <Button type="submit" disabled={orderMutation.isPending}>
                              {orderMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Place Order'
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </TabsContent>
                    
                    <TabsContent value="paypal">
                      <div className="text-center py-10">
                        <Button className="w-full max-w-md">
                          Pay with PayPal
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:w-1/3">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      <h3 className="font-medium mb-2">Shipping Address</h3>
                      {shippingInfo && (
                        <div className="text-gray-600">
                          <p>{shippingInfo.fullName}</p>
                          <p>{shippingInfo.address}</p>
                          <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                          <p>{shippingInfo.country}</p>
                          <p>Phone: {shippingInfo.phone}</p>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span>Free</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (7%)</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        
        {currentStep === 'confirmation' && (
          <div className="w-full max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your purchase. Your order has been received and is being processed.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md text-left mb-6">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Order Number:</span>
                    <span>ORD-{Math.floor(100000 + Math.random() * 900000)}</span>
                    <span className="text-gray-600">Order Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                    <span className="text-gray-600">Order Total:</span>
                    <span>{formatCurrency(total)}</span>
                    <span className="text-gray-600">Payment Method:</span>
                    <span>{paymentMethod === 'credit' ? 'Credit Card' : 'PayPal'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" onClick={() => navigate('/products')}>
                    Continue Shopping
                  </Button>
                  <Button>Track Your Order</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
