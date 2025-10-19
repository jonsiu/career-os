import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TransitionAssessmentFlow } from '../transition-assessment-flow';
import { TransitionPlanCard } from '../transition-plan-card';
import { SkillGapAnalysis } from '../skill-gap-analysis';
import { BenchmarkingDisplay } from '../benchmarking-display';
import { CourseRecommendations } from '../course-recommendations';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'test-user-id' }, isLoaded: true }),
}));

jest.mock('@/lib/abstractions', () => ({
  database: {
    getUserByClerkId: jest.fn(),
  },
}));

describe('Transition UI Components', () => {
  describe('TransitionAssessmentFlow', () => {
    it('should render the first step and navigate forward', async () => {
      const onComplete = jest.fn();
      const onCancel = jest.fn();

      render(
        <TransitionAssessmentFlow
          userId="test-user-id"
          onComplete={onComplete}
          onCancel={onCancel}
        />
      );

      // Check that the first step (CurrentRole) is rendered
      expect(screen.getByText(/current role/i)).toBeInTheDocument();

      // Fill in current role information
      const roleInput = screen.getByPlaceholderText(/e.g., Software Engineer/i);
      fireEvent.change(roleInput, { target: { value: 'Software Engineer' } });

      // Navigate to next step
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Should show the second step (TargetRole)
      await waitFor(() => {
        expect(screen.getByText(/target role/i)).toBeInTheDocument();
      });
    });

    it('should allow navigation backward through steps', async () => {
      const onComplete = jest.fn();
      const onCancel = jest.fn();

      render(
        <TransitionAssessmentFlow
          userId="test-user-id"
          onComplete={onComplete}
          onCancel={onCancel}
        />
      );

      // Navigate forward
      const roleInput = screen.getByPlaceholderText(/e.g., Software Engineer/i);
      fireEvent.change(roleInput, { target: { value: 'Software Engineer' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/target role/i)).toBeInTheDocument();
      });

      // Navigate backward
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      // Should show the first step again
      expect(screen.getByText(/current role/i)).toBeInTheDocument();
    });

    it('should validate required fields before allowing next step', () => {
      const onComplete = jest.fn();
      const onCancel = jest.fn();

      render(
        <TransitionAssessmentFlow
          userId="test-user-id"
          onComplete={onComplete}
          onCancel={onCancel}
        />
      );

      // Try to proceed without filling in required fields
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Should display validation error or keep user on same step
      expect(screen.getByText(/current role/i)).toBeInTheDocument();
    });
  });

  describe('TransitionPlanCard', () => {
    it('should display transition metadata correctly', () => {
      const mockPlan = {
        id: 'plan-1',
        userId: 'test-user-id',
        title: 'IC to Manager Transition',
        description: 'Transition from Individual Contributor to Engineering Manager',
        transitionTypes: ['cross-role'],
        primaryTransitionType: 'cross-role',
        currentRole: 'Senior Software Engineer',
        targetRole: 'Engineering Manager',
        bridgeRoles: ['Tech Lead', 'Staff Engineer'],
        estimatedTimeline: {
          minMonths: 8,
          maxMonths: 12,
          factors: ['Leadership experience', 'Company culture'],
        },
        benchmarkData: {
          similarTransitions: 'IC to Manager',
          averageTimeline: '10 months',
          successRate: 75,
        },
        progressPercentage: 35,
        goals: ['Build leadership skills', 'Mentor team members'],
        timeline: 10,
        milestones: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<TransitionPlanCard plan={mockPlan} onSelect={jest.fn()} />);

      // Check that all key information is displayed
      expect(screen.getByText('IC to Manager Transition')).toBeInTheDocument();
      expect(screen.getByText(/cross-role/i)).toBeInTheDocument();
      expect(screen.getByText(/8-12 months/i)).toBeInTheDocument();
      expect(screen.getByText(/35%/i)).toBeInTheDocument();
      expect(screen.getByText(/Tech Lead/i)).toBeInTheDocument();
    });
  });

  describe('SkillGapAnalysis', () => {
    it('should group skills by criticality level', () => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'One-on-One Management',
          criticalityLevel: 'critical',
          currentLevel: 'beginner',
          targetLevel: 'intermediate',
          transferableFrom: ['Mentoring'],
        },
        {
          id: 'skill-2',
          name: 'Budget Planning',
          criticalityLevel: 'important',
          currentLevel: 'beginner',
          targetLevel: 'intermediate',
        },
        {
          id: 'skill-3',
          name: 'Public Speaking',
          criticalityLevel: 'nice-to-have',
          currentLevel: 'beginner',
          targetLevel: 'intermediate',
        },
      ];

      render(<SkillGapAnalysis skills={mockSkills} planId="plan-1" />);

      // Should display skill sections by criticality
      expect(screen.getByText(/critical skills/i)).toBeInTheDocument();
      expect(screen.getByText(/important skills/i)).toBeInTheDocument();
      expect(screen.getByText(/nice-to-have skills/i)).toBeInTheDocument();

      // Check that skills are in correct sections
      expect(screen.getByText('One-on-One Management')).toBeInTheDocument();
      expect(screen.getByText('Budget Planning')).toBeInTheDocument();
      expect(screen.getByText('Public Speaking')).toBeInTheDocument();
    });

    it('should display transferable skills with badges', () => {
      const mockSkills = [
        {
          id: 'skill-1',
          name: 'One-on-One Management',
          criticalityLevel: 'critical',
          currentLevel: 'beginner',
          targetLevel: 'intermediate',
          transferableFrom: ['Mentoring', 'Code Reviews'],
        },
      ];

      render(<SkillGapAnalysis skills={mockSkills} planId="plan-1" />);

      // Should display transferable skills
      expect(screen.getByText(/Transfers from/i)).toBeInTheDocument();
      expect(screen.getByText(/Mentoring/i)).toBeInTheDocument();
    });
  });

  describe('CourseRecommendations', () => {
    it('should display course recommendations with affiliate links', () => {
      const mockCourses = [
        {
          provider: 'Coursera',
          title: 'Leadership Fundamentals',
          url: 'https://coursera.org/course/leadership',
          affiliateLink: 'https://coursera.org/course/leadership?aff=careeros',
          price: 49.99,
        },
        {
          provider: 'Udemy',
          title: 'Management Essentials',
          url: 'https://udemy.com/course/management',
          affiliateLink: 'https://udemy.com/course/management?aff=careeros',
          price: 29.99,
        },
      ];

      render(<CourseRecommendations courses={mockCourses} skillName="Leadership" />);

      // Check that courses are displayed
      expect(screen.getByText('Leadership Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Management Essentials')).toBeInTheDocument();

      // Check for affiliate disclosure
      expect(screen.getByText(/affiliate/i)).toBeInTheDocument();

      // Check that prices are displayed
      expect(screen.getByText(/\$49\.99/)).toBeInTheDocument();
      expect(screen.getByText(/\$29\.99/)).toBeInTheDocument();
    });

    it('should render affiliate links with proper attributes', () => {
      const mockCourses = [
        {
          provider: 'Coursera',
          title: 'Leadership Fundamentals',
          url: 'https://coursera.org/course/leadership',
          affiliateLink: 'https://coursera.org/course/leadership?aff=careeros',
          price: 49.99,
        },
      ];

      render(<CourseRecommendations courses={mockCourses} skillName="Leadership" />);

      const affiliateLink = screen.getByRole('link', { name: /Leadership Fundamentals/i });
      expect(affiliateLink).toHaveAttribute('href', 'https://coursera.org/course/leadership?aff=careeros');
      expect(affiliateLink).toHaveAttribute('target', '_blank');
      expect(affiliateLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('BenchmarkingDisplay', () => {
    it('should visualize timeline comparison data', () => {
      const mockBenchmarkData = {
        similarTransitions: 'IC to Manager',
        averageTimeline: '10 months',
        successRate: 75,
      };

      const userTimeline = {
        minMonths: 8,
        maxMonths: 12,
      };

      render(
        <BenchmarkingDisplay
          benchmarkData={mockBenchmarkData}
          userTimeline={userTimeline}
        />
      );

      // Check that benchmark information is displayed
      expect(screen.getByText(/IC to Manager/i)).toBeInTheDocument();
      expect(screen.getByText(/10 months/i)).toBeInTheDocument();
      expect(screen.getByText(/75%/i)).toBeInTheDocument();

      // Check that user timeline is shown for comparison
      expect(screen.getByText(/8-12 months/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate current role input in assessment flow', () => {
      const onComplete = jest.fn();
      const onCancel = jest.fn();

      render(
        <TransitionAssessmentFlow
          userId="test-user-id"
          onComplete={onComplete}
          onCancel={onCancel}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });

      // Try to proceed without input
      fireEvent.click(nextButton);

      // Should still be on the same step (validation should prevent navigation)
      expect(screen.getByText(/current role/i)).toBeInTheDocument();
      expect(onComplete).not.toHaveBeenCalled();
    });
  });
});
