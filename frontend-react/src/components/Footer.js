import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3 className="footer-title">KrishiRaksha</h3>
          <p className="footer-tagline">Empowering Indian Farmers</p>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h4>Services</h4>
            <ul>
              <li><a href="/disease-detection">Disease Detection</a></li>
              <li><a href="/market-prices">Market Prices</a></li>
              <li><a href="/environment">Weather Monitor</a></li>
              <li><a href="/harvest">Harvest Optimizer</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Resources</h4>
            <ul>
              <li><a href="#user-guide">User Guide</a></li>
              <li><a href="#faqs">FAQs</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#api-docs">API Docs</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#feedback">Feedback</a></li>
              <li><a href="#report">Report Bug</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Connect</h4>
            <ul>
              <li><a href="#facebook" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="#twitter" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              <li><a href="#youtube" target="_blank" rel="noopener noreferrer">YouTube</a></li>
              <li><a href="#whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-contact">
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <span>Helpline: 1800-XXX-XXXX (Toll Free)</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <span>Email: support@krishiraksha.in</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <span>Address: Agricultural Innovation Center, New Delhi, India</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">🕐</span>
            <span>Support Hours: 24/7 Available</span>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2025 KrishiRaksha. All Rights Reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <span className="separator">|</span>
            <a href="#terms">Terms of Service</a>
            <span className="separator">|</span>
            <a href="#accessibility">Accessibility</a>
          </div>
          <p className="footer-tagline-bottom">Made with ❤️ for Indian Farmers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
