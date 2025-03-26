'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { getDictionary } from '@/lib/dictionaries';
import { getReceipt } from '@/lib/supabase';
import { ReceiptType } from '@/lib/schema';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ReceiptIcon, ArrowLeft, Printer, CalendarIcon, ClockIcon, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useReactToPrint } from 'react-to-print';

interface ReceiptDetailPageProps {
  params: {
    lang: string;
    id: string;
  };
}

export default function ReceiptDetailPage({ params: { lang, id } }: ReceiptDetailPageProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [receipt, setReceipt] = useState<ReceiptType | null>(null);
  const [loading, setLoading] = useState(true);
  const [dictionary, setDictionary] = useState<any>({});
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Receipt-${receipt?.order_number || id}`,
    onAfterPrint: () => {
      toast({
        title: dictionary.receipt?.printSuccess || "Éxito",
        description: dictionary.receipt?.printed || "Recibo impreso correctamente"
      });
    }
  });

  // Load dictionary based on language
  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(lang);
      setDictionary(dict);
    };
    loadDictionary();
  }, [lang]);

  // Load receipt
  useEffect(() => {
    const loadReceipt = async () => {
      if (!isLoaded) return;
      
      try {
        setLoading(true);
        const fetchedReceipt = await getReceipt(id);
        
        if (fetchedReceipt && typeof fetchedReceipt === 'object') {
          setReceipt(fetchedReceipt as ReceiptType);
        } else {
          toast({
            title: dictionary.receipt?.error || "Error",
            description: dictionary.receipt?.loadError || "No se pudo cargar el recibo",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading receipt:', error);
        toast({
          title: dictionary.receipt?.error || "Error",
          description: dictionary.receipt?.loadError || "No se pudo cargar el recibo",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [isLoaded, id, dictionary, toast]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm:ss');
    } catch (e) {
      return '';
    }
  };

  if (!isLoaded || loading) {
    return <ReceiptDetailSkeleton />;
  }

  if (!isSignedIn) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.receipt?.title || "Detalle de Compra"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {dictionary.receipt?.signInRequired || "Inicia sesión para ver los detalles de tu compra"}
            </p>
            <Link href={`/${lang}/sign-in`} passHref>
              <Button>{dictionary.common?.signIn || "Iniciar sesión"}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/${lang}/receipts`} passHref>
            <Button variant="ghost" className="px-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {dictionary.common?.back || "Volver"}
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <ReceiptIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-lg mb-2">
              {dictionary.receipt?.notFound || "Recibo no encontrado"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {dictionary.receipt?.notFoundSub || "El recibo que buscas no existe o no tienes acceso a él"}
            </p>
            <Link href={`/${lang}/receipts`} passHref>
              <Button variant="outline">
                {dictionary.common?.backToReceipts || "Volver a mis compras"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href={`/${lang}/receipts`} passHref>
          <Button variant="ghost" className="px-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {dictionary.common?.back || "Volver"}
          </Button>
        </Link>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          {dictionary.receipt?.print || "Imprimir"}
        </Button>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center">
          <ReceiptIcon className="h-6 w-6 mr-2" />
          {dictionary.receipt?.title || "Detalle de Compra"}
        </h1>
        <p className="text-muted-foreground">
          {dictionary.receipt?.order || "Pedido"} #{receipt.order_number}
        </p>
      </div>

      <div ref={printRef} className="print:p-4">
        {/* Logo and header for printing */}
        <div className="hidden print:block mb-6 text-center">
          <div className="font-bold text-xl mb-1">Nestlé Experience</div>
          <div className="text-sm text-muted-foreground mb-4">
            {dictionary.receipt?.receiptTitle || "Recibo de Compra"}
          </div>
        </div>

        <Card className="mb-4 print:shadow-none print:border-none">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm">
                <div className="flex items-center text-muted-foreground mb-1">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {formatDate(receipt.created_at)}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {formatTime(receipt.created_at)}
                </div>
              </div>
              
              <div className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                {dictionary.receipt?.completed || "Completado"}
              </div>
            </div>
            
            <div className="border-t pt-4 mt-2">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">
                {dictionary.receipt?.customerInfo || "Información del Cliente"}
              </h3>
              <div className="font-medium">{user?.fullName || user?.emailAddresses[0].emailAddress}</div>
              <div className="text-sm text-muted-foreground">{user?.emailAddresses[0].emailAddress}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4 print:shadow-none print:border-none">
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center">
              <Package className="h-4 w-4 mr-2" />
              {dictionary.receipt?.items || "Productos"} ({receipt.items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {receipt.items && receipt.items.map((item, index) => (
                <div key={index} className="p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {item.image_url && (
                      <div className="h-12 w-12 relative rounded-md overflow-hidden">
                        <Image 
                          src={item.image_url}
                          alt={item.name || 'Product'}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                    </div>
                  </div>
                  
                  <div className="font-medium text-right">
                    {item.coin_value} {dictionary.common?.coins || "monedas"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-none">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-lg font-bold pt-2">
              <span>{dictionary.receipt?.total || "Total"}</span>
              <span>{receipt.total_coins} {dictionary.common?.coins || "monedas"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer for printing */}
        <div className="hidden print:block mt-8 text-center text-sm text-muted-foreground">
          <p>{dictionary.receipt?.thankYou || "¡Gracias por tu compra!"}</p>
          <p>{dictionary.receipt?.visitAgain || "Te esperamos pronto en Nestlé Experience"}</p>
        </div>
      </div>
    </div>
  );
}

function ReceiptDetailSkeleton() {
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <Skeleton className="h-10 w-20" />
      </div>

      <div className="mb-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          
          <Skeleton className="h-1 w-full mt-4 mb-4" />
          
          <Skeleton className="h-4 w-36 mb-3" />
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="pb-0">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="py-2">
          {[1, 2].map((i) => (
            <div key={i} className="py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-md" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 