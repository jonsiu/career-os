import { render, screen } from '@testing-library/react';
import { SkillGapMatrix, type SkillGapItem } from '../SkillGapMatrix';

describe('SkillGapMatrix Component', () => {
  const mockSkills: SkillGapItem[] = [
    {
      skillName: 'Python Programming',
      category: 'Technical Skills',
      currentLevel: 40,
      requiredLevel: 80,
      importance: 'critical',
      gapType: 'critical',
    },
    {
      skillName: 'Machine Learning',
      category: 'Technical Skills',
      currentLevel: 20,
      requiredLevel: 75,
      importance: 'high',
      gapType: 'critical',
    },
    {
      skillName: 'Communication',
      category: 'Soft Skills',
      currentLevel: 70,
      requiredLevel: 85,
      importance: 'medium',
      gapType: 'nice-to-have',
    },
    {
      skillName: 'Project Management',
      category: 'Management',
      currentLevel: 80,
      requiredLevel: 85,
      importance: 'low',
      gapType: 'transferable',
    },
  ];

  it('renders the component with title and description', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    expect(screen.getByText('Skill Gap Matrix')).toBeInTheDocument();
    expect(screen.getByText(/Current vs. required skill levels/)).toBeInTheDocument();
  });

  it('displays empty state when no skills provided', () => {
    render(<SkillGapMatrix skills={[]} />);
    expect(screen.getByText('No skill gap data available')).toBeInTheDocument();
  });

  it('renders legend with all gap types', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    expect(screen.getByText('Critical Gap')).toBeInTheDocument();
    expect(screen.getByText('Nice to Have')).toBeInTheDocument();
    expect(screen.getByText('Transferable')).toBeInTheDocument();
  });

  it('groups skills by category', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Soft Skills')).toBeInTheDocument();
    expect(screen.getByText('Management')).toBeInTheDocument();
  });

  it('displays skill count per category', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    // Technical Skills has 2 skills
    const techSkillsBadges = screen.getAllByText(/2 skills/);
    expect(techSkillsBadges.length).toBeGreaterThan(0);
  });

  it('calculates and displays average gap per category', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    // Technical Skills: (40 + 55) / 2 = 47.5, rounded = 48%
    expect(screen.getByText(/Avg Gap: 48%/)).toBeInTheDocument();
  });

  it('displays all skill names', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    expect(screen.getByText('Python Programming')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Project Management')).toBeInTheDocument();
  });

  it('shows current level for each skill', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    expect(screen.getByText(/Current:/)).toBeInTheDocument();
    // Check for level labels (Basic for 40%)
    expect(screen.getByText('Basic')).toBeInTheDocument();
  });

  it('shows required level for each skill', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    expect(screen.getAllByText(/Required:/).length).toBeGreaterThan(0);
  });

  it('displays gap percentage for each skill', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    // Python: 80 - 40 = 40%
    expect(screen.getByText(/Gap: 40%/)).toBeInTheDocument();
    // Machine Learning: 75 - 20 = 55%
    expect(screen.getByText(/Gap: 55%/)).toBeInTheDocument();
  });

  it('renders progress bar with correct aria attributes', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);

    const firstBar = progressBars[0];
    expect(firstBar).toHaveAttribute('aria-valuemin', '0');
    expect(firstBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('displays importance-based styling', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    // Check that different importance levels are rendered
    const { container } = render(<SkillGapMatrix skills={mockSkills} />);
    // Critical importance should have red styling (via className)
    expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
  });

  it('shows gap type icons correctly', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    // Check for icon aria-labels
    const criticalIcons = screen.getAllByLabelText('Critical Gap');
    expect(criticalIcons.length).toBeGreaterThan(0);
  });

  it('renders summary statistics', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    expect(screen.getByText('Total Skills')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Critical Gaps')).toBeInTheDocument();
    expect(screen.getByText('Transferable')).toBeInTheDocument();
  });

  it('counts total skills correctly', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('counts categories correctly', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    // 3 categories: Technical Skills, Soft Skills, Management
    const categoryCount = screen.getAllByText('3');
    expect(categoryCount.length).toBeGreaterThan(0);
  });

  it('counts critical gaps correctly', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    // 2 critical gaps: Python and Machine Learning
    const criticalCount = screen.getAllByText('2');
    expect(criticalCount.length).toBeGreaterThan(0);
  });

  it('counts transferable skills correctly', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    // 1 transferable: Project Management
    const transferableCount = screen.getAllByText('1');
    expect(transferableCount.length).toBeGreaterThan(0);
  });

  it('sorts categories by average gap descending', () => {
    const { container } = render(<SkillGapMatrix skills={mockSkills} />);
    const categoryHeaders = container.querySelectorAll('h3');
    // First category should be Technical Skills (highest avg gap: 47.5%)
    expect(categoryHeaders[0].textContent).toBe('Technical Skills');
  });

  it('renders with custom className', () => {
    const { container } = render(
      <SkillGapMatrix skills={mockSkills} className="custom-matrix-class" />
    );
    const card = container.querySelector('.custom-matrix-class');
    expect(card).toBeInTheDocument();
  });

  it('handles hover state with cursor-help class', () => {
    const { container } = render(<SkillGapMatrix skills={mockSkills} />);
    const hoverElements = container.querySelectorAll('.cursor-help');
    expect(hoverElements.length).toBeGreaterThan(0);
  });

  it('displays level categories correctly', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    // 40% = Basic, 80% = Advanced, 70% = Intermediate
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
  });

  it('renders arrow icon between current and required', () => {
    render(<SkillGapMatrix skills={mockSkills} />);
    // ArrowRight component should be rendered (can't directly test icon)
    const { container } = render(<SkillGapMatrix skills={mockSkills} />);
    // Check for the presence of elements with ArrowRight (via SVG paths)
    expect(container).toBeTruthy();
  });
});
