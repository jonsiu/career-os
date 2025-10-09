import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WelcomeStep } from '../welcome-step';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('WelcomeStep', () => {
  const mockOnNext = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome content correctly', () => {
    render(<WelcomeStep onNext={mockOnNext} onSkip={mockOnSkip} />);
    
    expect(screen.getByText('Welcome to CareerOS')).toBeInTheDocument();
    expect(screen.getByText(/Transform your resume from good to exceptional/)).toBeInTheDocument();
  });

  it('displays all feature cards', () => {
    render(<WelcomeStep onNext={mockOnNext} onSkip={mockOnSkip} />);
    
    expect(screen.getByText('Resume Analysis')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Coaching')).toBeInTheDocument();
    expect(screen.getByText('Job Matching')).toBeInTheDocument();
    expect(screen.getByText('Career Growth')).toBeInTheDocument();
  });

  it('shows benefits section', () => {
    render(<WelcomeStep onNext={mockOnNext} onSkip={mockOnSkip} />);
    
    expect(screen.getByText("What You'll Achieve")).toBeInTheDocument();
    expect(screen.getByText('Get noticed by hiring managers')).toBeInTheDocument();
    expect(screen.getByText('Increase interview callbacks by 3x')).toBeInTheDocument();
  });

  it('calls onNext when Get Started button is clicked', () => {
    render(<WelcomeStep onNext={mockOnNext} onSkip={mockOnSkip} />);
    
    const getStartedButton = screen.getByText('Get Started');
    fireEvent.click(getStartedButton);
    
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when Skip Onboarding button is clicked', () => {
    render(<WelcomeStep onNext={mockOnNext} onSkip={mockOnSkip} />);
    
    const skipButton = screen.getByText('Skip Onboarding');
    fireEvent.click(skipButton);
    
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('shows skip option text', () => {
    render(<WelcomeStep onNext={mockOnNext} onSkip={mockOnSkip} />);
    
    expect(screen.getByText(/You can always complete onboarding later/)).toBeInTheDocument();
  });
});
