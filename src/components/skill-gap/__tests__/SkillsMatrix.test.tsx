import { render, screen } from '@testing-library/react';
import { SkillsMatrix, type SkillGap } from '../SkillsMatrix';

describe('SkillsMatrix Component', () => {
  const mockCriticalGaps: SkillGap[] = [
    {
      skillName: 'Python Programming',
      importance: 90,
      currentLevel: 30,
      targetLevel: 80,
      gapType: 'critical',
    },
    {
      skillName: 'Machine Learning',
      importance: 85,
      currentLevel: 20,
      targetLevel: 75,
      gapType: 'critical',
    },
  ];

  const mockNiceToHaveGaps: SkillGap[] = [
    {
      skillName: 'Docker',
      importance: 60,
      currentLevel: 40,
      targetLevel: 70,
      gapType: 'nice-to-have',
    },
  ];

  const mockTransferableSkills: SkillGap[] = [
    {
      skillName: 'Communication',
      importance: 70,
      currentLevel: 80,
      targetLevel: 80,
      gapType: 'transferable',
    },
  ];

  it('renders the component with title and description', () => {
    render(
      <SkillsMatrix
        criticalGaps={mockCriticalGaps}
        niceToHaveGaps={mockNiceToHaveGaps}
        transferableSkills={mockTransferableSkills}
      />
    );

    expect(screen.getByText('Skills Matrix')).toBeInTheDocument();
    expect(screen.getByText(/Visual comparison of your current skills/)).toBeInTheDocument();
  });

  it('renders legend with correct icons and labels', () => {
    render(
      <SkillsMatrix
        criticalGaps={mockCriticalGaps}
        niceToHaveGaps={mockNiceToHaveGaps}
        transferableSkills={mockTransferableSkills}
      />
    );

    expect(screen.getByText('Critical Gap')).toBeInTheDocument();
    expect(screen.getByText('Nice to Have')).toBeInTheDocument();
    expect(screen.getByText('Transferable')).toBeInTheDocument();
  });

  it('renders all skills in the matrix', () => {
    render(
      <SkillsMatrix
        criticalGaps={mockCriticalGaps}
        niceToHaveGaps={mockNiceToHaveGaps}
        transferableSkills={mockTransferableSkills}
      />
    );

    // Skills may appear multiple times (desktop + mobile views)
    expect(screen.getAllByText('Python Programming').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Machine Learning').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Docker').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Communication').length).toBeGreaterThan(0);
  });

  it('displays empty state when no skills are provided', () => {
    render(
      <SkillsMatrix
        criticalGaps={[]}
        niceToHaveGaps={[]}
        transferableSkills={[]}
      />
    );

    expect(screen.getByText('No skill data available')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <SkillsMatrix
        criticalGaps={mockCriticalGaps}
        niceToHaveGaps={[]}
        transferableSkills={[]}
        className="custom-class"
      />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('displays proficiency level badges for skills', () => {
    render(
      <SkillsMatrix
        criticalGaps={mockCriticalGaps}
        niceToHaveGaps={mockNiceToHaveGaps}
        transferableSkills={mockTransferableSkills}
      />
    );

    // Check for "Current" and "Target" badges in mobile view
    const badges = screen.getAllByText(/Current|Target|Basic|Intermediate|Advanced|Expert/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('includes accessibility attributes for screen readers', () => {
    render(
      <SkillsMatrix
        criticalGaps={mockCriticalGaps}
        niceToHaveGaps={[]}
        transferableSkills={[]}
      />
    );

    // Check for aria-labels on icons
    const criticalGapIcon = screen.getAllByLabelText('Critical gap')[0];
    expect(criticalGapIcon).toBeInTheDocument();
  });
});
