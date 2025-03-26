import { createClient } from '@supabase/supabase-js';
import { validateProduct, validateProducts, validateCartItems, validateUser } from './schema';

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database tables
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  qr_code_url: string;
  created_at: string;
  inventory: number;
  coin_value: number;
};

/**
 * Tipo que representa a un usuario en la base de datos
 */
export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  coins: number;
  is_admin: boolean;
  profile_image_url: string | null;
  created_at: string;
}

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
};

// Error handling wrapper for Supabase operations
async function handleDatabaseError<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string
): Promise<T | null> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      console.error(`${errorMessage}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Unexpected error in ${errorMessage}:`, error);
    return null;
  }
}

// Database helper functions
export async function getProducts(): Promise<Product[]> {
  const result = await supabase
    .from('products')
    .select('*')
    .order('name');
    
  if (result.error) {
    console.error('Error fetching products:', result.error);
    return [];
  }
  
  try {
    return validateProducts(result.data || []);
  } catch (error) {
    console.error('Error validating products:', error);
    return [];
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  const result = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  if (result.error) {
    console.error('Error fetching product:', result.error);
    return null;
  }
  
  try {
    return validateProduct(result.data);
  } catch (error) {
    console.error('Error validating product:', error);
    return null;
  }
}

export async function getUserCart(userId: string): Promise<CartItem[]> {
  const result = await supabase
    .from('cart_items')
    .select('*, product:products(*)')
    .eq('user_id', userId);
    
  if (result.error) {
    console.error('Error fetching cart:', result.error);
    return [];
  }
  
  try {
    return validateCartItems(result.data || []);
  } catch (error) {
    console.error('Error validating cart items:', error);
    return [];
  }
}

export async function addToCart(userId: string, productId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Verificar si el usuario ya tiene productos en el carrito
    const { data: existingItems, error: checkError } = await supabase
      .from('cart_items')
      .select('id')
      .eq('user_id', userId);
      
    if (checkError) {
      console.error('Error checking existing cart items:', checkError);
      return { success: false, message: 'Error al verificar el carrito' };
    }
    
    // Si ya tiene productos, impedir agregar más (límite de un producto por usuario)
    if (existingItems && existingItems.length > 0) {
      return { 
        success: false, 
        message: 'Ya tienes un producto en tu carrito. Completa tu compra actual o elimina el producto existente.' 
      };
    }
    
    // Verificar si el producto existe y tiene inventario
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('inventory, coin_value')
      .eq('id', productId)
      .single();
      
    if (productError || !product) {
      console.error('Error fetching product:', productError);
      return { success: false, message: 'El producto no existe o no está disponible' };
    }
    
    // Verificar si hay inventario
    if (product.inventory <= 0) {
      return { success: false, message: 'El producto está agotado' };
    }
    
    // Verificar si el usuario tiene suficientes monedas
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return { success: false, message: 'Error al verificar tus monedas' };
    }
    
    if (userData.coins < product.coin_value) {
      return { success: false, message: 'No tienes suficientes monedas para este producto' };
    }
    
    // Agregar el producto al carrito
    const { error: insertError } = await supabase
      .from('cart_items')
      .insert([{ user_id: userId, product_id: productId }]);
      
    if (insertError) {
      console.error('Error adding to cart:', insertError);
      return { success: false, message: 'Error al agregar al carrito' };
    }
    
    // Disminuir el inventario del producto
    const { error: updateError } = await supabase
      .from('products')
      .update({ inventory: product.inventory - 1 })
      .eq('id', productId);
      
    if (updateError) {
      console.error('Error updating inventory:', updateError);
      // Aquí no devolvemos un error para no confundir al usuario,
      // ya que el producto ya se agregó al carrito, pero registramos el error
    }
    
    return { success: true, message: 'Producto agregado al carrito' };
  } catch (error) {
    console.error('Unexpected error in addToCart:', error);
    return { success: false, message: 'Error inesperado al añadir al carrito' };
  }
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  return handleDatabaseError(
    async () => supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId),
    'Error removing item from cart'
  ).then(result => !!result);
}

export async function getUserCoins(userId: string): Promise<number> {
  try {
    const result = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();
      
    if (result.error) {
      console.error('Error fetching user coins:', result.error);
      return 0;
    }
    
    try {
      const user = validateUser(result.data);
      return user.coins;
    } catch (error) {
      console.error('Error validating user data:', error);
      return 0;
    }
  } catch (error) {
    console.error('Unexpected error in getUserCoins:', error);
    return 0;
  }
}

/**
 * Actualiza la cantidad de monedas de un usuario
 * @param userId - ID del usuario a actualizar
 * @param newCoinsValue - Nueva cantidad de monedas
 * @returns Boolean indicando si la operación fue exitosa
 */
export const updateUserCoins = async (userId: string, newCoinsValue: number): Promise<boolean> => {
  try {
    if (newCoinsValue < 0) {
      console.error('El valor de monedas no puede ser negativo');
      return false;
    }
    
    const { error } = await supabase
      .from('users')
      .update({ coins: newCoinsValue })
      .eq('id', userId);
    
    if (error) {
      console.error('Error al actualizar monedas del usuario:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error en updateUserCoins:', error);
    return false;
  }
};

export async function clearUserCart(userId: string): Promise<boolean> {
  return handleDatabaseError(
    async () => supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId),
    'Error clearing user cart'
  ).then(result => !!result);
}

/**
 * Verifica si un usuario tiene permisos de administrador
 * @param userId ID del usuario a verificar
 * @returns True si el usuario es administrador, false en caso contrario
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error al verificar permisos de administrador:', error);
      return false;
    }
    
    return !!data?.is_admin;
  } catch (error) {
    console.error('Error inesperado al verificar permisos de admin:', error);
    return false;
  }
}

/**
 * Obtiene el número total de usuarios registrados
 * @returns Número total de usuarios
 */
export async function getUserCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('Error al obtener el conteo de usuarios:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error inesperado al contar usuarios:', error);
    return 0;
  }
}

/**
 * Obtiene el número total de productos
 * @returns Número total de productos
 */
export async function getProductCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('Error al obtener el conteo de productos:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error inesperado al contar productos:', error);
    return 0;
  }
}

/**
 * Obtiene el número total de órdenes (recibos generados)
 * @returns Número total de órdenes
 */
export async function getOrderCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('receipts')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('Error al obtener el conteo de órdenes:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error inesperado al contar órdenes:', error);
    return 0;
  }
}

/**
 * Crea un nuevo producto en la base de datos
 * @param productData Datos del producto a crear
 * @returns El producto creado
 */
export async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'qr_code_url'>): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
      
    if (error) {
      console.error('Error al crear producto:', error);
      return null;
    }
    
    try {
      return validateProduct(data);
    } catch (validationError) {
      console.error('Error validando el producto creado:', validationError);
      return null;
    }
  } catch (error) {
    console.error('Error inesperado al crear producto:', error);
    return null;
  }
}

/**
 * Actualiza un producto existente
 * @param productId ID del producto a actualizar
 * @param productData Datos actualizados del producto
 * @returns Booleano indicando si la operación fue exitosa
 */
export async function updateProduct(
  productId: string, 
  productData: Partial<Omit<Product, 'id' | 'created_at' | 'qr_code_url'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId);
      
    if (error) {
      console.error('Error al actualizar producto:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error inesperado al actualizar producto:', error);
    return false;
  }
}

/**
 * Elimina un producto
 * @param productId ID del producto a eliminar
 * @returns Booleano indicando si la operación fue exitosa
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
      
    if (error) {
      console.error('Error al eliminar producto:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error inesperado al eliminar producto:', error);
    return false;
  }
}

/**
 * Genera un código QR para un producto
 * @param productId ID del producto
 * @returns URL del código QR generado
 */
export async function generateQRCode(productId: string): Promise<string | null> {
  try {
    // Obtener datos del producto para incluir en el QR
    const product = await getProduct(productId);
    if (!product) {
      console.error('Producto no encontrado para generar QR');
      return null;
    }
    
    // Crear contenido del QR (URL o datos estructurados)
    const qrContent = JSON.stringify({
      id: product.id,
      name: product.name,
      timestamp: new Date().toISOString()
    });
    
    // Utilizar algún servicio de generación de QR
    // Por ejemplo, QR Code Generator API, o una librería
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}`;
    
    // Opcional: guardar la URL del QR en la base de datos
    const { error } = await supabase
      .from('products')
      .update({ qr_code_url: qrApiUrl })
      .eq('id', productId);
      
    if (error) {
      console.error('Error al guardar URL del QR:', error);
    }
    
    return qrApiUrl;
  } catch (error) {
    console.error('Error al generar código QR:', error);
    return null;
  }
}

/**
 * Obtiene la lista de todos los usuarios registrados
 * @returns Lista de usuarios
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error en getUsers:', error);
    return [];
  }
};

/**
 * Procesa la compra del carrito de un usuario y genera un recibo
 * @param userId - ID del usuario que realiza la compra
 * @returns Objeto con el resultado de la operación y el recibo generado
 */
export async function processCheckout(userId: string): Promise<{
  success: boolean;
  message: string;
  receipt?: {
    id: string;
    order_number: string;
    total_coins: number;
    created_at: string;
    items: Array<{
      product_id: string;
      product_name: string;
      coin_value: number;
    }>;
  };
}> {
  // Crear una transacción de Supabase
  // Aunque Supabase no soporta transacciones como tal, podemos manejar el proceso de forma similar
  
  try {
    // 1. Obtener los items del carrito
    const cartItems = await getUserCart(userId);
    
    if (cartItems.length === 0) {
      return {
        success: false,
        message: 'El carrito está vacío'
      };
    }
    
    // 2. Verificar que el usuario tenga suficientes monedas
    const userCoins = await getUserCoins(userId);
    const totalCoins = cartItems.reduce((total, item) => total + (item.product?.coin_value || 0), 0);
    
    if (userCoins < totalCoins) {
      return {
        success: false,
        message: 'No tienes suficientes monedas para completar la compra'
      };
    }
    
    // 3. Crear el recibo
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const receiptItems = cartItems.map(item => ({
      product_id: item.product_id,
      product_name: item.product?.name || 'Producto',
      coin_value: item.product?.coin_value || 0
    }));
    
    const { data: receiptData, error: receiptError } = await supabase
      .from('receipts')
      .insert([{
        user_id: userId,
        order_number: orderNumber,
        total_coins: totalCoins,
        items: receiptItems
      }])
      .select()
      .single();
      
    if (receiptError) {
      console.error('Error creating receipt:', receiptError);
      return {
        success: false,
        message: 'Error al crear el recibo de compra'
      };
    }
    
    // 4. Actualizar las monedas del usuario
    const newCoinsValue = userCoins - totalCoins;
    const coinsUpdated = await updateUserCoins(userId, newCoinsValue);
    
    if (!coinsUpdated) {
      console.error('Error updating user coins');
      // No devolvemos error ya que el recibo ya se creó, pero registramos el error
    }
    
    // 5. Limpiar el carrito
    const cartCleared = await clearUserCart(userId);
    
    if (!cartCleared) {
      console.error('Error clearing cart');
      // No devolvemos error ya que el recibo ya se creó, pero registramos el error
    }
    
    return {
      success: true,
      message: 'Compra procesada correctamente',
      receipt: receiptData
    };
    
  } catch (error) {
    console.error('Error during checkout process:', error);
    return {
      success: false,
      message: 'Error al procesar la compra'
    };
  }
}

/**
 * Obtiene los recibos de un usuario
 * @param userId - ID del usuario
 * @returns Lista de recibos del usuario
 */
export async function getUserReceipts(userId: string) {
  return handleDatabaseError(
    async () => supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    'Error fetching user receipts'
  );
}

/**
 * Obtiene un recibo específico
 * @param receiptId - ID del recibo
 * @returns Datos del recibo
 */
export async function getReceipt(receiptId: string) {
  return handleDatabaseError(
    async () => supabase
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .single(),
    'Error fetching receipt'
  );
} 