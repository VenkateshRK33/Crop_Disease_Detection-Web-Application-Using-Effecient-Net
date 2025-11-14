# Design Document

## Overview

This design document outlines the architecture and implementation approach for transforming the existing single-page Plant Disease Detection application into **KrishiRaksha** - a comprehensive, professional multi-page farmer platform. The platform will use React Router for navigation, integrate multiple external APIs, and provide advanced decision-making tools for farmers.

### Brand Identity

**Platform Name:** KrishiRaksha (कृषि रक्षा - Agriculture Protection)

**Brand Values:**
- Professional and trustworthy
- Modern yet accessible to farmers
- Data-driven and scientific
- Supportive and empowering

**Visual Theme:**
- Primary Color: Deep Green (#2D5016) - Represents agriculture, growth, trust
- Secondary Color: Golden Yellow (#F4A300) - Represents harvest, prosperity
- Accent Color: Earth Brown (#8B4513) - Represents soil, grounding
- Background: Clean White (#FFFFFF) with subtle texture
- Text: Dark Charcoal (#2C3E50) for readability
- Success: Fresh Green (#27AE60)
- Warning: Amber (#F39C12)
- Error: Terracotta Red (#E74C3C)

**Typography:**
- Headings: 'Poppins' or 'Inter' (Professional, modern)
- Body: 'Open Sans' or 'Roboto' (Highly readable)
- Hindi Support: 'Noto Sans Devanagari' for bilingual content

**Logo:**
- User-provided logo image
- Placement: Top-left of navigation bar
- Size: Height 50-60px (desktop), 40px (mobile)
- Padding: Adequate spacing for elegance
- Always visible across all pages

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (SPA)                     │
│  ┌──────────┬──────────┬──────────┬────────────────────┐   │
│  │   Home   │  Market  │ Disease  │   Environmental    │   │
│  │   Page   │  Prices  │Detection │    Monitoring      │   │
│  └──────────┴──────────┴──────────┴────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Shared Components & Navigation               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Node.js)                      │
│  ┌──────────┬──────────┬──────────┬────────────────────┐   │
│  │   ML     │  Market  │  Weather │   Harvest          │   │
│  │  Service │  Prices  │   API    │  Calculator        │   │
│  └──────────┴──────────┴──────────┴────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services & Database                    │
│  ┌──────────┬──────────┬──────────┬────────────────────┐   │
│  │ ML Model │ Weather  │  Market  │     MongoDB        │   │
│  │  (PyTorch)│   API    │Data API  │                    │   │
│  └──────────┴──────────┴──────────┴────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19.2.0 (existing)
- React Router v6 (for multi-page navigation)
- Recharts or Chart.js (for data visualization)
- Axios (existing, for API calls)

**Backend:**
- Node.js + Express (existing)
- New routes for market prices, weather, harvest calculator
- MongoDB (existing, for data persistence)

**External APIs:**
- Weather API: OpenWeatherMap or WeatherAPI.com
- Market Prices: Government agricultural APIs or custom data source
- AQI: AirVisual API or OpenWeatherMap AQI

## Components and Interfaces

### Navigation System

**Component: `Navigation.js`**

**Professional Navigation Bar Design:**

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  KrishiRaksha    Home  Market  Disease  Environment  │
│                                                    [Profile] │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Sticky header with subtle shadow on scroll
- Logo (50-60px height) with "KrishiRaksha" text in brand font
- Clean navigation links with hover effects
- Active page indicator (underline or background highlight)
- Professional spacing and alignment
- Mobile: Hamburger menu with slide-in drawer
- Smooth transitions and animations

**Styling:**
- Background: White with 1px bottom border
- Logo: User-provided image, elegant sizing
- Nav Links: Dark text, green underline on hover/active
- Mobile Menu: Full-height drawer with fade-in animation

### Page Components

#### 1. Home Page (`HomePage.js`)

**Professional Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Hero Section                              │
│                                                              │
│         🌾 KrishiRaksha - कृषि रक्षा 🌾                    │
│                                                              │
│      "Empowering Farmers with Smart Agriculture"            │
│                                                              │
│   AI-Powered Disease Detection | Real-Time Market Prices    │
│        Environmental Monitoring | Harvest Optimization       │
│                                                              │
│              [Get Started →]  [Learn More]                   │
│                                                              │
│         (Professional background: Subtle farm imagery)       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Our Services                              │
└─────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   🔬         │   📊         │   🌤️         │   📈         │
│   Disease    │   Market     │   Weather    │   Harvest    │
│   Detection  │   Prices     │   Monitor    │   Optimizer  │
│              │              │              │              │
│ AI-powered   │ Compare crop │ Real-time    │ Maximize     │
│ diagnosis    │ prices across│ environmental│ your profits │
│              │ markets      │ data         │              │
│              │              │              │              │
│ [Explore →]  │ [View →]     │ [Check →]    │ [Calculate →]│
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Platform Impact                           │
│                                                              │
│    10,000+          5,000+          95%           24/7      │
│  Predictions      Farmers Helped   Accuracy      Support    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Why Choose KrishiRaksha?                    │
│                                                              │
│  ✓ Scientific AI Models    ✓ Real-Time Data                │
│  ✓ Expert Guidance         ✓ Easy to Use                    │
│  ✓ Free for Farmers        ✓ Available in Hindi            │
└─────────────────────────────────────────────────────────────┘
```

**Professional Features:**
- Clean, modern hero with gradient overlay
- Professional service cards with icons and hover effects
- Impact statistics with animated counters
- Trust-building elements (accuracy, support)
- Bilingual support (English + Hindi)
- Professional color scheme throughout
- Smooth scroll animations
- Call-to-action buttons with clear hierarchy

#### 2. Market Prices Page (`MarketPricesPage.js`)

**Layout:**
```
┌─────────────────────────────────────────┐
│     Crop Selection Dropdown              │
│     [Select Crop: Wheat ▼]               │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│        Price Comparison Chart            │
│     (Line/Bar chart showing prices)      │
│                                          │
│  Market A: ₹2500/quintal                │
│  Market B: ₹2650/quintal  ← Best        │
│  Market C: ₹2400/quintal                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Price Trend (Last 30 Days)       │
│        (Line chart over time)            │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Market Details Table                │
│  Market | Price | Distance | Updated     │
└─────────────────────────────────────────┘
```

**Components:**
- `CropSelector` - Dropdown for crop selection
- `PriceComparisonChart` - Visual price comparison
- `PriceTrendChart` - Historical price trends
- `MarketDetailsTable` - Detailed market information

**Data Structure:**
```javascript
{
  crop: "wheat",
  markets: [
    {
      name: "Market A",
      location: "City Name",
      price: 2500,
      unit: "quintal",
      distance: 15, // km
      lastUpdated: "2025-11-14T10:00:00Z"
    }
  ],
  priceHistory: [
    { date: "2025-11-01", avgPrice: 2450 },
    { date: "2025-11-02", avgPrice: 2480 }
  ]
}
```

#### 3. Disease Detection Page (`DiseaseDetectionPage.js`)

**Layout:** (Keep existing design, just wrap in page component)
- Existing ImageUpload component
- Existing Results component
- Existing VisualPipeline component
- Existing PredictionHistory component

**Changes:**
- Wrap existing App.js content in a page component
- Maintain all current functionality
- Integrate with new navigation

#### 4. Environmental Monitoring Page (`EnvironmentPage.js`)

**Layout:**
```
┌─────────────────────────────────────────┐
│      Location Selector                   │
│      [Enter Location or Use GPS]         │
└─────────────────────────────────────────┘
┌──────────┬──────────┬──────────┬────────┐
│ Weather  │   Temp   │ Moisture │  AQI   │
│  ☀️ Sunny│  28°C    │   65%    │  Good  │
│          │          │          │   45   │
└──────────┴──────────┴──────────┴────────┘
┌─────────────────────────────────────────┐
│        7-Day Weather Forecast            │
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun      │
│  ☀️   ⛅   🌧️   ☀️   ☀️   ⛅   ☀️      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│     Temperature & Humidity Trends        │
│        (Line chart over time)            │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│        Farming Recommendations           │
│  "Good conditions for irrigation today"  │
└─────────────────────────────────────────┘
```

**Components:**
- `LocationSelector` - GPS or manual location input
- `WeatherCard` - Current weather display
- `EnvironmentalMetrics` - Temp, moisture, AQI gauges
- `WeatherForecast` - 7-day forecast
- `TrendCharts` - Historical environmental data
- `FarmingRecommendations` - AI-generated advice based on conditions

**Data Structure:**
```javascript
{
  location: { lat: 28.7041, lon: 77.1025, name: "Delhi" },
  current: {
    weather: "Clear",
    temperature: 28,
    humidity: 65,
    aqi: 45,
    soilMoisture: 60 // if available
  },
  forecast: [
    { date: "2025-11-15", temp: 29, weather: "Sunny", humidity: 60 }
  ],
  trends: {
    temperature: [{ date: "2025-11-01", value: 25 }],
    humidity: [{ date: "2025-11-01", value: 70 }]
  }
}
```

### Advanced Features

#### Optimal Harvest Time Calculator

**Component: `HarvestCalculator.js`**

**Layout:**
```
┌─────────────────────────────────────────┐
│     Optimal Harvest Time Calculator      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Input Form:                             │
│  - Crop Type: [Dropdown]                 │
│  - Current Maturity: [Slider 0-100%]     │
│  - Pest Infestation: [Slider 0-100%]     │
│  - Current Market Price: [Input ₹/unit]  │
│  - Expected Growth Rate: [Auto/Manual]   │
│  - Pest Damage Rate: [Auto/Manual]       │
│                                          │
│  [Calculate Optimal Time]                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Recommendation                   │
│  🎯 Optimal Harvest Date: Nov 25, 2025  │
│  📊 Expected Profit: ₹45,000             │
│  ⚠️  Confidence: 85%                     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Scenario Comparison Chart           │
│                                          │
│  Profit                                  │
│    │     ╱╲                              │
│    │    ╱  ╲                             │
│    │   ╱    ╲___                         │
│    │__╱_________╲___                     │
│      Now  +7d  +14d  +21d                │
│                                          │
│  ● Sell Now: ₹35,000                    │
│  ● Wait 7 days: ₹42,000                 │
│  ● Wait 14 days: ₹45,000 ← Optimal      │
│  ● Wait 21 days: ₹38,000 (pest damage)  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Detailed Analysis                │
│  • Current crop value: ₹35,000           │
│  • Potential growth: +₹15,000            │
│  • Pest damage risk: -₹5,000             │
│  • Market trend: Stable                  │
│                                          │
│  Recommendation: Wait 14 days for        │
│  optimal maturity before pest damage     │
│  significantly impacts yield.            │
└─────────────────────────────────────────┘
```

**Algorithm Logic:**

```javascript
function calculateOptimalHarvestTime(inputs) {
  const {
    cropType,
    currentMaturity,      // 0-100%
    pestInfestation,      // 0-100%
    currentMarketPrice,   // ₹/unit
    expectedYield,        // kg/acre
    growthRate,          // % per day
    pestDamageRate       // % per day
  } = inputs;

  // Calculate for next 30 days
  const scenarios = [];
  for (let days = 0; days <= 30; days++) {
    // Calculate maturity
    const maturity = Math.min(100, currentMaturity + (growthRate * days));
    
    // Calculate pest damage
    const pestDamage = Math.min(100, pestInfestation + (pestDamageRate * days));
    
    // Calculate effective yield
    const maturityFactor = maturity / 100;
    const damageFactor = (100 - pestDamage) / 100;
    const effectiveYield = expectedYield * maturityFactor * damageFactor;
    
    // Calculate profit
    const revenue = effectiveYield * currentMarketPrice;
    const costs = calculateCosts(days); // Storage, labor, etc.
    const profit = revenue - costs;
    
    scenarios.push({
      days,
      date: addDays(new Date(), days),
      maturity,
      pestDamage,
      effectiveYield,
      profit,
      confidence: calculateConfidence(maturity, pestDamage)
    });
  }
  
  // Find optimal scenario
  const optimal = scenarios.reduce((best, current) => 
    current.profit > best.profit ? current : best
  );
  
  return {
    optimal,
    scenarios,
    recommendation: generateRecommendation(optimal, scenarios)
  };
}
```

**Confidence Score Calculation:**
- High confidence (>80%): Maturity 70-90%, Pest damage <30%
- Medium confidence (50-80%): Maturity 50-70% or Pest damage 30-50%
- Low confidence (<50%): Maturity <50% or Pest damage >50%

#### Crop Planning Calendar

**Component: `CropCalendar.js`**

**Layout:**
```
┌─────────────────────────────────────────┐
│        November 2025                     │
│  Sun Mon Tue Wed Thu Fri Sat            │
│                  1   2   3   4          │
│   5   6   7   8   9  10  11             │
│  12  13  14  15  16  17  18             │
│  19  20  21  22  23  24  25             │
│  26  27  28  29  30                     │
│                                          │
│  🌱 Planting  💧 Irrigation  🌾 Harvest │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Upcoming Activities                 │
│  • Nov 16: Irrigate wheat field          │
│  • Nov 20: Apply fertilizer              │
│  • Nov 25: Harvest tomatoes              │
└─────────────────────────────────────────┘
```

### Shared Components

#### Footer Component (`Footer.js`)

**Professional Footer Design:**

```
┌─────────────────────────────────────────────────────────────┐
│                         KrishiRaksha                         │
│                    Empowering Indian Farmers                 │
│                                                              │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│  │   Services   │   Resources  │   Support    │  Connect │ │
│  │              │              │              │          │ │
│  │ Disease      │ User Guide   │ Help Center  │ Facebook │ │
│  │ Detection    │ FAQs         │ Contact Us   │ Twitter  │ │
│  │ Market       │ Blog         │ Feedback     │ YouTube  │ │
│  │ Prices       │ API Docs     │ Report Bug   │ WhatsApp │ │
│  └──────────────┴──────────────┴──────────────┴──────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📞 Helpline: 1800-XXX-XXXX (Toll Free)                │ │
│  │  ✉️  Email: support@krishiraksha.in                    │ │
│  │  📍 Address: [Your Organization Address]               │ │
│  │  🕐 Support Hours: 24/7 Available                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  © 2025 KrishiRaksha. All Rights Reserved.                  │
│  Privacy Policy | Terms of Service | Accessibility          │
│                                                              │
│  Made with ❤️ for Indian Farmers                            │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**
- Background: Deep Green (#2D5016) with subtle texture
- Text: White/Light colors for contrast
- Links: Hover effect with golden yellow
- Professional spacing and organization
- Mobile: Stacked columns for better readability

## Data Models

### Market Price Data Model

```javascript
const MarketPriceSchema = new mongoose.Schema({
  crop: { type: String, required: true },
  market: { type: String, required: true },
  location: {
    city: String,
    state: String,
    coordinates: { lat: Number, lon: Number }
  },
  price: { type: Number, required: true },
  unit: { type: String, default: 'quintal' },
  currency: { type: String, default: 'INR' },
  timestamp: { type: Date, default: Date.now },
  source: String
});
```

### Environmental Data Model

```javascript
const EnvironmentalDataSchema = new mongoose.Schema({
  location: {
    name: String,
    coordinates: { lat: Number, lon: Number }
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number,
    windSpeed: Number
  },
  aqi: Number,
  soilMoisture: Number,
  timestamp: { type: Date, default: Date.now }
});
```

### Harvest Calculation Model

```javascript
const HarvestCalculationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cropType: String,
  inputs: {
    currentMaturity: Number,
    pestInfestation: Number,
    currentMarketPrice: Number,
    expectedYield: Number
  },
  result: {
    optimalDate: Date,
    expectedProfit: Number,
    confidence: Number
  },
  timestamp: { type: Date, default: Date.now }
});
```

### Crop Calendar Event Model

```javascript
const CropEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cropType: String,
  eventType: { 
    type: String, 
    enum: ['planting', 'irrigation', 'fertilizer', 'pesticide', 'harvest'] 
  },
  date: Date,
  notes: String,
  completed: { type: Boolean, default: false },
  reminder: { type: Boolean, default: true }
});
```

## API Endpoints

### Market Prices

```
GET  /api/market-prices/:crop
GET  /api/market-prices/:crop/history?days=30
GET  /api/market-prices/crops (list all available crops)
POST /api/market-prices/compare (compare multiple markets)
```

### Environmental Data

```
GET  /api/environment/current?lat=X&lon=Y
GET  /api/environment/forecast?lat=X&lon=Y&days=7
GET  /api/environment/history?lat=X&lon=Y&days=30
```

### Harvest Calculator

```
POST /api/harvest/calculate
GET  /api/harvest/history/:userId
```

### Crop Calendar

```
GET    /api/calendar/events/:userId
POST   /api/calendar/events
PUT    /api/calendar/events/:eventId
DELETE /api/calendar/events/:eventId
```

## External API Integration

### Weather API (OpenWeatherMap)

**Endpoints to use:**
- Current weather: `api.openweathermap.org/data/2.5/weather`
- 7-day forecast: `api.openweathermap.org/data/2.5/forecast`
- Air pollution: `api.openweathermap.org/data/2.5/air_pollution`

**API Key:** Store in `.env` as `WEATHER_API_KEY`

### Market Price Data

**Options:**
1. **Government APIs:** 
   - India: AGMARKNET API (if available)
   - Manual data entry with admin panel
2. **Mock Data:** For development, use realistic mock data
3. **Web Scraping:** Scrape government agricultural websites (with proper permissions)

**Implementation:** Start with mock data, plan for real API integration

## Error Handling

### Frontend Error Boundaries

```javascript
<ErrorBoundary>
  <Router>
    <Routes>
      {/* All routes */}
    </Routes>
  </Router>
</ErrorBoundary>
```

### API Error Handling

```javascript
// Standardized error response
{
  success: false,
  error: {
    code: "WEATHER_API_UNAVAILABLE",
    message: "Unable to fetch weather data",
    userMessage: "Weather information is temporarily unavailable. Please try again later.",
    timestamp: "2025-11-14T10:00:00Z"
  }
}
```

## Testing Strategy

### Unit Tests
- Test individual components (Navigation, Charts, Forms)
- Test calculation algorithms (Harvest calculator logic)
- Test utility functions (date formatting, price calculations)

### Integration Tests
- Test API endpoints
- Test data flow between components
- Test external API integration with mocks

### E2E Tests
- Test complete user journeys (Home → Market Prices → View Data)
- Test form submissions (Harvest calculator)
- Test navigation flow

## Performance Optimization

### Code Splitting
```javascript
const MarketPricesPage = lazy(() => import('./pages/MarketPricesPage'));
const EnvironmentPage = lazy(() => import('./pages/EnvironmentPage'));
```

### Data Caching
- Cache weather data for 30 minutes
- Cache market prices for 1 hour
- Use React Query or SWR for data fetching

### Image Optimization
- Lazy load images
- Use WebP format where supported
- Compress images for web

## Deployment Considerations

### Environment Variables
```
# Backend
PORT=4000
MONGODB_URI=mongodb://localhost:27017/farmer-platform
WEATHER_API_KEY=your_key_here
MARKET_API_KEY=your_key_here
ML_API_URL=http://localhost:5000

# Frontend
REACT_APP_API_URL=http://localhost:4000
```

### Build Process
```bash
# Frontend build
cd frontend-react
npm run build

# Backend deployment
# Use PM2 or similar for process management
pm2 start backend/server.js
```

## Professional UI/UX Guidelines

### Design Principles

**1. Professional Aesthetics**
- Clean, modern interface with ample white space
- Consistent spacing (8px grid system)
- Subtle shadows and depth (elevation)
- Smooth transitions and micro-interactions
- Professional photography and illustrations

**2. Color Usage**
- Primary actions: Deep Green (#2D5016)
- Secondary actions: Golden Yellow (#F4A300)
- Backgrounds: White with subtle textures
- Cards: White with soft shadows
- Hover states: Slightly darker shades
- Disabled states: Gray with reduced opacity

**3. Typography Scale**
```
H1: 48px (Hero headings)
H2: 36px (Page titles)
H3: 28px (Section headings)
H4: 24px (Card titles)
H5: 20px (Subheadings)
Body: 16px (Regular text)
Small: 14px (Captions, labels)
```

**4. Component Styling**

**Buttons:**
- Primary: Green background, white text, rounded corners (8px)
- Secondary: White background, green border, green text
- Hover: Slight scale (1.02) + shadow increase
- Padding: 12px 24px
- Font weight: 600

**Cards:**
- Background: White
- Border: None or 1px light gray
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Hover: Shadow increase + slight lift
- Border radius: 12px
- Padding: 24px

**Forms:**
- Input fields: Border 1px gray, focus: green border
- Labels: Above inputs, 14px, medium weight
- Validation: Green checkmark or red error message
- Placeholder: Light gray text

**Charts:**
- Colors: Green shades for positive, amber for neutral, red for negative
- Grid lines: Light gray, subtle
- Tooltips: White background, shadow, clear typography
- Legends: Clear, positioned appropriately

**5. Responsive Breakpoints**
```
Mobile: 320px - 767px
Tablet: 768px - 1023px
Desktop: 1024px - 1439px
Large Desktop: 1440px+
```

**6. Animations**
- Page transitions: 300ms ease-in-out
- Hover effects: 200ms ease
- Loading spinners: Smooth rotation
- Skeleton loaders: Subtle shimmer effect
- Avoid excessive animations (professional, not flashy)

**7. Accessibility**
- Color contrast ratio: Minimum 4.5:1 (WCAG AA)
- Focus indicators: Clear outline on keyboard navigation
- Alt text for all images
- ARIA labels for interactive elements
- Keyboard navigation support

**8. Professional Touches**
- Subtle background patterns (agricultural motifs)
- Professional icons (Feather Icons or Heroicons)
- High-quality images (farmers, crops, fields)
- Consistent spacing and alignment
- Loading states for all async operations
- Empty states with helpful messages
- Success/error notifications (toast messages)

## Security Considerations

- Validate all user inputs
- Sanitize data before database storage
- Rate limit API endpoints
- Secure API keys (never expose in frontend)
- Implement CORS properly
- Use HTTPS in production

## Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG AA)
- Responsive text sizing

## Future Enhancements

- Mobile app (React Native)
- Push notifications for calendar events
- Community forum for farmers
- Multi-language support
- Voice input for illiterate farmers
- Offline mode with service workers
- Integration with government schemes
- Crop insurance calculator
- Loan eligibility checker

