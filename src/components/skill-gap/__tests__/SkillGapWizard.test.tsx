/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SkillGapWizard } from '../SkillGapWizard';

// Create a mock toast function that can be spied on
const mockToast = jest.fn();

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock child components
jest.mock('../TargetRoleSelector', () => ({
  TargetRoleSelector: ({ onChange }: { onChange: (role: string, code?: string) => void }) => (
    <div data-testid="target-role-selector">
      <button onClick={() => onChange('Software Engineer', '15-1252.00')}>
        Select Role
      </button>
    </div>
  ),
}));

jest.mock('../AnalysisConfiguration', () => ({
  AnalysisConfiguration: ({ onChange }: { onChange: (config: { userAvailability?: number }) => void }) => (
    <div data-testid="analysis-configuration">
      <button onClick={() => onChange({ userAvailability: 10 })}>
        Set Availability
      </button>
    </div>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

describe('SkillGapWizard', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();
  const defaultProps = {
    userId: 'user123',
    resumeId: 'resume123',
    onComplete: mockOnComplete,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders wizard with initial step', () => {
    render(<SkillGapWizard {...defaultProps} />);

    expect(screen.getByText('Select Target Role')).toBeInTheDocument();
    expect(screen.getByTestId('target-role-selector')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
  });

  it('navigates to next step when Next button is clicked', async () => {
    render(<SkillGapWizard {...defaultProps} />);

    // Select a role first
    const selectRoleButton = screen.getByText('Select Role');
    fireEvent.click(selectRoleButton);

    // Click Next
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Configure Analysis')).toBeInTheDocument();
      expect(screen.getByTestId('analysis-configuration')).toBeInTheDocument();
    });
  });

  it('navigates back to previous step when Back button is clicked', async () => {
    render(<SkillGapWizard {...defaultProps} />);

    // Navigate forward first
    const selectRoleButton = screen.getByText('Select Role');
    fireEvent.click(selectRoleButton);
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Configure Analysis')).toBeInTheDocument();
    });

    // Click Back
    const backButton = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText('Select Target Role')).toBeInTheDocument();
    });
  });

  it('validates target role is required before proceeding', async () => {
    render(<SkillGapWizard {...defaultProps} />);

    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Target role required',
          variant: 'destructive',
        })
      );
    });
  });

  it('validates user availability is required and > 0', async () => {
    render(<SkillGapWizard {...defaultProps} />);

    // Navigate to configuration step
    const selectRoleButton = screen.getByText('Select Role');
    fireEvent.click(selectRoleButton);
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Configure Analysis')).toBeInTheDocument();
    });

    // Try to proceed without setting availability - just click Analyze without setting availability
    const analyzeButton = screen.getByRole('button', { name: /Analyze/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Availability required',
          variant: 'destructive',
        })
      );
    });
  });

  it('calls API and completes wizard on successful analysis', async () => {
    const mockAnalysisResponse = {
      analysisId: 'analysis123',
      criticalGaps: [],
      niceToHaveGaps: [],
      transferableSkills: [],
      roadmap: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnalysisResponse,
    });

    render(<SkillGapWizard {...defaultProps} />);

    // Complete wizard flow
    const selectRoleButton = screen.getByText('Select Role');
    fireEvent.click(selectRoleButton);

    let nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId('analysis-configuration')).toBeInTheDocument();
    });

    const setAvailabilityButton = screen.getByText('Set Availability');
    fireEvent.click(setAvailabilityButton);

    const analyzeButton = screen.getByRole('button', { name: /Analyze/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/skill-gap/analyze',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('resume123'),
        })
      );

      expect(mockOnComplete).toHaveBeenCalledWith('analysis123');
    });
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Analysis failed' }),
    });

    render(<SkillGapWizard {...defaultProps} />);

    // Complete wizard flow
    const selectRoleButton = screen.getByText('Select Role');
    fireEvent.click(selectRoleButton);

    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId('analysis-configuration')).toBeInTheDocument();
    });

    const setAvailabilityButton = screen.getByText('Set Availability');
    fireEvent.click(setAvailabilityButton);

    const analyzeButton = screen.getByRole('button', { name: /Analyze/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Analysis failed',
          variant: 'destructive',
        })
      );
    });
  });

  it('shows cancel confirmation and calls onCancel', () => {
    window.confirm = jest.fn(() => true);
    render(<SkillGapWizard {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to cancel? Your progress will be lost.'
    );
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during analysis', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<SkillGapWizard {...defaultProps} />);

    // Complete wizard flow
    const selectRoleButton = screen.getByText('Select Role');
    fireEvent.click(selectRoleButton);

    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId('analysis-configuration')).toBeInTheDocument();
    });

    const setAvailabilityButton = screen.getByText('Set Availability');
    fireEvent.click(setAvailabilityButton);

    const analyzeButton = screen.getByRole('button', { name: /Analyze/i });
    fireEvent.click(analyzeButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Analyzing skill gaps...')).toBeInTheDocument();
    });
  });
});
