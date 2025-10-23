/**
 * Performance Monitoring Utility
 *
 * Tracks and logs performance metrics for skill gap analysis operations.
 * Monitors O*NET API response times, cache hit rates, AI analysis duration,
 * and affiliate click-through rates.
 *
 * For MVP: Logs to console with structured format
 * Future: Integration with Sentry/DataDog for production monitoring
 */

export interface PerformanceMetric {
  operation: string;
  duration: number; // milliseconds
  success: boolean;
  cached?: boolean;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number; // percentage
  lastReset: number;
}

export interface AnalysisMetrics {
  totalAnalyses: number;
  avgDuration: number;
  p95Duration: number;
  timeoutCount: number;
  errorCount: number;
  errorRate: number; // percentage
}

/**
 * Performance Monitor Class
 *
 * Singleton pattern for tracking performance metrics across the application.
 * Provides real-time monitoring and alerting for performance targets.
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private onetCacheStats = { hits: 0, misses: 0 };
  private aiCacheStats = { hits: 0, misses: 0 };
  private affiliateCTR = { clicks: 0, views: 0 };

  // Performance targets from spec
  private readonly TARGETS = {
    INITIAL_ANALYSIS_MS: 10000, // <10 seconds
    AI_ANALYSIS_MS: 30000, // <30 seconds
    ONET_CACHE_HIT_RATE: 0.85, // >85%
    CONVEX_QUERY_MS: 500, // <500ms
    ERROR_RATE: 0.01, // <1%
  };

  private constructor() {
    // Initialize periodic cleanup of old metrics (keep last 1000 entries)
    if (typeof window === 'undefined') {
      // Server-side only
      setInterval(() => this.cleanupOldMetrics(), 60000); // Every minute
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start tracking an operation
   */
  public startOperation(operationName: string): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      return duration;
    };
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    // Log to console with structured format
    this.logMetric(fullMetric);

    // Check for performance target violations
    this.checkPerformanceTargets(fullMetric);
  }

  /**
   * Track O*NET cache hit or miss
   */
  public trackONetCache(isHit: boolean): void {
    if (isHit) {
      this.onetCacheStats.hits++;
    } else {
      this.onetCacheStats.misses++;
    }

    const hitRate = this.getONetCacheHitRate();

    // Alert if cache hit rate drops below target (after warmup period)
    const totalRequests = this.onetCacheStats.hits + this.onetCacheStats.misses;
    if (totalRequests > 50 && hitRate < this.TARGETS.ONET_CACHE_HIT_RATE) {
      console.warn(
        `[PERFORMANCE WARNING] O*NET cache hit rate (${(hitRate * 100).toFixed(1)}%) ` +
        `is below target (${(this.TARGETS.ONET_CACHE_HIT_RATE * 100)}%)`
      );
    }
  }

  /**
   * Track AI cache hit or miss
   */
  public trackAICache(isHit: boolean): void {
    if (isHit) {
      this.aiCacheStats.hits++;
    } else {
      this.aiCacheStats.misses++;
    }
  }

  /**
   * Track affiliate click-through
   */
  public trackAffiliateCTR(event: 'view' | 'click'): void {
    if (event === 'view') {
      this.affiliateCTR.views++;
    } else {
      this.affiliateCTR.clicks++;
    }
  }

  /**
   * Get O*NET cache statistics
   */
  public getONetCacheMetrics(): CacheMetrics {
    const total = this.onetCacheStats.hits + this.onetCacheStats.misses;
    const hitRate = total > 0 ? this.onetCacheStats.hits / total : 0;

    return {
      hits: this.onetCacheStats.hits,
      misses: this.onetCacheStats.misses,
      hitRate,
      lastReset: Date.now(),
    };
  }

  /**
   * Get O*NET cache hit rate
   */
  public getONetCacheHitRate(): number {
    const total = this.onetCacheStats.hits + this.onetCacheStats.misses;
    return total > 0 ? this.onetCacheStats.hits / total : 0;
  }

  /**
   * Get AI cache statistics
   */
  public getAICacheMetrics(): CacheMetrics {
    const total = this.aiCacheStats.hits + this.aiCacheStats.misses;
    const hitRate = total > 0 ? this.aiCacheStats.hits / total : 0;

    return {
      hits: this.aiCacheStats.hits,
      misses: this.aiCacheStats.misses,
      hitRate,
      lastReset: Date.now(),
    };
  }

  /**
   * Get affiliate click-through rate
   */
  public getAffiliateCTR(): number {
    return this.affiliateCTR.views > 0
      ? this.affiliateCTR.clicks / this.affiliateCTR.views
      : 0;
  }

  /**
   * Get analysis performance metrics
   */
  public getAnalysisMetrics(operationName: string): AnalysisMetrics {
    const relevantMetrics = this.metrics.filter(m => m.operation === operationName);

    if (relevantMetrics.length === 0) {
      return {
        totalAnalyses: 0,
        avgDuration: 0,
        p95Duration: 0,
        timeoutCount: 0,
        errorCount: 0,
        errorRate: 0,
      };
    }

    const durations = relevantMetrics.map(m => m.duration).sort((a, b) => a - b);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const p95Index = Math.floor(durations.length * 0.95);
    const p95Duration = durations[p95Index] || durations[durations.length - 1];

    const timeoutCount = relevantMetrics.filter(m =>
      m.error && m.error.toLowerCase().includes('timeout')
    ).length;

    const errorCount = relevantMetrics.filter(m => !m.success).length;
    const errorRate = errorCount / relevantMetrics.length;

    return {
      totalAnalyses: relevantMetrics.length,
      avgDuration,
      p95Duration,
      timeoutCount,
      errorCount,
      errorRate,
    };
  }

  /**
   * Get summary of all metrics
   */
  public getMetricsSummary(): {
    onetCache: CacheMetrics;
    aiCache: CacheMetrics;
    affiliateCTR: number;
    initialAnalysis: AnalysisMetrics;
    aiAnalysis: AnalysisMetrics;
  } {
    return {
      onetCache: this.getONetCacheMetrics(),
      aiCache: this.getAICacheMetrics(),
      affiliateCTR: this.getAffiliateCTR(),
      initialAnalysis: this.getAnalysisMetrics('initial-analysis'),
      aiAnalysis: this.getAnalysisMetrics('ai-transferable-skills'),
    };
  }

  /**
   * Reset all metrics (useful for testing)
   */
  public resetMetrics(): void {
    this.metrics = [];
    this.onetCacheStats = { hits: 0, misses: 0 };
    this.aiCacheStats = { hits: 0, misses: 0 };
    this.affiliateCTR = { clicks: 0, views: 0 };
  }

  /**
   * Log metric to console with structured format
   */
  private logMetric(metric: PerformanceMetric): void {
    const level = metric.success ? 'info' : 'error';
    const cached = metric.cached ? ' [CACHED]' : '';

    console.log(
      JSON.stringify({
        level,
        type: 'performance',
        operation: metric.operation,
        duration: `${metric.duration}ms`,
        success: metric.success,
        cached: metric.cached || false,
        error: metric.error,
        metadata: metric.metadata,
        timestamp: new Date(metric.timestamp).toISOString(),
      })
    );

    // Also log human-readable version for development
    if (process.env.NODE_ENV === 'development') {
      const status = metric.success ? '\u2713' : '\u2717'; // ✓ or ✗
      console.log(
        `[${status}] ${metric.operation}${cached}: ${metric.duration}ms` +
        (metric.error ? ` - Error: ${metric.error}` : '')
      );
    }
  }

  /**
   * Check if metric violates performance targets and alert
   */
  private checkPerformanceTargets(metric: PerformanceMetric): void {
    // Check initial analysis target (<10 seconds)
    if (metric.operation === 'initial-analysis' && metric.duration > this.TARGETS.INITIAL_ANALYSIS_MS) {
      console.warn(
        `[PERFORMANCE WARNING] Initial analysis took ${metric.duration}ms, ` +
        `exceeding target of ${this.TARGETS.INITIAL_ANALYSIS_MS}ms`
      );
    }

    // Check AI analysis target (<30 seconds)
    if (metric.operation === 'ai-transferable-skills' && metric.duration > this.TARGETS.AI_ANALYSIS_MS) {
      console.warn(
        `[PERFORMANCE WARNING] AI analysis took ${metric.duration}ms, ` +
        `exceeding target of ${this.TARGETS.AI_ANALYSIS_MS}ms`
      );
    }

    // Check Convex query target (<500ms)
    if (metric.operation.includes('convex-query') && metric.duration > this.TARGETS.CONVEX_QUERY_MS) {
      console.warn(
        `[PERFORMANCE WARNING] Convex query took ${metric.duration}ms, ` +
        `exceeding target of ${this.TARGETS.CONVEX_QUERY_MS}ms`
      );
    }

    // Check error rate target (<1%)
    const recentMetrics = this.metrics.slice(-100); // Last 100 operations
    if (recentMetrics.length >= 100) {
      const errorCount = recentMetrics.filter(m => !m.success).length;
      const errorRate = errorCount / recentMetrics.length;

      if (errorRate > this.TARGETS.ERROR_RATE) {
        console.error(
          `[PERFORMANCE ALERT] Error rate (${(errorRate * 100).toFixed(2)}%) ` +
          `exceeds target (${(this.TARGETS.ERROR_RATE * 100)}%)`
        );
      }
    }
  }

  /**
   * Clean up old metrics to prevent memory growth
   */
  private cleanupOldMetrics(): void {
    if (this.metrics.length > 1000) {
      const toRemove = this.metrics.length - 1000;
      this.metrics.splice(0, toRemove);
      console.log(`[PERFORMANCE] Cleaned up ${toRemove} old metrics`);
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
