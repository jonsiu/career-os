import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { JobInterestsStep } from '../job-interests-step';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('JobInterestsStep', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders job interests form correctly', () => {
    render(<JobInterestsStep onNext={mockOnNext} onBack={mockOnBack} />);
    
    expect(screen.getByText('Tell Us About Your Goals')).toBeInTheDocument();
    expect(screen.getByText('Target Roles')).toBeInTheDocument();
    expect(screen.getByText('Industries')).toBeInTheDocument();
    expect(screen.getByText('Experience Level')).toBeInTheDocument();
  });

  it('shows popular roles and industries', () => {
    render(<JobInterestsStep onNext={mockOnNext} onBack={mockOnBack} />);
    
    expect(screen.getByText('Engineering Manager')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
  });

  it('allows adding custom roles', async () => {
    render(<JobInterestsStep onNext={mockOnNext} onBack={mockOnBack} />);
    
    const customRoleInput = screen.getByPlaceholderText('Add custom role...');
    const addButton = screen.getByRole('button', { name: /plus/i });
    
    fireEvent.change(customRoleInput, { target: { value: 'Custom Role' } });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Custom Role')).toBeInTheDocument();
    });
  });

  it('allows adding custom industries', async () => {
    render(<JobInterestsStep onNext={mockOnNext} onBack={mockOnBack} />);
    
    const customIndustryInput = screen.getByPlaceholderText('Add custom industry...');
    const addButtons = screen.getAllByRole('button', { name: /plus/i });
    const addIndustryButton = addButtons[1]; // Second plus button is for industries
    
    fireEvent.change(customIndustryInput, { target: { value: 'Custom Industry' } });
    fireEvent.click(addIndustryButton);
    
    await waitFor(() => {
      expect(screen.getByText('Custom Industry')).toBeInTheDocument();
    });
  });

  it('requires experience level selection', () => {
    render(<JobInterestsStep onNext={mockOnNext} onBack={mockOnBack} />);
    
    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when form is valid', async () => {
    render(<JobInterestsStep onNext={mockOnNext} onBack={mockOnBack} />);
    
    // Add a role
    const customRoleInput = screen.getByPlaceholderText('Add custom role...');
    const addButton = screen.getByRole('button', { name: /plus/i });
    fireEvent.change(customRoleInput, { target: { value: 'Test Role' } });
    fireEvent.click(addButton);
    
    // Add an industry
    const customIndustryInput = screen.getByPlaceholderText('Add custom industry...');
    const addIndustryButtons = screen.getAllByRole('button', { name: /plus/i });
    const addIndustryButton = addIndustryButtons[1];
    fireEvent.change(customIndustryInput, { target: { value: 'Test Industry' } });
    fireEvent.click(addIndustryButton);
    
    // Select experience level
    const experienceRadio = screen.getByLabelText('Mid Level (3-5 years)');
    fireEvent.click(experienceRadio);
    
    await waitFor(() => {
      const continueButton = screen.getByText('Continue');
      expect(continueButton).not.toBeDisabled();
    });
  });

  it('calls onBack when Back button is clicked', () => {
    render(<JobInterestsStep onNext={mockOnNext} onBack={mockOnBack} />);
    
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('calls onNext with correct data when form is submitted', async () => {
    render(<JobInterestsStep onNext={mockOnNext} onBack={mockOnBack} />);
    
    // Fill out the form
    const customRoleInput = screen.getByPlaceholderText('Add custom role...');
    const addButton = screen.getByRole('button', { name: /plus/i });
    fireEvent.change(customRoleInput, { target: { value: 'Test Role' } });
    fireEvent.click(addButton);
    
    const customIndustryInput = screen.getByPlaceholderText('Add custom industry...');
    const addIndustryButtons = screen.getAllByRole('button', { name: /plus/i });
    const addIndustryButton = addIndustryButtons[1];
    fireEvent.change(customIndustryInput, { target: { value: 'Test Industry' } });
    fireEvent.click(addIndustryButton);
    
    const experienceRadio = screen.getByLabelText('Mid Level (3-5 years)');
    fireEvent.click(experienceRadio);
    
    // Submit form
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        targetRoles: ['Test Role'],
        industries: ['Test Industry'],
        locations: [],
        experienceLevel: 'mid'
      });
    });
  });
});
