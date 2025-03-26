'use client';

import { useState, useEffect } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface RegistrationFormProps {
  lang?: string;
}

export function RegistrationForm({ lang = 'es' }: RegistrationFormProps) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Verificar si Clerk está cargado al montar el componente
  useEffect(() => {
    if (isLoaded) {
      console.log('Clerk loaded successfully');
    }
  }, [isLoaded]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      console.log('Clerk is not loaded');
      toast({
        title: "Error",
        description: "El sistema de autenticación no está listo. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
      return;
    }

    if (!name || !email || !company || !password) {
      setError('Por favor completa todos los campos obligatorios.');
      console.log('Missing required fields:', { name: !!name, email: !!email, company: !!company, password: !!password });
      return;
    }

    // Validar contraseña
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Starting sign-up process with Clerk');
      toast({
        title: "Procesando",
        description: "Creando tu cuenta...",
      });

      // Start the sign-up process with Clerk
      const clerkResult = await signUp.create({
        emailAddress: email,
        password,
        firstName: name,
      });

      console.log('Clerk sign-up result:', JSON.stringify({
        status: clerkResult.status,
        createdUserId: clerkResult.createdUserId || 'none',
        createdSessionId: clerkResult.createdSessionId || 'none',
      }));

      if (!clerkResult.createdUserId) {
        throw new Error('No se pudo crear la cuenta. Inténtalo de nuevo.');
      }

      // Prepare email verification regardless of session status
      console.log('Preparing email verification');
      await clerkResult.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      console.log('Email verification prepared successfully');

      console.log('Creating user in Supabase with ID:', clerkResult.createdUserId);
      let profileImageUrl = null;

      // Upload profile image to Supabase Storage if provided
      if (profileImage) {
        try {
          const fileName = `profile-${Date.now()}-${profileImage.name}`;
          console.log('Uploading profile image:', fileName);
          
          const { data, error } = await supabase.storage
            .from('profiles')
            .upload(fileName, profileImage);
            
          if (error) {
            console.error('Error uploading profile image:', error);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('profiles')
              .getPublicUrl(fileName);
              
            profileImageUrl = publicUrlData.publicUrl;
            console.log('Profile image uploaded successfully:', profileImageUrl);
          }
        } catch (uploadError) {
          console.error('Error in image upload process:', uploadError);
        }
      }

      // Create user in Supabase
      console.log('Creating user record in Supabase');
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: clerkResult.createdUserId,
            name,
            company,
            email,
            profile_image_url: profileImageUrl,
            coins: 150,
            role: 'user',
          }
        ]);

      if (userError) {
        console.error('Error creating user profile in Supabase:', userError);
        throw new Error('Error al crear el perfil de usuario. Por favor, inténtalo de nuevo.');
      }

      console.log('User profile created successfully');
      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada. Ahora debes verificar tu correo electrónico.",
      });

      // Redirect to verification page
      router.push(`/${lang}/verification`);
    } catch (err: any) {
      console.error('Error during registration:', err);
      
      // Extract meaningful error message
      let errorMessage = 'Error al registrarse. Por favor, intenta de nuevo.';
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
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">REGÍSTRATE</CardTitle>
        <CardDescription>
          Crea tu cuenta para participar en la experiencia Nestlé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div 
              className="w-24 h-24 rounded-full bg-primary/10 overflow-hidden relative border-2 border-primary flex items-center justify-center mb-2 cursor-pointer"
              onClick={() => document.getElementById('profile-upload')?.click()}
            >
              {profileImagePreview ? (
                <Image 
                  src={profileImagePreview} 
                  alt="Profile preview" 
                  fill 
                  className="object-cover"
                />
              ) : (
                <span className="text-primary text-xs text-center">
                  FOTO DE PERFIL
                </span>
              )}
            </div>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
            <span className="text-xs text-muted-foreground">
              Toca para subir una foto
            </span>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Empresa"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Add the clerk-captcha element inside the form */}
          <div id="clerk-captcha" className="mt-4"></div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full btn-primary"
        >
          {isLoading ? 'Procesando...' : 'Continuar'}
        </Button>
      </CardFooter>
    </Card>
  );
} 