import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { addCorsHeaders, handleCorsPreflight } from '@/lib/cors';

// Create a Convex HTTP client for server-side operations
const convexClient = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:8000"
);

export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔖 Job bookmark API called');
    
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ Authentication failed');
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return addCorsHeaders(response);
    }
    console.log('✅ User authenticated:', userId);

    const body = await request.json();
    const {
      title,
      company,
      description,
      descriptionHtml, // NEW: HTML description
      requirements = [],
      location,
      salary,
      postedDate, // NEW: Posted date
      url,
      source,
      skills = [],
      remote = false,
      deadline,
      userNotes = '',
      rating = 0,
      rawJobDescriptionHtml, // NEW: Raw HTML for re-parsing
      parsingMetadata // NEW: Parsing metadata
    } = body;

    // Validate required fields
    if (!title || !company || !description) {
      console.log('❌ Missing required fields');
      const response = NextResponse.json(
        { error: 'Title, company, and description are required' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    console.log('📄 Creating job bookmark:', { title, company, source });

    // Get user ID from Convex (using Clerk user ID)
    const user = await convexClient.query(api.users.getByClerkUserId, { 
      clerkUserId: userId 
    });

    if (!user) {
      console.log('❌ User not found in database');
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 });
      return addCorsHeaders(response);
    }

    // Create job bookmark
    const jobId = await convexClient.mutation(api.jobs.create, {
      userId: user._id,
      title,
      company,
      description,
      descriptionHtml, // NEW: Store sanitized HTML description
      requirements,
      location: location || 'Not specified',
      salary,
      postedDate, // NEW: Store posted date
      url, // NEW: Move URL to top-level field
      status: 'saved',
      metadata: {
        source,
        skills,
        remote,
        deadline,
        userNotes,
        rating,
        rawJobDescriptionHtml, // NEW: Store raw HTML for re-parsing
        parsingMetadata, // NEW: Store parsing metadata
        bookmarkedAt: new Date().toISOString(),
        extensionVersion: '1.0.0'
      }
    });

    console.log('✅ Job bookmark created:', jobId);

    const response = NextResponse.json({
      success: true,
      jobId,
      message: 'Job bookmarked successfully'
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Job bookmark API error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Getting user job bookmarks');
    
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return addCorsHeaders(response);
    }

    // Get user ID from Convex
    const user = await convexClient.query(api.users.getByClerkUserId, { 
      clerkUserId: userId 
    });

    if (!user) {
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 });
      return addCorsHeaders(response);
    }

    // Get user's job bookmarks
    const jobs = await convexClient.query(api.jobs.getByUserId, { 
      userId: user._id 
    });

    console.log('✅ Retrieved job bookmarks:', jobs.length);

    const response = NextResponse.json({
      success: true,
      jobs,
      count: jobs.length
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Get job bookmarks error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
