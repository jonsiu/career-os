import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { addCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Validating authentication token');
    
    // Get the current user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ No user found');
      const response = NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      return addCorsHeaders(response);
    }

    console.log('✅ Token is valid for user:', userId);

    // Return validation success
    const response = NextResponse.json({
      success: true,
      valid: true,
      userId: userId
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Error validating token:', error);
    const response = NextResponse.json(
      { error: 'Token validation failed' },
      { status: 401 }
    );
    return addCorsHeaders(response);
  }
}
