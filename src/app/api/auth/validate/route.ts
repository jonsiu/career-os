import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { addCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Validating authentication token');
    
    // Get the current user from Clerk
    const { userId, getToken } = await auth();
    
    if (!userId) {
      console.log('❌ No user found');
      const response = NextResponse.json({ 
        success: false,
        valid: false,
        error: 'Not authenticated',
        code: 'UNAUTHENTICATED'
      }, { status: 401 });
      return addCorsHeaders(response);
    }

    // Get token to validate it's still active
    const token = await getToken();
    
    if (!token) {
      console.log('❌ Token not available');
      const response = NextResponse.json({ 
        success: false,
        valid: false,
        error: 'Token not available',
        code: 'TOKEN_UNAVAILABLE'
      }, { status: 401 });
      return addCorsHeaders(response);
    }

    // Get user details for validation response
    const user = await currentUser();
    
    console.log('✅ Token is valid for user:', userId);

    // Return comprehensive validation response
    const response = NextResponse.json({
      success: true,
      valid: true,
      userId: userId,
      user: {
        id: userId,
        email: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
        emailVerified: user?.emailAddresses[0]?.verification?.status === 'verified'
      },
      tokenInfo: {
        hasToken: true,
        tokenType: 'clerk_session',
        validatedAt: Date.now()
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Error validating token:', error);
    const response = NextResponse.json(
      { 
        success: false,
        valid: false,
        error: 'Token validation failed',
        code: 'VALIDATION_ERROR'
      },
      { status: 401 }
    );
    return addCorsHeaders(response);
  }
}
