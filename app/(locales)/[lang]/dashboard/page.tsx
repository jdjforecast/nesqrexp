'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, getUserCoins } from '@/lib/supabase';
import { getDictionary } from '@/lib/i18n/dictionaries';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { lang } = useParams() as { lang: string };
  const [coins, setCoins] = useState(0);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    const loadDictionary = async () => {
      const dictionary = await getDictionary(lang);
      setDict(dictionary);
    };
    
    loadDictionary();
  }, [lang]);

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

  if (!isLoaded || loading || !dict) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-primary">{dict?.common?.loading || 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User welcome card */}
      <Card className="nestle-gradient text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{dict.dashboard.greeting.replace('{name}', userName)}</h2>
              <p className="text-sm opacity-85">{dict.dashboard.welcome}</p>
              <div className="mt-4 bg-white/20 rounded-full px-4 py-1 inline-block">
                <span className="font-bold">{coins}</span> {dict.dashboard.coins}
              </div>
            </div>
            <Image
              src="/nestle-logo-white.png"
              alt="Nestlé Logo"
              width={80}
              height={24}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-2 border-primary hover:bg-primary/5 transition-colors">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                <rect width="10" height="10" x="7" y="7" rx="1"/>
              </svg>
            </div>
            <h3 className="font-medium text-center">{dict.dashboard.scanQR}</h3>
            <p className="text-xs text-center text-muted-foreground">{dict.dashboard.scanDescription}</p>
            <Button className="mt-3 w-full" asChild>
              <Link href={`/${lang}/dashboard/scan`}>{dict.dashboard.scanQR}</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary hover:bg-primary/5 transition-colors">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
            </div>
            <h3 className="font-medium text-center">{dict.dashboard.viewCart}</h3>
            <p className="text-xs text-center text-muted-foreground">{dict.dashboard.cartDescription}</p>
            <Button className="mt-3 w-full" variant="outline" asChild>
              <Link href={`/${lang}/dashboard/cart`}>{dict.dashboard.viewCart}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured products */}
      <div>
        <h2 className="text-xl font-bold mb-4">{dict.dashboard.featuredProducts}</h2>
        <p className="text-sm text-muted-foreground mb-4">{dict.dashboard.scanToEarn}</p>
        
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((product) => (
            <Card key={product} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={`/products/product-${product}.jpg`}
                  alt={`Product ${product}`}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm">Nestlé Product {product}</h3>
                <p className="text-xs text-muted-foreground">+50 coins</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 