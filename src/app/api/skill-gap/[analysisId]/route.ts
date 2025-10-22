import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/nextjs';
import { api } from '@/lib/convex-client';
import { performanceMonitor } from '@/lib/utils/performance-monitor';

/**
 * GET /api/skill-gap/[analysisId]
 *
 * Retrieve a specific skill gap analysis by ID.
 * Validates that the requesting user owns the analysis for security.
 *
 * Task 5.2.1: Add pagination support for large roadmaps (>20 skills)
 *
 * Path Parameters:
 * - analysisId: Analysis document ID
 *
 * Query Parameters (optional):
 * - page: Page number for pagination (default: 1)
 * - pageSize: Items per page (default: 20, max: 100)
 * - includeRoadmap: Include full roadmap (default: true, set to false for summary)
 *
 * Output:
 * - analysis: Full analysis document with all fields
 * - pagination: Pagination info if roadmap is paginated
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validate analysisId parameter
    const { analysisId } = params;
    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // 3. Parse query parameters for pagination (Task 5.2.1)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || '20', 10),
      100 // Max 100 items per page
    );
    const includeRoadmap = searchParams.get('includeRoadmap') !== 'false';

    if (page < 1 || pageSize < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters: page and pageSize must be positive integers' },
        { status: 400 }
      );
    }

    // 4. Initialize Convex client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is not set');
    }

    const convex = new ConvexHttpClient(convexUrl);

    // 5. Get user from Convex
    const userQueryStart = Date.now();
    const user = await convex.query(api.users.getByClerkUserId, { clerkUserId: userId });
    performanceMonitor.recordMetric({
      operation: 'convex-query-user',
      duration: Date.now() - userQueryStart,
      success: !!user,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 6. Retrieve analysis by ID
    const analysisQueryStart = Date.now();
    const analysis = await convex.query(api.skillGapAnalyses.getById, {
      analysisId: analysisId as any, // Type assertion for Convex ID
    });
    performanceMonitor.recordMetric({
      operation: 'convex-query-analysis',
      duration: Date.now() - analysisQueryStart,
      success: !!analysis,
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // 7. Security check: Verify user owns the analysis
    if (analysis.userId !== user._id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this analysis' },
        { status: 403 }
      );
    }

    // 8. Paginate roadmap if it's large (Task 5.2.1)
    const roadmap = analysis.prioritizedRoadmap || [];
    const totalRoadmapItems = roadmap.length;
    const needsPagination = totalRoadmapItems > 20;

    let paginatedRoadmap = roadmap;
    let paginationInfo = undefined;

    if (needsPagination && includeRoadmap) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      paginatedRoadmap = roadmap.slice(startIndex, endIndex);

      paginationInfo = {
        currentPage: page,
        pageSize,
        totalItems: totalRoadmapItems,
        totalPages: Math.ceil(totalRoadmapItems / pageSize),
        hasNextPage: endIndex < totalRoadmapItems,
        hasPreviousPage: page > 1,
      };

      console.log(
        `Paginating roadmap: ${totalRoadmapItems} items, ` +
        `page ${page}/${paginationInfo.totalPages}, ` +
        `showing items ${startIndex + 1}-${Math.min(endIndex, totalRoadmapItems)}`
      );
    }

    // 9. Track total request duration
    const duration = Date.now() - startTime;
    performanceMonitor.recordMetric({
      operation: 'get-analysis-by-id',
      duration,
      success: true,
      metadata: {
        paginated: needsPagination,
        totalRoadmapItems,
      },
    });

    // 10. Return analysis data (with pagination if needed)
    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis._id,
        targetRole: analysis.targetRole,
        targetRoleONetCode: analysis.targetRoleONetCode,
        criticalGaps: analysis.criticalGaps,
        niceToHaveGaps: analysis.niceToHaveGaps,
        transferableSkills: analysis.transferableSkills,
        roadmap: includeRoadmap ? paginatedRoadmap : undefined,
        userAvailability: analysis.userAvailability,
        transitionType: analysis.transitionType,
        completionProgress: analysis.completionProgress,
        contentHash: analysis.contentHash,
        analysisVersion: analysis.analysisVersion,
        metadata: analysis.metadata,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      },
      pagination: paginationInfo,
      performanceMetrics: {
        totalDuration: `${duration}ms`,
        paginated: needsPagination,
      },
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    // Track failed request
    performanceMonitor.recordMetric({
      operation: 'get-analysis-by-id',
      duration,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    console.error('Error retrieving skill gap analysis:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
