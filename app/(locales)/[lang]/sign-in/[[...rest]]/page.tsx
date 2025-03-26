import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface SignInPageProps {
  params: {
    lang: string;
    rest?: string[];
  };
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  
  const authDict = {
    register: dictionary.auth?.register || "REGÍSTRATE",
    signIn: dictionary.auth?.signIn || "Iniciar Sesión"
  };

  const footerText = dictionary.footer?.allRightsReserved || "Todos los derechos reservados";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="nestle-gradient p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={`/${lang}`} className="flex items-center">
            <Image
              src="/nestle-logo-white.png"
              alt="Nestlé Logo"
              width={100}
              height={30}
              className="mr-2"
            />
          </Link>
          
          <Link 
            href={`/${lang}/register`}
            className="text-white hover:text-white/80 text-sm font-medium"
          >
            {authDict.register}
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "btn-primary",
                card: "shadow-lg border-0",
                headerTitle: "text-2xl font-bold text-primary",
                headerSubtitle: "text-muted-foreground"
              },
            }}
            redirectUrl={`/${lang}/dashboard`}
            path={`/${lang}/sign-in`}
            routing="path"
            signUpUrl={`/${lang}/register`}
          />

          {/* Add the clerk-captcha element */}
          <div id="clerk-captcha" className="mt-4"></div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Nestlé. {footerText}</p>
      </footer>
    </div>
  );
} 