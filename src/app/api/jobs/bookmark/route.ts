import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

// Create a Convex HTTP client for server-side operations
const convexClient = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:8000"
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔖 Job bookmark API called');
    
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ User authenticated:', userId);

    const body = await request.json();
    const { 
      title, 
      company, 
      description, 
      requirements = [], 
      location, 
      salary, 
      url, 
      source,
      skills = [],
      remote = false,
      deadline,
      userNotes = '',
      rating = 0
    } = body;

    // Validate required fields
    if (!title || !company || !description) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Title, company, and description are required' },
        { status: 400 }
      );
    }

    console.log('📄 Creating job bookmark:', { title, company, source });

    // Get user ID from Convex (using Clerk user ID)
    const user = await convexClient.query(api.users.getByClerkUserId, { 
      clerkUserId: userId 
    });

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create job bookmark
    const jobId = await convexClient.mutation(api.jobs.create, {
      userId: user._id,
      title,
      company,
      description,
      requirements,
      location: location || 'Not specified',
      salary,
      status: 'saved',
      metadata: {
        url,
        source,
        skills,
        remote,
        deadline,
        userNotes,
        rating,
        bookmarkedAt: new Date().toISOString(),
        extensionVersion: '1.0.0'
      }
    });

    console.log('✅ Job bookmark created:', jobId);

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Job bookmarked successfully'
    });

  } catch (error) {
    console.error('❌ Job bookmark API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Getting user job bookmarks');
    
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from Convex
    const user = await convexClient.query(api.users.getByClerkUserId, { 
      clerkUserId: userId 
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's job bookmarks
    const jobs = await convexClient.query(api.jobs.getByUserId, { 
      userId: user._id 
    });

    console.log('✅ Retrieved job bookmarks:', jobs.length);

    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length
    });

  } catch (error) {
    console.error('❌ Get job bookmarks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
