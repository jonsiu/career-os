import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { addCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔑 Getting authentication token');
    
    // Get the current user from Clerk
    const { userId, getToken } = await auth();
    
    if (!userId) {
      console.log('❌ No user found');
      const response = NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      return addCorsHeaders(response);
    }

    console.log('✅ User authenticated:', userId);

    // Get the Clerk session token
    const token = await getToken();
    
    if (!token) {
      console.log('❌ No token available');
      const response = NextResponse.json({ error: 'No token available' }, { status: 401 });
      return addCorsHeaders(response);
    }

    console.log('✅ Token generated successfully');

    // Return the token
    const response = NextResponse.json({
      success: true,
      token: token
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Error getting token:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
