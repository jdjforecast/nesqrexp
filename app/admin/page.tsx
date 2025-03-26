'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Fetch products on load
  useEffect(() => {
    if (!isLoaded) return;

    const checkAdminAndFetchData = async () => {
      try {
        setLoading(true);
        
        // Verify admin status
        const adminStatus = isAdmin();
        setIsAdminUser(adminStatus);
        
        if (!adminStatus) {
          return;
        }
        
        // Fetch products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        
        setProducts(data || []);
      } catch (error) {
        console.error('Error in admin panel:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, [isLoaded, user]);

  // Redirect non-admin users
  if (isLoaded && !loading && !isAdminUser) {
    redirect('/');
  }

  if (!isLoaded || loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-primary">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">Gestiona productos y usuarios</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products.length}</div>
            <p className="text-sm text-muted-foreground">
              Total de productos registrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">
              Total de usuarios registrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Selecciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">
              Total de productos seleccionados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Productos</h2>
        <Link href="/admin/products/new">
          <Button className="btn-primary">
            Agregar Producto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Productos</CardTitle>
            <div className="w-64">
              <Input
                placeholder="Buscar productos..."
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Producto</th>
                  <th className="text-left py-3 px-4">Precio</th>
                  <th className="text-left py-3 px-4">Coins</th>
                  <th className="text-left py-3 px-4">Inventario</th>
                  <th className="text-right py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No hay productos registrados
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {product.image_url && (
                            <div className="w-10 h-10 relative rounded overflow-hidden mr-3">
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {product.id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                      <td className="py-3 px-4">{product.coin_value}</td>
                      <td className="py-3 px-4">{product.inventory}</td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Opciones de Exportación</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Exportar selecciones</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Descarga un archivo CSV con las selecciones de productos de los usuarios
              </p>
              <Button variant="outline" className="w-full">
                Exportar CSV
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Exportar usuarios</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Descarga un archivo CSV con la información de los usuarios registrados
              </p>
              <Button variant="outline" className="w-full">
                Exportar CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 