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
    console.log('🔄 Job sync API called');
    
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ Authentication failed');
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return addCorsHeaders(response);
    }
    console.log('✅ User authenticated:', userId);

    const body = await request.json();
    const { jobs } = body;

    if (!Array.isArray(jobs)) {
      console.log('❌ Invalid jobs data');
      const response = NextResponse.json(
        { error: 'Jobs must be an array' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    console.log('📦 Syncing jobs:', jobs.length);

    // Get user ID from Convex
    const user = await convexClient.query(api.users.getByClerkUserId, { 
      clerkUserId: userId 
    });

    if (!user) {
      console.log('❌ User not found in database');
      const response = NextResponse.json({ error: 'User not found' }, { status: 404 });
      return addCorsHeaders(response);
    }

    // Get existing jobs to avoid duplicates
    const existingJobs = await convexClient.query(api.jobs.getByUserId, { 
      userId: user._id 
    });

    const existingUrls = new Set(
      existingJobs
        .map(job => job.url || job.metadata?.url) // Check both new top-level url and legacy metadata.url
        .filter(Boolean)
    );

    const newJobs = [];
    const duplicateJobs = [];

    // Process each job from the extension
    for (const jobData of jobs) {
      const {
        url,
        title,
        company,
        description,
        descriptionHtml, // NEW: HTML description
        requirements = [],
        location,
        salary,
        postedDate, // NEW: Posted date
        source,
        skills = [],
        remote = false,
        deadline,
        userNotes = '',
        rating = 0,
        rawJobDescriptionHtml, // NEW: Raw HTML for re-parsing
        parsingMetadata // NEW: Parsing metadata
      } = jobData;

      // Check if job already exists
      if (url && existingUrls.has(url)) {
        duplicateJobs.push({ title, company, url });
        continue;
      }

      try {
        // Create new job
        const jobId = await convexClient.mutation(api.jobs.create, {
          userId: user._id,
          title,
          company,
          description,
          descriptionHtml, // NEW: Store sanitized HTML description
          requirements,
          location: location || 'Not specified',
          salary,
          postedDate: postedDate || 'Not specified',
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
            extensionVersion: '1.0.0',
            syncedAt: new Date().toISOString()
          }
        });

        newJobs.push({ jobId, title, company });
        console.log('✅ Created job:', { jobId, title, company });

      } catch (error) {
        console.error('❌ Failed to create job:', { title, company, error });
      }
    }

    console.log('✅ Sync completed:', { 
      total: jobs.length, 
      new: newJobs.length, 
      duplicates: duplicateJobs.length 
    });

    const response = NextResponse.json({
      success: true,
      synced: newJobs.length,
      duplicates: duplicateJobs.length,
      total: jobs.length,
      newJobs,
      duplicateJobs
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Job sync API error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function GET() {
  try {
    console.log('📊 Getting sync status');

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

    // Get user's job statistics
    const jobs = await convexClient.query(api.jobs.getByUserId, { 
      userId: user._id 
    });

    const stats = {
      totalJobs: jobs.length,
      savedJobs: jobs.filter(job => job.status === 'saved').length,
      appliedJobs: jobs.filter(job => job.status === 'applied').length,
      interviewingJobs: jobs.filter(job => job.status === 'interviewing').length,
      offeredJobs: jobs.filter(job => job.status === 'offered').length,
      rejectedJobs: jobs.filter(job => job.status === 'rejected').length,
      lastSync: new Date().toISOString()
    };

    console.log('✅ Sync status retrieved:', stats);

    const response = NextResponse.json({
      success: true,
      stats
    });
    return addCorsHeaders(response);

  } catch (error) {
    console.error('❌ Get sync status error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
