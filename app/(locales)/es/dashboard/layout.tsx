import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const dictionary = await getDictionary('es');
  const { userId } = await auth();
  
  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/es/sign-in');
  }
  
  // Ensure navigation dictionary exists
  const dictionaryWithNav = {
    ...dictionary,
    navigation: dictionary.navigation || {
      home: "Inicio",
      products: "Productos",
      cart: "Carrito",
      orders: "Pedidos", 
      profile: "Perfil",
      scan: "Escanear",
      language: "Idioma"
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader dictionary={dictionaryWithNav} lang="es" />
      <main className="flex-1 container mx-auto py-8 px-4">
        {children}
      </main>
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
        <div className="container mx-auto">
          {dictionary.footer?.allRightsReserved || '© 2025 Nestlé. Todos los derechos reservados.'}
        </div>
      </footer>
    </div>
  );
} 