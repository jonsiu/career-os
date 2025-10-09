import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { addCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Getting current user info');
    
    // Get the current user from Clerk
    const { userId } = await auth();
    
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

    // Get full user details
    const user = await currentUser();
    
    if (!user) {
      console.log('❌ User details not found');
      const response = NextResponse.json({ 
        success: false,
        error: 'User details not available',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
      return addCorsHeaders(response);
    }

    // Return comprehensive user information
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        hasImage: user.hasImage,
        emailVerified: user.emailAddresses[0]?.verification?.status === 'verified',
        mfaEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        // Extension-specific fields
        extensionAuth: {
          isAuthenticated: true,
          lastAuthCheck: Date.now(),
          sessionId: `session_${userId}_${Date.now()}`
        }
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Error getting user info:', error);
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
