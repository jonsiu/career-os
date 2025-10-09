import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserExtensionStep } from '../browser-extension-step';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('BrowserExtensionStep', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders browser extension step correctly', () => {
    render(<BrowserExtensionStep onNext={mockOnNext} onBack={mockOnBack} onSkip={mockOnSkip} />);
    
    expect(screen.getByText('Install Browser Extension')).toBeInTheDocument();
    expect(screen.getByText(/Install our browser extension to bookmark jobs/)).toBeInTheDocument();
  });

  it('shows extension features', () => {
    render(<BrowserExtensionStep onNext={mockOnNext} onBack={mockOnBack} onSkip={mockOnSkip} />);
    
    expect(screen.getByText('Why Install the Extension?')).toBeInTheDocument();
    expect(screen.getByText('Job Bookmarking')).toBeInTheDocument();
    expect(screen.getByText('Resume Matching')).toBeInTheDocument();
    expect(screen.getByText('Instant Analysis')).toBeInTheDocument();
  });

  it('detects browser and shows install button', () => {
    render(<BrowserExtensionStep onNext={mockOnNext} onBack={mockOnBack} onSkip={mockOnSkip} />);
    
    expect(screen.getByText(/Install CareerOS Extension for/)).toBeInTheDocument();
  });

  it('shows installation steps when install button is clicked', async () => {
    render(<BrowserExtensionStep onNext={mockOnNext} onBack={mockOnBack} onSkip={mockOnSkip} />);
    
    const installButton = screen.getByText(/Install CareerOS Extension for/);
    fireEvent.click(installButton);
    
    await waitFor(() => {
      expect(screen.getByText('Installing Extension...')).toBeInTheDocument();
      expect(screen.getByText('Please follow the installation steps in your browser.')).toBeInTheDocument();
    });
  });

  it('shows success message after installation', async () => {
    render(<BrowserExtensionStep onNext={mockOnNext} onBack={mockOnBack} onSkip={mockOnSkip} />);
    
    const installButton = screen.getByText(/Install CareerOS Extension for/);
    fireEvent.click(installButton);
    
    // Wait for the simulated installation to complete
    await waitFor(() => {
      expect(screen.getByText('Extension Installed Successfully!')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls onBack when Back button is clicked', () => {
    render(<BrowserExtensionStep onNext={mockOnNext} onBack={mockOnBack} onSkip={mockOnSkip} />);
    
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when Skip for Now button is clicked', () => {
    render(<BrowserExtensionStep onNext={mockOnNext} onBack={mockOnBack} onSkip={mockOnSkip} />);
    
    const skipButton = screen.getByText('Skip for Now');
    fireEvent.click(skipButton);
    
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when Continue button is clicked', () => {
    render(<BrowserExtensionStep onNext={mockOnNext} onBack={mockOnBack} onSkip={mockOnSkip} />);
    
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('shows extension features list', () => {
    render(<BrowserExtensionStep onNext={mockOnNext} onBack={mockOnBack} onSkip={mockOnSkip} />);
    
    expect(screen.getByText('Extension Features:')).toBeInTheDocument();
    expect(screen.getByText(/Bookmark jobs from LinkedIn, Indeed, and other job sites/)).toBeInTheDocument();
    expect(screen.getByText(/Get instant resume compatibility scores/)).toBeInTheDocument();
  });
});
