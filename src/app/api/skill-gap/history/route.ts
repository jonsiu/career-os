import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/lib/convex-client';

/**
 * GET /api/skill-gap/history
 *
 * Retrieve historical skill gap analyses for the current user.
 * Results are sorted by creation date (most recent first).
 *
 * Query Parameters:
 * - targetRole (optional): Filter analyses by target role
 *
 * Output:
 * - analyses: Array of historical analyses with metadata
 * - count: Total number of analyses returned
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

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const targetRoleFilter = searchParams.get('targetRole');

    // 3. Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is not set');
    }

    const convex = new ConvexHttpClient(convexUrl);

    // 4. Get user from Convex
    const user = await convex.query(api.users.getByClerkUserId, { clerkUserId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 5. Retrieve historical analyses
    const analyses = await convex.query(api.skillGapAnalyses.getByUserId, {
      userId: user._id,
    });

    // 6. Filter by target role if specified
    let filteredAnalyses = analyses;
    if (targetRoleFilter) {
      filteredAnalyses = analyses.filter(
        (analysis: any) => analysis.targetRole === targetRoleFilter
      );
    }

    // 7. Map to summary format (exclude large fields for performance)
    const analysesSummary = filteredAnalyses.map((analysis: any) => ({
      id: analysis._id,
      targetRole: analysis.targetRole,
      targetRoleONetCode: analysis.targetRoleONetCode,
      transitionType: analysis.transitionType,
      completionProgress: analysis.completionProgress,
      criticalGapsCount: Array.isArray(analysis.criticalGaps) ? analysis.criticalGaps.length : 0,
      niceToHaveGapsCount: Array.isArray(analysis.niceToHaveGaps) ? analysis.niceToHaveGaps.length : 0,
      transferableSkillsCount: Array.isArray(analysis.transferableSkills) ? analysis.transferableSkills.length : 0,
      roadmapPhases: Array.isArray(analysis.prioritizedRoadmap) ? analysis.prioritizedRoadmap.length : 0,
      userAvailability: analysis.userAvailability,
      analysisVersion: analysis.analysisVersion,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
      metadata: {
        onetDataVersion: analysis.metadata?.onetDataVersion,
        aiModel: analysis.metadata?.aiModel,
        lastProgressUpdate: analysis.metadata?.lastProgressUpdate,
      },
    }));

    // 8. Return analyses sorted by createdAt (descending - most recent first)
    // Already sorted by Convex query with .order("desc")
    return NextResponse.json({
      success: true,
      analyses: analysesSummary,
      count: analysesSummary.length,
      filters: {
        targetRole: targetRoleFilter || null,
      },
    });

  } catch (error) {
    console.error('Error retrieving skill gap analysis history:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
