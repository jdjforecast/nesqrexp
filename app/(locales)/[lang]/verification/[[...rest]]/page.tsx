'use client';

import { useEffect } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface VerificationPageProps {
  params: {
    lang: string;
    rest?: string[];
  };
}

export default function VerificationPage({ params }: VerificationPageProps) {
  const { lang } = params;
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  // Countdown para renviar el código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  // Handle the verification code submission
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      toast({
        title: "Error",
        description: "El sistema de verificación no está listo. Por favor, intenta más tarde.",
        variant: "destructive"
      });
      return;
    }

    if (!verificationCode || verificationCode.trim().length === 0) {
      setError('Por favor ingresa el código de verificación.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      toast({
        title: "Verificando",
        description: "Estamos verificando tu código..."
      });

      // Attempt to verify the email address
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      console.log("Verification result:", completeSignUp.status);

      if (completeSignUp.status === 'complete') {
        // Si la verificación es exitosa, mostrar un mensaje de éxito
        toast({
          title: "¡Verificación exitosa!",
          description: "Tu correo ha sido verificado. Redirigiendo al dashboard..."
        });
        
        // If signup is complete, set the active session
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Redirigir al dashboard después de un breve retraso
        setTimeout(() => {
          window.location.href = `/${lang}/dashboard`;
        }, 1500);
      } else {
        // Si no se completó, mostrar error
        toast({
          title: "Error de verificación",
          description: "No pudimos verificar tu código. Por favor, revisa e intenta nuevamente.",
          variant: "destructive"
        });
        setError('Verificación incompleta. Revisa el código e intenta nuevamente.');
      }
    } catch (err: any) {
      console.error('Error during verification:', err);
      
      // Extraer mensaje de error significativo
      let errorMessage = 'Error en la verificación. Inténtalo de nuevo.';
      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para reenviar el código
  const handleResendCode = async () => {
    if (!isLoaded || resendDisabled) return;
    
    try {
      setResendDisabled(true);
      setCountdown(60); // 60 segundos antes de poder reenviar
      
      toast({
        title: "Reenviando código",
        description: "Estamos enviando un nuevo código a tu correo..."
      });
      
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      
      toast({
        title: "Código enviado",
        description: "Hemos enviado un nuevo código a tu correo electrónico"
      });
    } catch (err: any) {
      console.error('Error resending code:', err);
      
      toast({
        title: "Error",
        description: "No pudimos reenviar el código. Intenta más tarde.",
        variant: "destructive"
      });
    }
  };

  // Create links to avoid template literal type issues
  const homeLink = "/" + lang;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="nestle-gradient p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={homeLink} className="flex items-center">
            <Image
              src="/nestle-logo-white.png"
              alt="Nestlé Logo"
              width={100}
              height={30}
              className="mr-2"
            />
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Verificación de correo</CardTitle>
              <CardDescription>
                Hemos enviado un código de verificación a tu correo electrónico.
                Por favor, ingrésalo a continuación para verificar tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de verificación</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Ingresa el código"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive p-2 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : 'Verificar'}
                </Button>
                
                <div className="text-center mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="text-sm" 
                    onClick={handleResendCode}
                    disabled={resendDisabled}
                  >
                    {resendDisabled 
                      ? `Reenviar código (${countdown}s)` 
                      : 'No recibiste el código? Reenviar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Add the clerk-captcha element */}
          <div id="clerk-captcha" className="mt-4"></div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Nestlé. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
} 