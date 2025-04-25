import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderWithItems } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Package, 
  Phone, 
  RefreshCw, 
  ShoppingBag, 
  TruckIcon, 
  User2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TrackOrderPage() {
  const { id } = useParams();
  const orderId = id ? parseInt(id) : 0;
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch the specific order
  const { data: order, isLoading, error, refetch } = useQuery<OrderWithItems>({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("Failed to fetch order details");
      return res.json();
    },
    enabled: !!user && !!orderId,
  });
  
  // Handle unauthorized access
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
  
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-8">
          We couldn't find the order you're looking for. Please check the order ID and try again.
        </p>
        <Button onClick={() => navigate("/my-orders")}>
          Back to My Orders
        </Button>
      </div>
    );
  }
  
  // Helper function to get timeline based on order status
  const getOrderTimeline = (status: string) => {
    const statuses = ["pending", "processing", "shipped", "delivered"];
    const statusIndex = statuses.indexOf(status || "pending");
    
    return statuses.map((step, index) => {
      let state: "complete" | "current" | "upcoming" = "upcoming";
      
      if (index < statusIndex) {
        state = "complete";
      } else if (index === statusIndex) {
        state = "current";
      }
      
      return { status: step, state };
    });
  };
  
  const orderTimeline = getOrderTimeline(order.status);
  
  // Get delivery estimate based on status
  const getDeliveryEstimate = () => {
    const orderDate = new Date(order.createdAt);
    
    switch(order.status) {
      case "pending":
        // 3-5 days from order date
        const pendingMin = new Date(orderDate);
        pendingMin.setDate(orderDate.getDate() + 3);
        const pendingMax = new Date(orderDate);
        pendingMax.setDate(orderDate.getDate() + 5);
        return `${formatDate(pendingMin)} - ${formatDate(pendingMax)}`;
        
      case "processing":
        // 2-4 days from order date
        const processingMin = new Date(orderDate);
        processingMin.setDate(orderDate.getDate() + 2);
        const processingMax = new Date(orderDate);
        processingMax.setDate(orderDate.getDate() + 4);
        return `${formatDate(processingMin)} - ${formatDate(processingMax)}`;
        
      case "shipped":
        // 1-2 days from order date
        const shippedMin = new Date(orderDate);
        shippedMin.setDate(orderDate.getDate() + 1);
        const shippedMax = new Date(orderDate);
        shippedMax.setDate(orderDate.getDate() + 2);
        return `${formatDate(shippedMin)} - ${formatDate(shippedMax)}`;
        
      case "delivered":
        return "Delivered on " + formatDate(order.updatedAt);
        
      default:
        return "Calculating...";
    }
  };
  
  // Component to render the order status timeline
  const OrderStatusTimeline = () => {
    return (
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 border-l-2 border-gray-200"></div>
        
        <div className="space-y-6 relative">
          {orderTimeline.map((step, index) => {
            const isComplete = step.state === "complete";
            const isCurrent = step.state === "current";
            
            let icon;
            switch(step.status) {
              case "pending":
                icon = <RefreshCw className={`h-5 w-5 ${isComplete || isCurrent ? "text-primary" : "text-gray-400"}`} />;
                break;
              case "processing":
                icon = <Package className={`h-5 w-5 ${isComplete || isCurrent ? "text-primary" : "text-gray-400"}`} />;
                break;
              case "shipped":
                icon = <TruckIcon className={`h-5 w-5 ${isComplete || isCurrent ? "text-primary" : "text-gray-400"}`} />;
                break;
              case "delivered":
                icon = <CheckCircle2 className={`h-5 w-5 ${isComplete || isCurrent ? "text-primary" : "text-gray-400"}`} />;
                break;
            }
            
            return (
              <div key={step.status} className="flex items-start ml-0">
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full -ml-4 mr-4 border-2 z-10 ${
                  isComplete ? "bg-primary border-primary" : 
                  isCurrent ? "bg-white border-primary" : 
                  "bg-white border-gray-300"
                }`}>
                  {icon}
                </div>
                
                <div className="flex-grow pt-1">
                  <h4 className={`font-medium capitalize ${
                    isComplete || isCurrent ? "text-black" : "text-gray-500"
                  }`}>
                    {step.status}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {isComplete ? "Completed" : 
                     isCurrent ? "In progress" : 
                     "Pending"}
                  </p>
                  {isCurrent && step.status === "shipped" && order.trackingNumber && (
                    <p className="text-xs mt-1">
                      Tracking: <span className="font-mono">{order.trackingNumber}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/my-orders")} 
          className="mb-4"
        >
          &larr; Back to My Orders
        </Button>
        <h1 className="text-2xl font-bold">Track Order #{orderId}</h1>
        <p className="text-gray-500">Order placed on {order.createdAt ? formatDate(order.createdAt) : 'N/A'}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current status: <Badge className="capitalize ml-1">{order.status}</Badge></CardDescription>
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline />
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                  Estimated Delivery
                </h3>
                <p className="mt-1 font-medium">{getDeliveryEstimate()}</p>
                
                {order.trackingNumber && (
                  <div className="mt-4">
                    <h3 className="font-medium">Tracking Number</h3>
                    <p className="mt-1 font-mono text-sm">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-gray-500" />
                    Shipping Address
                  </h3>
                  <p className="mt-1 text-sm whitespace-pre-line">{order.shippingAddress}</p>
                </div>
                
                <div>
                  <h3 className="font-medium flex items-center">
                    <User2 className="mr-2 h-5 w-5 text-gray-500" />
                    Customer Details
                  </h3>
                  <p className="mt-1 text-sm">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  
                  {order.contactPhone && (
                    <div className="flex items-center mt-2 text-sm">
                      <Phone className="mr-1 h-4 w-4 text-gray-500" />
                      {order.contactPhone}
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="font-medium mb-4">Order Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items && order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.product && (
                              <>
                                <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                  <img 
                                    src={item.product.mainImage} 
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{item.product.name}</p>
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
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-end mt-4">
                  <div className="w-full max-w-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(order.total * 0.9)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>{formatCurrency(order.total * 0.1)}</span>
                    </div>
                    {order.deliveryMethod === 'shipping' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span>{formatCurrency(5.99)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-1 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Delivery Method</h3>
                  <p className="capitalize">{order.deliveryMethod}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                  <p>{order.paymentMethod}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
                  <Badge className="capitalize mt-1">{order.status}</Badge>
                </div>
                
                {order.status === "delivered" ? (
                  <div className="flex items-center p-3 bg-green-50 rounded-md mt-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm text-green-700">
                      Your order has been delivered successfully on {order.updatedAt ? formatDate(order.updatedAt) : 'N/A'}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center p-3 bg-blue-50 rounded-md mt-4">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                    <p className="text-sm text-blue-700">
                      {order.status === "shipped" 
                        ? "Your order is on the way! Expected delivery by " + getDeliveryEstimate()
                        : order.status === "processing"
                        ? "Your order is being processed and will be shipped soon."
                        : "Your order has been received and will be processed shortly."}
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-4"
                  onClick={() => {
                    refetch();
                    toast({
                      title: "Order status updated",
                      description: "The latest order information has been loaded",
                    });
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
                
                {order.status === "shipped" && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Have questions about your delivery?</h3>
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}