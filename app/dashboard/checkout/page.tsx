'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserCart, supabase, updateUserCoins } from '@/lib/supabase';
import { CartItem } from '@/lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.product?.price || 0);
  }, 0);
  
  // Calculate total nestle coins
  const totalCoins = cartItems.reduce((total, item) => {
    return total + (item.product?.coin_value || 0);
  }, 0);

  useEffect(() => {
    const fetchCart = async () => {
      if (!isLoaded || !user) return;
      
      try {
        setLoading(true);
        const items = await getUserCart(user.id);
        
        if (items.length === 0) {
          // Redirect to cart if no items
          router.push('/dashboard/cart');
          return;
        }
        
        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Error al cargar el carrito. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isLoaded, user, router]);

  const handleCompleteOrder = async () => {
    if (!user || cartItems.length === 0) return;
    
    try {
      setProcessing(true);
      setError(null);
      
      // 1. Update user's coins
      const { data: userData } = await supabase
        .from('users')
        .select('coins')
        .eq('id', user.id)
        .single();
      
      const currentCoins = userData?.coins || 0;
      const newCoins = currentCoins + totalCoins;
      
      await updateUserCoins(user.id, newCoins);
      
      // 2. Clear cart (This would typically go to an order history table in a real app)
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        throw new Error('Error clearing cart');
      }
      
      // 3. Redirect to success page
      router.push('/dashboard/checkout/success');
      
    } catch (error) {
      console.error('Error completing order:', error);
      setError('Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-primary">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                {item.product?.image_url && (
                  <div className="h-16 w-16 relative rounded-md overflow-hidden">
                    <Image 
                      src={item.product.image_url}
                      alt={item.product?.name || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{item.product?.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-sm font-semibold">${item.product?.price.toFixed(2)}</span>
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs nestle-coin">
                      +{item.product?.coin_value} coins
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold">
                <span>Total Nestle Coins</span>
                <span className="nestle-coin px-2 py-1 rounded-full">
                  +{totalCoins} coins
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Tu selección será entregada al final del evento Nestlé Pharma.
          </p>
          
          <div className="text-sm">
            <p className="font-medium">Nombre: {user.fullName || user.username}</p>
            <p className="text-muted-foreground">ID de usuario: {user.id.substring(0, 8)}</p>
          </div>
        </CardContent>
      </Card>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleCompleteOrder}
          disabled={processing || cartItems.length === 0}
          className="btn-primary"
        >
          {processing ? 'Procesando...' : 'Confirmar Pedido'}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/cart')}
          disabled={processing}
        >
          Volver al Carrito
        </Button>
      </div>
    </div>
  );
} 