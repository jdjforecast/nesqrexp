'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Cart } from '@/components/cart';
import { getUserCart } from '@/lib/supabase';
import { CartItem } from '@/lib/supabase';

export default function CartPage() {
  const { user, isLoaded } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!isLoaded || !user) return;
    
    try {
      setLoading(true);
      const items = await getUserCart(user.id);
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-primary">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mi Carrito</h1>
      
      <Cart 
        items={cartItems}
        userId={user.id}
        onItemRemoved={fetchCart}
      />
    </div>
  );
} 