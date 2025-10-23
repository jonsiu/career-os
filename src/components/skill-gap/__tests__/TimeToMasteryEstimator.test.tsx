import { render, screen } from '@testing-library/react';
import { TimeToMasteryEstimator, type SkillEstimate } from '../TimeToMasteryEstimator';

describe('TimeToMasteryEstimator Component', () => {
  const mockSkills: SkillEstimate[] = [
    {
      skillName: 'Python Basics',
      estimatedHours: 40,
      weeksToComplete: 4,
      difficulty: 'beginner',
      priorityScore: 85,
      isQuickWin: true,
      learningPath: ['Variables & Types', 'Control Flow', 'Functions'],
    },
    {
      skillName: 'Machine Learning',
      estimatedHours: 160,
      weeksToComplete: 16,
      difficulty: 'advanced',
      priorityScore: 75,
      isQuickWin: false,
      learningPath: ['Linear Regression', 'Neural Networks', 'Deep Learning'],
    },
    {
      skillName: 'Git',
      estimatedHours: 20,
      weeksToComplete: 2,
      difficulty: 'beginner',
      priorityScore: 65,
      isQuickWin: true,
    },
    {
      skillName: 'System Design',
      estimatedHours: 200,
      weeksToComplete: 20,
      difficulty: 'expert',
      priorityScore: 60,
      isQuickWin: false,
    },
  ];

  const userAvailability = 10; // hours per week

  it('renders the component with title and description', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getByText('Time to Mastery Estimator')).toBeInTheDocument();
    expect(screen.getByText(/Estimated time to master skills at 10 hours\/week/)).toBeInTheDocument();
  });

  it('displays empty state when no skills provided', () => {
    render(<TimeToMasteryEstimator skills={[]} userAvailability={userAvailability} />);
    expect(screen.getByText('No skill estimates available')).toBeInTheDocument();
  });

  it('calculates total hours correctly', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    // Total: 40 + 160 + 20 + 200 = 420 hours
    expect(screen.getByText('420h')).toBeInTheDocument();
  });

  it('calculates total weeks correctly', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    // Total: 420 / 10 = 42 weeks = ~10 months
    expect(screen.getByText('10 months')).toBeInTheDocument();
  });

  it('displays quick wins count correctly', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    // 2 quick wins: Python Basics and Git
    const quickWinElements = screen.getAllByText('2');
    expect(quickWinElements.length).toBeGreaterThan(0);
  });

  it('displays total skills count correctly', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    const skillCountElements = screen.getAllByText('4');
    expect(skillCountElements.length).toBeGreaterThan(0);
  });

  it('shows short-term skills section when applicable', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getByText('Short-term (0-4 weeks)')).toBeInTheDocument();
    // Git and Python Basics are short-term
    expect(screen.getByText(/Python Basics, Git/)).toBeInTheDocument();
  });

  it('shows medium-term skills section when applicable', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getByText('Medium-term (1-3 months)')).toBeInTheDocument();
    // Machine Learning is medium-term (16 weeks)
    expect(screen.getByText(/Machine Learning/)).toBeInTheDocument();
  });

  it('shows long-term skills section when applicable', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getByText('Long-term (3+ months)')).toBeInTheDocument();
    // System Design is long-term (20 weeks)
    expect(screen.getByText(/System Design/)).toBeInTheDocument();
  });

  it('displays all skill names', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getAllByText('Python Basics').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Machine Learning').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Git').length).toBeGreaterThan(0);
    expect(screen.getAllByText('System Design').length).toBeGreaterThan(0);
  });

  it('shows quick win badges for eligible skills', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    const quickWinBadges = screen.getAllByText('Quick Win');
    // 2 quick wins
    expect(quickWinBadges.length).toBe(2);
  });

  it('displays difficulty badges correctly', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getAllByText('Beginner').length).toBeGreaterThan(0);
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Expert')).toBeInTheDocument();
  });

  it('shows priority scores for each skill', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getByText(/Priority: 85/)).toBeInTheDocument();
    expect(screen.getByText(/Priority: 75/)).toBeInTheDocument();
    expect(screen.getByText(/Priority: 65/)).toBeInTheDocument();
    expect(screen.getByText(/Priority: 60/)).toBeInTheDocument();
  });

  it('displays estimated hours for each skill', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getAllByText('40h').length).toBeGreaterThan(0);
    expect(screen.getAllByText('160h').length).toBeGreaterThan(0);
    expect(screen.getAllByText('20h').length).toBeGreaterThan(0);
    expect(screen.getAllByText('200h').length).toBeGreaterThan(0);
  });

  it('displays weeks to complete for each skill', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getAllByText(/4 weeks/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/4 months/).length).toBeGreaterThan(0); // 16 weeks
    expect(screen.getAllByText(/2 weeks/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/5 months/).length).toBeGreaterThan(0); // 20 weeks
  });

  it('renders timeline bars with correct aria attributes', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);

    const firstBar = progressBars[0];
    expect(firstBar).toHaveAttribute('aria-valuemin', '0');
  });

  it('displays user availability information', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getByText(/Your availability: 10 hours per week/)).toBeInTheDocument();
  });

  it('shows disclaimer about estimate variability', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(
      screen.getByText(/Estimates are based on average learning times/)
    ).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <TimeToMasteryEstimator
        skills={mockSkills}
        userAvailability={userAvailability}
        className="custom-estimator-class"
      />
    );
    const card = container.querySelector('.custom-estimator-class');
    expect(card).toBeInTheDocument();
  });

  it('sorts skills by priority score for timeline', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    // Skills should be sorted by priority (descending)
    // Highest priority first: Python Basics (85)
    const skillElements = screen.getAllByText(/Priority:/);
    expect(skillElements[0].textContent).toContain('85');
  });

  it('calculates cumulative timeline correctly', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    // Check for week labels
    expect(screen.getByText(/Week 0/)).toBeInTheDocument();
  });

  it('displays summary icons correctly', () => {
    const { container } = render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    // Icons should be rendered (Clock, Calendar, Zap, TrendingUp)
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('groups skills correctly by time range', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    // Check that time range sections exist
    expect(screen.getByText('Time Range Distribution')).toBeInTheDocument();
  });

  it('displays skill counts for each time range', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    // Short-term: 2 skills
    const shortTermBadge = screen.getAllByText(/2 skills/);
    expect(shortTermBadge.length).toBeGreaterThan(0);
  });

  it('handles skills without learning path gracefully', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    // Git doesn't have learning path, should still render
    expect(screen.getAllByText('Git').length).toBeGreaterThan(0);
  });

  it('formats hours correctly for display', () => {
    const shortSkill: SkillEstimate[] = [
      {
        skillName: 'Quick Skill',
        estimatedHours: 0.5,
        weeksToComplete: 1,
        difficulty: 'beginner',
        priorityScore: 50,
      },
    ];
    render(<TimeToMasteryEstimator skills={shortSkill} userAvailability={10} />);
    // 0.5 hours should be displayed as minutes
    expect(screen.getAllByText(/30 min/).length).toBeGreaterThan(0);
  });

  it('displays individual estimates section', () => {
    render(
      <TimeToMasteryEstimator skills={mockSkills} userAvailability={userAvailability} />
    );
    expect(screen.getByText('Individual Estimates')).toBeInTheDocument();
  });
});
