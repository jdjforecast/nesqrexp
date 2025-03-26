import { SiteHeader } from "@/components/site-header"
import { auth } from "@clerk/nextjs/server"
import "../../app/globals.css"

interface LocaleLayoutProps {
  children: React.ReactNode
  lang: string
  dict: any // TODO: Definir tipo específico para el diccionario
}

export async function LocaleLayout({ children, lang, dict }: LocaleLayoutProps) {
  const { userId } = await auth()
  
  // Ensure navigation dictionary exists
  const dictionaryWithNav = {
    ...dict,
    navigation: dict.navigation || {
      home: lang === 'es' ? "Inicio" : "Home",
      products: lang === 'es' ? "Productos" : "Products",
      cart: lang === 'es' ? "Carrito" : "Cart",
      orders: lang === 'es' ? "Pedidos" : "Orders", 
      profile: lang === 'es' ? "Perfil" : "Profile",
      scan: lang === 'es' ? "Escanear" : "Scan",
      language: lang === 'es' ? "Idioma" : "Language"
    }
  }

  return (
    <>
      {userId && <SiteHeader dictionary={dictionaryWithNav} lang={lang} />}
      <main className="flex-1">
        {children}
      </main>
    </>
  )
} 