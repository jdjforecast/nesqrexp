'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { QrScanner } from '@/components/qr-scanner';
import { addToCart, getProduct } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function ScanPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [scanning, setScanning] = useState(true);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const handleScanSuccess = async (decodedText: string) => {
    try {
      setScanning(false);
      
      // Decode product ID from QR code
      // Assuming the QR code contains a URL with product ID
      let productId = decodedText;
      
      // Handle if the QR contains a full URL
      if (decodedText.includes('/products/')) {
        const parts = decodedText.split('/');
        productId = parts[parts.length - 1];
      }
      
      // Fetch product details
      const product = await getProduct(productId);
      
      if (!product) {
        setError('Producto no encontrado. Intenta escanear de nuevo.');
        return;
      }
      
      setScannedProduct(product);
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      setError('Error al procesar el código QR. Intenta de nuevo.');
    }
  };

  const handleAddToCart = async () => {
    if (!user || !scannedProduct) return;
    
    try {
      setAdding(true);
      const result = await addToCart(user.id, scannedProduct.id);
      
      if (result.success) {
        // Navigate to cart or success page
        router.push('/dashboard/cart');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Error al añadir el producto al carrito.');
    } finally {
      setAdding(false);
    }
  };

  const handleScanAgain = () => {
    setScannedProduct(null);
    setError(null);
    setScanning(true);
  };

  if (!isLoaded) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-primary">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Escanear Producto</h1>
      
      {scanning ? (
        <QrScanner 
          onScanSuccess={handleScanSuccess}
          onScanError={(errorMessage) => setError(errorMessage)}
        />
      ) : (
        <>
          {scannedProduct ? (
            <Card className="overflow-hidden">
              <div className="relative h-48 bg-muted">
                {scannedProduct.image_url && (
                  <Image
                    src={scannedProduct.image_url}
                    alt={scannedProduct.name}
                    fill
                    className="object-contain"
                  />
                )}
                <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold rounded-full px-2 py-1 text-blue-900">
                  +{scannedProduct.coin_value} coins
                </div>
              </div>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold">{scannedProduct.name}</h2>
                <p className="text-muted-foreground text-sm mb-4">{scannedProduct.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-lg">${scannedProduct.price.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">
                    Disponibles: {scannedProduct.inventory}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleAddToCart} 
                    className="w-full btn-primary"
                    disabled={adding}
                  >
                    {adding ? 'Añadiendo...' : 'Añadir al Carrito'}
                  </Button>
                  
                  <Button 
                    onClick={handleScanAgain} 
                    variant="outline" 
                    className="w-full"
                  >
                    Escanear Otro
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <div className="text-destructive mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3 className="text-lg font-semibold">Error al escanear</h3>
                <p className="text-sm mb-4">{error || 'No se pudo leer el código QR.'}</p>
                <Button onClick={handleScanAgain}>Intentar de nuevo</Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 