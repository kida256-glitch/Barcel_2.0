import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Store } from 'lucide-react';
import Link from 'next/link';

export default function RoleSelectionPage() {
  return (
    <div className="flex flex-col items-center text-center p-8">
      <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">
        How will you start?
      </h1>
      <p className="text-lg text-muted-foreground mb-12 max-w-md">
        Choose your role to get started. You can always change this later.
      </p>
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
        <Link href="/" className="group">
          <Card className="h-full transform transition-transform duration-300 group-hover:scale-105 group-hover:border-primary">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <ShoppingCart className="h-16 w-16 text-accent" />
              </div>
              <CardTitle className="text-2xl text-center">I'm a Buyer</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Browse products, make offers, and find great deals.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
        <Link href="/seller" className="group">
          <Card className="h-full transform transition-transform duration-300 group-hover:scale-105 group-hover:border-primary">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <Store className="h-16 w-16 text-accent" />
                </div>
              <CardTitle className="text-2xl text-center">I'm a Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                List your products, receive offers, and make sales.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
