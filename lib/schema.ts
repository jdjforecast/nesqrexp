import { z } from 'zod';
import { Product, User, CartItem } from './supabase';

// Esquema para productos
const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  image_url: z.string().url(),
  qr_code_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  inventory: z.number().int().nonnegative(),
  coin_value: z.number().int().positive(),
});

// Esquema para validar productos con campos opcionales para actualizaciones
export const productUpdateSchema = productSchema.partial();

// Esquema para validar usuarios
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(), // Email puede ser opcional durante la creación
  company: z.string(),
  coins: z.number().int().nonnegative().default(150),
  is_admin: z.boolean().default(false),
  profile_image_url: z.string().url().nullable(),
  created_at: z.string().datetime().optional(), // Puede ser opcional si lo asigna la DB
});

// Esquema para items del carrito
const cartItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  product_id: z.string(),
  created_at: z.string().datetime(),
  product: productSchema.optional(),
});

// Esquema para recibos
const receiptSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  order_number: z.string(),
  total_coins: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  items: z.array(z.object({
    product_id: z.string(),
    product_name: z.string(),
    coin_value: z.number().int().nonnegative(),
  }))
});

// Funciones de validación
export const validateProduct = (data: any) => productSchema.parse(data);
export const validateProducts = (data: any[]) => z.array(productSchema).parse(data);

export const validateUser = (data: any) => userSchema.parse(data);
export const validateUsers = (data: any[]) => z.array(userSchema).parse(data);

export const validateCartItem = (data: any) => cartItemSchema.parse(data);
export const validateCartItems = (data: any[]) => z.array(cartItemSchema).parse(data);

export const validateReceipt = (data: any) => receiptSchema.parse(data);
export const validateReceipts = (data: any[]) => z.array(receiptSchema).parse(data); 