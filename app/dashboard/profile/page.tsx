'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !user) return;

      try {
        setLoading(true);
        
        // Get user info from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }
        
        if (data) {
          setUserData(data);
          setName(data.name || '');
          setCompany(data.company || '');
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!name || !company) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Update user data in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          name,
          company,
        })
        .eq('id', user.id);
        
      if (error) {
        throw new Error('Error al actualizar el perfil.');
      }
      
      setSuccess('Perfil actualizado correctamente.');
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Error al actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    router.push('/');
  };

  if (!isLoaded || loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-primary">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={saving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                value={user?.primaryEmailAddress?.emailAddress || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                El correo electrónico no se puede cambiar.
              </p>
            </div>
            
            {error && (
              <div className="bg-destructive/10 text-destructive p-2 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm">
                {success}
              </div>
            )}
            
            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Mi cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Nestle Coins</h3>
                <p className="text-sm text-muted-foreground">
                  Has acumulado {userData?.coins || 0} coins
                </p>
              </div>
              <span className="nestle-coin px-3 py-1 rounded-full text-lg">
                {userData?.coins || 0}
              </span>
            </div>
            
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 