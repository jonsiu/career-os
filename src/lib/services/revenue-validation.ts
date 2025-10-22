/**
 * Revenue Target Validation
 * Task Group 5.3.4: Validate revenue targets from spec
 *
 * This module validates that the skill gap analysis feature meets revenue targets
 * specified in the spec:
 * - Affiliate click-through rate (CTR) target: 45%+
 * - Affiliate conversion rate target: 8-12%
 * - Revenue per analysis target: $3-5
 *
 * Monitors performance against targets and provides recommendations for optimization.
 */

/**
 * Revenue targets from spec (agent-os/specs/2025-10-17-skill-gap-analysis-for-transitions/spec.md)
 */
export const REVENUE_TARGETS = {
  // Click-through rate: % of analyses that result in at least one affiliate click
  clickThroughRate: {
    min: 0.45, // 45%+ target
    ideal: 0.60, // 60% ideal
    description: 'Percentage of analyses that result in at least one affiliate click',
  },

  // Conversion rate: % of clicks that result in course enrollment/purchase
  conversionRate: {
    min: 0.08, // 8% minimum
    ideal: 0.12, // 12% ideal
    description: 'Percentage of clicks that result in course enrollment/purchase',
  },

  // Revenue per analysis: Average revenue generated per skill gap analysis
  revenuePerAnalysis: {
    min: 3.0, // $3 minimum
    ideal: 5.0, // $5 ideal
    description: 'Average revenue generated per skill gap analysis',
  },
};

/**
 * Performance status for a metric
 */
export type MetricStatus = 'exceeds' | 'meets' | 'below' | 'critical';

/**
 * Validation result for a single metric
 */
export interface MetricValidation {
  metric: string;
  current: number;
  target: {
    min: number;
    ideal: number;
  };
  status: MetricStatus;
  percentOfTarget: number; // % of minimum target achieved
  recommendations: string[];
}

/**
 * Overall revenue validation result
 */
export interface RevenueValidationResult {
  overallStatus: MetricStatus;
  meetsAllTargets: boolean;
  validatedAt: number;
  metrics: {
    clickThroughRate: MetricValidation;
    conversionRate: MetricValidation;
    revenuePerAnalysis: MetricValidation;
  };
  summary: string;
  actionItems: string[];
}

/**
 * RevenueValidator
 *
 * Validates actual performance against revenue targets and provides optimization
 * recommendations.
 */
export class RevenueValidator {
  /**
   * Validate current metrics against revenue targets
   *
   * @param metrics - Current performance metrics
   * @returns Validation result with status and recommendations
   */
  validate(metrics: {
    clickThroughRate: number;
    conversionRate: number;
    revenuePerAnalysis: number;
  }): RevenueValidationResult {
    // Validate each metric
    const ctrValidation = this.validateMetric(
      'clickThroughRate',
      metrics.clickThroughRate,
      REVENUE_TARGETS.clickThroughRate
    );

    const conversionValidation = this.validateMetric(
      'conversionRate',
      metrics.conversionRate,
      REVENUE_TARGETS.conversionRate
    );

    const revenueValidation = this.validateMetric(
      'revenuePerAnalysis',
      metrics.revenuePerAnalysis,
      REVENUE_TARGETS.revenuePerAnalysis
    );

    // Determine overall status (worst of all metrics)
    const statuses = [
      ctrValidation.status,
      conversionValidation.status,
      revenueValidation.status,
    ];
    const overallStatus = this.determineOverallStatus(statuses);

    // Check if all targets are met
    const meetsAllTargets =
      ctrValidation.status !== 'critical' &&
      ctrValidation.status !== 'below' &&
      conversionValidation.status !== 'critical' &&
      conversionValidation.status !== 'below' &&
      revenueValidation.status !== 'critical' &&
      revenueValidation.status !== 'below';

    // Generate summary
    const summary = this.generateSummary(
      overallStatus,
      meetsAllTargets,
      ctrValidation,
      conversionValidation,
      revenueValidation
    );

    // Aggregate action items
    const actionItems = [
      ...ctrValidation.recommendations,
      ...conversionValidation.recommendations,
      ...revenueValidation.recommendations,
    ];

    return {
      overallStatus,
      meetsAllTargets,
      validatedAt: Date.now(),
      metrics: {
        clickThroughRate: ctrValidation,
        conversionRate: conversionValidation,
        revenuePerAnalysis: revenueValidation,
      },
      summary,
      actionItems,
    };
  }

  /**
   * Validate a single metric against its target
   *
   * @param metricName - Metric name
   * @param current - Current metric value
   * @param target - Target configuration
   * @returns Validation result for the metric
   */
  private validateMetric(
    metricName: string,
    current: number,
    target: { min: number; ideal: number; description: string }
  ): MetricValidation {
    // Calculate status
    let status: MetricStatus;
    if (current >= target.ideal) {
      status = 'exceeds';
    } else if (current >= target.min) {
      status = 'meets';
    } else if (current >= target.min * 0.8) {
      status = 'below';
    } else {
      status = 'critical';
    }

    // Calculate percentage of target
    const percentOfTarget = (current / target.min) * 100;

    // Generate recommendations based on status
    const recommendations = this.generateRecommendations(
      metricName,
      status,
      current,
      target
    );

    return {
      metric: metricName,
      current,
      target: {
        min: target.min,
        ideal: target.ideal,
      },
      status,
      percentOfTarget,
      recommendations,
    };
  }

  /**
   * Determine overall status from individual metric statuses
   */
  private determineOverallStatus(statuses: MetricStatus[]): MetricStatus {
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('below')) return 'below';
    if (statuses.includes('meets')) return 'meets';
    return 'exceeds';
  }

  /**
   * Generate recommendations for improving a metric
   */
  private generateRecommendations(
    metricName: string,
    status: MetricStatus,
    current: number,
    target: { min: number; ideal: number; description: string }
  ): string[] {
    const recommendations: string[] = [];

    if (status === 'exceeds') {
      // Metric exceeds target - maintain performance
      recommendations.push(
        `${metricName}: Exceeding target (${(current * 100).toFixed(1)}% vs ${target.ideal * 100}% ideal). Continue current strategy.`
      );
      return recommendations;
    }

    // Generate metric-specific recommendations based on status
    switch (metricName) {
      case 'clickThroughRate':
        if (status === 'critical' || status === 'below') {
          recommendations.push(
            'CTR below target: Improve course recommendation relevance by fine-tuning AI transferable skills matcher.'
          );
          recommendations.push(
            'CTR below target: Highlight "quick wins" (high-priority, short-duration courses) more prominently.'
          );
          recommendations.push(
            'CTR below target: Test different recommendation layouts (card vs. list) using A/B testing framework.'
          );
          recommendations.push(
            'CTR below target: Add social proof (ratings, review counts) more prominently to course cards.'
          );
        } else {
          recommendations.push(
            `CTR meets minimum (${(current * 100).toFixed(1)}%): Consider optimizing to reach ideal target (${target.ideal * 100}%).`
          );
        }
        break;

      case 'conversionRate':
        if (status === 'critical' || status === 'below') {
          recommendations.push(
            'Conversion below target: Partner with platforms offering better conversion incentives (discounts, free trials).'
          );
          recommendations.push(
            'Conversion below target: Improve affiliate link trust signals (verified partner badges, FTC disclosure).'
          );
          recommendations.push(
            'Conversion below target: Test showing top 3 vs. top 5 courses per skill to reduce choice paralysis.'
          );
          recommendations.push(
            'Conversion below target: Add urgency indicators (limited-time offers, enrollment deadlines).'
          );
        } else {
          recommendations.push(
            `Conversion meets minimum (${(current * 100).toFixed(1)}%): Monitor partner conversion webhooks for optimization opportunities.`
          );
        }
        break;

      case 'revenuePerAnalysis':
        if (status === 'critical' || status === 'below') {
          recommendations.push(
            `Revenue/analysis below target ($${current.toFixed(2)} vs $${target.min} min): Focus on higher-commission partners (Coursera 45% vs Udemy 15%).`
          );
          recommendations.push(
            'Revenue/analysis below target: Prioritize courses with higher price points while maintaining relevance.'
          );
          recommendations.push(
            'Revenue/analysis below target: Increase CTR and conversion rate to compound revenue impact.'
          );
          recommendations.push(
            'Revenue/analysis below target: Test AI-curated recommendations vs. manual algorithm for better course-skill matching.'
          );
        } else {
          recommendations.push(
            `Revenue/analysis meets minimum ($${current.toFixed(2)}): Continue optimizing CTR and conversion for revenue growth.`
          );
        }
        break;
    }

    return recommendations;
  }

  /**
   * Generate summary text for validation result
   */
  private generateSummary(
    overallStatus: MetricStatus,
    meetsAllTargets: boolean,
    ctr: MetricValidation,
    conversion: MetricValidation,
    revenue: MetricValidation
  ): string {
    if (meetsAllTargets) {
      return `Revenue targets are being met. CTR: ${(ctr.current * 100).toFixed(1)}% (target: ${ctr.target.min * 100}%+), Conversion: ${(conversion.current * 100).toFixed(1)}% (target: ${conversion.target.min * 100}%-${conversion.target.ideal * 100}%), Revenue/Analysis: $${revenue.current.toFixed(2)} (target: $${revenue.target.min}-$${revenue.target.ideal}).`;
    }

    const failingMetrics: string[] = [];
    if (ctr.status === 'critical' || ctr.status === 'below') {
      failingMetrics.push(
        `CTR at ${(ctr.current * 100).toFixed(1)}% (${ctr.percentOfTarget.toFixed(0)}% of target)`
      );
    }
    if (conversion.status === 'critical' || conversion.status === 'below') {
      failingMetrics.push(
        `Conversion at ${(conversion.current * 100).toFixed(1)}% (${conversion.percentOfTarget.toFixed(0)}% of target)`
      );
    }
    if (revenue.status === 'critical' || revenue.status === 'below') {
      failingMetrics.push(
        `Revenue at $${revenue.current.toFixed(2)} (${revenue.percentOfTarget.toFixed(0)}% of target)`
      );
    }

    return `Revenue targets not fully met (Status: ${overallStatus}). Metrics below target: ${failingMetrics.join(', ')}. See recommendations for optimization.`;
  }

  /**
   * Log validation result to console
   *
   * @param result - Validation result to log
   */
  logValidationResult(result: RevenueValidationResult): void {
    console.log('\n=== Revenue Target Validation Report ===');
    console.log(`Overall Status: ${result.overallStatus.toUpperCase()}`);
    console.log(`All Targets Met: ${result.meetsAllTargets ? 'YES' : 'NO'}`);
    console.log(
      `Validated At: ${new Date(result.validatedAt).toISOString()}\n`
    );

    console.log('METRICS:');
    Object.values(result.metrics).forEach((metric) => {
      const displayValue =
        metric.metric === 'revenuePerAnalysis'
          ? `$${metric.current.toFixed(2)}`
          : `${(metric.current * 100).toFixed(1)}%`;
      const targetMin =
        metric.metric === 'revenuePerAnalysis'
          ? `$${metric.target.min}`
          : `${(metric.target.min * 100).toFixed(0)}%`;
      const targetIdeal =
        metric.metric === 'revenuePerAnalysis'
          ? `$${metric.target.ideal}`
          : `${(metric.target.ideal * 100).toFixed(0)}%`;

      console.log(`\n${metric.metric}:`);
      console.log(`  Current: ${displayValue}`);
      console.log(`  Target: ${targetMin} - ${targetIdeal}`);
      console.log(`  Status: ${metric.status.toUpperCase()}`);
      console.log(
        `  % of Target: ${metric.percentOfTarget.toFixed(1)}%`
      );
    });

    console.log(`\nSUMMARY:\n${result.summary}`);

    if (result.actionItems.length > 0) {
      console.log('\nRECOMMENDATIONS:');
      result.actionItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`);
      });
    }

    console.log('\n========================================\n');
  }
}
