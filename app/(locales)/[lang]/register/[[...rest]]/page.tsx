import Image from "next/image";
import Link from "next/link";
import { RegistrationForm } from "@/components/registration-form";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface RegisterPageProps {
  params: {
    lang: string;
    rest?: string[];
  };
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  
  const authDict = {
    login: dictionary.auth?.login || "Iniciar sesión",
    signIn: dictionary.auth?.signIn || "Iniciar Sesión"
  };

  const footerText = dictionary.footer?.allRightsReserved || "Todos los derechos reservados";

  // Paths with concat to avoid type issues
  const homePath = "/" + lang;
  const signInPath = "/" + lang + "/sign-in";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="nestle-gradient p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={homePath} className="flex items-center">
            <Image
              src="/nestle-logo-white.png"
              alt="Nestlé Logo"
              width={100}
              height={30}
              className="mr-2"
            />
          </Link>
          
          <Link 
            href={signInPath}
            className="text-white hover:text-white/80 text-sm font-medium"
          >
            {authDict.signIn}
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <RegistrationForm lang={lang} />
          
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