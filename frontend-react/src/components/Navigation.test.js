import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';

// Helper to render with router
const renderWithRouter = (component, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {component}
    </MemoryRouter>
  );
};

describe('Navigation Component', () => {
  test('renders brand name and logo', () => {
    renderWithRouter(<Navigation />);
    
    expect(screen.getAllByText('KrishiRaksha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('कृषि रक्षा').length).toBeGreaterThan(0);
    expect(screen.getAllByText('🌾').length).toBeGreaterThan(0);
  });

  test('renders all navigation links', () => {
    renderWithRouter(<Navigation />);
    
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Market Prices').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Disease Detection').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Environment').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Harvest Calculator').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Crop Calendar').length).toBeGreaterThan(0);
  });

  test('highlights active page', () => {
    renderWithRouter(<Navigation />, { route: '/market-prices' });
    
    const links = screen.getAllByRole('link');
    const marketPricesLink = links.find(link => link.textContent.includes('Market Prices'));
    
    expect(marketPricesLink).toHaveClass('active');
  });

  test('mobile menu toggle button is present', () => {
    renderWithRouter(<Navigation />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    expect(toggleButton).toBeInTheDocument();
  });

  test('opens mobile menu when toggle is clicked', () => {
    renderWithRouter(<Navigation />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    const mobileMenu = document.querySelector('.mobile-menu');
    expect(mobileMenu).toHaveClass('open');
  });

  test('closes mobile menu when close button is clicked', () => {
    renderWithRouter(<Navigation />);
    
    // Open menu
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    // Close menu
    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);
    
    const mobileMenu = document.querySelector('.mobile-menu');
    expect(mobileMenu).not.toHaveClass('open');
  });

  test('closes mobile menu when a link is clicked', () => {
    renderWithRouter(<Navigation />);
    
    // Open menu
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    // Click a mobile nav link
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    fireEvent.click(mobileLinks[0]);
    
    const mobileMenu = document.querySelector('.mobile-menu');
    expect(mobileMenu).not.toHaveClass('open');
  });

  test('closes mobile menu when overlay is clicked', () => {
    renderWithRouter(<Navigation />);
    
    // Open menu
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    // Click overlay
    const overlay = document.querySelector('.mobile-menu-overlay');
    fireEvent.click(overlay);
    
    const mobileMenu = document.querySelector('.mobile-menu');
    expect(mobileMenu).not.toHaveClass('open');
  });

  test('displays icons for each navigation link', () => {
    renderWithRouter(<Navigation />);
    
    const container = document.body;
    expect(container.textContent).toContain('🏠');
    expect(container.textContent).toContain('📊');
    expect(container.textContent).toContain('🔬');
    expect(container.textContent).toContain('🌤️');
  });
});
