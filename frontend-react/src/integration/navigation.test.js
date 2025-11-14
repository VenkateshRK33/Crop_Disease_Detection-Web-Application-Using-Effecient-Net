import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Navigation Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} })
    });
  });

  test('navigates from Home to Market Prices page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Verify we're on home page
    expect(screen.getAllByText(/KrishiRaksha/i).length).toBeGreaterThan(0);

    // Find and click Market Prices link
    const marketPricesLinks = screen.getAllByText(/Market Prices/i);
    fireEvent.click(marketPricesLinks[0]);

    // Verify navigation occurred
    await waitFor(() => {
      expect(window.location.pathname).toBe('/market-prices');
    });
  });

  test('navigates from Home to Disease Detection page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const diseaseLinks = screen.getAllByText(/Disease Detection/i);
    fireEvent.click(diseaseLinks[0]);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/disease-detection');
    });
  });

  test('navigates from Home to Environment page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const envLinks = screen.getAllByText(/Environment/i);
    fireEvent.click(envLinks[0]);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/environment');
    });
  });

  test('navigates from Home to Harvest Calculator page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const harvestLinks = screen.getAllByText(/Harvest Calculator/i);
    fireEvent.click(harvestLinks[0]);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/harvest-calculator');
    });
  });

  test('navigates from Home to Crop Calendar page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const calendarLinks = screen.getAllByText(/Crop Calendar/i);
    fireEvent.click(calendarLinks[0]);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/crop-calendar');
    });
  });

  test('navigation persists across page changes', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Navigate to Market Prices
    const marketLinks = screen.getAllByText(/Market Prices/i);
    fireEvent.click(marketLinks[0]);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/market-prices');
    });

    // Navigate to Environment
    const envLinks = screen.getAllByText(/Environment/i);
    fireEvent.click(envLinks[0]);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/environment');
    });

    // Navigate back to Home
    const homeLinks = screen.getAllByText(/Home/i);
    fireEvent.click(homeLinks[0]);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });

  test('mobile menu navigation works correctly', async () => {
    // Set mobile viewport
    global.innerWidth = 375;
    global.innerHeight = 667;

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Open mobile menu
    const menuToggle = screen.getByLabelText(/Toggle navigation menu/i);
    fireEvent.click(menuToggle);

    // Wait for menu to open
    await waitFor(() => {
      const mobileMenu = document.querySelector('.mobile-menu');
      expect(mobileMenu).toHaveClass('open');
    });

    // Click a link in mobile menu
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    if (mobileLinks.length > 1) {
      fireEvent.click(mobileLinks[1]); // Click second link (Market Prices)
    }

    // Verify menu closes after navigation
    await waitFor(() => {
      const mobileMenu = document.querySelector('.mobile-menu');
      expect(mobileMenu).not.toHaveClass('open');
    });
  });

  test('404 page is shown for invalid routes', async () => {
    render(
      <MemoryRouter initialEntries={['/invalid-route-xyz']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/404/i)).toBeInTheDocument();
    });
  });

  test('navigation maintains active state', async () => {
    render(
      <MemoryRouter initialEntries={['/market-prices']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const marketLink = links.find(link => 
        link.textContent.includes('Market Prices') && link.classList.contains('active')
      );
      expect(marketLink).toBeTruthy();
    });
  });
});

describe('Component Data Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('CropSelector updates parent component state', async () => {
    const mockOnChange = jest.fn();
    
    const { CropSelector } = require('../components/CropSelector');
    
    render(<CropSelector selectedCrop="" onCropChange={mockOnChange} />);

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Select a crop
    const wheatOption = screen.getByText(/Wheat/i);
    fireEvent.click(wheatOption);

    expect(mockOnChange).toHaveBeenCalledWith('wheat');
  });

  test('LocationSelector triggers API call on selection', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => [{
        lat: '28.7041',
        lon: '77.1025',
        display_name: 'Delhi, India'
      }]
    });

    const mockOnSelect = jest.fn();
    const { default: LocationSelector } = require('../components/LocationSelector');
    
    render(<LocationSelector onLocationSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText(/Enter city or location/i);
    fireEvent.change(input, { target: { value: 'Delhi' } });

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: expect.any(Number),
          lon: expect.any(Number),
          name: expect.any(String)
        })
      );
    });
  });

  test('HarvestCalculatorForm validates and submits data', async () => {
    const mockOnCalculate = jest.fn();
    const { default: HarvestCalculatorForm } = require('../components/HarvestCalculatorForm');
    
    render(<HarvestCalculatorForm onCalculate={mockOnCalculate} loading={false} />);

    // Fill form
    const cropSelect = screen.getByLabelText(/Crop Type/i);
    fireEvent.change(cropSelect, { target: { value: 'wheat' } });

    const priceInput = screen.getByLabelText(/Current Market Price/i);
    fireEvent.change(priceInput, { target: { value: '2500' } });

    const yieldInput = screen.getByLabelText(/Expected Yield/i);
    fireEvent.change(yieldInput, { target: { value: '50' } });

    // Submit
    const submitButton = screen.getByText(/Calculate Optimal Time/i);
    fireEvent.click(submitButton);

    expect(mockOnCalculate).toHaveBeenCalledWith(
      expect.objectContaining({
        cropType: 'wheat',
        currentMarketPrice: 2500,
        expectedYield: 50
      })
    );
  });
});
