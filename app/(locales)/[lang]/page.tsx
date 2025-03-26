import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDictionary } from '@/lib/i18n/dictionaries';
import LanguageSwitcher from '@/components/language-switcher';

export default async function HomePage({ params: { lang } }: { params: { lang: string } }) {
  const dict = await getDictionary(lang);
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="nestle-gradient p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={`/${lang}`} className="flex items-center">
            <Image
              src="/nestle-logo-white.png"
              alt="Nestlé Logo"
              width={120}
              height={36}
            />
          </Link>
          
          <LanguageSwitcher />
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <Image
            src="/nestle-logo.png"
            alt="Nestlé Logo"
            width={250}
            height={75}
            className="mx-auto mb-8"
          />
          
          <h1 className="text-3xl font-bold mb-2">{dict.homepage.title as string}</h1>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-muted-foreground">
            {dict.homepage.subtitle as string}
          </p>
          
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <Button size="lg" className="w-full" asChild>
              <Link href={`/${lang}/register`}>{dict.homepage.register as string}</Link>
            </Button>
            
            <Link href={`/${lang}/login`} className="text-sm text-muted-foreground hover:text-primary">
              {dict.homepage.loginPrompt as string}
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 p-6">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Nestlé. {dict.footer.allRightsReserved as string}</p>
        </div>
      </footer>
    </div>
  );
} 