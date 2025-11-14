import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LocationSelector from './LocationSelector';

// Mock fetch
global.fetch = jest.fn();

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};

describe('LocationSelector Component', () => {
  const mockOnLocationSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.navigator.geolocation = mockGeolocation;
  });

  test('renders location input and buttons', () => {
    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    expect(screen.getByPlaceholderText('Enter city or location name...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Use Current Location')).toBeInTheDocument();
  });

  test('search button is disabled when input is empty', () => {
    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    const searchButton = screen.getByText('Search');
    expect(searchButton).toBeDisabled();
  });

  test('search button is enabled when input has value', () => {
    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    const input = screen.getByPlaceholderText('Enter city or location name...');
    fireEvent.change(input, { target: { value: 'Delhi' } });
    
    const searchButton = screen.getByText('Search');
    expect(searchButton).not.toBeDisabled();
  });

  test('handles manual location search successfully', async () => {
    const mockGeocodingResponse = [
      {
        lat: '28.7041',
        lon: '77.1025',
        display_name: 'Delhi, India'
      }
    ];

    global.fetch.mockResolvedValueOnce({
      json: async () => mockGeocodingResponse
    });

    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    const input = screen.getByPlaceholderText('Enter city or location name...');
    fireEvent.change(input, { target: { value: 'Delhi' } });
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockOnLocationSelect).toHaveBeenCalledWith({
        lat: 28.7041,
        lon: 77.1025,
        name: 'Delhi'
      });
    });
  });

  test('displays error when location not found', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => []
    });

    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    const input = screen.getByPlaceholderText('Enter city or location name...');
    fireEvent.change(input, { target: { value: 'InvalidCity123' } });
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Location not found. Please try a different search.')).toBeInTheDocument();
    });
  });

  test('handles geolocation success', async () => {
    const mockPosition = {
      coords: {
        latitude: 28.7041,
        longitude: 77.1025
      }
    };

    const mockReverseGeocodingResponse = {
      address: {
        city: 'Delhi'
      }
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    global.fetch.mockResolvedValueOnce({
      json: async () => mockReverseGeocodingResponse
    });

    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    const gpsButton = screen.getByText('Use Current Location');
    fireEvent.click(gpsButton);
    
    await waitFor(() => {
      expect(mockOnLocationSelect).toHaveBeenCalledWith({
        lat: 28.7041,
        lon: 77.1025,
        name: 'Delhi'
      });
    });
  });

  test('handles geolocation error', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ code: 1, message: 'User denied geolocation' });
    });

    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    const gpsButton = screen.getByText('Use Current Location');
    fireEvent.click(gpsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to retrieve your location. Please enter manually.')).toBeInTheDocument();
    });
  });

  test('displays selected location', async () => {
    const mockGeocodingResponse = [
      {
        lat: '28.7041',
        lon: '77.1025',
        display_name: 'Delhi, India'
      }
    ];

    global.fetch.mockResolvedValueOnce({
      json: async () => mockGeocodingResponse
    });

    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    const input = screen.getByPlaceholderText('Enter city or location name...');
    fireEvent.change(input, { target: { value: 'Delhi' } });
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      expect(screen.getByText(/28.7041, 77.1025/)).toBeInTheDocument();
    });
  });

  test('disables inputs during loading', async () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    const input = screen.getByPlaceholderText('Enter city or location name...');
    fireEvent.change(input, { target: { value: 'Delhi' } });
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(screen.getByText('Use Current Location')).toBeDisabled();
    });
  });

  test('handles geolocation not supported', () => {
    global.navigator.geolocation = undefined;

    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    const gpsButton = screen.getByText('Use Current Location');
    fireEvent.click(gpsButton);
    
    expect(screen.getByText('Geolocation is not supported by your browser')).toBeInTheDocument();
  });

  test('handles network error during geocoding', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<LocationSelector onLocationSelect={mockOnLocationSelect} />);
    
    const input = screen.getByPlaceholderText('Enter city or location name...');
    fireEvent.change(input, { target: { value: 'Delhi' } });
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error finding location. Please try again.')).toBeInTheDocument();
    });
  });
});
