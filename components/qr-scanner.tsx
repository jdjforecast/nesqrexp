'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Product } from '@/lib/supabase';

interface QrScannerProps {
  onScanSuccess: (product: Product) => void;
  onScanError: (error: string) => void;
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
    }
  };
}

export function QrScanner({ onScanSuccess, onScanError, dictionary }: QrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const cameraContainerId = 'qr-reader';

  useEffect(() => {
    // Clean up scanner when component unmounts
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch((error: Error) => {
          console.error("Failed to stop camera:", error);
        });
      }
    };
  }, [scanning]);

  const startScanner = async () => {
    try {
      setError(null);
      setScanning(true);
      
      const html5QrCode = new Html5Qrcode(cameraContainerId);
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10 },
        async (qrCodeMessage: string) => {
          console.log(`QR Code detected: ${qrCodeMessage}`);
          
          // Process the QR code data
          try {
            setLoading(true);
            // Fetch product data based on QR code
            const response = await fetch(`/api/products/qr?code=${encodeURIComponent(qrCodeMessage)}`);
            
            if (!response.ok) {
              throw new Error(dictionary.scanner.productNotFound);
            }
            
            const productData = await response.json();
            setProduct(productData);
            onScanSuccess(productData);
            
            // Stop scanning after successful scan
            html5QrCode.stop().catch((error: Error) => {
              console.error("Failed to stop camera:", error);
            });
          } catch (error) {
            if (error instanceof Error) {
              setError(error.message);
              onScanError(error.message);
            } else {
              setError(dictionary.scanner.scanError);
              onScanError(dictionary.scanner.scanError);
            }
          } finally {
            setLoading(false);
            setScanning(false);
          }
        },
        (errorMessage: string) => {
          console.log(`QR Code scan error: ${errorMessage}`);
        }
      );
    } catch (error) {
      console.error("Error starting scanner:", error);
      setError(dictionary.scanner.scanError);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (error) {
        console.error("Failed to stop camera:", error);
      }
    }
  };

  const resetScanner = () => {
    setProduct(null);
    setError(null);
  };

  return (
    <div className="qr-scanner-container">
      <h2 className="text-2xl font-bold mb-4">{dictionary.scanner.title}</h2>
      
      {!scanning && !product && !error && (
        <div className="mb-4">
          <p className="mb-2">{dictionary.scanner.instructions}</p>
          <button
            onClick={startScanner}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {dictionary.scanner.startScanner}
          </button>
        </div>
      )}
      
      {scanning && (
        <div className="mb-4">
          <div id={cameraContainerId} className="w-full max-w-sm mx-auto mb-4"></div>
          <button
            onClick={stopScanner}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            {dictionary.scanner.stopScanner}
          </button>
        </div>
      )}
      
      {error && (
        <div className="mb-4">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={resetScanner}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {dictionary.scanner.scanAnother}
          </button>
        </div>
      )}
      
      {loading && <p>Loading...</p>}
    </div>
  );
} 