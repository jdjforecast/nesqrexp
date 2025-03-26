'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import LanguageSwitcher from './language-switcher';
import { QrCodeIcon, ShoppingCartIcon, UserIcon } from 'lucide-react';

interface SiteHeaderProps {
  dictionary: {
    navigation: {
      home: string;
      products: string;
      cart: string;
      profile: string;
      scan: string;
      language: string;
    };
  };
  lang: string;
}

export function SiteHeader({ dictionary, lang }: SiteHeaderProps) {
  const pathname = usePathname();
  
  // Define links with their URLs and active states
  const links = [
    {
      href: { pathname: `/${lang}` },
      label: dictionary.navigation.home,
      active: pathname === `/${lang}`,
    },
    {
      href: { pathname: `/${lang}/${lang === 'es' ? 'escanear' : 'scan'}` },
      label: dictionary.navigation.scan,
      active: pathname === `/${lang}/scan` || pathname === `/${lang}/escanear`,
      icon: <QrCodeIcon className="h-4 w-4 mr-1" />,
    },
    {
      href: { pathname: `/${lang}/cart` },
      label: dictionary.navigation.cart,
      active: pathname === `/${lang}/cart`,
      icon: <ShoppingCartIcon className="h-4 w-4 mr-1" />,
    },
    {
      href: { pathname: `/${lang}/profile` },
      label: dictionary.navigation.profile,
      active: pathname === `/${lang}/profile`,
      icon: <UserIcon className="h-4 w-4 mr-1" />,
    },
  ];

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href={{ pathname: `/${lang}` }}>
              <span className="font-bold text-xl">Nestlé QR</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-4">
            {links.map((link) => (
              <Link
                key={JSON.stringify(link.href)}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  link.active
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {link.icon && link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
        <div className="flex justify-around">
          {links.map((link) => (
            <Link
              key={JSON.stringify(link.href)}
              href={link.href}
              className={`flex flex-col items-center px-3 py-2 text-xs ${
                link.active
                  ? 'text-blue-800'
                  : 'text-gray-600'
              }`}
            >
              {link.icon && <div className="h-6 w-6 mb-1">{link.icon}</div>}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
} 