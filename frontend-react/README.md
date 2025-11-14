# KrishiRaksha - React Frontend

Professional multi-page React frontend for the KrishiRaksha smart agriculture platform.

## Overview

KrishiRaksha is a comprehensive farmer platform featuring:
- Disease Detection with AI chatbot
- Market Price Comparison
- Environmental Monitoring
- Harvest Optimization Calculator
- Crop Planning Calendar

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm test`

Launches the test runner in interactive watch mode.

## Project Structure

```
frontend-react/
├── public/                  # Static files
│   ├── logo.png            # KrishiRaksha logo
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navigation.js, Footer.js, PageLayout.js
│   │   ├── Toast.js, SkeletonLoader.js, EmptyState.js
│   │   └── Feature-specific components
│   ├── pages/              # Page components
│   │   ├── HomePage.js, MarketPricesPage.js
│   │   ├── DiseaseDetectionPage.js, EnvironmentPage.js
│   │   ├── HarvestCalculatorPage.js, CropCalendarPage.js
│   │   └── NotFoundPage.js
│   ├── contexts/           # React contexts
│   ├── App.js              # Main app with routing
│   ├── index.js            # Entry point
│   ├── index.css           # Global styles
│   └── animations.css      # Animation utilities
└── package.json
```

## Backend Proxy

The app is configured to proxy API requests to `http://localhost:4000` where the Node.js backend runs.

## Key Features

- **Multi-Page Navigation**: React Router v6 with responsive design
- **Professional Design**: KrishiRaksha branding with deep green theme
- **Disease Detection**: AI-powered diagnosis with chatbot
- **Market Intelligence**: Price comparison and trend analysis
- **Environmental Monitoring**: Weather, AQI, and farming recommendations
- **Harvest Optimization**: Calculate optimal harvest timing
- **Crop Calendar**: Plan and track farming activities
- **Accessibility**: WCAG AA compliant

## Dependencies

- **React** 19.2.0 - UI library
- **React Router DOM** 6.x - Multi-page routing
- **Recharts** 2.x - Data visualization
- **Axios** 1.13.2 - HTTP client
- **React Scripts** 5.0.1 - Build tools

## Documentation

- [Main README](../README.md) - Project overview
- [User Guide](../docs/USER-GUIDE.md) - How to use the platform
- [API Reference](../docs/API-REFERENCE.md) - API documentation

---

**🌾 KrishiRaksha - Empowering Farmers with Smart Agriculture**
