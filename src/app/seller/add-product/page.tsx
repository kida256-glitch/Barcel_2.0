'use client';

import { useRouter } from 'next/navigation';
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
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  images: z.array(z.string().url('Please enter a valid image URL.')).min(1, 'At least one image is required.'),
  priceOptions: z.array(z.object({
    price: z.coerce.number().positive('Price must be a positive number.'),
  })).min(1, 'At least one price tier is required.'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const router = useRouter();
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

  const onSubmit = (data: ProductFormValues) => {
    console.log('New Product Data:', data);
    // In a real app, you would send this data to your backend/database.
    // For now, we'll just show a success message and redirect.
    toast({
      title: 'Product Added Successfully!',
      description: `${data.name} has been listed for sale.`,
    });
    router.push('/seller');
  };

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
            Add New Product
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
                    {imageFields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`images.${index}`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input placeholder="https://picsum.photos/seed/..." {...field} />
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
                    <Button type="button" variant="outline" onClick={() => appendImage('')}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Another Image
                    </Button>
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
