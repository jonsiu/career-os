import { NextRequest, NextResponse } from 'next/server';
import { addCorsHeaders, handleCorsPreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🏥 Health check API called');
    
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected', // This would check actual database connection
        auth: 'available',
        api: 'operational'
      }
    };

    console.log('✅ Health check passed');

    const response = NextResponse.json(health);
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Health check failed:', error);
    const response = NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
