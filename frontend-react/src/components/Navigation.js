import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './Navigation.css';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: '🏠' },
    { path: '/market-prices', label: t('nav.marketPrices'), icon: '📊' },
    { path: '/disease-detection', label: t('nav.diseaseDetection'), icon: '🔬' },
    { path: '/environment', label: t('nav.environment'), icon: '🌤️' },
    { path: '/harvest-calculator', label: t('nav.harvest'), icon: '🌾' },
    { path: '/crop-calendar', label: t('nav.cropCalendar'), icon: '🗓️' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Logo and Brand */}
        <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
          <div className="nav-logo">
            <span className="logo-icon">🌾</span>
          </div>
          <div className="nav-brand-text">
            <span className="brand-name">KrishiRaksha</span>
            <span className="brand-name-hindi">कृषि रक्षा</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.path} className="nav-item">
              <Link
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                <span className="nav-link-icon">{link.icon}</span>
                <span className="nav-link-text">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Language Switcher */}
        <div className="nav-language-switcher">
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <div className="mobile-brand">
              <span className="logo-icon">🌾</span>
              <div>
                <div className="brand-name">KrishiRaksha</div>
                <div className="brand-name-hindi">कृषि रक्षा</div>
              </div>
            </div>
            <button
              className="mobile-menu-close"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <ul className="mobile-nav-links">
            {navLinks.map((link) => (
              <li key={link.path} className="mobile-nav-item">
                <Link
                  to={link.path}
                  className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-link-icon">{link.icon}</span>
                  <span className="nav-link-text">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
