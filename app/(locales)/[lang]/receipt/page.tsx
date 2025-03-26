'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReceiptIcon, PrinterIcon, HomeIcon, ShoppingBagIcon, CheckCircle2 } from 'lucide-react';
import { getUserCart, Product, CartItem, clearUserCart } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

interface ReceiptPageProps {
  params: {
    lang: string;
  };
  dictionary: {
    receipt: {
      title: string;
      orderComplete: string;
      orderNumber: string;
      date: string;
      items: string;
      coins: string;
      total: string;
      print: string;
      backToHome: string;
      shop: string;
      thankYou: string;
      yourInfo: string;
    };
  };
}

export default function ReceiptPage({ params, dictionary }: ReceiptPageProps) {
  const { lang } = params;
  const { isLoaded, isSignedIn, user } = useUser();
  const [receipt, setReceipt] = useState<{
    orderNumber: string;
    date: string;
    items: CartItem[];
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const generateReceipt = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        setLoading(true);
        // Get cart items
        const items = await getUserCart(user.id);
        
        if (items.length === 0) {
          // If cart is empty, redirect to home
          router.push(`/${lang}`);
          return;
        }
        
        // Generate receipt data
        const receiptData = {
          orderNumber: `ORD-${Date.now().toString().substr(-6)}`,
          date: new Date().toISOString(),
          items,
          total: items.reduce((total, item) => total + (item.product?.coin_value || 0), 0)
        };
        
        setReceipt(receiptData);
        
        // Clear the cart
        await clearUserCart(user.id);
      } catch (error) {
        console.error('Error generating receipt:', error);
      } finally {
        setLoading(false);
      }
    };

    generateReceipt();
  }, [isLoaded, isSignedIn, user, lang, router]);

  const handlePrint = () => {
    window.print();
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full mb-4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push(`/${lang}/sign-in`);
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="receipt-card">
        <CardHeader className="text-center border-b pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <ReceiptIcon className="h-6 w-6" />
            {dictionary.receipt.title}
          </CardTitle>
          <p className="text-gray-500 mt-2">{dictionary.receipt.orderComplete}</p>
        </CardHeader>
        
        {loading ? (
          <CardContent className="py-6">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        ) : receipt ? (
          <CardContent className="py-6">
            <div className="flex justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">{dictionary.receipt.orderNumber}</p>
                <p className="font-medium">{receipt.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{dictionary.receipt.date}</p>
                <p className="font-medium">{formatDate(receipt.date)}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">{dictionary.receipt.yourInfo}</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{user?.fullName || user?.username}</p>
                {user?.publicMetadata?.company && (
                  <p className="text-gray-600">{user.publicMetadata.company as string}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">{dictionary.receipt.items}</h3>
              <div className="space-y-4 mb-6">
                {receipt.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {item.product?.image_url && (
                        <div className="relative h-12 w-12 mr-3 rounded-md overflow-hidden">
                          <Image
                            src={item.product.image_url}
                            alt={item.product?.name || 'Product'}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{item.product?.name}</h4>
                        {item.product?.description && (
                          <p className="text-xs text-gray-500">{item.product.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.product?.coin_value} {dictionary.receipt.coins}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>{dictionary.receipt.total}</span>
                  <span>{receipt.total} {dictionary.receipt.coins}</span>
                </div>
              </div>
              
              <div className="text-center mt-8 text-gray-500">
                <p>{dictionary.receipt.thankYou}</p>
              </div>
            </div>
          </CardContent>
        ) : null}
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto flex gap-2"
            onClick={handlePrint}
          >
            <PrinterIcon className="h-4 w-4" />
            {dictionary.receipt.print}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full sm:w-auto flex gap-2"
            onClick={() => router.push(`/${lang}`)}
          >
            <HomeIcon className="h-4 w-4" />
            {dictionary.receipt.backToHome}
          </Button>
          
          <Button 
            className="w-full sm:w-auto flex gap-2"
            onClick={() => router.push(`/${lang}/scan`)}
          >
            <ShoppingBagIcon className="h-4 w-4" />
            {dictionary.receipt.shop}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 