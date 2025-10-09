import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { addCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔌 Extension authentication check');
    
    // Get the current user from Clerk
    const { userId, getToken } = await auth();
    
    if (!userId) {
      console.log('❌ No user found for extension');
      const response = NextResponse.json({ 
        success: false,
        authenticated: false,
        error: 'Not authenticated',
        code: 'UNAUTHENTICATED'
      }, { status: 401 });
      return addCorsHeaders(response);
    }

    // Get user details
    const user = await currentUser();
    
    if (!user) {
      console.log('❌ User details not found for extension');
      const response = NextResponse.json({ 
        success: false,
        authenticated: false,
        error: 'User details not available',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
      return addCorsHeaders(response);
    }

    // Get extension-specific token
    const token = await getToken({ template: 'extension' });
    
    if (!token) {
      console.log('❌ Extension token not available');
      const response = NextResponse.json({ 
        success: false,
        authenticated: false,
        error: 'Extension token not available',
        code: 'TOKEN_UNAVAILABLE'
      }, { status: 401 });
      return addCorsHeaders(response);
    }

    console.log('✅ Extension authentication successful for user:', userId);

    // Return comprehensive extension authentication response
    const response = NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        emailVerified: user.emailAddresses[0]?.verification?.status === 'verified',
        mfaEnabled: user.twoFactorEnabled
      },
      token: token,
      session: {
        id: `ext_session_${userId}_${Date.now()}`,
        createdAt: Date.now(),
        expiresAt: Date.now() + (3600 * 1000), // 1 hour
        type: 'extension_session',
        permissions: [
          'extension:read',
          'extension:write',
          'jobs:bookmark',
          'jobs:sync',
          'resume:analyze',
          'user:profile'
        ]
      },
      extension: {
        version: '1.0.0',
        supportedFeatures: [
          'job_bookmarking',
          'resume_analysis',
          'career_insights',
          'real_time_sync'
        ],
        lastSync: Date.now()
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Error in extension authentication:', error);
    const response = NextResponse.json(
      { 
        success: false,
        authenticated: false,
        error: 'Extension authentication failed',
        code: 'EXTENSION_AUTH_ERROR'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔌 Extension authentication refresh');
    
    const body = await request.json();
    const { refreshToken, sessionId } = body;
    
    // Get the current user from Clerk
    const { userId, getToken } = await auth();
    
    if (!userId) {
      console.log('❌ No user found for extension refresh');
      const response = NextResponse.json({ 
        success: false,
        error: 'Not authenticated',
        code: 'UNAUTHENTICATED'
      }, { status: 401 });
      return addCorsHeaders(response);
    }

    // Get fresh token
    const token = await getToken({ template: 'extension' });
    
    if (!token) {
      console.log('❌ Extension token refresh failed');
      const response = NextResponse.json({ 
        success: false,
        error: 'Token refresh failed',
        code: 'TOKEN_REFRESH_FAILED'
      }, { status: 401 });
      return addCorsHeaders(response);
    }

    console.log('✅ Extension token refreshed successfully');

    // Return refreshed token information
    const response = NextResponse.json({
      success: true,
      token: token,
      session: {
        id: sessionId || `ext_session_${userId}_${Date.now()}`,
        refreshedAt: Date.now(),
        expiresAt: Date.now() + (3600 * 1000), // 1 hour
        type: 'extension_session_refreshed'
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Error refreshing extension token:', error);
    const response = NextResponse.json(
      { 
        success: false,
        error: 'Token refresh failed',
        code: 'REFRESH_ERROR'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
