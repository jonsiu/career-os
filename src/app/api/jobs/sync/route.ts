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
    console.log('🔄 Job sync API called');
    
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ User authenticated:', userId);

    const body = await request.json();
    const { jobs } = body;

    if (!Array.isArray(jobs)) {
      console.log('❌ Invalid jobs data');
      return NextResponse.json(
        { error: 'Jobs must be an array' },
        { status: 400 }
      );
    }

    console.log('📦 Syncing jobs:', jobs.length);

    // Get user ID from Convex
    const user = await convexClient.query(api.users.getByClerkUserId, { 
      clerkUserId: userId 
    });

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get existing jobs to avoid duplicates
    const existingJobs = await convexClient.query(api.jobs.getByUserId, { 
      userId: user._id 
    });

    const existingUrls = new Set(
      existingJobs
        .map(job => job.metadata?.url)
        .filter(Boolean)
    );

    const newJobs = [];
    const duplicateJobs = [];

    // Process each job from the extension
    for (const jobData of jobs) {
      const { url, title, company, description, requirements = [], location, salary, source, skills = [], remote = false, deadline, userNotes = '', rating = 0 } = jobData;

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

    return NextResponse.json({
      success: true,
      synced: newJobs.length,
      duplicates: duplicateJobs.length,
      total: jobs.length,
      newJobs,
      duplicateJobs
    });

  } catch (error) {
    console.error('❌ Job sync API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting sync status');
    
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

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Get sync status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
