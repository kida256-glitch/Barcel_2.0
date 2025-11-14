import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSellerById, products } from '@/lib/data';
import { PlusCircle, List, Tag, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SellerDashboard() {
  const sellerId = 'seller-1'; // Mock seller
  const sellerProducts = products.filter(p => p.sellerId === sellerId);
  const seller = getSellerById(sellerId);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline text-primary">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your products and view your sales.</p>
          </div>
          <Button asChild>
            <Link href="/seller/add-product">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Product
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>My Products</CardTitle>
            <CardDescription>
              {sellerProducts.length > 0
                ? `You have ${sellerProducts.length} product(s) listed.`
                : "You haven't listed any products yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sellerProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {sellerProducts.map((product) => (
                  <Card key={product.id} className="flex flex-col md:flex-row items-start gap-4 p-4">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={150}
                      height={100}
                      className="rounded-md object-cover aspect-[3/2]"
                      data-ai-hint="product image"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg font-headline">{product.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <List className="h-4 w-4" />
                          <span>{product.reviews.length} reviews</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                           <span>{product.priceOptions.length} price tiers</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 self-start md:self-center">
                        <Button variant="outline" size="sm"><Edit className="mr-2 h-3 w-3" /> Edit</Button>
                        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-3 w-3" /> Delete</Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Ready to sell? Add your first product to get started.</p>
                    <Button asChild>
                      <Link href="/seller/add-product">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        List a Product
                      </Link>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
