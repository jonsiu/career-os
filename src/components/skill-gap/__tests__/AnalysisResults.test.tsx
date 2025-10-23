import { render, screen, fireEvent } from '@testing-library/react';
import { AnalysisResults, type AnalysisData } from '../AnalysisResults';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

describe('AnalysisResults Component', () => {
  const mockAnalysisData: AnalysisData = {
    id: 'test-analysis-123',
    targetRole: 'Senior Software Engineer',
    targetRoleONetCode: '15-1252.00',
    criticalGaps: [
      {
        skillName: 'Python Programming',
        importance: 90,
        currentLevel: 30,
        targetLevel: 80,
        priorityScore: 85,
        timeEstimate: 80,
        marketDemand: 95,
      },
      {
        skillName: 'System Design',
        importance: 88,
        currentLevel: 25,
        targetLevel: 75,
        priorityScore: 82,
        timeEstimate: 120,
        marketDemand: 90,
      },
    ],
    niceToHaveGaps: [
      {
        skillName: 'Docker',
        importance: 60,
        currentLevel: 40,
        targetLevel: 70,
        priorityScore: 55,
        timeEstimate: 40,
      },
    ],
    transferableSkills: [
      {
        skillName: 'Communication',
        currentLevel: 80,
        applicability: 85,
        transferExplanation: 'Strong communication applies directly to technical leadership',
        confidence: 0.9,
      },
      {
        skillName: 'Problem Solving',
        currentLevel: 75,
        applicability: 90,
        transferExplanation: 'Analytical thinking transfers well to software engineering',
        confidence: 0.95,
      },
    ],
    prioritizedRoadmap: [
      {
        phase: 1,
        skills: ['Python Programming'],
        estimatedDuration: 12,
        milestoneTitle: 'Master Core Programming',
      },
      {
        phase: 2,
        skills: ['System Design'],
        estimatedDuration: 16,
        milestoneTitle: 'Learn System Architecture',
      },
    ],
    transitionType: 'upward',
    completionProgress: 15,
  };

  it('renders the component with tabbed interface', () => {
    render(<AnalysisResults data={mockAnalysisData} />);

    expect(screen.getByRole('tab', { name: /Overview/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Skills Matrix/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Radar Chart/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Roadmap/ })).toBeInTheDocument();
  });

  it('displays overview tab by default', () => {
    render(<AnalysisResults data={mockAnalysisData} />);

    expect(screen.getByText('Analysis Overview')).toBeInTheDocument();
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
  });

  it('shows summary statistics in overview tab', () => {
    render(<AnalysisResults data={mockAnalysisData} />);

    // Critical gaps count
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Critical Gaps')).toBeInTheDocument();

    // Nice-to-have count
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Nice-to-Have')).toBeInTheDocument();

    // Transferable skills count
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Transferable Skills')).toBeInTheDocument();
  });

  it('displays transition type when provided', () => {
    render(<AnalysisResults data={mockAnalysisData} />);

    expect(screen.getByText(/Transition Type/)).toBeInTheDocument();
  });

  it('switches to Skills Matrix tab when clicked', () => {
    render(<AnalysisResults data={mockAnalysisData} />);

    const matrixTab = screen.getByRole('tab', { name: /Skills Matrix/ });
    fireEvent.click(matrixTab);

    // Should show the SkillsMatrix component
    expect(screen.getByText('Skills Matrix')).toBeInTheDocument();
  });

  it('switches to Radar Chart tab when clicked', () => {
    render(<AnalysisResults data={mockAnalysisData} />);

    const radarTab = screen.getByRole('tab', { name: /Radar Chart/ });
    fireEvent.click(radarTab);

    // Should show the RadarChart component
    expect(screen.getAllByText('Skill Profile Comparison').length).toBeGreaterThan(0);
  });

  it('switches to Roadmap tab when clicked', () => {
    render(<AnalysisResults data={mockAnalysisData} />);

    const roadmapTab = screen.getByRole('tab', { name: /Roadmap/ });
    fireEvent.click(roadmapTab);

    // Should show the PrioritizedRoadmap component
    expect(screen.getAllByText('Prioritized Learning Roadmap').length).toBeGreaterThan(0);
  });

  it('renders with custom className', () => {
    const { container } = render(
      <AnalysisResults data={mockAnalysisData} className="custom-results-class" />
    );

    const wrapper = container.querySelector('.custom-results-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('displays no data message when analysis data is not provided', () => {
    render(<AnalysisResults />);

    expect(screen.getByText('No analysis data available')).toBeInTheDocument();
  });

  it('supports both "analysis" and "data" props for backwards compatibility', () => {
    const { rerender } = render(<AnalysisResults analysis={mockAnalysisData} />);
    expect(screen.getAllByText('Senior Software Engineer').length).toBeGreaterThan(0);

    rerender(<AnalysisResults data={mockAnalysisData} />);
    expect(screen.getAllByText('Senior Software Engineer').length).toBeGreaterThan(0);
  });

  it('displays quick action buttons', () => {
    render(<AnalysisResults data={mockAnalysisData} />);

    expect(screen.getByText(/Add All Gaps to Skills Tracker/)).toBeInTheDocument();
    expect(screen.getByText(/Create Career Plan from Roadmap/)).toBeInTheDocument();
  });
});
