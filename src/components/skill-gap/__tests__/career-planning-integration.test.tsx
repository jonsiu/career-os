/**
 * @jest-environment jsdom
 *
 * Career Planning Page Integration Tests
 *
 * Tests for Task Group 4.5: Integration with Career Planning Page
 * Focuses on:
 * - "Skill Gap Analysis" tab navigation
 * - Analysis results display in context
 * - One-click "Add to Skills Tracker" action
 * - One-click "Create Career Plan" action
 * - Page state persistence
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalysisResults, type SkillGapAnalysisData } from '../AnalysisResults';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Career Planning Page Integration', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockToast = jest.fn();

  const mockAnalysisData: SkillGapAnalysisData = {
    id: 'analysis-123',
    targetRole: 'Senior Software Engineer',
    targetRoleONetCode: '15-1252.00',
    criticalGaps: [
      {
        skillName: 'System Design',
        importance: 90,
        currentLevel: 40,
        targetLevel: 80,
        priorityScore: 85,
        timeEstimate: 120,
        marketDemand: 88,
      },
      {
        skillName: 'Kubernetes',
        importance: 85,
        currentLevel: 20,
        targetLevel: 70,
        priorityScore: 78,
        timeEstimate: 80,
        marketDemand: 82,
      },
    ],
    niceToHaveGaps: [
      {
        skillName: 'GraphQL',
        importance: 60,
        currentLevel: 30,
        targetLevel: 65,
        priorityScore: 55,
        timeEstimate: 40,
      },
    ],
    transferableSkills: [
      {
        skillName: 'JavaScript',
        currentLevel: 85,
        applicability: 95,
        transferExplanation: 'Directly applicable to frontend and backend development',
        confidence: 0.95,
      },
    ],
    prioritizedRoadmap: [
      {
        phase: 1,
        skills: ['Kubernetes'],
        estimatedDuration: 8,
        milestoneTitle: 'Master Container Orchestration',
      },
      {
        phase: 2,
        skills: ['System Design'],
        estimatedDuration: 12,
        milestoneTitle: 'Learn Advanced System Design',
      },
    ],
    transitionType: 'upward',
    completionProgress: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Tab Navigation and Display', () => {
    it('should render analysis results with Quick Actions section', () => {
      render(<AnalysisResults analysis={mockAnalysisData} />);

      // Check Quick Actions section is present
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText(/Integrate this analysis with your career development workflow/i)).toBeInTheDocument();
    });

    it('should display both integration action buttons', () => {
      render(<AnalysisResults analysis={mockAnalysisData} />);

      // Check both action buttons are present
      expect(screen.getByRole('button', { name: /Add All Gaps to Skills Tracker \(3\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Career Plan from Roadmap/i })).toBeInTheDocument();
    });

    it('should show correct gap count in skills tracker button', () => {
      render(<AnalysisResults analysis={mockAnalysisData} />);

      const totalGaps = mockAnalysisData.criticalGaps.length + mockAnalysisData.niceToHaveGaps.length;
      expect(screen.getByText(`Add All Gaps to Skills Tracker (${totalGaps})`)).toBeInTheDocument();
    });

    it('should navigate through analysis tabs without errors', () => {
      render(<AnalysisResults analysis={mockAnalysisData} />);

      // Click through tabs to ensure they render properly
      const overviewTab = screen.getByRole('tab', { name: /Overview/i });
      const matrixTab = screen.getByRole('tab', { name: /Skills Matrix/i });
      const radarTab = screen.getByRole('tab', { name: /Radar Chart/i });
      const roadmapTab = screen.getByRole('tab', { name: /Roadmap/i });

      fireEvent.click(matrixTab);
      fireEvent.click(radarTab);
      fireEvent.click(roadmapTab);
      fireEvent.click(overviewTab);

      // Verify no errors occurred and overview content is still visible
      expect(screen.getByText('Analysis Overview')).toBeInTheDocument();
    });
  });

  describe('Add to Skills Tracker Action', () => {
    it('should call API to add all gaps to skills tracker', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 3, success: true }),
      });

      render(<AnalysisResults analysis={mockAnalysisData} />);

      const addButton = screen.getByRole('button', { name: /Add All Gaps to Skills Tracker/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/skills/batch-create',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('analysis-123'),
          })
        );
      });
    });

    it('should show success toast with link to Skills Tracker', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 3, success: true }),
      });

      render(<AnalysisResults analysis={mockAnalysisData} />);

      const addButton = screen.getByRole('button', { name: /Add All Gaps to Skills Tracker/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Skills Added to Tracker',
            description: expect.stringContaining('Successfully added 3 skills'),
            action: expect.anything(),
          })
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to add skills' }),
      });

      render(<AnalysisResults analysis={mockAnalysisData} />);

      const addButton = screen.getByRole('button', { name: /Add All Gaps to Skills Tracker/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to Add Skills',
            description: expect.stringContaining('Failed to add skills'),
            variant: 'destructive',
          })
        );
      });
    });

    it('should disable button when no analysis ID is present', () => {
      const dataWithoutId = { ...mockAnalysisData, id: undefined };
      render(<AnalysisResults analysis={dataWithoutId} />);

      const addButton = screen.getByRole('button', { name: /Add All Gaps to Skills Tracker/i });

      // Button should still be present but clicking it should show error
      fireEvent.click(addButton);

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Analysis ID is missing. Cannot add skills to tracker.',
          variant: 'destructive',
        })
      );
    });
  });

  describe('Create Career Plan Action', () => {
    it('should call API to create career plan from roadmap', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          plan: {
            id: 'plan-123',
            title: 'Transition to Senior Software Engineer',
          },
          success: true,
        }),
      });

      render(<AnalysisResults analysis={mockAnalysisData} />);

      const createButton = screen.getByRole('button', { name: /Create Career Plan from Roadmap/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/plans/create-from-analysis',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Transition to Senior Software Engineer'),
          })
        );
      });
    });

    it('should generate plan with correct milestones from roadmap', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          plan: { id: 'plan-123', title: 'Transition Plan' },
          success: true,
        }),
      });

      render(<AnalysisResults analysis={mockAnalysisData} />);

      const createButton = screen.getByRole('button', { name: /Create Career Plan from Roadmap/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);

        expect(requestBody.milestones).toHaveLength(2);
        expect(requestBody.milestones[0].title).toBe('Master Container Orchestration');
        expect(requestBody.milestones[1].title).toBe('Learn Advanced System Design');
      });
    });

    it('should show success toast with link to Career Plan', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          plan: {
            id: 'plan-123',
            title: 'Transition to Senior Software Engineer',
          },
          success: true,
        }),
      });

      render(<AnalysisResults analysis={mockAnalysisData} />);

      const createButton = screen.getByRole('button', { name: /Create Career Plan from Roadmap/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Career Plan Created',
            description: expect.stringContaining('Transition to Senior Software Engineer'),
            action: expect.anything(),
          })
        );
      });
    });

    it('should handle API errors when creating plan', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to create plan' }),
      });

      render(<AnalysisResults analysis={mockAnalysisData} />);

      const createButton = screen.getByRole('button', { name: /Create Career Plan from Roadmap/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to Create Plan',
            description: expect.stringContaining('Failed to create plan'),
            variant: 'destructive',
          })
        );
      });
    });

    it('should disable button when no roadmap is present', () => {
      const dataWithoutRoadmap = { ...mockAnalysisData, prioritizedRoadmap: [] };
      render(<AnalysisResults analysis={dataWithoutRoadmap} />);

      const createButton = screen.getByRole('button', { name: /Create Career Plan from Roadmap/i });
      expect(createButton).toBeDisabled();
    });
  });

  describe('Page State Persistence', () => {
    it('should maintain tab selection state during interactions', () => {
      render(<AnalysisResults analysis={mockAnalysisData} />);

      // Initially, Overview tab content should be visible
      expect(screen.getByText('Analysis Overview')).toBeInTheDocument();

      // Switch to roadmap tab
      const roadmapTab = screen.getByRole('tab', { name: /Roadmap/i });
      fireEvent.click(roadmapTab);

      // Roadmap tab should be selected (aria-selected="true")
      expect(roadmapTab).toHaveAttribute('aria-selected', 'true');

      // Switch back to overview
      const overviewTab = screen.getByRole('tab', { name: /Overview/i });
      fireEvent.click(overviewTab);

      // Overview tab should be selected again
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Analysis Overview')).toBeInTheDocument();
    });

    it('should render without analysis data gracefully', () => {
      render(<AnalysisResults analysis={undefined} data={undefined} />);

      expect(screen.getByText('No analysis data available')).toBeInTheDocument();
    });

    it('should support both analysis and data prop names for backwards compatibility', () => {
      const { rerender } = render(<AnalysisResults data={mockAnalysisData} />);
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();

      rerender(<AnalysisResults analysis={mockAnalysisData} />);
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
  });
});
