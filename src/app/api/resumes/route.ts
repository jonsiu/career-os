import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/lib/convex-client';

/**
 * GET /api/resumes
 *
 * Get all resumes for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is not set');
    }

    const convex = new ConvexHttpClient(convexUrl);

    // 3. Get user from Convex
    const user = await convex.query(api.users.getByClerkUserId, { clerkUserId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 4. Get user's resumes
    const resumes = await convex.query(api.resumes.getByUserId, { userId: user._id });

    // 5. Return resumes with proper format (map _id to id for frontend compatibility)
    return NextResponse.json({
      success: true,
      resumes: resumes.map(resume => ({
        id: resume._id,
        _id: resume._id,
        title: resume.title,
        content: resume.content,
        filePath: resume.filePath,
        metadata: resume.metadata,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      })),
      count: resumes.length,
    });

  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
