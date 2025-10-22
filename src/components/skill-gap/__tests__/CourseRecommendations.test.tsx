/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseRecommendations } from '../CourseRecommendations';
import { CourseRecommendation } from '@/lib/services/affiliate-recommendations';

// Mock fetch for click tracking
global.fetch = jest.fn();

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  configurable: true,
  value: mockWindowOpen,
});

describe('CourseRecommendations', () => {
  const mockRecommendations: CourseRecommendation[] = [
    {
      skillName: 'React',
      skillPriority: 85,
      courses: [
        {
          title: 'Complete React Developer Course',
          provider: 'Udemy',
          url: 'https://www.udemy.com/course/react-complete',
          affiliateUrl: 'https://www.udemy.com/course/react-complete?couponCode=careerosapp&utm_source=careerosapp',
          price: '$19.99',
          rating: 4.7,
          reviewCount: 12500,
          estimatedHours: 40,
          level: 'Intermediate',
          topics: ['React', 'JavaScript', 'Web Development'],
          isQuickWin: false,
        },
        {
          title: 'React Basics',
          provider: 'Coursera',
          url: 'https://www.coursera.org/learn/react-basics',
          affiliateUrl: 'https://www.coursera.org/learn/react-basics?utm_source=careerosapp',
          price: 'Free',
          rating: 4.6,
          reviewCount: 8200,
          estimatedHours: 15,
          level: 'Beginner',
          topics: ['React', 'Frontend'],
          isQuickWin: true,
        },
        {
          title: 'Advanced React Patterns',
          provider: 'Udemy',
          url: 'https://www.udemy.com/course/advanced-react',
          affiliateUrl: 'https://www.udemy.com/course/advanced-react?couponCode=careerosapp',
          price: '$49.99',
          rating: 4.8,
          reviewCount: 3200,
          estimatedHours: 25,
          level: 'Advanced',
          topics: ['React', 'Advanced Patterns'],
          isQuickWin: false,
        },
      ],
    },
    {
      skillName: 'TypeScript',
      skillPriority: 75,
      courses: [
        {
          title: 'TypeScript Fundamentals',
          provider: 'Coursera',
          url: 'https://www.coursera.org/learn/typescript',
          affiliateUrl: 'https://www.coursera.org/learn/typescript?utm_source=careerosapp',
          price: 'Free',
          rating: 4.5,
          reviewCount: 5400,
          estimatedHours: 12,
          level: 'Beginner',
          topics: ['TypeScript', 'JavaScript'],
          isQuickWin: true,
        },
      ],
    },
  ];

  const defaultProps = {
    recommendations: mockRecommendations,
    analysisId: 'analysis123',
    userId: 'user123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders affiliate disclosure prominently', () => {
    render(<CourseRecommendations {...defaultProps} />);

    expect(screen.getByText(/We may earn a commission/i)).toBeInTheDocument();
    expect(screen.getByText(/at no additional cost to you/i)).toBeInTheDocument();
  });

  it('displays courses with correct labels for free and paid', () => {
    render(<CourseRecommendations {...defaultProps} />);

    // Check for Free labels (there are 2 free courses)
    const freeLabels = screen.getAllByText('Free');
    expect(freeLabels.length).toBeGreaterThan(0);

    // Check for paid prices
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('displays Quick Win badge for high-priority, low-time courses', () => {
    render(<CourseRecommendations {...defaultProps} />);

    // React Basics and TypeScript Fundamentals should have Quick Win badge
    const quickWinBadges = screen.getAllByText('Quick Win');
    expect(quickWinBadges.length).toBeGreaterThan(0);
  });

  it('tracks click when affiliate link is clicked', async () => {
    render(<CourseRecommendations {...defaultProps} />);

    // Find and click an affiliate link
    const affiliateLinks = screen.getAllByText('View Course');
    fireEvent.click(affiliateLinks[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/recommendations/track-click',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('analysis123'),
        })
      );
    });
  });

  it('opens affiliate link in new tab after tracking', async () => {
    render(<CourseRecommendations {...defaultProps} />);

    const affiliateLinks = screen.getAllByText('View Course');
    fireEvent.click(affiliateLinks[0]);

    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('udemy.com'),
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  it('sorts courses by rating by default', () => {
    render(<CourseRecommendations {...defaultProps} />);

    // Get all course titles (headings level 3)
    const courseTitles = screen.getAllByRole('heading', { level: 3 });

    // First heading should be "Courses for React"
    expect(courseTitles[0]).toHaveTextContent('Courses for React');

    // Advanced React Patterns (4.8 rating) should be the first course title
    expect(courseTitles[1]).toHaveTextContent('Advanced React Patterns');
  });

  it('displays course cards with all required information', () => {
    render(<CourseRecommendations {...defaultProps} />);

    // Check for course title
    expect(screen.getByText('Complete React Developer Course')).toBeInTheDocument();

    // Check for provider badges (using getAllByText since there are multiple Udemy courses)
    const udemyBadges = screen.getAllByText('Udemy');
    expect(udemyBadges.length).toBeGreaterThan(0);

    // Check for rating
    expect(screen.getByText('4.7')).toBeInTheDocument();

    // Check for estimated hours
    expect(screen.getByText(/40 hours/i)).toBeInTheDocument();

    // Check for level badges
    const intermediateBadges = screen.getAllByText('Intermediate');
    expect(intermediateBadges.length).toBeGreaterThan(0);
  });
});
