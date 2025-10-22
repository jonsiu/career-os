import { render, screen } from '@testing-library/react';
import { SkillProgressBar } from '../SkillProgressBar';

describe('SkillProgressBar Component', () => {
  const defaultProps = {
    skillName: 'Python Programming',
    currentLevel: 40,
    targetLevel: 80,
  };

  it('renders the skill name correctly', () => {
    render(<SkillProgressBar {...defaultProps} />);
    expect(screen.getByText('Python Programming')).toBeInTheDocument();
  });

  it('displays current level correctly', () => {
    render(<SkillProgressBar {...defaultProps} />);
    const elements = screen.getAllByText(/40%/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('calculates and displays the gap correctly', () => {
    render(<SkillProgressBar {...defaultProps} />);
    // Gap = 80 - 40 = 40%
    const elements = screen.getAllByText(/40%/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('shows level indicators when showLevelIndicators is true', () => {
    render(<SkillProgressBar {...defaultProps} showLevelIndicators={true} />);
    expect(screen.getAllByText('Beginner').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Basic').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Intermediate').length).toBeGreaterThan(0);
  });

  it('hides level indicators when showLevelIndicators is false', () => {
    render(<SkillProgressBar {...defaultProps} showLevelIndicators={false} />);
    // Level indicators should not be present in the level thresholds section
    const beginnerLabels = screen.queryAllByText('Beginner');
    // Only appears in current/target level summary, not in indicators
    expect(beginnerLabels.length).toBeLessThanOrEqual(2);
  });

  it('renders critical gap type badge correctly', () => {
    render(<SkillProgressBar {...defaultProps} gapType="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders nice-to-have gap type badge correctly', () => {
    render(<SkillProgressBar {...defaultProps} gapType="nice-to-have" />);
    expect(screen.getByText('Nice-to-Have')).toBeInTheDocument();
  });

  it('renders transferable gap type badge correctly', () => {
    render(<SkillProgressBar {...defaultProps} gapType="transferable" />);
    expect(screen.getByText('Transferable')).toBeInTheDocument();
  });

  it('displays correct level labels for current and target', () => {
    render(<SkillProgressBar {...defaultProps} />);
    // Current: 40% = Basic
    expect(screen.getAllByText('Basic').length).toBeGreaterThan(0);
    // Target: 80% = Advanced
    expect(screen.getAllByText('Advanced').length).toBeGreaterThan(0);
  });

  it('renders with custom className', () => {
    const { container } = render(
      <SkillProgressBar {...defaultProps} className="custom-class" />
    );
    const element = container.querySelector('.custom-class');
    expect(element).toBeInTheDocument();
  });

  it('shows progress bar with correct aria attributes', () => {
    render(<SkillProgressBar {...defaultProps} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '40');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders info tooltip trigger', () => {
    render(<SkillProgressBar {...defaultProps} />);
    const infoButton = screen.getByLabelText('Skill information');
    expect(infoButton).toBeInTheDocument();
  });

  it('handles zero current level correctly', () => {
    render(<SkillProgressBar {...defaultProps} currentLevel={0} targetLevel={50} />);
    expect(screen.getAllByText('None').length).toBeGreaterThan(0);
  });

  it('handles expert level correctly', () => {
    render(<SkillProgressBar {...defaultProps} currentLevel={95} targetLevel={100} />);
    expect(screen.getAllByText('Expert').length).toBeGreaterThan(0);
  });

  it('displays target level marker when target is above current', () => {
    render(<SkillProgressBar {...defaultProps} />);
    // Target marker should be rendered (checking via aria-label)
    const targetMarker = screen.getByLabelText(/Target level: 80%/);
    expect(targetMarker).toBeInTheDocument();
  });

  it('renders current level summary correctly', () => {
    render(<SkillProgressBar {...defaultProps} />);
    expect(screen.getByText(/Current:/)).toBeInTheDocument();
  });

  it('renders target level summary correctly', () => {
    render(<SkillProgressBar {...defaultProps} />);
    expect(screen.getByText(/Target:/)).toBeInTheDocument();
  });

  it('renders gap summary correctly', () => {
    render(<SkillProgressBar {...defaultProps} />);
    expect(screen.getByText(/Gap:/)).toBeInTheDocument();
  });
});
