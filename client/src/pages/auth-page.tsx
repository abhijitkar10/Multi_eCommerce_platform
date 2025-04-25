import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, 
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Mail, Lock, User, ShoppingBag } from "lucide-react";
import axios from "axios";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

const registerSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  confirmPassword: z.string(),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("login");

  // OTP state variables for registration
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form initialization
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form initialization including phone field
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",  // Phone number is stored here
    },
  });

  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values, {
      onError: (error: any) => {
        toast({
          title: "Login Failed",
          description: error.message || "Unable to log in. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const onRegisterSubmit = (values: RegisterValues) => {
    // Ensure that OTP has been verified before proceeding
    if (!otpVerified) {
      toast({
        title: "OTP Verification Required",
        description: "Please verify your phone number before creating an account.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(values, {
      onError: (error: any) => {
        toast({
          title: "Registration Failed",
          description: error.message || "Unable to register. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  // Send OTP API call: retrieves the phone number from the form state
  const sendOTPHandler = async () => {
    const phoneNumber = registerForm.getValues("phone");
    if (!phoneNumber) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    setOtpLoading(true);
    try {
      await axios.post("/api/send-otp", { phoneNumber });
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "OTP has been sent to your phone.",
      });
    } catch (error: any) {
      toast({
        title: "OTP Sending Failed",
        description: error.response?.data?.error || "Unable to send OTP.",
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP API call: again uses the stored phone number
  const verifyOTPHandler = async () => {
    const phoneNumber = registerForm.getValues("phone");
    if (!otp || !phoneNumber) {
      toast({
        title: "Invalid Input",
        description: "Please enter the OTP sent to your phone.",
        variant: "destructive",
      });
      return;
    }
    setOtpLoading(true);
    try {
      const response = await axios.post("/api/verify-otp", { phoneNumber, code: otp });
      if (response.data.message === "OTP verified successfully") {
        setOtpVerified(true);
        toast({
          title: "Verified",
          description: "Phone number verified successfully.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "OTP verification failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.response?.data?.error || "Error verifying OTP.",
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-lg p-8 flex flex-col justify-center order-2 lg:order-1">
          <div className="mb-8">
            <ShoppingBag className="h-16 w-16 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Welcome to ShopEase</h1>
            <p className="text-indigo-100">
              Your one-stop destination for all your shopping needs. Get access to exclusive deals, 
              track your orders, and enjoy a seamless shopping experience.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-indigo-500 bg-opacity-30 p-2 rounded mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Wide Product Selection</h3>
                <p className="text-sm text-indigo-200">Browse thousands of products across various categories</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-indigo-500 bg-opacity-30 p-2 rounded mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Fast & Free Shipping</h3>
                <p className="text-sm text-indigo-200">Get your orders delivered quickly and free of charge</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-indigo-500 bg-opacity-30 p-2 rounded mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Secure Payments</h3>
                <p className="text-sm text-indigo-200">Your transactions are always safe and secure</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth forms */}
        <div className="order-1 lg:order-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Account Access</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one to start shopping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>
                
                {/* Login Tab */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                  placeholder="johndoe" 
                                  className="pl-10"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                  placeholder="••••••••" 
                                  type="password" 
                                  className="pl-10"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <p>
                      Don't have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0" 
                        onClick={() => setActiveTab("register")}
                      >
                        Create one
                      </Button>
                    </p>
                  </div>
                </TabsContent>
                
                {/* Register Tab */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                  placeholder="John Doe" 
                                  className="pl-10"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="johndoe" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input 
                                    placeholder="john@example.com" 
                                    className="pl-10"
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter your phone number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* OTP Section */}
                      <div className="flex flex-col gap-2">
                        <Button 
                          type="button" 
                          onClick={sendOTPHandler}
                          disabled={otpLoading || otpSent || otpVerified}
                          className="w-full"
                        >
                          {otpLoading ? "Sending OTP..." : "Send OTP"}
                        </Button>
                        
                        {otpSent && !otpVerified && (
                          <div className="flex flex-col gap-2">
                            <Input 
                              type="text"
                              placeholder="Enter OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                            />
                            <Button 
                              type="button" 
                              onClick={verifyOTPHandler}
                              disabled={otpLoading}
                              className="w-full"
                            >
                              {otpLoading ? "Verifying..." : "Verify OTP"}
                            </Button>
                          </div>
                        )}
                        
                        {otpVerified && (
                          <p className="text-green-600 text-sm">Phone number verified!</p>
                        )}
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                  placeholder="••••••••" 
                                  type="password" 
                                  className="pl-10"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Must be at least 6 characters long
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                  placeholder="••••••••" 
                                  type="password" 
                                  className="pl-10"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <p>
                      Already have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0" 
                        onClick={() => setActiveTab("login")}
                      >
                        Sign in
                      </Button>
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col">
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our{" "}
                <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
