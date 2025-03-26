import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const dictionary = await getDictionary('en');
  const { userId } = await auth();
  
  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/en/sign-in');
  }
  
  // Ensure navigation dictionary exists
  const dictionaryWithNav = {
    ...dictionary,
    navigation: dictionary.navigation || {
      home: "Home",
      products: "Products",
      cart: "Cart",
      orders: "Orders", 
      profile: "Profile",
      scan: "Scan",
      language: "Language"
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader dictionary={dictionaryWithNav} lang="en" />
      <main className="flex-1 container mx-auto py-8 px-4">
        {children}
      </main>
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
        <div className="container mx-auto">
          {dictionary.footer?.allRightsReserved || '© 2025 Nestlé. All rights reserved.'}
        </div>
      </footer>
    </div>
  );
} 