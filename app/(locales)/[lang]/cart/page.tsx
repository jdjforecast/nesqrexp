'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCartIcon, TrashIcon, ReceiptIcon, Loader2, ShoppingBag } from 'lucide-react';
import { getUserCart, removeFromCart, CartItem, getUserCoins, processCheckout } from '@/lib/supabase';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { getDictionary } from '@/lib/i18n/dictionaries';

interface CartPageProps {
  params: {
    lang: string;
  };
}

export default function CartPage({ params }: CartPageProps) {
  const { lang } = params;
  const { isLoaded, isSignedIn, user } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [dictionary, setDictionary] = useState<any>({
    cart: {
      title: 'Carrito',
      empty: 'Tu carrito está vacío',
      checkout: 'Finalizar compra',
      remove: 'Eliminar',
      total: 'Total',
      coins: 'monedas',
      backToScan: 'Escanear productos',
      receipt: 'Generar recibo',
      processing: 'Procesando...',
      insufficientCoins: 'No tienes suficientes monedas',
      availableCoins: 'Monedas disponibles',
    }
  });

  useEffect(() => {
    // Cargar el diccionario
    const loadDictionary = async () => {
      const dict = await getDictionary(lang);
      setDictionary(dict);
    };
    
    loadDictionary();
  }, [lang]);

  useEffect(() => {
    const loadCartAndCoins = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        setLoading(true);
        
        // Cargar carrito
        const items = await getUserCart(user.id);
        setCartItems(items);
        
        // Cargar monedas del usuario
        const coins = await getUserCoins(user.id);
        setUserCoins(coins);
      } catch (error) {
        console.error('Error loading cart:', error);
        toast({
          title: "Error",
          description: "No pudimos cargar tu carrito. Intenta de nuevo más tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadCartAndCoins();
  }, [isLoaded, isSignedIn, user, toast]);

  const handleRemoveItem = async (itemId: string) => {
    if (!user) return;
    
    try {
      setRemoving(itemId);
      const success = await removeFromCart(itemId);
      
      if (success) {
        setCartItems(cartItems.filter(item => item.id !== itemId));
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado de tu carrito."
        });
      } else {
        toast({
          title: "Error",
          description: "No pudimos eliminar el producto. Intenta de nuevo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el producto.",
        variant: "destructive"
      });
    } finally {
      setRemoving(null);
    }
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;
    
    try {
      setProcessingCheckout(true);
      
      toast({
        title: "Procesando tu compra",
        description: "Estamos procesando tu pedido..."
      });
      
      // Calcular total de monedas
      const totalCoins = cartItems.reduce((total, item) => total + (item.product?.coin_value || 0), 0);
      
      // Verificar si el usuario tiene suficientes monedas
      if (userCoins < totalCoins) {
        toast({
          title: "Monedas insuficientes",
          description: `Necesitas ${totalCoins} monedas para completar esta compra.`,
          variant: "destructive"
        });
        setProcessingCheckout(false);
        return;
      }
      
      // Procesar la compra
      const result = await processCheckout(user.id);
      
      if (result.success) {
        toast({
          title: "¡Compra exitosa!",
          description: "Tu pedido ha sido procesado. Redirigiendo al recibo..."
        });
        
        // Redireccionar a la página de recibo
        router.push(`/${lang}/receipt`);
      } else {
        toast({
          title: "Error en la compra",
          description: result.message || "Hubo un problema al procesar tu compra.",
          variant: "destructive"
        });
        setProcessingCheckout(false);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar tu compra.",
        variant: "destructive"
      });
      setProcessingCheckout(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full mb-4" />
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
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <ShoppingCartIcon className="mr-2 h-6 w-6" />
              {dictionary.cart.title}
            </CardTitle>
            <div className="text-sm bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full flex items-center">
              <span className="font-semibold mr-1">{userCoins}</span> 
              {dictionary.cart.coins}
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          {loading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-6">{dictionary.cart.empty}</p>
              <Link href={`/${lang}/scan`} passHref>
                <Button variant="outline" className="gap-2">
                  <ShoppingCartIcon className="h-4 w-4" />
                  {dictionary.cart.backToScan}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    {item.product?.image_url && (
                      <div className="relative h-16 w-16 mr-4 rounded-md overflow-hidden">
                        <Image
                          src={item.product.image_url}
                          alt={item.product?.name || 'Product'}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{item.product?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {dictionary.cart.coins}: {item.product?.coin_value}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removing === item.id}
                  >
                    {removing === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                    <span className="sr-only">{dictionary.cart.remove}</span>
                  </Button>
                </div>
              ))}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-500">
                    {dictionary.cart.availableCoins}
                  </span>
                  <span className="font-medium">{userCoins}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">{dictionary.cart.total}</span>
                  <span className="font-bold text-lg">
                    {cartItems.reduce((total, item) => total + (item.product?.coin_value || 0), 0)} {dictionary.cart.coins}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        {cartItems.length > 0 && (
          <CardFooter className="border-t pt-4">
            <Button 
              className="w-full flex gap-2" 
              onClick={handleCheckout}
              disabled={processingCheckout}
            >
              {processingCheckout ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {dictionary.cart.processing}
                </>
              ) : (
                <>
                  <ReceiptIcon className="h-4 w-4" />
                  {dictionary.cart.checkout}
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 