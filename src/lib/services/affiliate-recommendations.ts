/**
 * AffiliateRecommendationEngine Service
 *
 * Generates personalized course recommendations based on skill gap analysis,
 * integrates with affiliate partner APIs (Coursera, Udemy), and tracks
 * click-through for revenue analytics.
 *
 * Features:
 * - Course recommendation from multiple affiliate partners
 * - Affiliate link generation with unique tracking tags
 * - Course prioritization by gap criticality, ratings, and relevance
 * - Click-through tracking for revenue analytics
 * - FTC-compliant disclosure management
 *
 * Revenue Tracking:
 * - Tracking tag format: careerosapp-{userId}-{analysisId}-{skillName}
 * - Click-through rate (CTR) = clicks / impressions
 * - Target CTR: 45%+, Target conversion: 8-12%, Target revenue/analysis: $3-5
 */

import { PrioritizedSkillGap } from './skill-gap-analyzer';

export interface Course {
  title: string;
  provider: string; // "Coursera" | "Udemy" | "LinkedIn Learning"
  url: string; // Original course URL
  affiliateUrl: string; // Affiliate tracking URL
  price: string; // "Free" | "$XX.XX"
  rating: number; // 0-5 stars
  reviewCount: number;
  estimatedHours: number;
  level: string; // "Beginner" | "Intermediate" | "Advanced"
  topics: string[];
  isQuickWin: boolean; // High priority, low time commitment
}

export interface CourseRecommendation {
  skillName: string;
  skillPriority: number;
  courses: Course[];
}

export interface UserPreferences {
  providers?: string[]; // Filter by provider
  maxPrice?: number; // Maximum price filter
  preferredDuration?: string; // "short" | "medium" | "long"
  learningFormats?: string[]; // "video" | "interactive" | "reading"
}

export interface AffiliateClickEvent {
  analysisId: string;
  skillName: string;
  courseProvider: string;
  courseUrl: string;
  courseTitle?: string;
  timestamp: number;
}

export class AffiliateRecommendationEngine {
  private readonly FTC_DISCLOSURE =
    'We may earn a commission from course purchases made through our links, at no additional cost to you.';

  /**
   * Get personalized course recommendations for skill gaps
   *
   * @param skillGaps - Prioritized skill gaps from analysis
   * @param userId - User ID for tracking tags
   * @param analysisId - Analysis ID for tracking tags
   * @param userPreferences - Optional user preferences for filtering
   * @returns Course recommendations with FTC disclosure
   */
  async getCourseRecommendations(
    skillGaps: PrioritizedSkillGap[],
    userId: string,
    analysisId: string,
    userPreferences?: UserPreferences
  ): Promise<{
    recommendations: CourseRecommendation[];
    disclosure: string;
  }> {
    const recommendations: CourseRecommendation[] = [];

    for (const gap of skillGaps) {
      // Fetch courses from affiliate partners
      const courses = await this.fetchCoursesForSkill(gap.skillName, userPreferences);

      // Generate affiliate links with tracking tags
      const coursesWithAffiliateLinks = courses.map(course =>
        this.addAffiliateTracking(course, userId, analysisId, gap.skillName)
      );

      // Prioritize courses
      const prioritizedCourses = this.prioritizeCourses(coursesWithAffiliateLinks, gap);

      // Identify quick wins
      const coursesWithQuickWins = prioritizedCourses.map(course => ({
        ...course,
        isQuickWin: this.isQuickWin(course, gap),
      }));

      recommendations.push({
        skillName: gap.skillName,
        skillPriority: gap.priorityScore,
        courses: coursesWithQuickWins.slice(0, 3), // Top 3 courses per skill
      });
    }

    // Sort recommendations by skill priority (descending)
    recommendations.sort((a, b) => b.skillPriority - a.skillPriority);

    return {
      recommendations,
      disclosure: this.FTC_DISCLOSURE,
    };
  }

  /**
   * Generate affiliate link with unique tracking tag
   *
   * Tracking tag format: careerosapp-{userId}-{analysisId}-{skillName}
   *
   * @param course - Course object with original URL
   * @param userId - User ID for tracking
   * @param analysisId - Analysis ID for tracking
   * @param skillName - Skill name for tracking
   * @returns Course with affiliate URL
   */
  generateAffiliateLink(
    course: Omit<Course, 'affiliateUrl'>,
    userId: string,
    analysisId: string,
    skillName: string
  ): Course {
    return this.addAffiliateTracking(course, userId, analysisId, skillName);
  }

  /**
   * Prioritize courses by gap criticality, ratings, and relevance
   *
   * Factors:
   * - Course rating (4.5+ stars preferred) - 35% weight
   * - Review count (social proof) - 25% weight
   * - Price (prefer free options) - 20% weight
   * - Gap priority score - 20% weight
   *
   * @param courses - Array of courses to prioritize
   * @param gap - Skill gap with priority score
   * @returns Top courses sorted by composite score
   */
  prioritizeCourses(courses: Course[], gap: PrioritizedSkillGap): Course[] {
    return courses
      .map(course => ({
        course,
        score: this.calculateCourseScore(course, gap),
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.course);
  }

  /**
   * Track affiliate click event for analytics
   *
   * This method would be called from the API endpoint to persist click data
   *
   * @param event - Affiliate click event data
   * @returns Click event with timestamp
   */
  trackAffiliateClick(event: Omit<AffiliateClickEvent, 'timestamp'>): AffiliateClickEvent {
    return {
      ...event,
      timestamp: Date.now(),
    };
  }

  /**
   * Get FTC-compliant disclosure text
   *
   * @returns FTC disclosure text
   */
  getDisclosure(): string {
    return this.FTC_DISCLOSURE;
  }

  // Private helper methods

  /**
   * Fetch courses for a specific skill from affiliate partners
   *
   * @param skillName - Skill to search courses for
   * @param preferences - Optional user preferences for filtering
   * @returns Array of courses (without affiliate links yet)
   */
  private async fetchCoursesForSkill(
    skillName: string,
    preferences?: UserPreferences
  ): Promise<Omit<Course, 'affiliateUrl' | 'isQuickWin'>[]> {
    const courses: Omit<Course, 'affiliateUrl' | 'isQuickWin'>[] = [];

    // Determine which providers to query
    const providers = preferences?.providers || ['Coursera', 'Udemy'];

    // Fetch from each provider
    if (providers.includes('Coursera')) {
      const courseraCourses = await this.fetchCourseraCourses(skillName, preferences);
      courses.push(...courseraCourses);
    }

    if (providers.includes('Udemy')) {
      const udemyCourses = await this.fetchUdemyCourses(skillName, preferences);
      courses.push(...udemyCourses);
    }

    if (providers.includes('LinkedIn Learning')) {
      const linkedInCourses = await this.fetchLinkedInCourses(skillName, preferences);
      courses.push(...linkedInCourses);
    }

    return courses;
  }

  /**
   * Fetch courses from Coursera Partner API
   *
   * @param skillName - Skill to search for
   * @param preferences - User preferences
   * @returns Coursera courses
   */
  private async fetchCourseraCourses(
    skillName: string,
    preferences?: UserPreferences
  ): Promise<Omit<Course, 'affiliateUrl' | 'isQuickWin'>[]> {
    try {
      const apiKey = process.env.COURSERA_API_KEY;
      if (!apiKey) {
        console.warn('Coursera API key not configured');
        return [];
      }

      // Coursera API endpoint: GET /courses.v1?q=search&query={skill}
      const baseUrl = 'https://api.coursera.org/api/courses.v1';
      const searchParams = new URLSearchParams({
        q: 'search',
        query: skillName,
        limit: '10',
      });

      const response = await fetch(`${baseUrl}?${searchParams}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        console.error(`Coursera API error: ${response.status}`);
        return [];
      }

      const data = await response.json();

      // Map Coursera response to Course interface
      return data.elements?.map((item: any) => ({
        title: item.name || 'Untitled Course',
        provider: 'Coursera',
        url: `https://www.coursera.org/learn/${item.slug}`,
        price: item.productDifficultyLevel === 'Free' ? 'Free' : `$${item.price || 49}`,
        rating: item.averageProductRating || 4.0,
        reviewCount: item.numProductRatings || 0,
        estimatedHours: item.workload ? parseInt(item.workload) : 20,
        level: this.mapCourseraLevel(item.productDifficultyLevel),
        topics: item.domainTypes || [],
      })) || [];
    } catch (error) {
      console.error('Error fetching Coursera courses:', error);
      return [];
    }
  }

  /**
   * Fetch courses from Udemy Affiliate API
   *
   * @param skillName - Skill to search for
   * @param preferences - User preferences
   * @returns Udemy courses
   */
  private async fetchUdemyCourses(
    skillName: string,
    preferences?: UserPreferences
  ): Promise<Omit<Course, 'affiliateUrl' | 'isQuickWin'>[]> {
    try {
      const clientId = process.env.UDEMY_CLIENT_ID;
      const clientSecret = process.env.UDEMY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.warn('Udemy API credentials not configured');
        return [];
      }

      // Udemy API endpoint: GET /courses/?search={skill}
      const baseUrl = 'https://www.udemy.com/api-2.0/courses/';
      const searchParams = new URLSearchParams({
        search: skillName,
        page_size: '10',
        ordering: 'relevance',
      });

      // Udemy uses Basic Auth with client ID and secret
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const response = await fetch(`${baseUrl}?${searchParams}`, {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      });

      if (!response.ok) {
        console.error(`Udemy API error: ${response.status}`);
        return [];
      }

      const data = await response.json();

      // Map Udemy response to Course interface
      return data.results?.map((item: any) => ({
        title: item.title || 'Untitled Course',
        provider: 'Udemy',
        url: `https://www.udemy.com${item.url}`,
        price: item.price === 'Free' ? 'Free' : `$${item.price || 19.99}`,
        rating: item.rating || 4.0,
        reviewCount: item.num_reviews || 0,
        estimatedHours: item.content_info_short ? parseInt(item.content_info_short) : 10,
        level: this.mapUdemyLevel(item.instructional_level),
        topics: item.visible_instructors?.map((i: any) => i.display_name) || [],
      })) || [];
    } catch (error) {
      console.error('Error fetching Udemy courses:', error);
      return [];
    }
  }

  /**
   * Fetch courses from LinkedIn Learning (manual curation fallback for MVP)
   *
   * @param skillName - Skill to search for
   * @param preferences - User preferences
   * @returns LinkedIn Learning courses
   */
  private async fetchLinkedInCourses(
    skillName: string,
    preferences?: UserPreferences
  ): Promise<Omit<Course, 'affiliateUrl' | 'isQuickWin'>[]> {
    // For MVP, return empty array (LinkedIn Learning API requires enterprise partnership)
    // In production, this would integrate with LinkedIn Learning API or use manual curation
    console.warn('LinkedIn Learning integration not available in MVP');
    return [];
  }

  /**
   * Add affiliate tracking to course URL
   *
   * @param course - Course without affiliate URL
   * @param userId - User ID
   * @param analysisId - Analysis ID
   * @param skillName - Skill name
   * @returns Course with affiliate URL
   */
  private addAffiliateTracking(
    course: Omit<Course, 'affiliateUrl' | 'isQuickWin'>,
    userId: string,
    analysisId: string,
    skillName: string
  ): Omit<Course, 'isQuickWin'> {
    const trackingTag = `careerosapp-${userId}-${analysisId}-${skillName}`;
    let affiliateUrl: string;

    if (course.provider === 'Coursera') {
      const affiliateId = process.env.COURSERA_AFFILIATE_ID || 'careerosapp';
      affiliateUrl = `${course.url}?utm_source=careerosapp&utm_campaign=${trackingTag}&affiliateId=${affiliateId}`;
    } else if (course.provider === 'Udemy') {
      const affiliateId = process.env.UDEMY_AFFILIATE_ID || 'careerosapp';
      affiliateUrl = `${course.url}?couponCode=${affiliateId}&utm_source=careerosapp&utm_campaign=${trackingTag}`;
    } else {
      // Default tracking for other providers
      affiliateUrl = `${course.url}?utm_source=careerosapp&utm_campaign=${trackingTag}`;
    }

    return {
      ...course,
      affiliateUrl,
    };
  }

  /**
   * Calculate composite score for course prioritization
   *
   * @param course - Course to score
   * @param gap - Skill gap with priority
   * @returns Composite score (0-100)
   */
  private calculateCourseScore(course: Course, gap: PrioritizedSkillGap): number {
    // Normalize rating to 0-1 scale
    const ratingScore = course.rating / 5;

    // Normalize review count to 0-1 scale (cap at 10,000)
    const reviewScore = Math.min(course.reviewCount, 10000) / 10000;

    // Price score: free = 1.0, paid = 0.5
    const priceScore = course.price === 'Free' ? 1.0 : 0.5;

    // Normalize gap priority score to 0-1 scale
    const priorityScore = gap.priorityScore / 100;

    // Calculate weighted composite score
    const compositeScore =
      ratingScore * 0.35 +
      reviewScore * 0.25 +
      priceScore * 0.2 +
      priorityScore * 0.2;

    return Math.round(compositeScore * 100);
  }

  /**
   * Determine if course is a quick win
   *
   * Quick win: High priority skill + short course duration (<20 hours)
   *
   * @param course - Course to evaluate
   * @param gap - Skill gap with priority
   * @returns True if quick win
   */
  private isQuickWin(course: Course, gap: PrioritizedSkillGap): boolean {
    const isHighPriority = gap.priorityScore >= 70;
    const isShortDuration = course.estimatedHours <= 20;
    return isHighPriority && isShortDuration;
  }

  /**
   * Map Coursera difficulty level to standard level
   */
  private mapCourseraLevel(level: string | undefined): string {
    if (!level) return 'Beginner';
    const levelLower = level.toLowerCase();
    if (levelLower.includes('beginner')) return 'Beginner';
    if (levelLower.includes('intermediate')) return 'Intermediate';
    if (levelLower.includes('advanced')) return 'Advanced';
    return 'Beginner';
  }

  /**
   * Map Udemy instructional level to standard level
   */
  private mapUdemyLevel(level: string | undefined): string {
    if (!level) return 'Beginner';
    const levelLower = level.toLowerCase();
    if (levelLower.includes('beginner') || levelLower.includes('all')) return 'Beginner';
    if (levelLower.includes('intermediate')) return 'Intermediate';
    if (levelLower.includes('expert') || levelLower.includes('advanced')) return 'Advanced';
    return 'Beginner';
  }
}
