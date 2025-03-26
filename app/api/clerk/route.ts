import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Webhook de Clerk para sincronizar datos de usuario con Supabase
 * 
 * Este endpoint recibe eventos de Clerk y actualiza los datos en Supabase
 * cuando se producen cambios en los usuarios.
 * 
 * @param req - Solicitud HTTP entrante
 * @returns Respuesta HTTP con el resultado de la operación
 */
export async function POST(req: Request) {
  try {
    // Procesar el webhook
    const payload = await req.json();
    const { type, data } = payload as WebhookEvent;
    
    console.log(`[WEBHOOK] Clerk event received: ${type}`);
    
    // Manejar eventos de usuario
    switch (type) {
      case 'user.created':
        return handleUserCreated(data);
        
      case 'user.updated':
        return handleUserUpdated(data);
        
      case 'user.deleted':
        return handleUserDeleted(data);
        
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${type}`);
        return NextResponse.json(
          { success: true, message: 'Webhook received but not processed' }, 
          { status: 200 }
        );
    }
  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Maneja el evento de creación de usuario
 * @param data - Datos del usuario creado
 */
async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name } = data;
  const email = email_addresses?.[0]?.email_address;
  
  if (!email) {
    console.error('[WEBHOOK] No email address found for user:', id);
    return NextResponse.json(
      { success: false, error: 'No email address found' },
      { status: 400 }
    );
  }
  
  try {
    // Verificar si el usuario ya existe en Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', id)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[WEBHOOK] Error fetching user:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Error fetching user data' },
        { status: 500 }
      );
    }
    
    // Si el usuario ya existe, actualizar su email
    if (existingUser) {
      const { error } = await supabase
        .from('users')
        .update({ email })
        .eq('id', id);
        
      if (error) {
        console.error('[WEBHOOK] Error updating user email:', error);
        return NextResponse.json(
          { success: false, error: 'Error updating user' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { success: true, message: 'User email updated' },
        { status: 200 }
      );
    }
    
    // Si el usuario no existe, crear un registro básico
    const { error } = await supabase
      .from('users')
      .insert([
        {
          id,
          name: first_name || 'Usuario',
          email,
          company: 'Pendiente',
          coins: 150,
          role: 'user',
        }
      ]);
      
    if (error) {
      console.error('[WEBHOOK] Error creating user:', error);
      return NextResponse.json(
        { success: false, error: 'Error creating user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'User created in Supabase' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[WEBHOOK] Error in user.created handler:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Maneja el evento de actualización de usuario
 * @param data - Datos del usuario actualizado
 */
async function handleUserUpdated(data: any) {
  const { id, email_addresses, first_name } = data;
  const email = email_addresses?.[0]?.email_address;
  
  try {
    // Solo actualizar el email si ha cambiado
    if (email) {
      const { error } = await supabase
        .from('users')
        .update({ 
          email,
          name: first_name || undefined
        })
        .eq('id', id);
        
      if (error) {
        console.error('[WEBHOOK] Error updating user:', error);
        return NextResponse.json(
          { success: false, error: 'Error updating user' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: true, message: 'User updated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WEBHOOK] Error in user.updated handler:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Maneja el evento de eliminación de usuario
 * @param data - Datos del usuario eliminado
 */
async function handleUserDeleted(data: any) {
  const { id } = data;
  
  try {
    // No eliminar realmente el usuario, solo marcar como eliminado
    const { error } = await supabase
      .from('users')
      .update({ active: false })
      .eq('id', id);
      
    if (error) {
      console.error('[WEBHOOK] Error deactivating user:', error);
      return NextResponse.json(
        { success: false, error: 'Error deactivating user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'User deactivated' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WEBHOOK] Error in user.deleted handler:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 