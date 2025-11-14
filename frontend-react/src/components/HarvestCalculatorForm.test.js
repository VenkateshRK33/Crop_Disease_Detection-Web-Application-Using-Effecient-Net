import { render, screen, fireEvent } from '@testing-library/react';
import HarvestCalculatorForm from './HarvestCalculatorForm';

describe('HarvestCalculatorForm Component', () => {
  const mockOnCalculate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all form fields', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    expect(screen.getByLabelText(/Crop Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Maturity/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pest Infestation/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Market Price/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected Yield/)).toBeInTheDocument();
  });

  test('displays required field indicators', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    const requiredMarkers = screen.getAllByText('*');
    expect(requiredMarkers.length).toBeGreaterThan(0);
  });

  test('validates crop type is required', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    const submitButton = screen.getByText('Calculate Optimal Time');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please select a crop type')).toBeInTheDocument();
    expect(mockOnCalculate).not.toHaveBeenCalled();
  });

  test('validates market price is required', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    const cropSelect = screen.getByLabelText(/Crop Type/);
    fireEvent.change(cropSelect, { target: { value: 'wheat' } });
    
    const submitButton = screen.getByText('Calculate Optimal Time');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please enter a valid market price')).toBeInTheDocument();
    expect(mockOnCalculate).not.toHaveBeenCalled();
  });

  test('validates expected yield is required', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    const cropSelect = screen.getByLabelText(/Crop Type/);
    fireEvent.change(cropSelect, { target: { value: 'wheat' } });
    
    const priceInput = screen.getByLabelText(/Current Market Price/);
    fireEvent.change(priceInput, { target: { value: '2500' } });
    
    const submitButton = screen.getByText('Calculate Optimal Time');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please enter a valid expected yield')).toBeInTheDocument();
    expect(mockOnCalculate).not.toHaveBeenCalled();
  });

  test('validates market price must be positive', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    const cropSelect = screen.getByLabelText(/Crop Type/);
    fireEvent.change(cropSelect, { target: { value: 'wheat' } });
    
    const priceInput = screen.getByLabelText(/Current Market Price/);
    fireEvent.change(priceInput, { target: { value: '-100' } });
    
    const yieldInput = screen.getByLabelText(/Expected Yield/);
    fireEvent.change(yieldInput, { target: { value: '50' } });
    
    const submitButton = screen.getByText('Calculate Optimal Time');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please enter a valid market price')).toBeInTheDocument();
  });

  test('updates maturity slider value', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    const maturitySlider = screen.getByLabelText(/Current Maturity/);
    fireEvent.change(maturitySlider, { target: { value: '75' } });
    
    expect(screen.getByText('Current Maturity: 75%')).toBeInTheDocument();
  });

  test('updates pest infestation slider value', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    const pestSlider = screen.getByLabelText(/Pest Infestation/);
    fireEvent.change(pestSlider, { target: { value: '30' } });
    
    expect(screen.getByText('Pest Infestation: 30%')).toBeInTheDocument();
  });

  test('submits form with valid data', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    const cropSelect = screen.getByLabelText(/Crop Type/);
    fireEvent.change(cropSelect, { target: { value: 'wheat' } });
    
    const maturitySlider = screen.getByLabelText(/Current Maturity/);
    fireEvent.change(maturitySlider, { target: { value: '70' } });
    
    const pestSlider = screen.getByLabelText(/Pest Infestation/);
    fireEvent.change(pestSlider, { target: { value: '20' } });
    
    const priceInput = screen.getByLabelText(/Current Market Price/);
    fireEvent.change(priceInput, { target: { value: '2500' } });
    
    const yieldInput = screen.getByLabelText(/Expected Yield/);
    fireEvent.change(yieldInput, { target: { value: '50' } });
    
    const submitButton = screen.getByText('Calculate Optimal Time');
    fireEvent.click(submitButton);
    
    expect(mockOnCalculate).toHaveBeenCalledWith({
      cropType: 'wheat',
      currentMaturity: 70,
      pestInfestation: 20,
      currentMarketPrice: 2500,
      expectedYield: 50
    });
  });

  test('clears error when field is corrected', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    // Trigger validation error
    const submitButton = screen.getByText('Calculate Optimal Time');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please select a crop type')).toBeInTheDocument();
    
    // Fix the error
    const cropSelect = screen.getByLabelText(/Crop Type/);
    fireEvent.change(cropSelect, { target: { value: 'wheat' } });
    
    expect(screen.queryByText('Please select a crop type')).not.toBeInTheDocument();
  });

  test('disables submit button when loading', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={true} />);
    
    const submitButton = screen.getByText('Calculating...');
    expect(submitButton).toBeDisabled();
  });

  test('shows loading state with spinner', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={true} />);
    
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
    const spinner = document.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  test('displays all crop options', () => {
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);
    
    const cropSelect = screen.getByLabelText(/Crop Type/);
    const options = cropSelect.querySelectorAll('option');
    
    expect(options.length).toBeGreaterThan(10); // Should have multiple crop options
    expect(Array.from(options).some(opt => opt.textContent === 'Wheat')).toBe(true);
    expect(Array.from(options).some(opt => opt.textContent === 'Rice')).toBe(true);
  });
});
