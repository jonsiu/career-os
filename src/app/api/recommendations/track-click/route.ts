/**
 * Affiliate Click Tracking API
 * Task Group 3.3.4: Track affiliate link clicks for revenue analytics
 *
 * POST /api/recommendations/track-click
 * Returns: Success confirmation after tracking click event
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AffiliateRecommendationEngine } from '@/lib/services/affiliate-recommendations';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { analysisId, skillName, courseProvider, courseUrl, courseTitle } = body;

    // Validate required fields
    if (!analysisId || typeof analysisId !== 'string') {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    if (!skillName || typeof skillName !== 'string') {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 }
      );
    }

    if (!courseProvider || typeof courseProvider !== 'string') {
      return NextResponse.json(
        { error: 'Course provider is required' },
        { status: 400 }
      );
    }

    if (!courseUrl || typeof courseUrl !== 'string') {
      return NextResponse.json(
        { error: 'Course URL is required' },
        { status: 400 }
      );
    }

    // Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('Convex URL not configured');
    }

    const convex = new ConvexHttpClient(convexUrl);

    // Get existing analysis to verify it exists
    const analysis = await convex.query(api.skillGapAnalyses.getById, {
      analysisId: analysisId as Id<'skillGapAnalyses'>,
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Track click event using affiliate engine
    const engine = new AffiliateRecommendationEngine();
    const clickEvent = engine.trackAffiliateClick({
      analysisId,
      skillName,
      courseProvider,
      courseUrl,
      courseTitle,
    });

    // Update analysis metadata with click count
    const currentClickCount = analysis.metadata.affiliateClickCount || 0;
    const now = Date.now();

    await convex.mutation(api.skillGapAnalyses.update, {
      analysisId: analysisId as Id<'skillGapAnalyses'>,
      updates: {
        metadata: {
          ...analysis.metadata,
          affiliateClickCount: currentClickCount + 1,
          lastProgressUpdate: now,
        },
      },
    });

    // Log click event for analytics (in production, this would go to analytics service)
    console.log('Affiliate click tracked:', {
      analysisId,
      skillName,
      courseProvider,
      courseUrl,
      courseTitle,
      timestamp: clickEvent.timestamp,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully',
      data: {
        analysisId,
        skillName,
        courseProvider,
        clickCount: currentClickCount + 1,
        timestamp: clickEvent.timestamp,
      },
    });

  } catch (error) {
    console.error('Affiliate click tracking API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Analysis not found')) {
        return NextResponse.json(
          { error: 'Analysis not found' },
          { status: 404 }
        );
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
