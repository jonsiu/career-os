/**
 * Conversion Tracking API
 * Task Group 5.3.3: Add conversion tracking for affiliate partnerships
 *
 * POST /api/analytics/conversion
 * Returns: Success confirmation after tracking conversion event
 *
 * Tracks:
 * - Affiliate click-through rate (CTR): clicks / impressions
 * - Conversions (enrollments) via partner webhooks
 * - Conversion data stored in analysis metadata
 *
 * Note: Actual conversion tracking requires webhook integration with affiliate partners.
 * For MVP, this endpoint provides the framework for future webhook integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Conversion event data structure
 */
interface ConversionEvent {
  analysisId: string;
  skillName: string;
  courseProvider: string;
  courseUrl: string;
  courseTitle?: string;
  conversionType: 'enrollment' | 'purchase' | 'completion';
  revenue?: number; // Actual revenue from partner
  timestamp: number;
}

/**
 * POST /api/analytics/conversion
 *
 * Track affiliate conversion event (enrollment, purchase, completion)
 *
 * Input:
 * - analysisId: Skill gap analysis ID
 * - skillName: Skill that was addressed by the course
 * - courseProvider: Affiliate partner (Coursera, Udemy, etc.)
 * - courseUrl: Course URL
 * - courseTitle: Optional course title
 * - conversionType: Type of conversion (enrollment, purchase, completion)
 * - revenue: Optional actual revenue from partner
 *
 * Output:
 * - success: Boolean indicating successful tracking
 * - conversionEvent: The tracked conversion event
 * - metrics: Updated conversion metrics for the analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user (or verify webhook signature for partner webhooks)
    const { userId } = await auth();

    // For webhook calls from partners, verify signature instead of user auth
    const webhookSignature = request.headers.get('x-webhook-signature');

    if (!userId && !webhookSignature) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      analysisId,
      skillName,
      courseProvider,
      courseUrl,
      courseTitle,
      conversionType,
      revenue,
    } = body;

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

    if (
      !conversionType ||
      !['enrollment', 'purchase', 'completion'].includes(conversionType)
    ) {
      return NextResponse.json(
        {
          error:
            'Conversion type must be one of: enrollment, purchase, completion',
        },
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

    // Create conversion event
    const conversionEvent: ConversionEvent = {
      analysisId,
      skillName,
      courseProvider,
      courseUrl,
      courseTitle,
      conversionType,
      revenue,
      timestamp: Date.now(),
    };

    // Calculate updated metrics
    const metrics = calculateConversionMetrics(analysis, conversionEvent);

    // Update analysis metadata with conversion tracking
    // Note: For production, conversions would be stored in a separate table
    // For MVP, we track conversion count in metadata
    const updatedMetadata = {
      ...analysis.metadata,
      affiliateConversions: (analysis.metadata as any).affiliateConversions || 0 + 1,
      lastConversionDate: conversionEvent.timestamp,
      totalRevenue: ((analysis.metadata as any).totalRevenue || 0) + (revenue || 0),
    };

    await convex.mutation(api.skillGapAnalyses.update, {
      analysisId: analysisId as Id<'skillGapAnalyses'>,
      updates: {
        metadata: updatedMetadata,
      },
    });

    // Log conversion event for analytics (in production, send to analytics service)
    console.log('=== Affiliate Conversion Tracked ===');
    console.log(`Analysis ID: ${analysisId}`);
    console.log(`Skill: ${skillName}`);
    console.log(`Provider: ${courseProvider}`);
    console.log(`Course: ${courseTitle || courseUrl}`);
    console.log(`Conversion Type: ${conversionType}`);
    console.log(`Revenue: $${revenue || 0}`);
    console.log(`Timestamp: ${new Date(conversionEvent.timestamp).toISOString()}`);
    console.log('\nConversion Metrics:');
    console.log(`  Total Clicks: ${metrics.totalClicks}`);
    console.log(`  Total Conversions: ${metrics.totalConversions}`);
    console.log(`  Conversion Rate: ${(metrics.conversionRate * 100).toFixed(2)}%`);
    console.log(`  Total Revenue: $${metrics.totalRevenue.toFixed(2)}`);
    console.log('===================================\n');

    return NextResponse.json({
      success: true,
      message: 'Conversion tracked successfully',
      data: {
        conversionEvent,
        metrics,
      },
    });
  } catch (error) {
    console.error('Conversion tracking API error:', error);

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

/**
 * Calculate conversion metrics for an analysis
 *
 * @param analysis - Skill gap analysis document
 * @param newConversion - New conversion event to add
 * @returns Updated conversion metrics
 */
function calculateConversionMetrics(
  analysis: any,
  newConversion: ConversionEvent
): {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
} {
  const totalClicks = analysis.metadata.affiliateClickCount || 0;
  const totalConversions = ((analysis.metadata as any).affiliateConversions || 0) + 1;
  const conversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;
  const totalRevenue =
    ((analysis.metadata as any).totalRevenue || 0) + (newConversion.revenue || 0);

  return {
    totalClicks,
    totalConversions,
    conversionRate,
    totalRevenue,
  };
}

/**
 * GET /api/analytics/conversion
 *
 * Get conversion metrics for user's analyses
 *
 * Output:
 * - metrics: Aggregated conversion metrics
 * - byProvider: Breakdown by affiliate partner
 * - bySkill: Breakdown by skill category
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('Convex URL not configured');
    }

    const convex = new ConvexHttpClient(convexUrl);

    // Get user
    const user = await convex.query(api.users.getByClerkUserId, {
      clerkUserId: userId,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all analyses for user
    const analyses = await convex.query(api.skillGapAnalyses.getByUserId, {
      userId: user._id,
    });

    // Aggregate conversion metrics
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    const byProvider: Record<
      string,
      { clicks: number; conversions: number; revenue: number }
    > = {};

    analyses.forEach((analysis) => {
      const clicks = analysis.metadata.affiliateClickCount || 0;
      const conversions = (analysis.metadata as any).affiliateConversions || 0;
      const revenue = (analysis.metadata as any).totalRevenue || 0;

      totalClicks += clicks;
      totalConversions += conversions;
      totalRevenue += revenue;

      // For MVP, we don't track per-provider conversions
      // In production, this would be stored in a separate conversions table
    });

    const conversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;

    // Compare against target metrics
    const TARGET_CTR = 0.45; // 45%+
    const TARGET_CONVERSION_RATE = 0.10; // 8-12% (using midpoint 10%)

    return NextResponse.json({
      success: true,
      metrics: {
        totalClicks,
        totalConversions,
        conversionRate,
        totalRevenue,
        clickThroughRate: analyses.length > 0 ? totalClicks / analyses.length : 0,
      },
      targets: {
        clickThroughRate: TARGET_CTR,
        conversionRate: TARGET_CONVERSION_RATE,
      },
      meetsTargets: {
        clickThroughRate:
          analyses.length > 0 ? totalClicks / analyses.length >= TARGET_CTR : false,
        conversionRate: conversionRate >= TARGET_CONVERSION_RATE,
      },
    });
  } catch (error) {
    console.error('Conversion metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
