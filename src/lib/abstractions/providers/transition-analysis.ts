import { generateContentHash } from '../../utils/content-hash';
import {
  detectTransitionTypePrompt,
  generateRoadmapPrompt,
  analyzeSkillGapsPrompt,
  assessCareerCapitalPrompt
} from '../../prompts/transition-prompts';

/**
 * TransitionAnalysisProvider
 *
 * Provides AI-powered career transition analysis with multi-model approach:
 * - GPT-4: Structured analysis and skill gap identification
 * - Claude: Narrative coaching and roadmap generation
 *
 * Features:
 * - SHA-256 content hashing for caching (target 60%+ cache hit rate)
 * - Graceful error handling and fallbacks
 * - Cost optimization through caching and prompt efficiency
 * - Average cost per plan: <$2
 */
export class TransitionAnalysisProvider {
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

  constructor() {
    this.cache = new Map();
  }

  /**
   * Identify transition type from resume and target role
   * Uses GPT-4 for structured analysis
   *
   * @param resumeContent - Resume text content
   * @param currentRole - Current job title
   * @param targetRole - Desired job title
   * @param targetIndustry - Optional target industry
   * @returns Transition type analysis with primary challenge
   */
  async identifyTransitionType(
    resumeContent: string,
    currentRole: string,
    targetRole: string,
    targetIndustry?: string
  ): Promise<{
    transitionTypes: string[];
    primaryTransitionType: string;
    currentRole: string;
    targetRole: string;
    currentIndustry?: string;
    targetIndustry?: string;
    transitionDifficulty: 'low' | 'medium' | 'high';
    confidence: number;
  }> {
    try {
      // Generate cache key
      const cacheKey = await this.generateCacheKey('transition-type', {
        resumeContent: resumeContent.substring(0, 1000),
        currentRole,
        targetRole,
        targetIndustry
      });

      // Check cache
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📋 Using cached transition type analysis');
        return cached;
      }

      console.log('🔄 Generating new transition type analysis');

      // Call API endpoint for transition type identification
      const response = await fetch('/api/transitions/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeContent: resumeContent.substring(0, 3000), // Limit content for cost optimization
          currentRole,
          targetRole,
          targetIndustry
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transition type identification failed');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid response from transition type API');
      }

      // Cache the result
      this.saveToCache(cacheKey, result.data);

      return result.data;
    } catch (error) {
      console.error('Transition type identification failed:', error);
      throw error;
    }
  }

  /**
   * Generate personalized transition roadmap
   * Uses Claude for narrative coaching and strategic planning
   *
   * @param transitionData - Transition type and metadata
   * @param resumeContent - Resume text content
   * @returns Roadmap with timeline, milestones, and bridge roles
   */
  async generateRoadmap(
    transitionData: {
      transitionTypes: string[];
      primaryTransitionType: string;
      currentRole?: string;
      targetRole?: string;
      currentIndustry?: string;
      targetIndustry?: string;
    },
    resumeContent: string
  ): Promise<{
    timeline: {
      minMonths: number;
      maxMonths: number;
      factors: string[];
    };
    milestones: Array<{
      id: string;
      title: string;
      description: string;
      targetDate: Date;
      status: 'pending' | 'in-progress' | 'completed';
      dependencies: string[];
      effort: number;
    }>;
    bridgeRoles: string[];
  }> {
    try {
      // Generate cache key
      const cacheKey = await this.generateCacheKey('roadmap', {
        transitionData,
        resumeContent: resumeContent.substring(0, 1000)
      });

      // Check cache
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📋 Using cached roadmap');
        return cached;
      }

      console.log('🔄 Generating new roadmap');

      // Call API endpoint for roadmap generation
      const response = await fetch('/api/transitions/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transitionData,
          resumeContent: resumeContent.substring(0, 3000)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Roadmap generation failed');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid response from roadmap API');
      }

      // Cache the result
      this.saveToCache(cacheKey, result.data);

      return result.data;
    } catch (error) {
      console.error('Roadmap generation failed:', error);
      throw error;
    }
  }

  /**
   * Analyze skill gaps with criticality levels
   * Uses GPT-4 for structured skill analysis
   *
   * @param currentRole - Current job title
   * @param targetRole - Desired job title
   * @param resumeContent - Resume text content
   * @returns Categorized skill gaps with learning time estimates
   */
  async analyzeSkillGaps(
    currentRole: string,
    targetRole: string,
    resumeContent: string
  ): Promise<{
    criticalSkills: Array<{
      skill: string;
      criticalityLevel: 'critical' | 'important' | 'nice-to-have';
      currentLevel: number;
      targetLevel: number;
      transferableFrom: string[];
      onetCode?: string;
      skillComplexity: 'basic' | 'intermediate' | 'advanced';
      estimatedLearningTime: {
        minWeeks: number;
        maxWeeks: number;
      };
    }>;
    importantSkills: any[];
    niceToHaveSkills: any[];
  }> {
    try {
      // Generate cache key
      const cacheKey = await this.generateCacheKey('skill-gaps', {
        currentRole,
        targetRole,
        resumeContent: resumeContent.substring(0, 1000)
      });

      // Check cache
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📋 Using cached skill gap analysis');
        return cached;
      }

      console.log('🔄 Generating new skill gap analysis');

      // Call API endpoint for skill gap analysis
      const response = await fetch('/api/transitions/skills-gap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentRole,
          targetRole,
          resumeContent: resumeContent.substring(0, 3000)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Skill gap analysis failed');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid response from skill gap API');
      }

      // Cache the result
      this.saveToCache(cacheKey, result.data);

      return result.data;
    } catch (error) {
      console.error('Skill gap analysis failed:', error);
      throw error;
    }
  }

  /**
   * Assess career capital and unique skill combinations
   * Uses Claude for narrative analysis and strategic insights
   *
   * @param resumeContent - Resume text content
   * @param currentRole - Current job title
   * @returns Career capital assessment with competitive advantages
   */
  async assessCareerCapital(
    resumeContent: string,
    currentRole: string
  ): Promise<{
    uniqueSkills: string[];
    rareSkillCombinations: string[];
    competitiveAdvantages: string[];
    marketValue?: 'low' | 'medium' | 'high';
  }> {
    try {
      // Generate cache key
      const cacheKey = await this.generateCacheKey('career-capital', {
        resumeContent: resumeContent.substring(0, 1000),
        currentRole
      });

      // Check cache
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📋 Using cached career capital assessment');
        return cached;
      }

      console.log('🔄 Generating new career capital assessment');

      // For now, use a simpler analysis approach
      // TODO: Create dedicated API endpoint when backend is ready
      const result = {
        uniqueSkills: this.extractUniqueSkills(resumeContent),
        rareSkillCombinations: this.identifyRareCombinations(resumeContent),
        competitiveAdvantages: this.identifyAdvantages(resumeContent, currentRole),
        marketValue: 'medium' as 'low' | 'medium' | 'high'
      };

      // Cache the result
      this.saveToCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Career capital assessment failed:', error);
      throw error;
    }
  }

  /**
   * Generate cache key using SHA-256 hash
   * Ensures consistent caching across identical inputs
   */
  private async generateCacheKey(prefix: string, data: any): Promise<string> {
    const content = JSON.stringify(data);
    const hash = await generateContentHash({ content } as any);
    return `${prefix}:${hash}`;
  }

  /**
   * Get data from in-memory cache
   * Checks TTL to ensure freshness
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Save data to in-memory cache with timestamp
   */
  private saveToCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear entire cache (for testing or manual invalidation)
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats(): {
    size: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size
    };
  }

  // Helper methods for career capital assessment (fallback when API not available)

  private extractUniqueSkills(resumeContent: string): string[] {
    const skills = new Set<string>();
    const content = resumeContent.toLowerCase();

    const techSkills = [
      'machine learning', 'ai', 'distributed systems', 'system design',
      'leadership', 'technical writing', 'public speaking', 'mentoring',
      'kubernetes', 'aws', 'react', 'python', 'java', 'go', 'rust'
    ];

    techSkills.forEach(skill => {
      if (content.includes(skill)) {
        skills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });

    return Array.from(skills).slice(0, 5);
  }

  private identifyRareCombinations(resumeContent: string): string[] {
    const combinations = [];
    const content = resumeContent.toLowerCase();

    // Check for rare skill pairings
    if (content.includes('machine learning') && content.includes('distributed systems')) {
      combinations.push('Machine Learning + Distributed Systems');
    }
    if (content.includes('leadership') && content.includes('technical')) {
      combinations.push('Technical Leadership');
    }
    if ((content.includes('engineer') || content.includes('developer')) &&
        content.includes('product')) {
      combinations.push('Engineering + Product Thinking');
    }

    return combinations.slice(0, 3);
  }

  private identifyAdvantages(resumeContent: string, currentRole: string): string[] {
    const advantages = [];
    const content = resumeContent.toLowerCase();

    if (content.includes('lead') || content.includes('senior')) {
      advantages.push('Strong technical foundation with leadership experience');
    }
    if (content.includes('startup') || content.includes('0-1')) {
      advantages.push('Experience building products from scratch');
    }
    if (content.includes('scale') || content.includes('growth')) {
      advantages.push('Experience scaling systems and teams');
    }

    return advantages.slice(0, 3);
  }
}
