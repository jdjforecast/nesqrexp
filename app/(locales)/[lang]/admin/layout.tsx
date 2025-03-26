'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  PackageOpen, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { checkIsAdmin } from '@/lib/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  const { lang } = params;
  const { isLoaded, isSignedIn, user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        setLoading(true);
        const adminStatus = await checkIsAdmin(user.id);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          // Redirigir a usuarios no administradores
          router.push(`/${lang}`);
        }
      } catch (error) {
        console.error('Error verificando permisos de administrador:', error);
        router.push(`/${lang}`);
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [isLoaded, isSignedIn, user, lang, router]);

  // Mostrar pantalla de carga mientras se verifica el estado de administrador
  if (loading || !isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no es administrador, no mostrar nada (ya se redirigió)
  if (!isAdmin) {
    return null;
  }

  // Opciones de navegación del panel de administración
  const navItems = [
    {
      label: 'Dashboard',
      href: `/${lang}/admin`,
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />
    },
    {
      label: 'Productos',
      href: `/${lang}/admin/products`,
      icon: <PackageOpen className="h-5 w-5 mr-3" />
    },
    {
      label: 'Usuarios',
      href: `/${lang}/admin/users`,
      icon: <Users className="h-5 w-5 mr-3" />
    },
    {
      label: 'Reportes',
      href: `/${lang}/admin/reports`,
      icon: <FileSpreadsheet className="h-5 w-5 mr-3" />
    },
    {
      label: 'Configuración',
      href: `/${lang}/admin/settings`,
      icon: <Settings className="h-5 w-5 mr-3" />
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para móvil */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-5 px-2">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow-lg">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
              <h2 className="text-xl font-bold">Admin Panel</h2>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4">
                {navItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    {item.icon}
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Barra superior */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="md:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-end">
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-sm text-gray-600 mr-2">
                {user?.fullName || user?.username}
              </span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 