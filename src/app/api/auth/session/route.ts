import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { addCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking CareerOS session status');
    
    // Get the current user from Clerk
    const { userId, getToken } = await auth();
    
    if (!userId) {
      console.log('❌ No active session found');
      const response = NextResponse.json({ 
        success: true,
        hasSession: false,
        session: null,
        message: 'No active CareerOS session'
      }, { status: 200 });
      return addCorsHeaders(response);
    }

    // Get user details
    const user = await currentUser();
    
    if (!user) {
      console.log('❌ User details not available');
      const response = NextResponse.json({ 
        success: true,
        hasSession: false,
        session: null,
        message: 'User details not available'
      }, { status: 200 });
      return addCorsHeaders(response);
    }

    // Get token to verify session is active
    const token = await getToken();
    
    if (!token) {
      console.log('❌ Session token not available');
      const response = NextResponse.json({ 
        success: true,
        hasSession: false,
        session: null,
        message: 'Session token not available'
      }, { status: 200 });
      return addCorsHeaders(response);
    }

    console.log('✅ Active CareerOS session found for user:', userId);

    // Return session information
    const response = NextResponse.json({
      success: true,
      hasSession: true,
      session: {
        id: `careeros_session_${userId}`,
        userId: userId,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        emailVerified: user.emailAddresses[0]?.verification?.status === 'verified',
        mfaEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        sessionActive: true,
        lastActivity: Date.now(),
        // Extension integration info
        extensionCompatible: true,
        extensionAuthUrl: `/auth/extension`,
        extensionTokenUrl: `/api/auth/token`
      },
      message: 'Active CareerOS session detected'
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Error checking session status:', error);
    const response = NextResponse.json(
      { 
        success: false,
        hasSession: false,
        session: null,
        error: 'Session check failed',
        code: 'SESSION_CHECK_ERROR'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Detailed session check for extension');
    
    const body = await request.json();
    const { extensionId, extensionVersion, requestedPermissions } = body;
    
    // Get the current user from Clerk
    const { userId, getToken } = await auth();
    
    if (!userId) {
      console.log('❌ No active session for extension check');
      const response = NextResponse.json({ 
        success: true,
        hasSession: false,
        session: null,
        extension: {
          canAuthenticate: true,
          authUrl: '/auth/extension',
          supportedFeatures: []
        },
        message: 'No active session - extension can initiate authentication'
      }, { status: 200 });
      return addCorsHeaders(response);
    }

    // Get user details
    const user = await currentUser();
    const token = await getToken();
    
    if (!user || !token) {
      console.log('❌ Incomplete session for extension');
      const response = NextResponse.json({ 
        success: true,
        hasSession: false,
        session: null,
        extension: {
          canAuthenticate: true,
          authUrl: '/auth/extension',
          supportedFeatures: []
        },
        message: 'Incomplete session - extension can initiate authentication'
      }, { status: 200 });
      return addCorsHeaders(response);
    }

    console.log('✅ Complete session available for extension:', extensionId);

    // Return detailed session and extension information
    const response = NextResponse.json({
      success: true,
      hasSession: true,
      session: {
        id: `careeros_session_${userId}`,
        userId: userId,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        emailVerified: user.emailAddresses[0]?.verification?.status === 'verified',
        mfaEnabled: user.twoFactorEnabled,
        sessionActive: true,
        lastActivity: Date.now()
      },
      extension: {
        id: extensionId,
        version: extensionVersion,
        canAuthenticate: true,
        authUrl: '/auth/extension',
        tokenUrl: '/api/auth/token',
        supportedFeatures: [
          'job_bookmarking',
          'resume_analysis',
          'career_insights',
          'real_time_sync',
          'user_profile_access'
        ],
        permissions: requestedPermissions || [
          'extension:read',
          'extension:write',
          'jobs:bookmark',
          'jobs:sync',
          'resume:analyze',
          'user:profile'
        ],
        lastSync: Date.now()
      },
      message: 'Active session available for extension integration'
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Error in detailed session check:', error);
    const response = NextResponse.json(
      { 
        success: false,
        hasSession: false,
        session: null,
        error: 'Session check failed',
        code: 'DETAILED_SESSION_CHECK_ERROR'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
