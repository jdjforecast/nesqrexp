'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { QrScanner } from '@/components/qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCartIcon, Coins } from 'lucide-react';
import { addToCart, Product, getUserCoins, updateUserCoins } from '@/lib/supabase';
import { toast } from 'sonner';

interface ScanPageProps {
  params: {
    lang: string;
  };
  dictionary: {
    scanner: {
      title: string;
      instructions: string;
      startScanner: string;
      stopScanner: string;
      scanAnother: string;
      scanError: string;
      productNotFound: string;
      addToCart: string;
      adding: string;
    };
    cart: {
      title: string;
    };
    common: {
      success: string;
    };
  };
}

export default function ScanPage({ params, dictionary }: ScanPageProps) {
  const { lang } = params;
  const { isLoaded, isSignedIn, user } = useUser();
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scanning, setScanning] = useState(false);
  const [adding, setAdding] = useState(false);
  const [userCoins, setUserCoins] = useState<number | null>(null);
  const router = useRouter();

  // Cargar las monedas del usuario al montar el componente
  const fetchUserCoins = async () => {
    if (!isLoaded || !isSignedIn) return;
    
    try {
      const coins = await getUserCoins(user.id);
      setUserCoins(coins);
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  };

  // Verificar si el usuario está cargado y autenticado
  if (isLoaded && !isSignedIn) {
    router.push(`/${lang}/sign-in`);
    return null;
  }

  // Cuando se escanea correctamente un producto
  const handleScanSuccess = (product: Product) => {
    setScannedProduct(product);
    setScanning(false);
    
    // Cargar las monedas del usuario para verificar si tiene suficientes
    fetchUserCoins();
  };

  // Cuando hay un error al escanear
  const handleScanError = (error: string) => {
    setScanning(false);
    toast.error(error);
  };

  // Agregar producto al carrito
  const handleAddToCart = async () => {
    if (!user || !scannedProduct) return;
    
    // Verificar si el usuario tiene suficientes monedas
    if (userCoins !== null && userCoins < scannedProduct.coin_value) {
      toast.error(`No tienes suficientes monedas para este producto (${scannedProduct.coin_value})`);
      return;
    }
    
    try {
      setAdding(true);
      
      // Agregar al carrito
      const response = await addToCart(user.id, scannedProduct.id);
      
      if (response.success) {
        // Actualizar monedas del usuario
        if (userCoins !== null) {
          const newCoins = userCoins - scannedProduct.coin_value;
          await updateUserCoins(user.id, newCoins);
          setUserCoins(newCoins);
        }
        
        toast.success(dictionary.common.success);
        
        // Redireccionar al carrito
        setTimeout(() => {
          router.push(`/${lang}/cart`);
        }, 1500);
      } else {
        toast.error(response.message);
        setAdding(false);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAdding(false);
    }
  };

  // Resetear el escaneo para escanear otro producto
  const handleScanAgain = () => {
    setScannedProduct(null);
    setScanning(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-center">
            {dictionary.scanner.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoaded && isSignedIn && (
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">{userCoins} monedas</span>
              </div>
              {/* Agregar botón para ir al carrito */}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => router.push(`/${lang}/cart`)}
              >
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                {dictionary.cart.title}
              </Button>
            </div>
          )}
          
          {/* Componente de escaneo QR */}
          <QrScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            dictionary={dictionary}
          />
          
          {/* Mostrar producto escaneado */}
          {scannedProduct && (
            <div className="mt-6 border rounded-lg p-4">
              <h3 className="text-lg font-semibold">{scannedProduct.name}</h3>
              <p className="text-gray-600 mb-4">{scannedProduct.description}</p>
              <div className="flex justify-between items-center">
                <div className="font-medium">
                  {scannedProduct.coin_value} monedas
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={adding || (userCoins !== null && userCoins < scannedProduct.coin_value)}
                >
                  {adding ? dictionary.scanner.adding : dictionary.scanner.addToCart}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!scanning && !scannedProduct && (
            <Button onClick={() => setScanning(true)}>
              {dictionary.scanner.startScanner}
            </Button>
          )}
          
          {!scanning && scannedProduct && (
            <Button variant="outline" onClick={handleScanAgain}>
              {dictionary.scanner.scanAnother}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 