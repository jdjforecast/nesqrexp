'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, getUserCoins } from '@/lib/supabase';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [coins, setCoins] = useState(0);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !user) return;

      try {
        setLoading(true);
        
        // Get user info from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('name, coins')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }
        
        if (data) {
          setUserName(data.name);
          setCoins(data.coins || 0);
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-primary">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">¡Hola, {userName || 'Usuario'}!</h1>
              <p className="text-white/80 mt-1">Bienvenido a tu experiencia Nestlé</p>
            </div>
            <div className="bg-yellow-400 text-blue-900 font-bold rounded-full px-4 py-2 flex items-center">
              <span className="mr-1">{coins}</span>
              <span>coins</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                <rect width="10" height="10" x="7" y="7" rx="1"/>
              </svg>
            </div>
            <h3 className="font-medium mb-1">Escanear QR</h3>
            <p className="text-xs text-muted-foreground mb-3">Agrega productos escaneando</p>
            <Link href="/dashboard/scan" className="w-full">
              <Button className="w-full btn-primary" size="sm">
                Escanear
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
            </div>
            <h3 className="font-medium mb-1">Ver Carrito</h3>
            <p className="text-xs text-muted-foreground mb-3">Revisa tus productos</p>
            <Link href="/dashboard/cart" className="w-full">
              <Button className="w-full" variant="outline" size="sm">
                Mi Carrito
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Products Carousel */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Destacados</CardTitle>
          <CardDescription>Escanea estos productos para ganar coins</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex-shrink-0 w-36">
                <div className="bg-muted rounded-lg h-36 mb-2 relative">
                  <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold rounded-full px-2 py-1 text-blue-900">
                    +5 coins
                  </div>
                </div>
                <h3 className="font-medium text-sm">Producto Nestlé {item}</h3>
                <p className="text-xs text-muted-foreground">Escanea para añadir</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 