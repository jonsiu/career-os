import { render, screen } from '@testing-library/react';
import { RadarChart, type SkillDimension } from '../RadarChart';

describe('RadarChart Component', () => {
  const mockDimensions: SkillDimension[] = [
    { name: 'Technical Skills', currentValue: 60, targetValue: 85 },
    { name: 'Soft Skills', currentValue: 75, targetValue: 80 },
    { name: 'Domain Knowledge', currentValue: 40, targetValue: 70 },
    { name: 'Tools & Technologies', currentValue: 55, targetValue: 90 },
    { name: 'Management', currentValue: 30, targetValue: 60 },
  ];

  it('renders the component with title and description', () => {
    render(<RadarChart dimensions={mockDimensions} />);

    expect(screen.getByText('Skill Profile Comparison')).toBeInTheDocument();
    expect(screen.getByText(/Current vs. target skill levels/)).toBeInTheDocument();
  });

  it('renders legend with current and target level indicators', () => {
    render(<RadarChart dimensions={mockDimensions} />);

    expect(screen.getByText('Current Level')).toBeInTheDocument();
    expect(screen.getByText('Target Level')).toBeInTheDocument();
  });

  it('renders SVG radar chart with correct role and aria-label', () => {
    render(<RadarChart dimensions={mockDimensions} />);

    const svg = screen.getByRole('img', { name: /Radar chart showing current vs target skill levels/ });
    expect(svg).toBeInTheDocument();
  });

  it('displays all dimension names in the chart', () => {
    render(<RadarChart dimensions={mockDimensions} />);

    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Soft Skills')).toBeInTheDocument();
    expect(screen.getByText('Domain Knowledge')).toBeInTheDocument();
    expect(screen.getByText('Tools & Technologies')).toBeInTheDocument();
    expect(screen.getByText('Management')).toBeInTheDocument();
  });

  it('renders accessible data table within details element', () => {
    render(<RadarChart dimensions={mockDimensions} />);

    const detailsElement = screen.getByText('View data table');
    expect(detailsElement).toBeInTheDocument();
  });

  it('displays current, target, and gap values in data table', () => {
    render(<RadarChart dimensions={mockDimensions} />);

    // Open the details to check table content
    const summary = screen.getByText('View data table');
    summary.click();

    // Check for table headers
    expect(screen.getByRole('columnheader', { name: 'Dimension' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Current' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Target' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Gap' })).toBeInTheDocument();
  });

  it('shows empty state when no dimensions are provided', () => {
    render(<RadarChart dimensions={[]} />);

    expect(screen.getByText('No skill data available')).toBeInTheDocument();
    expect(screen.getByText('No skill dimensions available for comparison')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <RadarChart dimensions={mockDimensions} className="custom-radar-class" />
    );

    const card = container.querySelector('.custom-radar-class');
    expect(card).toBeInTheDocument();
  });
});
