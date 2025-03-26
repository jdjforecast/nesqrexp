'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { FileDown, Coins, Package, Receipt } from 'lucide-react';

interface ReportsPageProps {
  params: {
    lang: string;
  };
  dictionary?: {
    admin?: {
      reports?: {
        title?: string;
        overview?: string;
        usageChart?: string;
        productDistribution?: string;
        exportData?: string;
        exportCSV?: string;
        exportPDF?: string;
        loadingData?: string;
        today?: string;
        week?: string;
        month?: string;
        year?: string;
        products?: string;
        users?: string;
        purchases?: string;
        coins?: string;
        productsByCategory?: string;
        userActivity?: string;
        topProducts?: string;
      };
    };
  };
}

// Datos de ejemplo para los gráficos
// En producción, estos datos deberían venir de la API
const demoActivityData = [
  { name: 'Lun', users: 12, products: 5 },
  { name: 'Mar', users: 19, products: 8 },
  { name: 'Mie', users: 15, products: 10 },
  { name: 'Jue', users: 25, products: 12 },
  { name: 'Vie', users: 32, products: 15 },
  { name: 'Sab', users: 18, products: 7 },
  { name: 'Dom', users: 10, products: 4 },
];

const demoProductData = [
  { name: 'Cafés', value: 35 },
  { name: 'Chocolates', value: 40 },
  { name: 'Cereales', value: 15 },
  { name: 'Lácteos', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsPage({ params, dictionary }: ReportsPageProps) {
  const { lang } = params;
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    purchases: 0,
    coins: 0
  });

  // Traducciones con valores por defecto
  const translations = {
    title: dictionary?.admin?.reports?.title || 'Reportes y Estadísticas',
    overview: dictionary?.admin?.reports?.overview || 'Resumen',
    usageChart: dictionary?.admin?.reports?.usageChart || 'Actividad de Usuarios',
    productDistribution: dictionary?.admin?.reports?.productDistribution || 'Distribución de Productos',
    exportData: dictionary?.admin?.reports?.exportData || 'Exportar Datos',
    exportCSV: dictionary?.admin?.reports?.exportCSV || 'Exportar CSV',
    exportPDF: dictionary?.admin?.reports?.exportPDF || 'Exportar PDF',
    loadingData: dictionary?.admin?.reports?.loadingData || 'Cargando datos...',
    today: dictionary?.admin?.reports?.today || 'Hoy',
    week: dictionary?.admin?.reports?.week || 'Semana',
    month: dictionary?.admin?.reports?.month || 'Mes',
    year: dictionary?.admin?.reports?.year || 'Año',
    products: dictionary?.admin?.reports?.products || 'Productos',
    users: dictionary?.admin?.reports?.users || 'Usuarios',
    purchases: dictionary?.admin?.reports?.purchases || 'Compras',
    coins: dictionary?.admin?.reports?.coins || 'Monedas',
    productsByCategory: dictionary?.admin?.reports?.productsByCategory || 'Productos por Categoría',
    userActivity: dictionary?.admin?.reports?.userActivity || 'Actividad de Usuarios',
    topProducts: dictionary?.admin?.reports?.topProducts || 'Productos Populares'
  };

  // Simular carga de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Aquí normalmente cargaríamos datos reales
        // Simulamos una carga con un tiempo de espera
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setStats({
          users: 145,
          products: 87,
          purchases: 63,
          coins: 2350
        });
      } catch (error) {
        console.error('Error al cargar datos de reportes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);
  
  // Función para exportar datos (ejemplo)
  const handleExport = (format: 'csv' | 'pdf') => {
    // Implementación real enviaría una solicitud al servidor para generar el archivo
    alert(`Exportando datos en formato ${format.toUpperCase()}...`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{translations.title}</h1>
      
      <div className="mb-6">
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">{translations.overview}</TabsTrigger>
            <TabsTrigger value="products">{translations.products}</TabsTrigger>
            <TabsTrigger value="users">{translations.users}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {translations.users}
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.users}</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {translations.products}
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.products}</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {translations.purchases}
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.purchases}</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {translations.coins}
                  </CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{stats.coins}</div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>{translations.usageChart}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant={timeRange === 'today' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setTimeRange('today')}
                    >
                      {translations.today}
                    </Button>
                    <Button 
                      variant={timeRange === 'week' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setTimeRange('week')}
                    >
                      {translations.week}
                    </Button>
                    <Button 
                      variant={timeRange === 'month' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setTimeRange('month')}
                    >
                      {translations.month}
                    </Button>
                    <Button 
                      variant={timeRange === 'year' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setTimeRange('year')}
                    >
                      {translations.year}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="w-full aspect-[4/3]">
                      <Skeleton className="w-full h-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={demoActivityData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="users" fill="#8884d8" name={translations.users} />
                        <Bar dataKey="products" fill="#82ca9d" name={translations.products} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>{translations.productDistribution}</CardTitle>
                  <CardDescription>
                    {translations.productsByCategory}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="w-full aspect-[4/3]">
                      <Skeleton className="w-full h-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={demoProductData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {demoProductData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{translations.exportData}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleExport('csv')}
                    className="flex items-center"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    {translations.exportCSV}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleExport('pdf')}
                    className="flex items-center"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    {translations.exportPDF}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>{translations.topProducts}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-muted-foreground">
                  Contenido de reportes de productos en desarrollo...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{translations.userActivity}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-muted-foreground">
                  Contenido de reportes de usuarios en desarrollo...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 