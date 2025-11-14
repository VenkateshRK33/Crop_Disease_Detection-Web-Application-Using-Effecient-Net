import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import './PageLayout.css';

const PageLayout = ({ children }) => {
  return (
    <div className="page-layout">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content" className="page-content">
        <div className="page-container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
