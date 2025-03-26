import { QrScanner } from '@/components/qr-scanner';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { addToCart } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ScanPage() {
  const dictionary = await getDictionary('en');
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/en/sign-in');
  }
  
  // Proporcionar un objeto completo de diccionario para el escáner
  const scannerDict = {
    scanner: {
      title: dictionary.scanner?.title || "SCAN QR CODE",
      instructions: dictionary.scanner?.instruction || "Point the camera at the QR code on the product",
      startScanner: dictionary.scanner?.startScanner || "Start Scanner",
      stopScanner: dictionary.scanner?.stopScanner || "Stop Scanner",
      scanAnother: dictionary.scanner?.scanAgain || "Scan Another",
      scanError: dictionary.scanner?.scanError || "Scan Error",
      productNotFound: dictionary.scanner?.productNotFound || "Product not found. Try scanning again.",
      addToCart: dictionary.scanner?.addToCart || "Add to Cart",
      adding: dictionary.scanner?.adding || "Adding...",
      howToScan: "How to scan a QR code",
      step1: "Press the 'Start Scanner' button to activate the camera",
      step2: "Center the QR code in the camera frame",
      step3: "Keep the camera steady until the code is recognized",
      unauthorized: "You must be signed in to add products to cart"
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