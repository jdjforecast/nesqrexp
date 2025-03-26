import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES, enUS } from "@clerk/localizations";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add Clerk custom configuration for localization
const clerkLocales = {
  es: esES,
  en: enUS
};

export const metadata: Metadata = {
  title: "Nestlé QR Experience",
  description: "Escanea códigos QR para productos Nestlé y gana recompensas",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { lang?: string };
}) {
  // Default to Spanish if no language is specified
  const lang = params?.lang || "es";
  const localization = lang === "en" ? clerkLocales.en : clerkLocales.es;

  return (
    <ClerkProvider 
      localization={localization} 
      appearance={{
        variables: {
          colorPrimary: '#3b82f6',
        },
        elements: {
          formButtonPrimary: "btn-primary",
          card: "shadow-lg border-0",
          headerTitle: "text-2xl font-bold text-primary",
          headerSubtitle: "text-muted-foreground",
        }
      }}
    >
      <html lang={lang} className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="min-h-screen bg-background font-sans antialiased">
          <div className="flex flex-col min-h-screen">
            {children}
            <Toaster />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
