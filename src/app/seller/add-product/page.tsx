'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm, useFieldArray, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/header';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, ArrowLeft, Upload, X, Sparkles, Package } from 'lucide-react';
import Link from 'next/link';
import { addProduct } from '@/lib/store';
import { useWallet } from '@/hooks/use-wallet';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  images: z.array(z.string()).min(1, 'At least one image is required.'),
  priceOptions: z.array(z.object({
    price: z.coerce.number().positive('Price must be a positive number.'),
  })).min(1, 'At least one price tier is required.'),
});

type ProductFormValues = z.infer<typeof productSchema>;

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallet } = useWallet();
  const [imageFiles, setImageFiles] = useState<{ file: File; preview: string }[]>([]);
  const [productType, setProductType] = useState<'premium' | 'other'>('other');
  
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'premium' || type === 'other') {
      setProductType(type);
    }
  }, [searchParams]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      images: [''],
      priceOptions: [{ price: 0 }],
    },
  });

  // @ts-ignore - TypeScript inference issue with multiple useFieldArray calls
  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    // @ts-ignore
    name: 'images',
  });

  const { fields: priceFields, append: appendPrice, remove: removePrice } = useFieldArray({
    control: form.control,
    name: 'priceOptions',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload image files only.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageFiles((prev) => [...prev, { file, preview: base64String }]);
        const currentImages = form.getValues('images');
        form.setValue('images', [...currentImages, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    const currentImages = form.getValues('images');
    form.setValue('images', currentImages.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!wallet?.address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to add products.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Use wallet address as seller ID (in production, you'd have a proper seller ID)
      const sellerId = wallet.address;
      
      // Use uploaded images or URL images
      const images = imageFiles.length > 0 
        ? imageFiles.map(img => img.preview)
        : data.images.filter(img => img.trim() !== '');

      const newProduct = addProduct({
        name: data.name,
        description: data.description,
        images: images,
        sellerId: sellerId,
        priceOptions: data.priceOptions.map(p => p.price).sort((a, b) => b - a), // Sort descending
        reviews: [],
        productType: productType,
      });

      toast({
        title: 'Product Added Successfully!',
        description: `${data.name} has been listed for sale and is now visible to buyers.`,
      });
      router.push('/seller');
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center min-w-0 flex-1">
            <Button variant="outline" size="icon" className="mr-2 sm:mr-4 flex-shrink-0" asChild>
              <Link href="/seller">
                <ArrowLeft />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline text-primary break-words">
                Add New Product
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {productType === 'premium' ? (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Premium Product
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Package className="h-3 w-3 mr-1" />
                    Other Product
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant={productType === 'premium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setProductType('premium');
                router.replace('/seller/add-product?type=premium');
              }}
              className={`${productType === 'premium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700' : ''} text-xs sm:text-sm whitespace-nowrap`}
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Premium
            </Button>
            <Button
              variant={productType === 'other' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setProductType('other');
                router.replace('/seller/add-product?type=other');
              }}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Other
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ChronoSphere X1" {...field} />
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
                      <FormLabel>Product Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your product in detail..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Product Images</FormLabel>
                  <div className="space-y-4 mt-2">
                    {/* File Upload Section */}
                    <div className="border-2 border-dashed border-border rounded-lg p-6">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium">Upload images from your device</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, GIF up to 10MB each
                          </p>
                        </div>
                        <label htmlFor="image-upload">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              Choose Files
                            </span>
                          </Button>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>

                    {/* Image Previews */}
                    {imageFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imageFiles.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImageFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* URL Input Section (Alternative) */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Or add image URLs:</p>
                      {imageFields.map((field, index) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`images.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Input placeholder="https://example.com/image.jpg" {...field} />
                                </FormControl>
                                {imageFields.length > 1 && (
                                  <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                      <Button type="button" variant="outline" onClick={() => {
                        // @ts-ignore - TypeScript inference issue
                        appendImage('');
                      }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Another URL
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                    <FormLabel>Price Tiers</FormLabel>
                    <div className="space-y-4 mt-2">
                        {priceFields.map((field, index) => (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={`priceOptions.${index}.price`}
                            render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                <FormControl>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-muted-foreground sm:text-sm">$</span>
                                        </div>
                                        <Input type="number" placeholder="Enter a price" className="pl-7" {...field} />
                                    </div>
                                </FormControl>
                                {priceFields.length > 1 && (
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removePrice(index)}>
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendPrice({ price: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Price Tier
                        </Button>
                    </div>
                </div>

                <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Adding Product...' : 'Add Product'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">Loading...</div>
        </main>
      </>
    }>
      <AddProductForm />
    </Suspense>
  );
}
