import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge multiple class names with Tailwind CSS
 * This utility combines clsx and tailwind-merge to provide a convenient way
 * to conditionally apply Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha ISO a un formato legible
 * @param dateString - String de fecha en formato ISO
 * @returns Fecha formateada (ej: "25 Jun 2023")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Opciones para formatear la fecha
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '';
  }
}

/**
 * Trunca un texto a la longitud especificada.
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Genera un ID único para uso en claves temporales.
 * @returns ID único
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
