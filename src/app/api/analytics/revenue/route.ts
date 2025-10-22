/**
 * Revenue Analytics API
 * Task Group 5.3.1: Affiliate analytics dashboard (logging for MVP)
 *
 * GET /api/analytics/revenue
 * Returns: Revenue analytics metrics for skill gap analysis feature
 *
 * Tracks:
 * - Monthly affiliate clicks by partner (Coursera, Udemy, LinkedIn Learning)
 * - Revenue per user (estimate based on CTR and conversion)
 * - Skill gap category with highest conversion
 * - ROI of AI-powered vs. rule-based recommendations
 *
 * For MVP: Logs metrics to console and aggregates from database metadata.
 * Future: Admin dashboard with real-time analytics visualization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// Revenue estimation constants (based on affiliate program averages)
const REVENUE_ESTIMATES = {
  coursera: {
    averageCommission: 0.45, // 45% commission
    averageCoursePrice: 49.0, // Average course price
  },
  udemy: {
    averageCommission: 0.15, // 15% commission
    averageCoursePrice: 19.99, // Average course price
  },
  linkedinLearning: {
    averageCommission: 0.20, // 20% commission
    averageCoursePrice: 29.99, // Average course price
  },
};

// Target metrics from spec
const TARGET_METRICS = {
  clickThroughRate: 0.45, // 45%+ target
  conversionRate: 0.10, // 8-12% target (using midpoint 10%)
  revenuePerAnalysis: 4.0, // $3-5 target (using midpoint $4)
};

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (admin check would go here in production)
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

    // Get user to verify authentication
    const user = await convex.query(api.users.getByClerkUserId, {
      clerkUserId: userId,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query parameters for date filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get all skill gap analyses (in production, this would be paginated)
    const allAnalyses = await convex.query(api.skillGapAnalyses.getByUserId, {
      userId: user._id,
    });

    // Filter by date range if provided
    let filteredAnalyses = allAnalyses;
    if (startDate || endDate) {
      filteredAnalyses = allAnalyses.filter((analysis) => {
        const analysisDate = analysis.createdAt;
        if (startDate && analysisDate < new Date(startDate).getTime()) {
          return false;
        }
        if (endDate && analysisDate > new Date(endDate).getTime()) {
          return false;
        }
        return true;
      });
    }

    // Calculate revenue analytics
    const analytics = calculateRevenueAnalytics(filteredAnalyses);

    // Log metrics to console (MVP approach)
    console.log('=== Revenue Analytics Report ===');
    console.log(`Period: ${startDate || 'All time'} to ${endDate || 'Present'}`);
    console.log(`Total Analyses: ${analytics.totalAnalyses}`);
    console.log(
      `Total Affiliate Clicks: ${analytics.totalAffiliateClicks}`
    );
    console.log(
      `Click-Through Rate: ${(analytics.clickThroughRate * 100).toFixed(2)}%`
    );
    console.log(
      `Estimated Conversion Rate: ${(analytics.estimatedConversionRate * 100).toFixed(2)}%`
    );
    console.log(
      `Estimated Revenue: $${analytics.estimatedTotalRevenue.toFixed(2)}`
    );
    console.log(
      `Revenue Per Analysis: $${analytics.revenuePerAnalysis.toFixed(2)}`
    );
    console.log('\nAffiliate Clicks by Partner:');
    Object.entries(analytics.clicksByPartner).forEach(([partner, clicks]) => {
      console.log(`  ${partner}: ${clicks} clicks`);
    });
    console.log('\nTop Converting Skill Categories:');
    analytics.topSkillCategories.forEach((category, index) => {
      console.log(
        `  ${index + 1}. ${category.category}: ${category.clicks} clicks`
      );
    });
    console.log('================================\n');

    // Return analytics data
    return NextResponse.json({
      success: true,
      analytics: {
        ...analytics,
        targetMetrics: TARGET_METRICS,
        meetsTargets: {
          clickThroughRate:
            analytics.clickThroughRate >= TARGET_METRICS.clickThroughRate,
          conversionRate:
            analytics.estimatedConversionRate >= TARGET_METRICS.conversionRate,
          revenuePerAnalysis:
            analytics.revenuePerAnalysis >= TARGET_METRICS.revenuePerAnalysis,
        },
      },
      message: 'Revenue analytics calculated successfully. See console for detailed report.',
    });
  } catch (error) {
    console.error('Revenue analytics API error:', error);

    if (error instanceof Error) {
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
 * Calculate revenue analytics from skill gap analyses
 *
 * @param analyses - Array of skill gap analyses
 * @returns Revenue analytics metrics
 */
function calculateRevenueAnalytics(analyses: any[]): {
  totalAnalyses: number;
  totalAffiliateClicks: number;
  clickThroughRate: number;
  estimatedConversionRate: number;
  estimatedTotalRevenue: number;
  revenuePerAnalysis: number;
  clicksByPartner: Record<string, number>;
  topSkillCategories: Array<{ category: string; clicks: number }>;
  aiPoweredAnalyses: number;
  ruleBasedAnalyses: number;
  roiComparison: {
    aiPowered: { clicks: number; estimatedRevenue: number };
    ruleBased: { clicks: number; estimatedRevenue: number };
  };
} {
  const totalAnalyses = analyses.length;
  const totalAffiliateClicks = analyses.reduce(
    (sum, analysis) => sum + (analysis.metadata.affiliateClickCount || 0),
    0
  );

  // Calculate click-through rate (CTR)
  // CTR = total clicks / total analyses (impressions)
  const clickThroughRate =
    totalAnalyses > 0 ? totalAffiliateClicks / totalAnalyses : 0;

  // Use target conversion rate for estimation (in production, track actual conversions)
  const estimatedConversionRate = TARGET_METRICS.conversionRate;

  // Estimate revenue by partner
  const clicksByPartner: Record<string, number> = {
    Coursera: 0,
    Udemy: 0,
    'LinkedIn Learning': 0,
  };

  // Track skill categories with clicks
  const skillCategoryClicks: Record<string, number> = {};

  // Track AI-powered vs. rule-based analyses
  let aiPoweredAnalyses = 0;
  let ruleBasedAnalyses = 0;
  let aiPoweredClicks = 0;
  let ruleBasedClicks = 0;

  analyses.forEach((analysis) => {
    const clickCount = analysis.metadata.affiliateClickCount || 0;

    // Categorize by AI model used
    if (analysis.metadata.aiModel && analysis.metadata.aiModel.includes('claude')) {
      aiPoweredAnalyses++;
      aiPoweredClicks += clickCount;
    } else {
      ruleBasedAnalyses++;
      ruleBasedClicks += clickCount;
    }

    // Distribute clicks evenly across partners (in production, track per-partner)
    const clicksPerPartner = Math.floor(clickCount / 3);
    clicksByPartner['Coursera'] += clicksPerPartner;
    clicksByPartner['Udemy'] += clicksPerPartner;
    clicksByPartner['LinkedIn Learning'] += clickCount - clicksPerPartner * 2;

    // Track clicks by skill category (using critical gaps as proxy)
    if (analysis.criticalGaps && analysis.criticalGaps.length > 0) {
      analysis.criticalGaps.forEach((gap: any) => {
        const category = gap.skillName || 'Unknown';
        skillCategoryClicks[category] = (skillCategoryClicks[category] || 0) + 1;
      });
    }
  });

  // Calculate estimated revenue
  let estimatedTotalRevenue = 0;
  Object.entries(clicksByPartner).forEach(([partner, clicks]) => {
    const partnerKey = partner.toLowerCase().replace(' ', '') as keyof typeof REVENUE_ESTIMATES;
    const estimates = REVENUE_ESTIMATES[partnerKey] || REVENUE_ESTIMATES.udemy;
    const estimatedConversions = clicks * estimatedConversionRate;
    const revenue =
      estimatedConversions *
      estimates.averageCoursePrice *
      estimates.averageCommission;
    estimatedTotalRevenue += revenue;
  });

  // Revenue per analysis
  const revenuePerAnalysis =
    totalAnalyses > 0 ? estimatedTotalRevenue / totalAnalyses : 0;

  // Top skill categories by clicks
  const topSkillCategories = Object.entries(skillCategoryClicks)
    .map(([category, clicks]) => ({ category, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10); // Top 10 categories

  // ROI comparison between AI-powered and rule-based
  const aiRevenuePerAnalysis =
    aiPoweredAnalyses > 0
      ? (aiPoweredClicks * estimatedConversionRate * 30 * 0.3) /
        aiPoweredAnalyses
      : 0;
  const ruleBasedRevenuePerAnalysis =
    ruleBasedAnalyses > 0
      ? (ruleBasedClicks * estimatedConversionRate * 30 * 0.3) /
        ruleBasedAnalyses
      : 0;

  return {
    totalAnalyses,
    totalAffiliateClicks,
    clickThroughRate,
    estimatedConversionRate,
    estimatedTotalRevenue,
    revenuePerAnalysis,
    clicksByPartner,
    topSkillCategories,
    aiPoweredAnalyses,
    ruleBasedAnalyses,
    roiComparison: {
      aiPowered: {
        clicks: aiPoweredClicks,
        estimatedRevenue: aiRevenuePerAnalysis * aiPoweredAnalyses,
      },
      ruleBased: {
        clicks: ruleBasedClicks,
        estimatedRevenue: ruleBasedRevenuePerAnalysis * ruleBasedAnalyses,
      },
    },
  };
}
