import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useLocation, useRoute } from "wouter";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderItem, OrderWithItems } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Package, RefreshCw, ShoppingBag, Truck } from "lucide-react";

// Order status badge helper
function OrderStatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let icon = null;
  
  switch(status) {
    case "pending":
      variant = "outline";
      icon = <RefreshCw className="mr-1 h-3 w-3" />;
      break;
    case "processing":
      variant = "secondary";
      icon = <Package className="mr-1 h-3 w-3" />;
      break;
    case "shipped":
      variant = "default";
      icon = <Truck className="mr-1 h-3 w-3" />;
      break;
    case "delivered":
      variant = "default";
      icon = <ShoppingBag className="mr-1 h-3 w-3" />;
      break;
    case "canceled":
      variant = "destructive";
      break;
  }
  
  return (
    <Badge variant={variant} className="capitalize">
      {icon}
      {status}
    </Badge>
  );
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { addOrderItemsToCart } = useCart();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch user orders
  const { 
    data: orders = [] as OrderWithItems[], 
    isLoading,
    error,
  } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });
  
  // Filter orders based on active tab
  const filteredOrders: OrderWithItems[] = activeTab === "all" 
    ? orders 
    : orders.filter((order: OrderWithItems) => order.status === activeTab);
  
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Orders</h1>
        <p className="text-gray-600 mb-8">
          We encountered an error while loading your orders. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
          <p className="text-gray-600 mb-6">
            {activeTab === "all" 
              ? "You haven't placed any orders yet." 
              : `You don't have any ${activeTab} orders.`}
          </p>
          <Button onClick={() => navigate("/products")}>
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {filteredOrders.map((order) => (
              <AccordionItem 
                key={order.id} 
                value={`order-${order.id}`}
                className="border rounded-lg p-2 mb-4"
              >
                <AccordionTrigger className="px-4 py-2 hover:no-underline">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full text-left gap-2">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">{formatCurrency(order.total)}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  {/* Order Items Table */}
                  <Table>
                    <TableCaption>Order details and items</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items && order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {item.product && (
                                <>
                                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                    <img 
                                      src={item.product.mainImage} 
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p>{item.product.name}</p>
                                    {item.isRental && item.rentalStartDate && item.rentalEndDate && (
                                      <p className="text-xs text-purple-600">
                                        Rental: {formatDate(item.rentalStartDate)} - {formatDate(item.rentalEndDate)}
                                      </p>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <Separator className="my-4" />
                  
                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Shipping Information</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{order.shippingAddress}</p>
                      
                      {order.contactPhone && (
                        <p className="text-sm mt-2">
                          <span className="text-gray-500">Contact:</span> {order.contactPhone}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Order Summary</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span>{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Method:</span>
                          <span className="capitalize">{order.deliveryMethod}</span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tracking Number:</span>
                            <span>{order.trackingNumber}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6 gap-2">
                    {(order.items && order.items.length > 0) && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            addOrderItemsToCart(order.items);
                            navigate('/cart');
                          }}
                        >
                          Add All to Cart
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/track-order/${order.id}`)}
                        >
                          Track Order
                        </Button>
                        
                        {order.items.length === 1 ? (
                          // For single item orders, direct link to that product
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/product/${order.items[0].productId}`)}
                          >
                            View Product
                          </Button>
                        ) : (
                          // For multi-item orders, use a proper dropdown menu
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Products
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Select a product</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {order.items.map((item) => (
                                item.product && (
                                  <DropdownMenuItem 
                                    key={item.id} 
                                    onClick={() => navigate(`/product/${item.productId}`)}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                      <img 
                                        src={item.product.mainImage} 
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="truncate">{item.product.name}</span>
                                  </DropdownMenuItem>
                                )
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}