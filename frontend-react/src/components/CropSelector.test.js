import { render, screen, fireEvent } from '@testing-library/react';
import CropSelector from './CropSelector';

describe('CropSelector Component', () => {
  const mockOnCropChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default placeholder', () => {
    render(<CropSelector selectedCrop="" onCropChange={mockOnCropChange} />);
    
    expect(screen.getByText('Select Crop')).toBeInTheDocument();
    expect(screen.getByText('Select a crop...')).toBeInTheDocument();
  });

  test('displays selected crop when provided', () => {
    render(<CropSelector selectedCrop="wheat" onCropChange={mockOnCropChange} />);
    
    expect(screen.getByText(/Wheat/)).toBeInTheDocument();
    expect(screen.getByText('🌾')).toBeInTheDocument();
  });

  test('opens dropdown when button is clicked', () => {
    render(<CropSelector selectedCrop="" onCropChange={mockOnCropChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByPlaceholderText('Search crops...')).toBeInTheDocument();
  });

  test('displays all crop options when opened', () => {
    render(<CropSelector selectedCrop="" onCropChange={mockOnCropChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText(/Wheat/)).toBeInTheDocument();
    expect(screen.getByText(/Rice/)).toBeInTheDocument();
    expect(screen.getByText(/Tomato/)).toBeInTheDocument();
    expect(screen.getByText(/Potato/)).toBeInTheDocument();
  });

  test('filters crops based on search term', () => {
    render(<CropSelector selectedCrop="" onCropChange={mockOnCropChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const searchInput = screen.getByPlaceholderText('Search crops...');
    fireEvent.change(searchInput, { target: { value: 'tom' } });
    
    expect(screen.getByText(/Tomato/)).toBeInTheDocument();
    expect(screen.queryByText(/Wheat/)).not.toBeInTheDocument();
  });

  test('shows "No crops found" when search has no results', () => {
    render(<CropSelector selectedCrop="" onCropChange={mockOnCropChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const searchInput = screen.getByPlaceholderText('Search crops...');
    fireEvent.change(searchInput, { target: { value: 'xyz123' } });
    
    expect(screen.getByText('No crops found')).toBeInTheDocument();
  });

  test('calls onCropChange when crop is selected', () => {
    render(<CropSelector selectedCrop="" onCropChange={mockOnCropChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const wheatOption = screen.getByText(/Wheat/);
    fireEvent.click(wheatOption);
    
    expect(mockOnCropChange).toHaveBeenCalledWith('wheat');
  });

  test('closes dropdown after crop selection', () => {
    render(<CropSelector selectedCrop="" onCropChange={mockOnCropChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const wheatOption = screen.getByText(/Wheat/);
    fireEvent.click(wheatOption);
    
    expect(screen.queryByPlaceholderText('Search crops...')).not.toBeInTheDocument();
  });

  test('highlights selected crop in dropdown', () => {
    render(<CropSelector selectedCrop="rice" onCropChange={mockOnCropChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const riceOptions = screen.getAllByText(/Rice/);
    const riceOption = riceOptions.find(el => el.closest('li'))?.closest('li');
    expect(riceOption).toHaveClass('selected');
  });

  test('search is case-insensitive', () => {
    render(<CropSelector selectedCrop="" onCropChange={mockOnCropChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const searchInput = screen.getByPlaceholderText('Search crops...');
    fireEvent.change(searchInput, { target: { value: 'WHEAT' } });
    
    expect(screen.getByText(/Wheat/)).toBeInTheDocument();
  });

  test('clears search term after selection', () => {
    render(<CropSelector selectedCrop="" onCropChange={mockOnCropChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const searchInput = screen.getByPlaceholderText('Search crops...');
    fireEvent.change(searchInput, { target: { value: 'wheat' } });
    
    const wheatOption = screen.getByText(/Wheat/);
    fireEvent.click(wheatOption);
    
    // Reopen dropdown
    fireEvent.click(button);
    const newSearchInput = screen.getByPlaceholderText('Search crops...');
    expect(newSearchInput.value).toBe('');
  });
});
