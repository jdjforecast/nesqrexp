'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { Menu, X, QrCode, ShoppingCart, User, LogIn, Home, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserCoins } from '@/lib/supabase';

interface NavMenuProps {
  lang: string;
  dictionary?: {
    home?: {
      title?: string;
      welcome?: string;
      scan?: string;
      profile?: string;
      signIn?: string;
      register?: string;
      cart?: string;
    };
    receipts?: {
      title?: string;
    };
  };
}

export default function NavMenu({ lang, dictionary }: NavMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const [coins, setCoins] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchUserCoins = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const userCoins = await getUserCoins(user.id);
          setCoins(userCoins);
        } catch (error) {
          console.error('Error fetching user coins:', error);
        }
      }
    };
    
    fetchUserCoins();
  }, [isLoaded, isSignedIn, user]);

  // Default texts if dictionary is not provided
  const homeText = dictionary?.home?.title || 'Nestlé Experience';
  const scanText = dictionary?.home?.scan || 'Scan';
  const profileText = dictionary?.home?.profile || 'Profile';
  const signInText = dictionary?.home?.signIn || 'Sign In';
  const registerText = dictionary?.home?.register || 'Register';
  const cartText = dictionary?.home?.cart || 'Cart';
  const receiptsText = dictionary?.receipts?.title || 'My Purchases';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const homeLink = `/${lang}`;

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and site name */}
          <Link href={homeLink} className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Nestlé Logo" 
              width={40} 
              height={40} 
              className="mr-2"
            />
            <span className="font-bold text-xl">{homeText}</span>
          </Link>

          {/* User info and mobile menu button */}
          <div className="flex items-center gap-4">
            <SignedIn>
              {coins !== null && (
                <div className="hidden md:flex items-center gap-1 bg-yellow-50 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  <span>{coins}</span>
                  <span className="text-xs">coins</span>
                </div>
              )}
            </SignedIn>
            
            <button 
              onClick={toggleMenu}
              className="md:hidden flex items-center"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link href={homeLink} passHref>
                <Button variant="ghost" size="sm" className="flex gap-1.5 items-center">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              
              <Link href={`/${lang}/scan`} passHref>
                <Button variant="ghost" size="sm" className="flex gap-1.5 items-center">
                  <QrCode className="h-4 w-4" />
                  {scanText}
                </Button>
              </Link>
              
              <SignedIn>
                <Link href={`/${lang}/cart`} passHref>
                  <Button variant="ghost" size="sm" className="flex gap-1.5 items-center">
                    <ShoppingCart className="h-4 w-4" />
                    {cartText}
                  </Button>
                </Link>
                
                <Link href={`/${lang}/receipts`} passHref>
                  <Button variant="ghost" size="sm" className="flex gap-1.5 items-center">
                    <Receipt className="h-4 w-4" />
                    {receiptsText}
                  </Button>
                </Link>
                
                <Link href={`/${lang}/profile`} passHref>
                  <Button variant="ghost" size="sm" className="flex gap-1.5 items-center">
                    <User className="h-4 w-4" />
                    {profileText}
                  </Button>
                </Link>
                
                <UserButton afterSignOutUrl={homeLink} />
              </SignedIn>
              
              <SignedOut>
                <Link href={`/${lang}/sign-in`} passHref>
                  <Button variant="ghost" size="sm" className="flex gap-1.5 items-center">
                    <LogIn className="h-4 w-4" />
                    {signInText}
                  </Button>
                </Link>
                
                <Link href={`/${lang}/sign-up`} passHref>
                  <Button variant="default" size="sm">
                    {registerText}
                  </Button>
                </Link>
              </SignedOut>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="container mx-auto px-4 py-3 flex flex-col space-y-2">
            <Link 
              href={homeLink} 
              onClick={closeMenu}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            
            <Link 
              href={`/${lang}/scan`} 
              onClick={closeMenu}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
            >
              <QrCode className="h-5 w-5" />
              {scanText}
            </Link>
            
            <SignedIn>
              {coins !== null && (
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-800 p-2 rounded-md text-sm font-medium">
                  <span>{coins}</span>
                  <span className="text-xs">coins</span>
                </div>
              )}
              
              <Link 
                href={`/${lang}/cart`} 
                onClick={closeMenu}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartText}
              </Link>
              
              <Link 
                href={`/${lang}/receipts`} 
                onClick={closeMenu}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
              >
                <Receipt className="h-5 w-5" />
                {receiptsText}
              </Link>
              
              <Link 
                href={`/${lang}/profile`} 
                onClick={closeMenu}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
              >
                <User className="h-5 w-5" />
                {profileText}
              </Link>
              
              <div className="p-2">
                <UserButton afterSignOutUrl={homeLink} />
              </div>
            </SignedIn>
            
            <SignedOut>
              <Link 
                href={`/${lang}/sign-in`} 
                onClick={closeMenu}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
              >
                <LogIn className="h-5 w-5" />
                {signInText}
              </Link>
              
              <Link 
                href={`/${lang}/sign-up`} 
                onClick={closeMenu}
                className="p-2"
              >
                <Button className="w-full">
                  {registerText}
                </Button>
              </Link>
            </SignedOut>
          </nav>
        </div>
      )}
    </header>
  );
} 