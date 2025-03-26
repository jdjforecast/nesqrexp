import { QrScanner } from '@/components/qr-scanner';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { addToCart } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

export default async function ScanPage() {
  const dictionary = await getDictionary('es');
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/es/sign-in');
  }
  
  // Proporcionar un objeto completo de diccionario para el escáner
  const scannerDict = {
    scanner: {
      title: dictionary.scanner?.title || "ESCANEA EL CÓDIGO QR",
      instructions: dictionary.scanner?.instruction || "Apunta la cámara al código QR del producto",
      startScanner: dictionary.scanner?.startScanner || "Iniciar Escáner",
      stopScanner: dictionary.scanner?.stopScanner || "Detener Escáner",
      scanAnother: dictionary.scanner?.scanAgain || "Escanear Otro",
      scanError: dictionary.scanner?.scanError || "Error al escanear",
      productNotFound: dictionary.scanner?.productNotFound || "Producto no encontrado. Intenta escanear de nuevo.",
      addToCart: dictionary.scanner?.addToCart || "Añadir al Carrito",
      adding: dictionary.scanner?.adding || "Añadiendo...",
      howToScan: "Cómo escanear un código QR",
      step1: "Pulsa el botón 'Iniciar Escáner' para activar la cámara",
      step2: "Centra el código QR en el marco de la cámara",
      step3: "Mantén la cámara estable hasta que el código sea reconocido",
      unauthorized: "Debes iniciar sesión para añadir productos al carrito"
    }
  };
  
  async function handleAddToCart(productId: string) {
    'use server';
    
    if (!userId) {
      return { success: false, message: scannerDict.scanner.unauthorized };
    }
    
    return await addToCart(userId, productId);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        <QrScanner 
          dictionary={scannerDict}
          onScanSuccess={(product) => {
            // Client component will handle this
            console.log('Product scanned:', product);
          }}
          onScanError={(error) => {
            // Client component will handle this
            console.error('Scan error:', error);
          }}
        />
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">{scannerDict.scanner.howToScan}</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>{scannerDict.scanner.step1}</li>
            <li>{scannerDict.scanner.step2}</li>
            <li>{scannerDict.scanner.step3}</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 