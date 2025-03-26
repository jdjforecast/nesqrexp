'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem, removeFromCart } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCartIcon, TrashIcon, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CartProps {
  items: CartItem[];
  userId: string;
  coins: number;
  lang: string;
  onItemRemoved?: () => void;
  dictionary?: {
    cart?: {
      title?: string;
      empty?: string;
      checkout?: string;
      remove?: string;
      total?: string;
      coins?: string;
      backToScan?: string;
      processing?: string;
      availableCoins?: string;
    };
  };
}

export function Cart({ items, userId, coins, lang, onItemRemoved, dictionary = {} }: CartProps) {
  const [processing, setProcessing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Default texts
  const texts = {
    title: dictionary.cart?.title || 'Carrito',
    empty: dictionary.cart?.empty || 'Tu carrito está vacío',
    checkout: dictionary.cart?.checkout || 'Finalizar compra',
    remove: dictionary.cart?.remove || 'Eliminar',
    total: dictionary.cart?.total || 'Total',
    coins: dictionary.cart?.coins || 'monedas',
    backToScan: dictionary.cart?.backToScan || 'Escanear productos',
    processing: dictionary.cart?.processing || 'Procesando...',
    availableCoins: dictionary.cart?.availableCoins || 'Monedas disponibles'
  };
  
  // Calculate totals
  const totalCoins = items.reduce((total, item) => {
    return total + (item.product?.coin_value || 0);
  }, 0);

  const handleRemoveItem = async (itemId: string) => {
    setRemovingId(itemId);
    
    try {
      const success = await removeFromCart(itemId);
      
      if (success) {
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado del carrito"
        });
        
        if (onItemRemoved) {
          onItemRemoved();
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el producto",
        variant: "destructive"
      });
    } finally {
      setRemovingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            {texts.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="text-center py-8">
            <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground mb-6">{texts.empty}</p>
            <Link href={`/${lang}/scan`} passHref>
              <Button variant="outline" className="gap-2">
                <ShoppingCartIcon className="h-4 w-4" />
                {texts.backToScan}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            {texts.title}
          </CardTitle>
          <div className="text-sm bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full">
            <span className="font-semibold">{items.length}</span> {items.length === 1 ? 'producto' : 'productos'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {item.product?.image_url && (
                  <div className="h-16 w-16 relative rounded-md overflow-hidden">
                    <Image 
                      src={item.product.image_url}
                      alt={item.product?.name || 'Product'}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-medium">{item.product?.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-yellow-800 font-medium">
                      {item.product?.coin_value} {texts.coins}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                disabled={removingId === item.id}
                onClick={() => handleRemoveItem(item.id)}
                className="text-destructive h-8 px-2"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
            <span>{texts.availableCoins}</span>
            <span>{coins}</span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span>{texts.total}</span>
            <span className="font-bold text-lg">{totalCoins} {texts.coins}</span>
          </div>

          <div className="mt-4">
            <Link href={`/${lang}/cart`} passHref>
              <Button 
                className="w-full flex items-center justify-center gap-2"
                disabled={processing}
              >
                {processing ? texts.processing : (
                  <>
                    {texts.checkout}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 