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

export default function VerificationPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Handle the verification code submission
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      return;
    }

    if (!verificationCode) {
      setError('Por favor ingresa el código de verificación.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Attempt to verify the email address
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        // If signup is complete, set the active session
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/dashboard');
      } else {
        // If not complete, show an error message
        setError('Hubo un problema al verificar tu correo electrónico. Por favor intenta de nuevo.');
      }
    } catch (err: any) {
      console.error('Error during verification:', err);
      setError(err.errors?.[0]?.message || 'Error en la verificación. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="nestle-gradient p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
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
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleVerification}
              disabled={isSubmitting}
              className="w-full btn-primary"
            >
              {isSubmitting ? 'Verificando...' : 'Verificar'}
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Nestlé. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
} 