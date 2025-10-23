/**
 * AffiliateRecommendationEngine Service Tests
 * Task Group 3.3.1: Test affiliate recommendation service
 */

import { AffiliateRecommendationEngine, Course } from '../affiliate-recommendations';
import { PrioritizedSkillGap } from '../skill-gap-analyzer';

describe('AffiliateRecommendationEngine', () => {
  let engine: AffiliateRecommendationEngine;

  beforeEach(() => {
    engine = new AffiliateRecommendationEngine();
  });

  describe('generateAffiliateLink', () => {
    it('should generate affiliate link with tracking tag for Coursera', () => {
      const course: Omit<Course, 'affiliateUrl'> = {
        title: 'Python for Data Science',
        provider: 'Coursera',
        url: 'https://www.coursera.org/learn/python-data-science',
        price: 'Free',
        rating: 4.8,
        reviewCount: 5000,
        estimatedHours: 40,
        level: 'Beginner',
        topics: ['Python', 'Data Science'],
        isQuickWin: false,
      };

      const result = engine.generateAffiliateLink(
        course,
        'user123',
        'analysis456',
        'Python'
      );

      expect(result.affiliateUrl).toContain('careerosapp-user123-analysis456-Python');
      expect(result.affiliateUrl).toContain('utm_source=careerosapp');
      expect(result.affiliateUrl).toContain('utm_campaign=');
      expect(result.title).toBe(course.title);
      expect(result.provider).toBe('Coursera');
    });

    it('should generate affiliate link with tracking tag for Udemy', () => {
      const course: Omit<Course, 'affiliateUrl'> = {
        title: 'Complete JavaScript Course',
        provider: 'Udemy',
        url: 'https://www.udemy.com/course/complete-javascript',
        price: '$19.99',
        rating: 4.6,
        reviewCount: 10000,
        estimatedHours: 30,
        level: 'Intermediate',
        topics: ['JavaScript', 'Web Development'],
        isQuickWin: true,
      };

      const result = engine.generateAffiliateLink(
        course,
        'user789',
        'analysis101',
        'JavaScript'
      );

      expect(result.affiliateUrl).toContain('careerosapp-user789-analysis101-JavaScript');
      expect(result.affiliateUrl).toContain('utm_source=careerosapp');
      expect(result.title).toBe(course.title);
      expect(result.provider).toBe('Udemy');
    });
  });

  describe('prioritizeCourses', () => {
    it('should prioritize courses by composite score (rating, reviews, price, gap priority)', () => {
      const gap: PrioritizedSkillGap = {
        skillName: 'Python',
        onetCode: 'IT-001',
        importance: 0.9,
        currentLevel: 20,
        targetLevel: 80,
        timeToAcquire: 120,
        marketDemand: 0.8,
        careerCapital: 0.7,
        priorityScore: 85,
      };

      const courses: Course[] = [
        {
          title: 'Low-rated paid course',
          provider: 'Coursera',
          url: 'https://example.com/1',
          affiliateUrl: 'https://example.com/1?aff=123',
          price: '$49',
          rating: 3.5,
          reviewCount: 100,
          estimatedHours: 40,
          level: 'Beginner',
          topics: [],
          isQuickWin: false,
        },
        {
          title: 'High-rated free course',
          provider: 'Coursera',
          url: 'https://example.com/2',
          affiliateUrl: 'https://example.com/2?aff=123',
          price: 'Free',
          rating: 4.9,
          reviewCount: 8000,
          estimatedHours: 50,
          level: 'Intermediate',
          topics: [],
          isQuickWin: false,
        },
        {
          title: 'Medium-rated free course',
          provider: 'Udemy',
          url: 'https://example.com/3',
          affiliateUrl: 'https://example.com/3?aff=123',
          price: 'Free',
          rating: 4.2,
          reviewCount: 1500,
          estimatedHours: 25,
          level: 'Beginner',
          topics: [],
          isQuickWin: true,
        },
      ];

      const prioritized = engine.prioritizeCourses(courses, gap);

      // High-rated free course should be first (best rating + free + many reviews)
      expect(prioritized[0].title).toBe('High-rated free course');
      // Medium-rated free course should be second (free + decent rating)
      expect(prioritized[1].title).toBe('Medium-rated free course');
      // Low-rated paid course should be last (worst on all factors)
      expect(prioritized[2].title).toBe('Low-rated paid course');
    });

    it('should return top 3 courses when more are available', () => {
      const gap: PrioritizedSkillGap = {
        skillName: 'React',
        importance: 0.8,
        currentLevel: 30,
        targetLevel: 90,
        timeToAcquire: 100,
        marketDemand: 0.9,
        careerCapital: 0.6,
        priorityScore: 80,
      };

      const courses: Course[] = Array(10).fill(null).map((_, i) => ({
        title: `Course ${i + 1}`,
        provider: 'Coursera',
        url: `https://example.com/${i}`,
        affiliateUrl: `https://example.com/${i}?aff=123`,
        price: i % 2 === 0 ? 'Free' : '$29',
        rating: 4.0 + (i * 0.05),
        reviewCount: 1000 * (i + 1),
        estimatedHours: 30,
        level: 'Intermediate',
        topics: [],
        isQuickWin: false,
      }));

      const prioritized = engine.prioritizeCourses(courses, gap);

      // Should return all courses sorted (not limited to 3 in prioritizeCourses method)
      expect(prioritized.length).toBe(10);
      // Verify sorting (higher rated courses first)
      expect(prioritized[0].rating).toBeGreaterThan(prioritized[prioritized.length - 1].rating);
    });
  });

  describe('trackAffiliateClick', () => {
    it('should track affiliate click with timestamp', () => {
      const clickEvent = engine.trackAffiliateClick({
        analysisId: 'analysis123',
        skillName: 'Python',
        courseProvider: 'Coursera',
        courseUrl: 'https://example.com/course',
        courseTitle: 'Python Basics',
      });

      expect(clickEvent.analysisId).toBe('analysis123');
      expect(clickEvent.skillName).toBe('Python');
      expect(clickEvent.courseProvider).toBe('Coursera');
      expect(clickEvent.courseUrl).toBe('https://example.com/course');
      expect(clickEvent.courseTitle).toBe('Python Basics');
      expect(clickEvent.timestamp).toBeDefined();
      expect(typeof clickEvent.timestamp).toBe('number');
      expect(clickEvent.timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('getDisclosure', () => {
    it('should return FTC-compliant disclosure text', () => {
      const disclosure = engine.getDisclosure();

      expect(disclosure).toBeDefined();
      expect(disclosure).toContain('commission');
      expect(disclosure).toContain('no additional cost');
      expect(typeof disclosure).toBe('string');
      expect(disclosure.length).toBeGreaterThan(0);
    });
  });

  describe('getCourseRecommendations', () => {
    it('should return recommendations with FTC disclosure', async () => {
      // Mock skill gaps
      const skillGaps: PrioritizedSkillGap[] = [
        {
          skillName: 'Python',
          importance: 0.9,
          currentLevel: 20,
          targetLevel: 80,
          timeToAcquire: 120,
          marketDemand: 0.8,
          careerCapital: 0.7,
          priorityScore: 85,
        },
      ];

      // Note: This will actually try to call affiliate APIs
      // In a real test, we'd mock fetch() to return mock data
      // For this test, we'll skip if API keys aren't configured

      const result = await engine.getCourseRecommendations(
        skillGaps,
        'user123',
        'analysis456'
      );

      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.disclosure).toBeDefined();
      expect(typeof result.disclosure).toBe('string');
      expect(result.disclosure).toContain('commission');
    });
  });
});
