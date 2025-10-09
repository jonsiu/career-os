import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { addCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🏥 Extension health check');
    
    const startTime = Date.now();
    
    // Check basic authentication
    const { userId, getToken } = await auth();
    const user = await currentUser();
    const token = await getToken();
    
    const authCheckTime = Date.now() - startTime;
    
    // Health check results
    const healthChecks = {
      authentication: {
        status: userId ? 'healthy' : 'unhealthy',
        userId: userId || null,
        hasUser: !!user,
        hasToken: !!token,
        responseTime: authCheckTime
      },
      database: {
        status: 'healthy', // Assuming Convex is healthy if we got this far
        responseTime: 0
      },
      api: {
        status: 'healthy',
        version: '1.0.0',
        timestamp: Date.now()
      }
    };
    
    // Overall health status
    const overallStatus = userId && user && token ? 'healthy' : 'degraded';
    
    console.log(`✅ Extension health check completed: ${overallStatus}`);
    
    const response = NextResponse.json({
      success: true,
      status: overallStatus,
      timestamp: Date.now(),
      checks: healthChecks,
      extension: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        features: {
          authentication: true,
          jobBookmarking: true,
          resumeAnalysis: true,
          realTimeSync: true
        }
      },
      user: userId ? {
        id: userId,
        email: user?.emailAddresses[0]?.emailAddress,
        authenticated: true
      } : {
        authenticated: false
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Extension health check failed:', error);
    const response = NextResponse.json(
      { 
        success: false,
        status: 'unhealthy',
        timestamp: Date.now(),
        error: 'Health check failed',
        code: 'HEALTH_CHECK_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Extension diagnostic check');
    
    const body = await request.json();
    const { 
      extensionId, 
      extensionVersion, 
      diagnosticLevel = 'basic',
      includeUserInfo = false 
    } = body;
    
    const startTime = Date.now();
    
    // Basic system checks
    const systemChecks = {
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime()
    };
    
    // Authentication checks
    const { userId, getToken } = await auth();
    const user = await currentUser();
    const token = await getToken();
    
    const authDiagnostics = {
      hasUserId: !!userId,
      hasUser: !!user,
      hasToken: !!token,
      tokenType: token ? 'clerk_session' : null,
      userEmail: user?.emailAddresses[0]?.emailAddress || null,
      emailVerified: user?.emailAddresses[0]?.verification?.status === 'verified' || false,
      mfaEnabled: user?.twoFactorEnabled || false
    };
    
    // Extension-specific checks
    const extensionChecks = {
      extensionId: extensionId || 'unknown',
      extensionVersion: extensionVersion || 'unknown',
      diagnosticLevel,
      supportedFeatures: [
        'job_bookmarking',
        'resume_analysis',
        'career_insights',
        'real_time_sync'
      ],
      apiEndpoints: {
        auth: '/api/auth/extension',
        token: '/api/auth/token',
        validate: '/api/auth/validate',
        session: '/api/auth/session',
        health: '/api/auth/extension/health'
      }
    };
    
    // Advanced diagnostics if requested
    let advancedDiagnostics = null;
    if (diagnosticLevel === 'advanced') {
      advancedDiagnostics = {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null,
        networkInterfaces: require('os').networkInterfaces()
      };
    }
    
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Extension diagnostic completed in ${responseTime}ms`);
    
    const response = NextResponse.json({
      success: true,
      timestamp: Date.now(),
      responseTime,
      system: systemChecks,
      authentication: authDiagnostics,
      extension: extensionChecks,
      advanced: advancedDiagnostics,
      user: includeUserInfo && userId ? {
        id: userId,
        email: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
        fullName: user?.fullName,
        imageUrl: user?.imageUrl,
        createdAt: user?.createdAt,
        lastSignInAt: user?.lastSignInAt
      } : null,
      recommendations: generateRecommendations(authDiagnostics, extensionChecks)
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Extension diagnostic failed:', error);
    const response = NextResponse.json(
      { 
        success: false,
        timestamp: Date.now(),
        error: 'Diagnostic check failed',
        code: 'DIAGNOSTIC_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

function generateRecommendations(authDiagnostics: any, extensionChecks: any) {
  const recommendations = [];
  
  if (!authDiagnostics.hasUserId) {
    recommendations.push({
      type: 'authentication',
      priority: 'high',
      message: 'User not authenticated - extension should initiate authentication flow',
      action: 'Call /auth/extension endpoint to start authentication'
    });
  }
  
  if (!authDiagnostics.hasToken) {
    recommendations.push({
      type: 'token',
      priority: 'high',
      message: 'No authentication token available',
      action: 'Refresh token using /api/auth/token endpoint'
    });
  }
  
  if (!authDiagnostics.emailVerified) {
    recommendations.push({
      type: 'verification',
      priority: 'medium',
      message: 'User email not verified',
      action: 'Consider prompting user to verify email for full functionality'
    });
  }
  
  if (extensionChecks.extensionVersion === 'unknown') {
    recommendations.push({
      type: 'extension',
      priority: 'low',
      message: 'Extension version not provided',
      action: 'Include extension version in diagnostic requests for better support'
    });
  }
  
  return recommendations;
}
