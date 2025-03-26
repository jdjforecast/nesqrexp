'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Pencil, 
  Eye, 
  Coins 
} from 'lucide-react';
import { 
  getUsers, 
  User, 
  updateUserCoins
} from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

interface UsersPageProps {
  params: {
    lang: string;
  };
  dictionary?: {
    admin?: {
      users?: {
        title?: string;
        search?: string;
        name?: string;
        company?: string;
        coins?: string;
        email?: string;
        joinDate?: string;
        actions?: string;
        viewProfile?: string;
        editCoins?: string;
        save?: string;
        cancel?: string;
        updateCoins?: string;
        currentCoins?: string;
        newCoins?: string;
        loadingUsers?: string;
        noUsers?: string;
        userDetails?: string;
      };
    };
  };
}

export default function UsersPage({ params, dictionary }: UsersPageProps) {
  const { lang } = params;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCoinsDialogOpen, setIsCoinsDialogOpen] = useState(false);
  const [newCoinsValue, setNewCoinsValue] = useState<number>(0);
  const [updatingCoins, setUpdatingCoins] = useState(false);

  // Traducciones con valores por defecto
  const translations = {
    title: dictionary?.admin?.users?.title || 'Gestión de Usuarios',
    search: dictionary?.admin?.users?.search || 'Buscar usuarios...',
    name: dictionary?.admin?.users?.name || 'Nombre',
    company: dictionary?.admin?.users?.company || 'Empresa',
    coins: dictionary?.admin?.users?.coins || 'Monedas',
    email: dictionary?.admin?.users?.email || 'Email',
    joinDate: dictionary?.admin?.users?.joinDate || 'Fecha de registro',
    actions: dictionary?.admin?.users?.actions || 'Acciones',
    viewProfile: dictionary?.admin?.users?.viewProfile || 'Ver Perfil',
    editCoins: dictionary?.admin?.users?.editCoins || 'Editar Monedas',
    save: dictionary?.admin?.users?.save || 'Guardar',
    cancel: dictionary?.admin?.users?.cancel || 'Cancelar',
    updateCoins: dictionary?.admin?.users?.updateCoins || 'Actualizar Monedas',
    currentCoins: dictionary?.admin?.users?.currentCoins || 'Monedas Actuales',
    newCoins: dictionary?.admin?.users?.newCoins || 'Nuevas Monedas',
    loadingUsers: dictionary?.admin?.users?.loadingUsers || 'Cargando usuarios...',
    noUsers: dictionary?.admin?.users?.noUsers || 'No hay usuarios para mostrar',
    userDetails: dictionary?.admin?.users?.userDetails || 'Detalles del Usuario'
  };

  // Cargar usuarios al iniciar
  useEffect(() => {
    loadUsers();
  }, []);

  // Función para cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ver detalles de usuario
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  };

  // Editar monedas de usuario
  const handleEditCoins = (user: User) => {
    setSelectedUser(user);
    setNewCoinsValue(user.coins);
    setIsCoinsDialogOpen(true);
  };

  // Actualizar monedas de usuario
  const handleUpdateCoins = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdatingCoins(true);
      const success = await updateUserCoins(selectedUser.id, newCoinsValue);
      
      if (success) {
        // Actualizar usuario en el estado
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id 
              ? { ...user, coins: newCoinsValue } 
              : user
          )
        );
        setIsCoinsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error al actualizar monedas:', error);
    } finally {
      setUpdatingCoins(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{translations.title}</h1>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder={translations.search}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{translations.noUsers}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>{translations.name}</TableHead>
                  <TableHead>{translations.company}</TableHead>
                  <TableHead>{translations.coins}</TableHead>
                  <TableHead className="hidden md:table-cell">{translations.joinDate}</TableHead>
                  <TableHead className="text-right">{translations.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.profile_image_url && (
                        <div className="h-10 w-10 relative rounded-full overflow-hidden">
                          <Image
                            src={user.profile_image_url}
                            alt={user.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.company}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                        {user.coins}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetails(user)}
                          title={translations.viewProfile}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditCoins(user)}
                          title={translations.editCoins}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Diálogo para ver detalles de usuario */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{translations.userDetails}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center mb-6">
                {selectedUser.profile_image_url ? (
                  <div className="h-20 w-20 relative rounded-full overflow-hidden mr-4">
                    <Image
                      src={selectedUser.profile_image_url}
                      alt={selectedUser.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl text-gray-500">
                      {selectedUser.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.company}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 py-2 border-b">
                  <span className="text-gray-500">{translations.coins}</span>
                  <span className="col-span-2 font-medium flex items-center">
                    <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                    {selectedUser.coins}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 py-2 border-b">
                  <span className="text-gray-500">{translations.joinDate}</span>
                  <span className="col-span-2 font-medium">
                    {formatDate(selectedUser.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              {translations.cancel}
            </Button>
            <Button 
              onClick={() => {
                setIsDetailsDialogOpen(false);
                setIsCoinsDialogOpen(true);
              }}
            >
              {translations.editCoins}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar monedas de usuario */}
      <Dialog open={isCoinsDialogOpen} onOpenChange={setIsCoinsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{translations.updateCoins}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center mb-4">
                <span className="font-medium">{selectedUser.name}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <Label>{translations.currentCoins}</Label>
                  <span className="font-medium flex items-center">
                    <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                    {selectedUser.coins}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newCoins">{translations.newCoins}</Label>
                  <Input
                    id="newCoins"
                    type="number"
                    value={newCoinsValue}
                    onChange={(e) => setNewCoinsValue(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCoinsDialogOpen(false)}
            >
              {translations.cancel}
            </Button>
            <Button 
              onClick={handleUpdateCoins}
              disabled={updatingCoins}
            >
              {updatingCoins ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
              ) : (
                translations.save
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 