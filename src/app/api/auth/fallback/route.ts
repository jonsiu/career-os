import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { addCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fallback authentication check');
    
    // Get the current user from Clerk
    const { userId, getToken } = await auth();
    
    if (!userId) {
      console.log('❌ No user found for fallback auth');
      const response = NextResponse.json({ 
        success: false,
        fallbackAvailable: false,
        error: 'Not authenticated',
        code: 'UNAUTHENTICATED',
        fallbackOptions: [
          {
            type: 'redirect_to_signin',
            url: '/sign-in',
            description: 'Redirect to CareerOS sign-in page'
          },
          {
            type: 'extension_auth_flow',
            url: '/auth/extension',
            description: 'Start extension authentication flow'
          }
        ]
      }, { status: 401 });
      return addCorsHeaders(response);
    }

    // Get user details
    const user = await currentUser();
    
    if (!user) {
      console.log('❌ User details not found for fallback auth');
      const response = NextResponse.json({ 
        success: false,
        fallbackAvailable: false,
        error: 'User details not available',
        code: 'USER_NOT_FOUND',
        fallbackOptions: [
          {
            type: 'refresh_session',
            url: '/api/auth/refresh',
            description: 'Try to refresh user session'
          }
        ]
      }, { status: 404 });
      return addCorsHeaders(response);
    }

    // Try to get token with fallback strategies
    let token = null;
    let tokenSource = 'none';
    
    try {
      // Primary: Try extension template
      token = await getToken({ template: 'extension' });
      tokenSource = 'extension_template';
    } catch (error) {
      console.log('Extension template failed, trying default token');
      try {
        // Fallback: Try default token
        token = await getToken();
        tokenSource = 'default_token';
      } catch (fallbackError) {
        console.log('Default token also failed');
      }
    }

    if (!token) {
      console.log('❌ No token available for fallback auth');
      const response = NextResponse.json({ 
        success: false,
        fallbackAvailable: true,
        error: 'No token available',
        code: 'TOKEN_UNAVAILABLE',
        user: {
          id: userId,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName
        },
        fallbackOptions: [
          {
            type: 'refresh_token',
            url: '/api/auth/token',
            description: 'Try to refresh authentication token'
          },
          {
            type: 're_authenticate',
            url: '/auth/extension',
            description: 'Re-authenticate with extension'
          },
          {
            type: 'offline_mode',
            description: 'Use cached authentication data',
            requiresExtension: true
          }
        ]
      }, { status: 401 });
      return addCorsHeaders(response);
    }

    console.log(`✅ Fallback authentication successful with ${tokenSource}`);

    // Return fallback authentication response
    const response = NextResponse.json({
      success: true,
      fallbackAvailable: true,
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
      tokenInfo: {
        source: tokenSource,
        type: tokenSource === 'extension_template' ? 'extension_access_token' : 'clerk_session',
        issuedAt: Date.now(),
        expiresIn: 3600, // 1 hour
        fallbackUsed: tokenSource !== 'extension_template'
      },
      fallbackOptions: [
        {
          type: 'full_authentication',
          url: '/auth/extension',
          description: 'Complete extension authentication flow',
          recommended: true
        },
        {
          type: 'token_refresh',
          url: '/api/auth/token',
          description: 'Refresh current token'
        }
      ]
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Fallback authentication error:', error);
    const response = NextResponse.json(
      { 
        success: false,
        fallbackAvailable: false,
        error: 'Fallback authentication failed',
        code: 'FALLBACK_AUTH_ERROR',
        fallbackOptions: [
          {
            type: 'emergency_signin',
            url: '/sign-in',
            description: 'Emergency sign-in to CareerOS'
          },
          {
            type: 'contact_support',
            description: 'Contact support for authentication issues'
          }
        ]
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Fallback authentication with cached data');
    
    const body = await request.json();
    const { 
      cachedToken, 
      cachedUser, 
      extensionId,
      offlineMode = false 
    } = body;
    
    // Validate cached data if provided
    if (cachedToken && cachedUser) {
      console.log('Validating cached authentication data');
      
      // Basic validation of cached data
      const isValidCachedData = (
        cachedUser.id && 
        cachedUser.email && 
        cachedToken.length > 10 // Basic token length check
      );
      
      if (isValidCachedData) {
        console.log('✅ Cached authentication data appears valid');
        
        const response = NextResponse.json({
          success: true,
          fallbackUsed: true,
          source: 'cached_data',
          user: cachedUser,
          token: cachedToken,
          tokenInfo: {
            source: 'cached',
            type: 'cached_token',
            validatedAt: Date.now(),
            expiresIn: 3600,
            offlineMode: offlineMode
          },
          warnings: [
            'Using cached authentication data',
            'Token may expire soon - refresh recommended',
            'Some features may be limited in offline mode'
          ],
          recommendations: [
            {
              type: 'refresh_when_online',
              description: 'Refresh authentication when connection is restored'
            },
            {
              type: 'validate_periodically',
              description: 'Validate token periodically for security'
            }
          ]
        });
        return addCorsHeaders(response);
      }
    }
    
    // If no valid cached data, try to get fresh authentication
    const { userId, getToken } = await auth();
    
    if (!userId) {
      console.log('❌ No fresh authentication available');
      const response = NextResponse.json({ 
        success: false,
        fallbackAvailable: false,
        error: 'No authentication available',
        code: 'NO_AUTH_AVAILABLE',
        fallbackOptions: [
          {
            type: 'signin_required',
            url: '/sign-in',
            description: 'Sign in to CareerOS is required'
          }
        ]
      }, { status: 401 });
      return addCorsHeaders(response);
    }
    
    // Get fresh user and token
    const user = await currentUser();
    const token = await getToken();
    
    if (!user || !token) {
      console.log('❌ Fresh authentication incomplete');
      const response = NextResponse.json({ 
        success: false,
        fallbackAvailable: false,
        error: 'Authentication incomplete',
        code: 'AUTH_INCOMPLETE'
      }, { status: 401 });
      return addCorsHeaders(response);
    }
    
    console.log('✅ Fresh authentication successful');
    
    const response = NextResponse.json({
      success: true,
      fallbackUsed: false,
      source: 'fresh_auth',
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
      tokenInfo: {
        source: 'fresh',
        type: 'clerk_session',
        issuedAt: Date.now(),
        expiresIn: 3600
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Fallback authentication with cached data failed:', error);
    const response = NextResponse.json(
      { 
        success: false,
        fallbackAvailable: false,
        error: 'Fallback authentication failed',
        code: 'FALLBACK_CACHED_AUTH_ERROR'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
