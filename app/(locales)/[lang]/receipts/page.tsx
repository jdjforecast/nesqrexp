'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getDictionary } from '@/lib/dictionaries';
import { getUserReceipts } from '@/lib/supabase';
import { ReceiptType } from '@/lib/schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ReceiptIcon, ArrowLeft, ChevronRight, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ReceiptsPageProps {
  params: {
    lang: string;
  };
}

export default function ReceiptsPage({ params: { lang } }: ReceiptsPageProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dictionary, setDictionary] = useState<any>({});
  const { toast } = useToast();

  // Load dictionary based on language
  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(lang);
      setDictionary(dict);
    };
    loadDictionary();
  }, [lang]);

  // Load user receipts
  useEffect(() => {
    const loadReceipts = async () => {
      if (!isLoaded || !isSignedIn) return;
      
      try {
        setLoading(true);
        const fetchedReceipts = await getUserReceipts(user.id);
        
        if (Array.isArray(fetchedReceipts)) {
          // Sort receipts by created_at date (newest first)
          const sortedReceipts = fetchedReceipts.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          setReceipts(sortedReceipts);
        } else {
          toast({
            title: dictionary.receipts?.error || "Error",
            description: dictionary.receipts?.loadError || "No se pudieron cargar los recibos",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading receipts:', error);
        toast({
          title: dictionary.receipts?.error || "Error",
          description: dictionary.receipts?.loadError || "No se pudieron cargar los recibos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadReceipts();
  }, [isLoaded, isSignedIn, user, dictionary, toast]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  if (!isLoaded) {
    return <ReceiptsPageSkeleton />;
  }

  if (!isSignedIn) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.receipts?.title || "Mis Compras"}</CardTitle>
            <CardDescription>
              {dictionary.receipts?.signInRequired || "Inicia sesión para ver tu historial de compras"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${lang}/sign-in`} passHref>
              <Button>{dictionary.common?.signIn || "Iniciar sesión"}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/${lang}`} passHref>
          <Button variant="ghost" className="px-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {dictionary.common?.back || "Volver"}
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <ReceiptIcon className="h-6 w-6 mr-2" />
        {dictionary.receipts?.title || "Mis Compras"}
      </h1>

      {loading ? (
        <ReceiptsPageSkeleton />
      ) : receipts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <ReceiptIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-lg mb-2">
              {dictionary.receipts?.empty || "No tienes compras recientes"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {dictionary.receipts?.emptySub || "Tus compras aparecerán aquí una vez que realices una"}
            </p>
            <Link href={`/${lang}/scan`} passHref>
              <Button variant="outline">
                {dictionary.receipts?.startShopping || "Empezar a comprar"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <Link key={receipt.id} href={`/${lang}/receipt/${receipt.id}`} passHref>
              <Card className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {dictionary.receipts?.order || "Pedido"} #{receipt.order_number}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(receipt.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3 text-right">
                        <div className="font-medium text-yellow-800">
                          {receipt.total_coins} {dictionary.common?.coins || "monedas"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {receipt.items?.length || 0} {(receipt.items?.length || 0) === 1 
                            ? (dictionary.receipts?.item || "producto") 
                            : (dictionary.receipts?.items || "productos")}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ReceiptsPageSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center">
                <div className="mr-3 text-right space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 