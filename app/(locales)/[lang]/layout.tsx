import { Metadata } from "next"
import { Inter } from "next/font/google"
import { getDictionary } from "@/lib/i18n/dictionaries"
import { LocaleLayout } from "@/components/locale-layout"

const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const dict = await getDictionary(lang)
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  }
}

export default async function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const dict = await getDictionary(lang)

  return (
    <html lang={lang}>
      <body className={inter.className}>
        <LocaleLayout lang={lang} dict={dict}>
          {children}
        </LocaleLayout>
      </body>
    </html>
  )
} 