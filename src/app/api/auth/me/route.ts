import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
      const response = NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      return addCorsHeaders(response);
    }

    console.log('✅ User authenticated:', userId);

    // Return user information
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        // Add any other user fields you need
      }
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Error getting user info:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
