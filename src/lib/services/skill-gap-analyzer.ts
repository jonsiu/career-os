/**
 * SkillGapAnalyzer Service
 *
 * Implements multi-factor prioritization algorithm and timeline estimation
 * for skill gap analysis in career transitions.
 *
 * Features:
 * - Multi-factor priority scoring (impact, time, market demand, career capital, learning velocity)
 * - Timeline estimation with user availability and learning velocity
 * - Quick wins identification (high impact, low time)
 * - Learning velocity calculation from Skills Tracker history
 *
 * Formula:
 * PriorityScore = (
 *   ImpactOnRoleReadiness * 0.30 +
 *   (1/TimeToAcquire_normalized) * 0.25 +
 *   MarketDemand * 0.20 +
 *   CareerCapital * 0.15 +
 *   LearningVelocity * 0.10
 * ) * 100
 */

import { Skill } from '@/lib/abstractions/types';

export interface SkillGap {
  skillName: string;
  onetCode?: string;
  importance: number; // 0-1 scale
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  timeToAcquire: number; // hours
  marketDemand: number; // 0-1 scale
  careerCapital: number; // 0-1 scale
}

export interface PrioritizedSkillGap extends SkillGap {
  priorityScore: number; // 0-100 scale
}

export interface ResumeSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface TargetSkill {
  skillName: string;
  skillCode: string;
  importance: number; // 1-100 from O*NET
  level: number; // 0-7 scale from O*NET
  category: string;
}

export interface TimelineEstimate {
  estimatedHours: number;
  weeksToComplete: number;
  complexity: 'basic' | 'intermediate' | 'advanced';
}

export interface RoadmapPhase {
  phase: number; // 1, 2, 3
  skills: string[];
  estimatedDuration: number; // weeks
  milestoneTitle: string;
}

export class SkillGapAnalyzer {
  /**
   * Analyze skill gaps between current skills and target role requirements
   *
   * @param resumeSkills - Skills extracted from user's resume
   * @param targetSkills - Target role skill requirements from O*NET
   * @param userAvailability - Hours per week user can dedicate to learning
   * @returns Categorized skill gaps with priority scores
   */
  analyzeGap(
    resumeSkills: ResumeSkill[],
    targetSkills: TargetSkill[],
    userAvailability: number
  ): {
    criticalGaps: SkillGap[];
    niceToHaveGaps: SkillGap[];
    existingSkills: string[];
  } {
    const criticalGaps: SkillGap[] = [];
    const niceToHaveGaps: SkillGap[] = [];
    const existingSkills: string[] = [];

    // Map resume skills by name for quick lookup
    const resumeSkillMap = new Map(
      resumeSkills.map(s => [s.name.toLowerCase(), s])
    );

    for (const targetSkill of targetSkills) {
      const skillNameLower = targetSkill.skillName.toLowerCase();
      const resumeSkill = resumeSkillMap.get(skillNameLower);

      // Convert O*NET importance (1-100) to 0-1 scale
      const importance = targetSkill.importance / 100;

      if (resumeSkill) {
        // User has this skill - check if gap exists
        const currentLevel = this.convertSkillLevelToNumeric(resumeSkill.level);
        const targetLevel = this.convertONetLevelToNumeric(targetSkill.level);

        if (currentLevel >= targetLevel) {
          // Skill meets or exceeds target
          existingSkills.push(targetSkill.skillName);
        } else {
          // Gap exists
          const gap: SkillGap = {
            skillName: targetSkill.skillName,
            onetCode: targetSkill.skillCode,
            importance,
            currentLevel,
            targetLevel,
            timeToAcquire: this.calculateBaseTimeToAcquire(targetSkill.level),
            marketDemand: this.estimateMarketDemand(targetSkill.category),
            careerCapital: this.calculateCareerCapital(importance, targetSkill.level),
          };

          // Categorize by importance
          if (importance >= 0.7) {
            criticalGaps.push(gap);
          } else {
            niceToHaveGaps.push(gap);
          }
        }
      } else {
        // User doesn't have this skill - it's a gap
        const gap: SkillGap = {
          skillName: targetSkill.skillName,
          onetCode: targetSkill.skillCode,
          importance,
          currentLevel: 0,
          targetLevel: this.convertONetLevelToNumeric(targetSkill.level),
          timeToAcquire: this.calculateBaseTimeToAcquire(targetSkill.level),
          marketDemand: this.estimateMarketDemand(targetSkill.category),
          careerCapital: this.calculateCareerCapital(importance, targetSkill.level),
        };

        // Categorize by importance
        if (importance >= 0.7) {
          criticalGaps.push(gap);
        } else {
          niceToHaveGaps.push(gap);
        }
      }
    }

    return {
      criticalGaps,
      niceToHaveGaps,
      existingSkills,
    };
  }

  /**
   * Prioritize skill gaps using multi-factor algorithm
   *
   * Formula:
   * PriorityScore = (
   *   ImpactOnRoleReadiness * 0.30 +
   *   (1/TimeToAcquire_normalized) * 0.25 +
   *   MarketDemand * 0.20 +
   *   CareerCapital * 0.15 +
   *   LearningVelocity * 0.10
   * ) * 100
   *
   * @param gaps - Skill gaps to prioritize
   * @param learningVelocity - User's learning velocity (0-2 scale, 1.0 = average)
   * @returns Gaps sorted by priority score (descending)
   */
  prioritizeGaps(gaps: SkillGap[], learningVelocity: number = 1.0): PrioritizedSkillGap[] {
    const prioritized: PrioritizedSkillGap[] = gaps.map(gap => {
      // Normalize time to acquire (inverse: less time = higher score)
      // Max time assumed to be 400 hours for normalization
      const maxTime = 400;
      const normalizedTime = Math.min(gap.timeToAcquire, maxTime) / maxTime;
      const timeScore = 1 - normalizedTime; // Inverse: less time = higher score

      // Normalize learning velocity to 0-1 scale
      // Velocity range: 0-2, center at 1.0
      const normalizedVelocity = Math.min(learningVelocity / 2, 1);

      // Calculate weighted priority score
      const priorityScore = (
        gap.importance * 0.30 +
        timeScore * 0.25 +
        gap.marketDemand * 0.20 +
        gap.careerCapital * 0.15 +
        normalizedVelocity * 0.10
      ) * 100;

      return {
        ...gap,
        priorityScore: Math.round(priorityScore * 100) / 100, // Round to 2 decimal places
      };
    });

    // Sort by priority score descending
    return prioritized.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Estimate timeline for acquiring a skill
   *
   * Algorithm:
   * - BaseComplexityHours: Basic (0-3): 60h, Intermediate (4-5): 120h, Advanced (6-7): 280h
   * - LearningVelocityMultiplier: Fast (>1.2): 0.8x, Average (0.8-1.2): 1.0x, Slow (<0.8): 1.3x
   * - SkillLevelGapMultiplier: Gap 0-30%: 1.0x, 31-60%: 1.5x, 61-100%: 2.0x
   *
   * @param gap - Skill gap with O*NET level and current/target levels
   * @param userAvailability - Hours per week user can dedicate
   * @param learningVelocity - User's learning velocity
   * @returns Time estimate in hours and weeks
   */
  estimateTimeline(
    gap: { skillName: string; onetLevel: number; currentLevel: number; targetLevel: number },
    userAvailability: number,
    learningVelocity: number
  ): TimelineEstimate {
    // Determine base complexity hours from O*NET level (using midpoint of ranges)
    let baseComplexityHours: number;
    let complexity: 'basic' | 'intermediate' | 'advanced';

    if (gap.onetLevel <= 3) {
      // Basic skills (0-3): 40-80 hours, midpoint = 60
      baseComplexityHours = 60;
      complexity = 'basic';
    } else if (gap.onetLevel <= 5) {
      // Intermediate skills (4-5): 80-160 hours, midpoint = 120
      baseComplexityHours = 120;
      complexity = 'intermediate';
    } else {
      // Advanced skills (6-7): 160-400 hours, midpoint = 280
      baseComplexityHours = 280;
      complexity = 'advanced';
    }

    // Apply learning velocity multiplier
    let velocityMultiplier: number;
    if (learningVelocity > 1.2) {
      velocityMultiplier = 0.8; // Fast learner
    } else if (learningVelocity >= 0.8) {
      velocityMultiplier = 1.0; // Average learner
    } else {
      velocityMultiplier = 1.3; // Slower learner
    }

    // Apply skill level gap multiplier
    const gapPercentage = ((gap.targetLevel - gap.currentLevel) / gap.targetLevel) * 100;
    let gapMultiplier: number;
    if (gapPercentage <= 30) {
      gapMultiplier = 1.0; // Small gap
    } else if (gapPercentage <= 60) {
      gapMultiplier = 1.5; // Medium gap
    } else {
      gapMultiplier = 2.0; // Large gap
    }

    // Calculate estimated hours
    const estimatedHours = Math.round(
      baseComplexityHours * velocityMultiplier * gapMultiplier
    );

    // Calculate weeks to complete
    const weeksToComplete = Math.ceil(estimatedHours / userAvailability);

    return {
      estimatedHours,
      weeksToComplete,
      complexity,
    };
  }

  /**
   * Generate prioritized learning roadmap from skill gaps
   *
   * @param prioritizedGaps - Gaps sorted by priority
   * @param userAvailability - Hours per week user can dedicate
   * @returns Roadmap with phases and milestones
   */
  generateRoadmap(
    prioritizedGaps: PrioritizedSkillGap[],
    userAvailability: number
  ): RoadmapPhase[] {
    const roadmap: RoadmapPhase[] = [];

    // Divide gaps into phases based on priority scores
    // Phase 1: Top 33% (highest priority)
    // Phase 2: Middle 33% (medium priority)
    // Phase 3: Bottom 33% (lower priority)
    const phase1Count = Math.ceil(prioritizedGaps.length / 3);
    const phase2Count = Math.ceil(prioritizedGaps.length / 3);

    const phase1Gaps = prioritizedGaps.slice(0, phase1Count);
    const phase2Gaps = prioritizedGaps.slice(phase1Count, phase1Count + phase2Count);
    const phase3Gaps = prioritizedGaps.slice(phase1Count + phase2Count);

    // Calculate durations for each phase
    const calculatePhaseDuration = (gaps: PrioritizedSkillGap[]): number => {
      const totalHours = gaps.reduce((sum, gap) => sum + gap.timeToAcquire, 0);
      return Math.ceil(totalHours / userAvailability);
    };

    if (phase1Gaps.length > 0) {
      roadmap.push({
        phase: 1,
        skills: phase1Gaps.map(g => g.skillName),
        estimatedDuration: calculatePhaseDuration(phase1Gaps),
        milestoneTitle: 'Critical Skills Foundation',
      });
    }

    if (phase2Gaps.length > 0) {
      roadmap.push({
        phase: 2,
        skills: phase2Gaps.map(g => g.skillName),
        estimatedDuration: calculatePhaseDuration(phase2Gaps),
        milestoneTitle: 'Core Competencies Development',
      });
    }

    if (phase3Gaps.length > 0) {
      roadmap.push({
        phase: 3,
        skills: phase3Gaps.map(g => g.skillName),
        estimatedDuration: calculatePhaseDuration(phase3Gaps),
        milestoneTitle: 'Advanced Skills Mastery',
      });
    }

    return roadmap;
  }

  /**
   * Calculate learning velocity from user's Skills Tracker history
   *
   * Velocity = average(timeSpent / estimatedTimeToTarget) across completed skills
   *
   * @param skills - User's skills from Skills Tracker
   * @returns Learning velocity (1.0 = average, >1.2 = fast, <0.8 = slow)
   */
  calculateLearningVelocity(skills: Skill[]): number {
    // Filter to only completed/mastered skills
    const completedSkills = skills.filter(
      s => s.status === 'mastered' || s.status === 'practicing' && s.progress === 100
    );

    if (completedSkills.length === 0) {
      // No history - default to average learner
      return 1.0;
    }

    // Calculate velocity for each completed skill
    const velocities = completedSkills
      .filter(s => s.estimatedTimeToTarget > 0) // Avoid division by zero
      .map(s => s.timeSpent / s.estimatedTimeToTarget);

    if (velocities.length === 0) {
      return 1.0;
    }

    // Return average velocity
    const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    return Math.round(avgVelocity * 100) / 100; // Round to 2 decimal places
  }

  // Helper methods

  /**
   * Convert skill level string to numeric (0-100 scale)
   */
  private convertSkillLevelToNumeric(level: string): number {
    const levelMap: Record<string, number> = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 100,
    };
    return levelMap[level] || 0;
  }

  /**
   * Convert O*NET level (0-7 scale) to numeric (0-100 scale)
   */
  private convertONetLevelToNumeric(onetLevel: number): number {
    // O*NET scale: 0-7 maps to 0-100
    return Math.round((onetLevel / 7) * 100);
  }

  /**
   * Calculate base time to acquire skill from O*NET complexity level
   */
  private calculateBaseTimeToAcquire(onetLevel: number): number {
    if (onetLevel <= 3) {
      return 60; // Basic: ~60 hours average
    } else if (onetLevel <= 5) {
      return 120; // Intermediate: ~120 hours average
    } else {
      return 280; // Advanced: ~280 hours average
    }
  }

  /**
   * Estimate market demand from skill category
   * Returns normalized score 0-1
   */
  private estimateMarketDemand(category: string): number {
    // Simplified market demand estimation
    // In production, this would integrate with real labor market data
    const highDemandCategories = [
      'Technical Skills',
      'Computer Skills',
      'Systems Skills',
    ];

    const categoryLower = category.toLowerCase();
    const isHighDemand = highDemandCategories.some(c =>
      categoryLower.includes(c.toLowerCase())
    );

    return isHighDemand ? 0.8 : 0.5;
  }

  /**
   * Calculate career capital from importance and rarity (complexity)
   * Career capital = importance * rarity_inverse
   * Returns normalized score 0-1
   */
  private calculateCareerCapital(importance: number, onetLevel: number): number {
    // Higher O*NET level = rarer skill = higher career capital
    const rarity = onetLevel / 7; // Normalize 0-7 to 0-1
    const careerCapital = importance * rarity;
    return Math.min(careerCapital, 1.0); // Cap at 1.0
  }
}
