'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import LanguageSwitcher from './language-switcher';

export default function LocalizedHeader() {
  const { lang } = useParams() as { lang: string };
  const pathname = usePathname();
  
  // Determine if we're on the dashboard
  const isDashboard = pathname.includes('/dashboard');
  
  return (
    <header className="nestle-gradient p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={`/${lang}${isDashboard ? '/dashboard' : ''}`} className="flex items-center">
          <Image
            src="/nestle-logo-white.png"
            alt="Nestlé Logo"
            width={120}
            height={36}
          />
        </Link>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton
            afterSignOutUrl={`/${lang}`}
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10",
              }
            }}
          />
        </div>
      </div>
    </header>
  );
} 