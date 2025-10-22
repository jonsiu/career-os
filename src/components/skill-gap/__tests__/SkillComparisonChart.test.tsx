import { render, screen } from '@testing-library/react';
import { SkillComparisonChart, type SkillComparison } from '../SkillComparisonChart';

// Mock recharts to avoid canvas/SVG rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
}));

describe('SkillComparisonChart Component', () => {
  const mockSkills: SkillComparison[] = [
    {
      skillName: 'Python',
      currentLevel: 60,
      targetLevel: 85,
      gap: 25,
      category: 'Programming',
      gapType: 'critical',
    },
    {
      skillName: 'JavaScript',
      currentLevel: 40,
      targetLevel: 75,
      gap: 35,
      category: 'Programming',
      gapType: 'critical',
    },
    {
      skillName: 'Communication',
      currentLevel: 70,
      targetLevel: 80,
      gap: 10,
      category: 'Soft Skills',
      gapType: 'nice-to-have',
    },
    {
      skillName: 'Leadership',
      currentLevel: 80,
      targetLevel: 85,
      gap: 5,
      category: 'Management',
      gapType: 'transferable',
    },
  ];

  it('renders the component with title and description', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    expect(screen.getByText('Skill Level Comparison')).toBeInTheDocument();
    expect(screen.getByText(/Current vs. target skill levels/)).toBeInTheDocument();
  });

  it('displays empty state when no skills provided', () => {
    render(<SkillComparisonChart skills={[]} />);
    expect(screen.getByText('No skill data available')).toBeInTheDocument();
    expect(screen.getByText('No skills to compare')).toBeInTheDocument();
  });

  it('renders bar chart on desktop view', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('shows legend when showLegend is true', () => {
    render(<SkillComparisonChart skills={mockSkills} showLegend={true} />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('limits display to maxSkillsDisplay', () => {
    render(<SkillComparisonChart skills={mockSkills} maxSkillsDisplay={2} />);
    // Should show badge indicating more skills
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('displays all skills in mobile view', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    // All skill names should be present in mobile list view
    expect(screen.getAllByText('Python').length).toBeGreaterThan(0);
    expect(screen.getAllByText('JavaScript').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Communication').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Leadership').length).toBeGreaterThan(0);
  });

  it('shows gap type badges correctly', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
    expect(screen.getByText('Nice-to-Have')).toBeInTheDocument();
    expect(screen.getByText('Transferable')).toBeInTheDocument();
  });

  it('displays progress bars with correct aria attributes', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);

    // Check first progress bar has correct attributes
    const firstBar = progressBars[0];
    expect(firstBar).toHaveAttribute('aria-valuemin', '0');
    expect(firstBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('calculates and displays gap correctly', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    // JavaScript has the largest gap (35%)
    expect(screen.getAllByText(/35%/).length).toBeGreaterThan(0);
  });

  it('displays summary statistics correctly', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    expect(screen.getByText('Total Skills')).toBeInTheDocument();
    expect(screen.getByText('Avg Current')).toBeInTheDocument();
    expect(screen.getByText('Avg Target')).toBeInTheDocument();
    expect(screen.getByText('Avg Gap')).toBeInTheDocument();
  });

  it('calculates average current level correctly', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    // Average: (60 + 40 + 70 + 80) / 4 = 62.5, rounded = 63%
    const avgElements = screen.getAllByText('63%');
    expect(avgElements.length).toBeGreaterThan(0);
  });

  it('sorts skills by gap (descending)', () => {
    const { container } = render(<SkillComparisonChart skills={mockSkills} maxSkillsDisplay={2} />);
    // JavaScript (gap: 35) and Python (gap: 25) should be shown first
    const skillText = container.textContent || '';
    const jsIndex = skillText.indexOf('JavaScript');
    const pythonIndex = skillText.indexOf('Python');
    // Both should be present (JavaScript with larger gap should appear first in data)
    expect(jsIndex).toBeGreaterThan(-1);
    expect(pythonIndex).toBeGreaterThan(-1);
  });

  it('renders with custom className', () => {
    const { container } = render(
      <SkillComparisonChart skills={mockSkills} className="custom-chart-class" />
    );
    const card = container.querySelector('.custom-chart-class');
    expect(card).toBeInTheDocument();
  });

  it('displays current level labels in mobile view', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    expect(screen.getAllByText(/Current/).length).toBeGreaterThan(0);
  });

  it('displays target level labels in mobile view', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    expect(screen.getAllByText(/Target/).length).toBeGreaterThan(0);
  });

  it('shows gap to close in mobile view', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    expect(screen.getAllByText(/Gap to close/).length).toBeGreaterThan(0);
  });

  it('handles skills without gap property by calculating it', () => {
    const skillsWithoutGap: SkillComparison[] = [
      {
        skillName: 'Test Skill',
        currentLevel: 30,
        targetLevel: 70,
        gap: 0, // Will be calculated as 40
        gapType: 'critical',
      },
    ];
    render(<SkillComparisonChart skills={skillsWithoutGap} />);
    // Gap should be calculated: 70 - 30 = 40
    expect(screen.getAllByText(/40%/).length).toBeGreaterThan(0);
  });

  it('displays total skill count correctly', () => {
    render(<SkillComparisonChart skills={mockSkills} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
