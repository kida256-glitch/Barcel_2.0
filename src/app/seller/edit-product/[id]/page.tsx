'use client';

import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { getProductById, updateProduct } from '@/lib/store';
import { useWallet } from '@/hooks/use-wallet';
import { useEffect, useState } from 'react';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  images: z.array(z.string()).min(1, 'At least one image is required.'),
  priceOptions: z.array(z.object({
    price: z.coerce.number().positive('Price must be a positive number.'),
  })).min(1, 'At least one price tier is required.'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { wallet } = useWallet();
  const [imageFiles, setImageFiles] = useState<{ file: File; preview: string }[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      images: [''],
      priceOptions: [{ price: 0 }],
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const { fields: priceFields, append: appendPrice, remove: removePrice } = useFieldArray({
    control: form.control,
    name: 'priceOptions',
  });

  useEffect(() => {
    if (!productId) return;

    const product = getProductById(productId);
    if (!product) {
      toast({
        title: 'Product Not Found',
        description: 'The product you are trying to edit does not exist.',
        variant: 'destructive',
      });
      router.push('/seller');
      return;
    }

    // Check if user owns this product
    if (wallet?.address && product.sellerId !== wallet.address) {
      toast({
        title: 'Unauthorized',
        description: 'You can only edit your own products.',
        variant: 'destructive',
      });
      router.push('/seller');
      return;
    }

    // Populate form with existing product data
    setExistingImages(product.images);
    form.reset({
      name: product.name,
      description: product.description,
      images: product.images,
      priceOptions: product.priceOptions.map(price => ({ price })),
    });
    setIsLoading(false);
  }, [productId, wallet?.address, router, form]);

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

  const removeExistingImage = (index: number) => {
    const newImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newImages);
    form.setValue('images', newImages);
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!wallet?.address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to edit products.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Combine existing images and new uploaded images
      const allImages = [
        ...existingImages,
        ...imageFiles.map(img => img.preview)
      ];

      // Also include any URL images from the form
      const urlImages = data.images.filter(img => 
        img.startsWith('http') && !img.startsWith('data:image')
      );
      const finalImages = [...allImages, ...urlImages].filter((img, index, self) => 
        self.indexOf(img) === index // Remove duplicates
      );

      const updated = updateProduct(productId, {
        name: data.name,
        description: data.description,
        images: finalImages.length > 0 ? finalImages : data.images,
        priceOptions: data.priceOptions.map(p => p.price).sort((a, b) => b - a),
      });

      if (updated) {
        toast({
          title: 'Product Updated Successfully!',
          description: `${data.name} has been updated.`,
        });
        router.push('/seller');
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/seller">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold font-headline text-primary">
            Edit Product
          </h1>
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
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Current Images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {existingImages.map((img, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={img}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeExistingImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* File Upload Section */}
                    <div className="border-2 border-dashed border-border rounded-lg p-6">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium">Upload new images from your device</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, GIF up to 10MB each
                          </p>
                        </div>
                        <label htmlFor="image-upload-edit">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              Choose Files
                            </span>
                          </Button>
                        </label>
                        <input
                          id="image-upload-edit"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>

                    {/* New Image Previews */}
                    {imageFiles.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">New Images:</p>
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
                  {form.formState.isSubmitting ? 'Updating Product...' : 'Update Product'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

