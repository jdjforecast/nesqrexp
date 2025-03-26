'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  DialogTrigger, 
  DialogFooter, 
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  QrCode, 
  Eye, 
  Download 
} from 'lucide-react';
import { 
  getProducts, 
  Product, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  generateQRCode
} from '@/lib/supabase';
import { truncateText } from '@/lib/utils';

interface ProductsPageProps {
  params: {
    lang: string;
  };
  dictionary?: {
    admin?: {
      products?: {
        title?: string;
        addProduct?: string;
        search?: string;
        name?: string;
        description?: string;
        price?: string;
        inventory?: string;
        coinValue?: string;
        image?: string;
        actions?: string;
        edit?: string;
        delete?: string;
        view?: string;
        generateQR?: string;
        downloadQR?: string;
        save?: string;
        cancel?: string;
        confirmDelete?: string;
        confirmDeleteMessage?: string;
        yes?: string;
        no?: string;
        loadingProducts?: string;
        noProducts?: string;
      };
    };
  };
}

export default function ProductsPage({ params, dictionary }: ProductsPageProps) {
  const { lang } = params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    inventory: 0,
    coin_value: 0,
    image_url: ''
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  // Traducciones con valores por defecto
  const translations = {
    title: dictionary?.admin?.products?.title || 'Gestión de Productos',
    addProduct: dictionary?.admin?.products?.addProduct || 'Añadir Producto',
    search: dictionary?.admin?.products?.search || 'Buscar productos...',
    name: dictionary?.admin?.products?.name || 'Nombre',
    description: dictionary?.admin?.products?.description || 'Descripción',
    price: dictionary?.admin?.products?.price || 'Precio',
    inventory: dictionary?.admin?.products?.inventory || 'Inventario',
    coinValue: dictionary?.admin?.products?.coinValue || 'Valor en Monedas',
    image: dictionary?.admin?.products?.image || 'Imagen URL',
    actions: dictionary?.admin?.products?.actions || 'Acciones',
    edit: dictionary?.admin?.products?.edit || 'Editar',
    delete: dictionary?.admin?.products?.delete || 'Eliminar',
    view: dictionary?.admin?.products?.view || 'Ver',
    generateQR: dictionary?.admin?.products?.generateQR || 'Generar QR',
    downloadQR: dictionary?.admin?.products?.downloadQR || 'Descargar QR',
    save: dictionary?.admin?.products?.save || 'Guardar',
    cancel: dictionary?.admin?.products?.cancel || 'Cancelar',
    confirmDelete: dictionary?.admin?.products?.confirmDelete || '¿Eliminar Producto?',
    confirmDeleteMessage: dictionary?.admin?.products?.confirmDeleteMessage || '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
    yes: dictionary?.admin?.products?.yes || 'Sí',
    no: dictionary?.admin?.products?.no || 'No',
    loadingProducts: dictionary?.admin?.products?.loadingProducts || 'Cargando productos...',
    noProducts: dictionary?.admin?.products?.noProducts || 'No hay productos para mostrar'
  };

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts();
  }, []);

  // Función para cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos por término de búsqueda
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar cambios en el formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'inventory' || name === 'coin_value' 
        ? Number(value) || 0 
        : value
    }));
  };

  // Preparar formulario para añadir producto
  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      inventory: 0,
      coin_value: 0,
      image_url: ''
    });
    setIsAddDialogOpen(true);
  };

  // Preparar formulario para editar producto
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      inventory: product.inventory,
      coin_value: product.coin_value,
      image_url: product.image_url
    });
    setIsEditDialogOpen(true);
  };

  // Confirmar eliminación de producto
  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Guardar nuevo producto
  const handleSaveNewProduct = async () => {
    try {
      await createProduct(formData);
      setIsAddDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error al crear producto:', error);
    }
  };

  // Actualizar producto existente
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await updateProduct(selectedProduct.id, formData);
      setIsEditDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };

  // Eliminar producto
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  // Generar código QR para un producto
  const handleGenerateQR = async (product: Product) => {
    setSelectedProduct(product);
    setGeneratingQR(true);
    setIsQRDialogOpen(true);
    
    try {
      const qrUrl = await generateQRCode(product.id);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error al generar código QR:', error);
    } finally {
      setGeneratingQR(false);
    }
  };

  // Descargar código QR
  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-product-${selectedProduct?.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{translations.title}</h1>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          {translations.addProduct}
        </Button>
      </div>
      
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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{translations.noProducts}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>{translations.name}</TableHead>
                  <TableHead className="hidden md:table-cell">{translations.description}</TableHead>
                  <TableHead>{translations.price}</TableHead>
                  <TableHead>{translations.inventory}</TableHead>
                  <TableHead>{translations.coinValue}</TableHead>
                  <TableHead className="text-right">{translations.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url && (
                        <div className="h-10 w-10 relative rounded overflow-hidden">
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs">
                      {truncateText(product.description, 50)}
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.inventory}</TableCell>
                    <TableCell>{product.coin_value}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleGenerateQR(product)}
                          title={translations.generateQR}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                          title={translations.edit}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteProduct(product)}
                          title={translations.delete}
                        >
                          <Trash2 className="h-4 w-4" />
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
      
      {/* Diálogo para añadir producto */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{translations.addProduct}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {translations.name}
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {translations.description}
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                {translations.price}
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inventory" className="text-right">
                {translations.inventory}
              </Label>
              <Input
                id="inventory"
                name="inventory"
                type="number"
                value={formData.inventory}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coin_value" className="text-right">
                {translations.coinValue}
              </Label>
              <Input
                id="coin_value"
                name="coin_value"
                type="number"
                value={formData.coin_value}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image_url" className="text-right">
                {translations.image}
              </Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {translations.cancel}
            </Button>
            <Button onClick={handleSaveNewProduct}>
              {translations.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar producto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{translations.edit}: {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name-edit" className="text-right">
                {translations.name}
              </Label>
              <Input
                id="name-edit"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description-edit" className="text-right">
                {translations.description}
              </Label>
              <Textarea
                id="description-edit"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price-edit" className="text-right">
                {translations.price}
              </Label>
              <Input
                id="price-edit"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inventory-edit" className="text-right">
                {translations.inventory}
              </Label>
              <Input
                id="inventory-edit"
                name="inventory"
                type="number"
                value={formData.inventory}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coin_value-edit" className="text-right">
                {translations.coinValue}
              </Label>
              <Input
                id="coin_value-edit"
                name="coin_value"
                type="number"
                value={formData.coin_value}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image_url-edit" className="text-right">
                {translations.image}
              </Label>
              <Input
                id="image_url-edit"
                name="image_url"
                value={formData.image_url}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {translations.cancel}
            </Button>
            <Button onClick={handleUpdateProduct}>
              {translations.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{translations.confirmDelete}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{translations.confirmDeleteMessage}</p>
            <p className="font-semibold mt-2">{selectedProduct?.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {translations.no}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {translations.yes}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para mostrar QR */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{translations.generateQR}</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center">
            {generatingQR ? (
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : qrCodeUrl ? (
              <div className="w-64 h-64 relative">
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  fill
                  sizes="256px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                <p className="text-gray-500">Error al generar QR</p>
              </div>
            )}
            <p className="mt-4 text-center font-medium">
              {selectedProduct?.name}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQRDialogOpen(false)}>
              {translations.cancel}
            </Button>
            <Button 
              onClick={handleDownloadQR}
              disabled={!qrCodeUrl || generatingQR}
            >
              <Download className="h-4 w-4 mr-2" />
              {translations.downloadQR}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 