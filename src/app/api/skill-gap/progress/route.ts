import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/nextjs';
import { api } from '@/lib/convex-client';

/**
 * POST /api/skill-gap/progress
 *
 * Update completion progress for a skill gap analysis based on user's
 * Skills Tracker data. Calculates progress by comparing analysis gaps
 * with completed/mastered skills in the Skills Tracker.
 *
 * Input:
 * - analysisId: Analysis document ID
 *
 * Output:
 * - completionProgress: Updated progress percentage (0-100)
 * - closedGaps: Number of gaps that have been closed
 * - totalGaps: Total number of gaps in the analysis
 * - gapBreakdown: Detailed breakdown of closed vs. open gaps
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const { analysisId } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Missing required field: analysisId' },
        { status: 400 }
      );
    }

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

    // 5. Retrieve analysis by ID
    const analysis = await convex.query(api.skillGapAnalyses.getById, {
      analysisId: analysisId as any, // Type assertion for Convex ID
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // 6. Security check: Verify user owns the analysis
    if (analysis.userId !== user._id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this analysis' },
        { status: 403 }
      );
    }

    // 7. Get all user's skills from Skills Tracker
    const userSkills = await convex.query(api.skills.getByUserId, {
      userId: user._id,
    });

    // 8. Create a map of skill names to their status for quick lookup
    const skillStatusMap = new Map<string, string>();
    userSkills.forEach((skill: any) => {
      skillStatusMap.set(skill.name.toLowerCase(), skill.status);
    });

    // 9. Combine all gaps (critical + nice-to-have)
    const allGaps = [
      ...analysis.criticalGaps,
      ...analysis.niceToHaveGaps,
    ];

    const totalGaps = allGaps.length;

    // 10. Count closed gaps (skills that are mastered or practicing with high progress)
    let closedGaps = 0;
    const closedGapNames: string[] = [];
    const openGapNames: string[] = [];

    allGaps.forEach((gap: any) => {
      const skillStatus = skillStatusMap.get(gap.skillName.toLowerCase());

      // Consider a gap "closed" if user has mastered or is practicing the skill
      if (skillStatus === 'mastered' || skillStatus === 'practicing') {
        closedGaps++;
        closedGapNames.push(gap.skillName);
      } else {
        openGapNames.push(gap.skillName);
      }
    });

    // 11. Calculate completion progress percentage
    const completionProgress = totalGaps > 0
      ? Math.round((closedGaps / totalGaps) * 100)
      : 0;

    // 12. Update analysis with new progress
    await convex.mutation(api.skillGapAnalyses.updateProgress, {
      analysisId: analysisId as any,
      completionProgress,
    });

    // 13. Return progress update results
    return NextResponse.json({
      success: true,
      completionProgress,
      closedGaps,
      totalGaps,
      gapBreakdown: {
        criticalGaps: {
          total: analysis.criticalGaps.length,
          closed: analysis.criticalGaps.filter((gap: any) =>
            skillStatusMap.get(gap.skillName.toLowerCase()) === 'mastered' ||
            skillStatusMap.get(gap.skillName.toLowerCase()) === 'practicing'
          ).length,
        },
        niceToHaveGaps: {
          total: analysis.niceToHaveGaps.length,
          closed: analysis.niceToHaveGaps.filter((gap: any) =>
            skillStatusMap.get(gap.skillName.toLowerCase()) === 'mastered' ||
            skillStatusMap.get(gap.skillName.toLowerCase()) === 'practicing'
          ).length,
        },
      },
      details: {
        closedGapNames,
        openGapNames,
      },
      previousProgress: analysis.completionProgress,
      progressChange: completionProgress - analysis.completionProgress,
    });

  } catch (error) {
    console.error('Error updating skill gap progress:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
