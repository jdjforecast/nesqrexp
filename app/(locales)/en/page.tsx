import { getDictionary } from '@/lib/i18n/dictionaries';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import Image from 'next/image';
import { QrCodeIcon, ShoppingCartIcon, Coins } from 'lucide-react';

export default async function HomePage() {
  const dictionary = await getDictionary('en');
  const { userId } = await auth();
  
  // Ensure we have all needed dictionary keys
  const homepageDict = {
    title: dictionary.homepage?.title || "Welcome to Nestlé QR Experience",
    subtitle: dictionary.homepage?.subtitle || "Scan QR codes to discover products and earn rewards",
    getStarted: "Get Started",
    howToUse: "How to Use"
  };
  
  const authDict = {
    signIn: dictionary.auth?.signIn || "Sign In"
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {homepageDict.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              {homepageDict.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {userId ? (
                <Link 
                  href={{ pathname: "/en/scan" }}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-medium text-lg inline-flex items-center"
                >
                  <QrCodeIcon className="mr-2 h-5 w-5" />
                  {homepageDict.getStarted}
                </Link>
              ) : (
                <Link 
                  href={{ pathname: "/en/sign-in" }}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-medium text-lg inline-flex items-center"
                >
                  {authDict.signIn}
                </Link>
              )}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {homepageDict.howToUse}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <QrCodeIcon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Scan</h3>
                <p className="text-gray-600">
                  Use your camera to scan QR codes on Nestlé products
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Coins</h3>
                <p className="text-gray-600">
                  You receive 150 coins to redeem for products by scanning their QR codes
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCartIcon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cart</h3>
                <p className="text-gray-600">
                  Add products to your cart and receive a detailed receipt of your selection
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="flex items-center justify-center gap-2 mb-1">
            An experience by MIpartner developed by Korova MB 
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="5" width="16" height="16" rx="2" />
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="10" y1="5" x2="10" y2="1" />
                <line x1="14" y1="5" x2="14" y2="1" />
                <path d="M12 12v4" />
                <path d="M8 12h8" />
              </svg>
            </span>
          </p>
          <p>Jaime Forero Castillo. © 2025 All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 