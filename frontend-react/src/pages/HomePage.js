import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({
    predictions: 0,
    farmers: 0,
    accuracy: 0,
    support: 0
  });
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = statsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasAnimated]);

  const animateCounters = () => {
    const targets = {
      predictions: 10000,
      farmers: 5000,
      accuracy: 95,
      support: 24
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounters({
        predictions: Math.floor(targets.predictions * progress),
        farmers: Math.floor(targets.farmers * progress),
        accuracy: Math.floor(targets.accuracy * progress),
        support: Math.floor(targets.support * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, interval);
  };

  const services = [
    {
      icon: '🔬',
      title: 'Disease Detection',
      description: 'AI-powered diagnosis of plant diseases with instant treatment recommendations',
      path: '/disease-detection'
    },
    {
      icon: '📊',
      title: 'Market Prices',
      description: 'Compare crop prices across markets to get the best value for your harvest',
      path: '/market-prices'
    },
    {
      icon: '🌤️',
      title: 'Weather Monitor',
      description: 'Real-time environmental data and weather forecasts for better planning',
      path: '/environment'
    },
    {
      icon: '📈',
      title: 'Harvest Optimizer',
      description: 'Maximize your profits with data-driven harvest timing recommendations',
      path: '/harvest-calculator'
    }
  ];

  const benefits = [
    'Scientific AI Models trained on thousands of plant images',
    'Real-Time Data from trusted agricultural sources',
    'Expert Guidance with actionable treatment recommendations',
    'Easy to Use interface designed for farmers',
    'Free for Farmers - no hidden costs or subscriptions',
    'Available in Hindi and English for accessibility'
  ];

  return (
    <PageLayout>
      <div className="home-page">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              KrishiRaksha
              <span className="hero-title-hindi">कृषि रक्षा</span>
            </h1>
            <p className="hero-tagline">
              Empowering Farmers with Smart Agriculture
            </p>
            <p className="hero-subtitle">
              AI-Powered Disease Detection | Real-Time Market Prices | Environmental Monitoring | Harvest Optimization
            </p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/disease-detection')}
              >
                Get Started →
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        <section id="services" className="services-section">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`service-card entrance-${index + 1}`}
                onClick={() => navigate(service.path)}
              >
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <button className="service-link">
                  Explore →
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section" ref={statsRef}>
          <h2 className="section-title">Platform Impact</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{counters.predictions.toLocaleString()}+</div>
              <div className="stat-label">Predictions Made</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{counters.farmers.toLocaleString()}+</div>
              <div className="stat-label">Farmers Helped</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{counters.accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{counters.support}/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </section>

        <section className="benefits-section">
          <h2 className="section-title">Why Choose KrishiRaksha?</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <span className="benefit-checkmark">✓</span>
                <span className="benefit-text">{benefit}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default HomePage;
