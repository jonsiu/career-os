/**
 * Performance Metrics Analytics API
 * Task 5.2.2: Add performance monitoring and metrics tracking
 *
 * GET /api/analytics/performance
 *
 * Returns comprehensive performance metrics including:
 * - O*NET API response times and cache hit rate
 * - AI analysis duration and timeout rate
 * - Affiliate click-through rate (CTR) and conversion
 * - Analysis completion times (initial and AI)
 * - Error rates and failure tracking
 *
 * This endpoint is used for monitoring performance targets from spec:
 * - Initial analysis <10s
 * - AI analysis <30s
 * - O*NET cache hit rate >85%
 * - Error rate <1%
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { performanceMonitor } from '@/lib/utils/performance-monitor';

/**
 * GET /api/analytics/performance
 *
 * Get current performance metrics summary
 * Requires authentication for security
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Get comprehensive metrics summary
    const summary = performanceMonitor.getMetricsSummary();

    // Get specific analysis metrics
    const initialAnalysisMetrics = performanceMonitor.getAnalysisMetrics('initial-analysis');
    const aiAnalysisMetrics = performanceMonitor.getAnalysisMetrics('ai-transferable-skills');
    const onetApiMetrics = performanceMonitor.getAnalysisMetrics('onet-api-fetch');

    // Calculate performance target compliance
    const targets = {
      initialAnalysisMs: 10000,
      aiAnalysisMs: 30000,
      onetCacheHitRate: 0.85,
      errorRate: 0.01,
    };

    const compliance = {
      initialAnalysis: {
        target: '<10 seconds',
        avgDuration: `${(initialAnalysisMetrics.avgDuration / 1000).toFixed(2)}s`,
        p95Duration: `${(initialAnalysisMetrics.p95Duration / 1000).toFixed(2)}s`,
        compliant: initialAnalysisMetrics.avgDuration < targets.initialAnalysisMs,
      },
      aiAnalysis: {
        target: '<30 seconds',
        avgDuration: `${(aiAnalysisMetrics.avgDuration / 1000).toFixed(2)}s`,
        p95Duration: `${(aiAnalysisMetrics.p95Duration / 1000).toFixed(2)}s`,
        compliant: aiAnalysisMetrics.avgDuration < targets.aiAnalysisMs,
      },
      onetCache: {
        target: '>85% hit rate',
        hitRate: `${(summary.onetCache.hitRate * 100).toFixed(1)}%`,
        compliant: summary.onetCache.hitRate >= targets.onetCacheHitRate,
      },
      errorRate: {
        target: '<1% error rate',
        initialAnalysisErrors: `${(initialAnalysisMetrics.errorRate * 100).toFixed(2)}%`,
        aiAnalysisErrors: `${(aiAnalysisMetrics.errorRate * 100).toFixed(2)}%`,
        compliant: initialAnalysisMetrics.errorRate < targets.errorRate &&
                   aiAnalysisMetrics.errorRate < targets.errorRate,
      },
    };

    // Return comprehensive metrics
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        onetCache: {
          hits: summary.onetCache.hits,
          misses: summary.onetCache.misses,
          hitRate: `${(summary.onetCache.hitRate * 100).toFixed(1)}%`,
        },
        aiCache: {
          hits: summary.aiCache.hits,
          misses: summary.aiCache.misses,
          hitRate: `${(summary.aiCache.hitRate * 100).toFixed(1)}%`,
        },
        affiliateCTR: `${(summary.affiliateCTR * 100).toFixed(1)}%`,
      },
      initialAnalysis: {
        totalAnalyses: initialAnalysisMetrics.totalAnalyses,
        avgDuration: `${(initialAnalysisMetrics.avgDuration / 1000).toFixed(2)}s`,
        p95Duration: `${(initialAnalysisMetrics.p95Duration / 1000).toFixed(2)}s`,
        errorCount: initialAnalysisMetrics.errorCount,
        errorRate: `${(initialAnalysisMetrics.errorRate * 100).toFixed(2)}%`,
      },
      aiAnalysis: {
        totalAnalyses: aiAnalysisMetrics.totalAnalyses,
        avgDuration: `${(aiAnalysisMetrics.avgDuration / 1000).toFixed(2)}s`,
        p95Duration: `${(aiAnalysisMetrics.p95Duration / 1000).toFixed(2)}s`,
        timeoutCount: aiAnalysisMetrics.timeoutCount,
        errorCount: aiAnalysisMetrics.errorCount,
        errorRate: `${(aiAnalysisMetrics.errorRate * 100).toFixed(2)}%`,
      },
      onetApi: {
        totalRequests: onetApiMetrics.totalAnalyses,
        avgDuration: `${onetApiMetrics.avgDuration.toFixed(0)}ms`,
        errorCount: onetApiMetrics.errorCount,
        errorRate: `${(onetApiMetrics.errorRate * 100).toFixed(2)}%`,
      },
      compliance,
      alerts: generateAlerts(compliance),
    });

  } catch (error) {
    console.error('Performance metrics API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/performance/reset
 *
 * Reset performance metrics (useful for testing and monitoring window resets)
 * Admin-only endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Note: In production, add admin role check here
    // For now, allow any authenticated user to reset metrics

    // Reset all metrics
    performanceMonitor.resetMetrics();

    return NextResponse.json({
      success: true,
      message: 'Performance metrics reset successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Performance metrics reset error:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate alerts for performance target violations
 */
function generateAlerts(compliance: any): string[] {
  const alerts: string[] = [];

  if (!compliance.initialAnalysis.compliant) {
    alerts.push(
      `Initial analysis duration (${compliance.initialAnalysis.avgDuration}) exceeds target of <10s`
    );
  }

  if (!compliance.aiAnalysis.compliant) {
    alerts.push(
      `AI analysis duration (${compliance.aiAnalysis.avgDuration}) exceeds target of <30s`
    );
  }

  if (!compliance.onetCache.compliant) {
    alerts.push(
      `O*NET cache hit rate (${compliance.onetCache.hitRate}) below target of >85%`
    );
  }

  if (!compliance.errorRate.compliant) {
    alerts.push(
      `Error rate exceeds target of <1%`
    );
  }

  return alerts;
}
