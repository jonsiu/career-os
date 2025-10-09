import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
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
      const response = NextResponse.json({ 
        success: false,
        error: 'Not authenticated',
        code: 'UNAUTHENTICATED'
      }, { status: 401 });
      return addCorsHeaders(response);
    }

    console.log('✅ User authenticated:', userId);

    // Get the Clerk session token with template
    const token = await getToken({ template: 'extension' });
    
    if (!token) {
      console.log('❌ No token available');
      const response = NextResponse.json({ 
        success: false,
        error: 'No token available',
        code: 'TOKEN_UNAVAILABLE'
      }, { status: 401 });
      return addCorsHeaders(response);
    }

    // Get user details for token metadata
    const user = await currentUser();
    
    console.log('✅ Token generated successfully');

    // Return comprehensive token information
    const response = NextResponse.json({
      success: true,
      token: token,
      tokenInfo: {
        userId: userId,
        email: user?.emailAddresses[0]?.emailAddress,
        issuedAt: Date.now(),
        expiresIn: 3600, // 1 hour in seconds
        type: 'extension_access_token',
        scope: ['extension:read', 'extension:write', 'jobs:bookmark', 'resume:analyze']
      },
      user: {
        id: userId,
        email: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Error getting token:', error);
    const response = NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
