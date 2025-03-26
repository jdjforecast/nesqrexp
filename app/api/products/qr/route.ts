import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateProduct } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    // Get QR code from query params
    const { searchParams } = new URL(request.url);
    const qrCode = searchParams.get('code');
    
    if (!qrCode) {
      return NextResponse.json(
        { error: 'Missing QR code parameter' },
        { status: 400 }
      );
    }
    
    // Query the database for a product with this QR code
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('qr_code_url', qrCode)
      .single();
    
    if (error) {
      console.error('Error fetching product by QR code:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product' },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    try {
      // Validate the product data against our schema
      const validatedProduct = validateProduct(data);
      return NextResponse.json(validatedProduct);
    } catch (validationError) {
      console.error('Product validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in QR code API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 