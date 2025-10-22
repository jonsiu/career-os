/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgressDashboard } from '../ProgressDashboard';

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ProgressDashboard', () => {
  const mockCurrentAnalysis = {
    _id: 'analysis123' as any,
    userId: 'user123' as any,
    resumeId: 'resume123' as any,
    targetRole: 'Software Engineer',
    targetRoleONetCode: '15-1252.00',
    criticalGaps: [
      {
        skillName: 'React',
        onetCode: 'sk001',
        importance: 90,
        currentLevel: 30,
        targetLevel: 80,
        priorityScore: 85,
        timeEstimate: 120,
        marketDemand: 95,
      },
      {
        skillName: 'TypeScript',
        onetCode: 'sk002',
        importance: 85,
        currentLevel: 40,
        targetLevel: 75,
        priorityScore: 80,
        timeEstimate: 80,
        marketDemand: 90,
      },
    ],
    niceToHaveGaps: [
      {
        skillName: 'GraphQL',
        onetCode: 'sk003',
        importance: 60,
        currentLevel: 20,
        targetLevel: 70,
        priorityScore: 65,
        timeEstimate: 60,
      },
    ],
    transferableSkills: [],
    prioritizedRoadmap: [],
    userAvailability: 10,
    transitionType: 'lateral',
    completionProgress: 33,
    contentHash: 'hash123',
    analysisVersion: '1.0',
    metadata: {
      onetDataVersion: '28.0',
      aiModel: 'claude-3-5-sonnet',
      affiliateClickCount: 0,
      lastProgressUpdate: Date.now() - 86400000, // 1 day ago
    },
    createdAt: Date.now() - 2592000000, // 30 days ago
    updatedAt: Date.now() - 86400000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.mockClear();
    (global.fetch as jest.Mock).mockClear();

    // Default mock for history endpoint (called on component mount)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        analyses: [],
        count: 0,
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Progress Calculation', () => {
    it('calculates progress correctly based on closed gaps', async () => {
      const totalGaps = mockCurrentAnalysis.criticalGaps.length + mockCurrentAnalysis.niceToHaveGaps.length;

      render(<ProgressDashboard currentAnalysis={mockCurrentAnalysis} />);

      await waitFor(() => {
        expect(screen.getByText(/You've closed 1 of 3/i)).toBeInTheDocument();
        expect(screen.getByText(/33%/i)).toBeInTheDocument();
      });
    });

    it('displays zero progress when no gaps are closed', async () => {
      const analysis = {
        ...mockCurrentAnalysis,
        completionProgress: 0,
      };

      render(<ProgressDashboard currentAnalysis={analysis} />);

      await waitFor(() => {
        expect(screen.getByText(/You've closed 0 of 3/i)).toBeInTheDocument();
        expect(screen.getByText(/0%/i)).toBeInTheDocument();
      });
    });

    it('displays 100% progress when all gaps are closed', async () => {
      const analysis = {
        ...mockCurrentAnalysis,
        completionProgress: 100,
      };

      render(<ProgressDashboard currentAnalysis={analysis} />);

      await waitFor(() => {
        expect(screen.getByText(/You've closed 3 of 3/i)).toBeInTheDocument();
        expect(screen.getByText(/100%/i)).toBeInTheDocument();
      });
    });
  });

  describe('Historical Analysis Comparison', () => {
    it('fetches and displays historical analyses on mount', async () => {
      const mockHistoricalAnalyses = [
        {
          id: 'analysis123',
          targetRole: 'Software Engineer',
          completionProgress: 33,
          criticalGapsCount: 2,
          niceToHaveGapsCount: 1,
          transferableSkillsCount: 0,
          roadmapPhases: 0,
          createdAt: Date.now() - 2592000000,
        },
        {
          id: 'analysis456',
          targetRole: 'Software Engineer',
          completionProgress: 0,
          criticalGapsCount: 5,
          niceToHaveGapsCount: 3,
          transferableSkillsCount: 0,
          roadmapPhases: 0,
          createdAt: Date.now() - 5184000000, // 60 days ago
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analyses: mockHistoricalAnalyses,
          count: 2,
        }),
      });

      render(<ProgressDashboard currentAnalysis={mockCurrentAnalysis} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/skill-gap/history');
      });
    });

    it('shows before/after comparison when historical analysis is selected', async () => {
      const mockHistoricalAnalyses = [
        {
          id: 'analysis456',
          targetRole: 'Software Engineer',
          completionProgress: 0,
          criticalGapsCount: 5,
          niceToHaveGapsCount: 3,
          transferableSkillsCount: 0,
          roadmapPhases: 0,
          createdAt: Date.now() - 5184000000,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analyses: mockHistoricalAnalyses,
          count: 1,
        }),
      });

      render(<ProgressDashboard currentAnalysis={mockCurrentAnalysis} />);

      await waitFor(() => {
        expect(screen.getByText(/Historical Analyses/i)).toBeInTheDocument();
      });
    });

    it('handles API error when fetching historical analyses', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<ProgressDashboard currentAnalysis={mockCurrentAnalysis} />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to load historical analyses',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Re-run Analysis Flow', () => {
    it('shows re-run analysis button', async () => {
      render(<ProgressDashboard currentAnalysis={mockCurrentAnalysis} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Re-run Analysis/i })).toBeInTheDocument();
      });
    });

    it('triggers re-run analysis when button is clicked', async () => {
      // Mock for initial history fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analyses: [],
          count: 0,
        }),
      });

      render(<ProgressDashboard currentAnalysis={mockCurrentAnalysis} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Re-run Analysis/i })).toBeInTheDocument();
      });

      // Mock for re-run analysis call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysisId: 'newAnalysis123',
          contentHashChanged: true,
        }),
      });

      const rerunButton = screen.getByRole('button', { name: /Re-run Analysis/i });
      fireEvent.click(rerunButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/skill-gap/analyze', expect.objectContaining({
          method: 'POST',
        }));
      });
    });

    it('shows message when resume content has not changed', async () => {
      // Mock for initial history fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analyses: [],
          count: 0,
        }),
      });

      render(<ProgressDashboard currentAnalysis={mockCurrentAnalysis} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Re-run Analysis/i })).toBeInTheDocument();
      });

      // Mock for re-run analysis call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysisId: 'analysis123',
          contentHashChanged: false,
          message: 'Resume content unchanged. Showing cached results.',
        }),
      });

      const rerunButton = screen.getByRole('button', { name: /Re-run Analysis/i });
      fireEvent.click(rerunButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Resume unchanged',
          })
        );
      });
    });
  });

  describe('Progress Calculation with Skills Tracker', () => {
    it('updates progress based on Skills Tracker when refresh is clicked', async () => {
      // Mock for initial history fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analyses: [],
          count: 0,
        }),
      });

      render(<ProgressDashboard currentAnalysis={mockCurrentAnalysis} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Refresh Progress/i })).toBeInTheDocument();
      });

      // Mock for refresh progress call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          completionProgress: 50,
          closedGaps: 2,
          totalGaps: 4,
          progressChange: 17,
        }),
      });

      const refreshButton = screen.getByRole('button', { name: /Refresh Progress/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/skill-gap/progress',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ analysisId: 'analysis123' }),
          })
        );
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Progress updated',
          })
        );
      });
    });
  });

  describe('Motivational Messaging', () => {
    it('shows appropriate message for low progress (0-25%)', async () => {
      const analysis = { ...mockCurrentAnalysis, completionProgress: 10 };
      render(<ProgressDashboard currentAnalysis={analysis} />);

      await waitFor(() => {
        expect(screen.getByText(/Keep learning!/i)).toBeInTheDocument();
      });
    });

    it('shows appropriate message for medium progress (26-75%)', async () => {
      const analysis = { ...mockCurrentAnalysis, completionProgress: 50 };
      render(<ProgressDashboard currentAnalysis={analysis} />);

      await waitFor(() => {
        expect(screen.getByText(/Great progress!/i)).toBeInTheDocument();
      });
    });

    it('shows appropriate message for high progress (76-100%)', async () => {
      const analysis = { ...mockCurrentAnalysis, completionProgress: 90 };
      render(<ProgressDashboard currentAnalysis={analysis} />);

      await waitFor(() => {
        expect(screen.getByText(/Almost there!/i)).toBeInTheDocument();
      });
    });

    it('shows completion message for 100% progress', async () => {
      const analysis = { ...mockCurrentAnalysis, completionProgress: 100 };
      render(<ProgressDashboard currentAnalysis={analysis} />);

      await waitFor(() => {
        expect(screen.getByText(/Congratulations!/i)).toBeInTheDocument();
      });
    });
  });
});
