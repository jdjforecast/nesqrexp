'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, 
  PackageOpen, 
  Users, 
  ShoppingBag 
} from 'lucide-react';
import { 
  getUserCount, 
  getProductCount, 
  getOrderCount 
} from '@/lib/supabase';

interface AdminDashboardProps {
  params: {
    lang: string;
  };
  dictionary?: {
    admin?: {
      dashboard?: {
        title?: string;
        overview?: string;
        totalUsers?: string;
        totalProducts?: string;
        totalOrders?: string;
        recentActivity?: string;
      };
    };
  };
}

export default function AdminDashboardPage({ params, dictionary }: AdminDashboardProps) {
  const { lang } = params;
  const [userCount, setUserCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Traducciones con valores por defecto
  const translations = {
    title: dictionary?.admin?.dashboard?.title || 'Panel de Administración',
    overview: dictionary?.admin?.dashboard?.overview || 'Resumen General',
    totalUsers: dictionary?.admin?.dashboard?.totalUsers || 'Usuarios Totales',
    totalProducts: dictionary?.admin?.dashboard?.totalProducts || 'Productos Totales',
    totalOrders: dictionary?.admin?.dashboard?.totalOrders || 'Órdenes Totales',
    recentActivity: dictionary?.admin?.dashboard?.recentActivity || 'Actividad Reciente'
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Cargar datos para el dashboard
        const [users, products, orders] = await Promise.all([
          getUserCount(),
          getProductCount(),
          getOrderCount()
        ]);
        
        setUserCount(users);
        setProductCount(products);
        setOrderCount(orders);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Tarjetas de estadísticas
  const statsCards = [
    {
      title: translations.totalUsers,
      value: userCount,
      icon: <Users className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-50'
    },
    {
      title: translations.totalProducts,
      value: productCount,
      icon: <PackageOpen className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50'
    },
    {
      title: translations.totalOrders,
      value: orderCount,
      icon: <ShoppingBag className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-50'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{translations.title}</h1>
      
      <h2 className="text-xl font-semibold mb-4">{translations.overview}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
                <div className={`p-4 rounded-full ${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Estadísticas de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Las estadísticas de uso estarán disponibles pronto</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{translations.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No hay actividad reciente para mostrar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 