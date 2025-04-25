import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload } from 'lucide-react';

// Define the form schema
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Price must be a valid number",
  }),
  category: z.string().min(1, { message: "Please select a category" }),
  condition: z.string().min(1, { message: "Please select a condition" }),
  availableForRent: z.boolean().default(false),
  rentalPrice: z.string().optional().refine(val => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
    message: "Rental price must be a valid number",
  }),
  rentalMinDays: z.string().optional().refine(val => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 1), {
    message: "Minimum rental days must be a valid number greater than 0",
  }),
  images: z.instanceof(FileList).optional().refine(files => !files || files.length > 0, {
    message: "At least one image is required",
  }),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function CreateProductPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Configure form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      condition: 'new',
      availableForRent: false,
      rentalPrice: '',
      rentalMinDays: '',
    },
  });
  
  const availableForRent = form.watch('availableForRent');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Clear previous previews
    setPreviewUrls([]);
    
    // Create new previews
    const newPreviewUrls: string[] = [];
    for (let i = 0; i < Math.min(files.length, 5); i++) {
      const file = files[i];
      newPreviewUrls.push(URL.createObjectURL(file));
    }
    
    setPreviewUrls(newPreviewUrls);
  };

  const createProduct = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/products', data, true);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/products'] });
      
      toast({
        title: 'Product created successfully',
        description: 'Your product has been listed on the marketplace',
        variant: 'default',
      });
      
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create product',
        description: error.message || 'There was an error creating your product. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to create a product',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    
    // Add basic product info
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('price', values.price);
    formData.append('category', values.category);
    formData.append('condition', values.condition);
    formData.append('availableForRent', String(values.availableForRent));
    
    // Add rental info if product is available for rent
    if (values.availableForRent) {
      if (values.rentalPrice) formData.append('rentalPrice', values.rentalPrice);
      if (values.rentalMinDays) formData.append('rentalMinDays', values.rentalMinDays);
      formData.append('rentalAvailable', 'true');
    }
    
    // Add images
    const imageFiles = values.images;
    if (imageFiles) {
      for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
        formData.append('images', imageFiles[i]);
      }
    }
    
    createProduct.mutate(formData);
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create a New Listing</CardTitle>
          <CardDescription>
            List your item for sale or rent in the student marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Textbook, Calculator, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your item in detail. Include any relevant information like brand, model, etc."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Be as detailed as possible to help others understand what you're selling.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                            <SelectItem value="Home & Kitchen">Home & Kitchen</SelectItem>
                            <SelectItem value="Beauty">Beauty</SelectItem>
                            <SelectItem value="Books">Books</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like-new">Like New</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="availableForRent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Available for Rent</FormLabel>
                        <FormDescription>
                          Allow other students to rent this item
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {availableForRent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name="rentalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rental Price ($ per day)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="rentalMinDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Rental Period (days)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium mb-1">Click to upload images</p>
                            <p className="text-xs text-muted-foreground mb-4">Upload up to 5 images (JPEG, PNG, GIF)</p>
                            <Input
                              id="images"
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                handleImageChange(e);
                                onChange(e.target.files);
                              }}
                              {...fieldProps}
                            />
                            <Label htmlFor="images" className="py-2 px-4 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
                              Select Files
                            </Label>
                          </div>
                          
                          {previewUrls.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                              {previewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                                  <img 
                                    src={url} 
                                    alt={`Product preview ${index}`} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Clear, well-lit photos will help your item sell faster.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : "Create Listing"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}