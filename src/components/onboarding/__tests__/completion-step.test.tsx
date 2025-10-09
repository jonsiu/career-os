import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompletionStep } from '../completion-step';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('CompletionStep', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders completion step correctly', () => {
    render(<CompletionStep onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Welcome to CareerOS!')).toBeInTheDocument();
    expect(screen.getByText(/You're all set up and ready to accelerate your career growth/)).toBeInTheDocument();
  });

  it('shows completed steps', () => {
    render(
      <CompletionStep 
        onComplete={mockOnComplete}
        resumeTitle="Test Resume"
        targetRoles={['Engineering Manager', 'Product Manager']}
        extensionInstalled={true}
      />
    );
    
    expect(screen.getByText('What You\'ve Accomplished')).toBeInTheDocument();
    expect(screen.getByText('Resume Uploaded')).toBeInTheDocument();
    expect(screen.getByText('Goals Set')).toBeInTheDocument();
    expect(screen.getByText('Extension Installed')).toBeInTheDocument();
  });

  it('shows next steps', () => {
    render(<CompletionStep onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
    expect(screen.getByText('Analyze Your Resume')).toBeInTheDocument();
    expect(screen.getByText('Start Coaching Session')).toBeInTheDocument();
    expect(screen.getByText('Browse Jobs')).toBeInTheDocument();
  });

  it('shows pro tips', () => {
    render(<CompletionStep onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Pro Tips for Success')).toBeInTheDocument();
    expect(screen.getByText(/Regular Updates:/)).toBeInTheDocument();
    expect(screen.getByText(/Use the Extension:/)).toBeInTheDocument();
    expect(screen.getByText(/AI Coaching:/)).toBeInTheDocument();
  });

  it('calls onComplete when Go to Dashboard button is clicked', () => {
    render(<CompletionStep onComplete={mockOnComplete} />);
    
    const dashboardButton = screen.getByText('Go to Dashboard');
    fireEvent.click(dashboardButton);
    
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('displays resume title when provided', () => {
    render(
      <CompletionStep 
        onComplete={mockOnComplete}
        resumeTitle="My Awesome Resume"
      />
    );
    
    expect(screen.getByText(/My Awesome Resume/)).toBeInTheDocument();
  });

  it('displays target roles when provided', () => {
    render(
      <CompletionStep 
        onComplete={mockOnComplete}
        targetRoles={['Engineering Manager', 'Product Manager', 'Technical Lead']}
      />
    );
    
    expect(screen.getByText(/Targeting 3 roles: Engineering Manager, Product Manager.../)).toBeInTheDocument();
  });

  it('shows extension status correctly', () => {
    render(
      <CompletionStep 
        onComplete={mockOnComplete}
        extensionInstalled={false}
      />
    );
    
    expect(screen.getByText('Extension installation skipped')).toBeInTheDocument();
  });

  it('shows extension installed status correctly', () => {
    render(
      <CompletionStep 
        onComplete={mockOnComplete}
        extensionInstalled={true}
      />
    );
    
    expect(screen.getByText('Browser extension is ready to use')).toBeInTheDocument();
  });

  it('shows completion badge', () => {
    render(<CompletionStep onComplete={mockOnComplete} />);
    
    expect(screen.getByText('Onboarding Complete')).toBeInTheDocument();
  });
});
