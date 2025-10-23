import { render, screen, fireEvent } from '@testing-library/react';
import { PrioritizedRoadmap, type RoadmapSkill } from '../PrioritizedRoadmap';

describe('PrioritizedRoadmap Component', () => {
  const mockSkills: RoadmapSkill[] = [
    {
      skillName: 'Python Programming',
      priorityScore: 85,
      timeEstimate: 80,
      importance: 90,
      phase: 1,
      category: 'Technical',
      isQuickWin: false,
    },
    {
      skillName: 'Git Version Control',
      priorityScore: 75,
      timeEstimate: 20,
      importance: 80,
      phase: 1,
      category: 'Technical',
      isQuickWin: true,
    },
    {
      skillName: 'Public Speaking',
      priorityScore: 55,
      timeEstimate: 100,
      importance: 60,
      phase: 2,
      category: 'Soft Skills',
      isQuickWin: false,
    },
    {
      skillName: 'Advanced Analytics',
      priorityScore: 40,
      timeEstimate: 200,
      importance: 50,
      phase: 3,
      category: 'Technical',
      isQuickWin: false,
    },
  ];

  it('renders the component with title and description', () => {
    render(<PrioritizedRoadmap skills={mockSkills} />);

    expect(screen.getByText('Prioritized Learning Roadmap')).toBeInTheDocument();
    expect(screen.getByText(/Your personalized learning path/)).toBeInTheDocument();
  });

  it('displays sorting controls', () => {
    render(<PrioritizedRoadmap skills={mockSkills} />);

    expect(screen.getByText('Sort by:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Priority/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Time/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Phase/ })).toBeInTheDocument();
  });

  it('displays all three phases with correct titles', () => {
    render(<PrioritizedRoadmap skills={mockSkills} />);

    expect(screen.getByText('Immediate Focus')).toBeInTheDocument();
    expect(screen.getByText('0-3 months')).toBeInTheDocument();
    expect(screen.getByText('Short-term Goals')).toBeInTheDocument();
    expect(screen.getByText('3-6 months')).toBeInTheDocument();
    expect(screen.getByText('Long-term Investment')).toBeInTheDocument();
    expect(screen.getByText('6-12 months')).toBeInTheDocument();
  });

  it('displays quick win badges for eligible skills', () => {
    render(<PrioritizedRoadmap skills={mockSkills} />);

    const quickWinBadges = screen.getAllByText(/Quick Win/);
    expect(quickWinBadges.length).toBeGreaterThan(0);
  });

  it('shows priority badges with correct labels', () => {
    render(<PrioritizedRoadmap skills={mockSkills} />);

    // Should have Critical (score >= 80), High (score >= 60), and Medium (score >= 40)
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    const mediumBadges = screen.getAllByText('Medium');
    expect(mediumBadges.length).toBeGreaterThan(0);
  });

  it('displays summary statistics', () => {
    render(<PrioritizedRoadmap skills={mockSkills} />);

    expect(screen.getByText('Total Skills')).toBeInTheDocument();
    expect(screen.getByText('Quick Wins')).toBeInTheDocument();
    expect(screen.getByText('Total Time')).toBeInTheDocument();
    expect(screen.getByText('Avg Priority')).toBeInTheDocument();
  });

  it('shows empty state when no skills are provided', () => {
    render(<PrioritizedRoadmap skills={[]} />);

    expect(screen.getByText('No roadmap data available')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <PrioritizedRoadmap skills={mockSkills} className="custom-roadmap-class" />
    );

    const card = container.querySelector('.custom-roadmap-class');
    expect(card).toBeInTheDocument();
  });

  it('allows sorting by different criteria', () => {
    render(<PrioritizedRoadmap skills={mockSkills} />);

    const timeButton = screen.getByRole('button', { name: /Time/ });
    fireEvent.click(timeButton);

    // After clicking time sort, the button should have the primary background
    expect(timeButton).toHaveClass('bg-primary');
  });

  it('displays all skills within their respective phases', () => {
    render(<PrioritizedRoadmap skills={mockSkills} />);

    // All skills should be visible (phases are expanded by default)
    expect(screen.getByText('Python Programming')).toBeInTheDocument();
    expect(screen.getByText('Git Version Control')).toBeInTheDocument();
    expect(screen.getByText('Public Speaking')).toBeInTheDocument();
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
  });
});
