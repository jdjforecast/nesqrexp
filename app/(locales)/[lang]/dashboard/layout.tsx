'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import LocalizedHeader from '@/components/localized-header';
import { getDictionary } from '@/lib/i18n/dictionaries';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function LocalizedDashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { lang } = useParams() as { lang: string };
  const [dict, setDict] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const loadDictionary = async () => {
      const dictionary = await getDictionary(lang);
      setDict(dictionary);
    };
    
    loadDictionary();
    setIsMounted(true);
  }, [lang]);

  const navItems = [
    {
      name: dict?.dashboard?.home || 'Home',
      href: `/${lang}/dashboard`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      name: dict?.dashboard?.scan || 'Scan',
      href: `/${lang}/dashboard/scan`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
          <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
          <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
          <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
          <rect width="10" height="10" x="7" y="7" rx="1"/>
        </svg>
      ),
    },
    {
      name: dict?.dashboard?.cart || 'Cart',
      href: `/${lang}/dashboard/cart`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      ),
    },
    {
      name: dict?.dashboard?.profile || 'Profile',
      href: `/${lang}/dashboard/profile`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <LocalizedHeader />
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Mobile Navigation Bar */}
      <nav className="bg-white border-t fixed bottom-0 w-full z-10">
        <ul className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center py-3 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <span className="mb-1">{item.icon}</span>
                  <span className="text-xs">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Bottom padding for mobile navigation */}
      <div className="h-16"></div>
    </div>
  );
} 