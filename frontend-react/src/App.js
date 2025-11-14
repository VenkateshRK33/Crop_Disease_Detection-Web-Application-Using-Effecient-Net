import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './i18n/config'; // Initialize i18n
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import Spinner from './components/Spinner';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const MarketPricesPage = lazy(() => import('./pages/MarketPricesPage'));
const DiseaseDetectionPage = lazy(() => import('./pages/DiseaseDetectionPage'));
const EnvironmentPage = lazy(() => import('./pages/EnvironmentPage'));
const HarvestCalculatorPage = lazy(() => import('./pages/HarvestCalculatorPage'));
const CropCalendarPage = lazy(() => import('./pages/CropCalendarPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * Main App Component
 * Sets up routing for the KrishiRaksha multi-page platform
 * Implements code splitting for better performance
 */
function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Suspense fallback={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh' 
          }}>
            <Spinner size="large" text="Loading..." />
          </div>
        }>
          <Routes>
            <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
            <Route path="/market-prices" element={<ErrorBoundary><MarketPricesPage /></ErrorBoundary>} />
            <Route path="/disease-detection" element={<ErrorBoundary><DiseaseDetectionPage /></ErrorBoundary>} />
            <Route path="/environment" element={<ErrorBoundary><EnvironmentPage /></ErrorBoundary>} />
            <Route path="/harvest-calculator" element={<ErrorBoundary><HarvestCalculatorPage /></ErrorBoundary>} />
            <Route path="/crop-calendar" element={<ErrorBoundary><CropCalendarPage /></ErrorBoundary>} />
            <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
