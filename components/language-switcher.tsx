'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Define supported locales directly here instead of importing from middleware
const locales = ['es', 'en'];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const { lang } = useParams() as { lang: string };
  
  // Function to generate the path for the target language
  const getLocalizedPath = (targetLocale: string) => {
    const segments = pathname.split('/');
    
    // Replace the language segment
    segments[1] = targetLocale;
    
    return segments.join('/');
  };
  
  return (
    <div className="flex items-center gap-2">
      {locales.map((locale) => (
        <Button
          key={locale}
          variant={locale === lang ? 'default' : 'outline'}
          size="sm"
          className={locale === lang ? 'pointer-events-none' : ''}
          asChild={locale !== lang}
        >
          {locale !== lang ? (
            <Link href={getLocalizedPath(locale)}>
              {locale.toUpperCase()}
            </Link>
          ) : (
            <span>{locale.toUpperCase()}</span>
          )}
        </Button>
      ))}
    </div>
  );
} 