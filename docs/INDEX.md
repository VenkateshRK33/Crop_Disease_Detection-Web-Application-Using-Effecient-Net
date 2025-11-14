# 📚 Documentation Index

## Quick Navigation

### 🎯 Start Here
- **[Project Overview](PROJECT-OVERVIEW.md)** - Complete project summary
- **[Quick Start Guide](../QUICKSTART_CHATBOT.md)** - Get started in 5 minutes

### 🔍 By Component

#### ML Model Division
- **[ML Model Documentation](ML-MODEL/README.md)**
  - What was done
  - Issues fixed
  - Configuration
  - API endpoints
  - Troubleshooting
  - Version history

#### Chatbot Division
- **[Chatbot Documentation](CHATBOT/README.md)**
  - What was done
  - Issues fixed
  - Architecture
  - API endpoints
  - Conversation flow
  - Troubleshooting
  - Version history

### 📖 Setup Guides
- **[Ollama Setup](../OLLAMA_SETUP.md)** - Install Ollama and LLM
- **[Chatbot Quick Start](../QUICKSTART_CHATBOT.md)** - Complete setup guide
- **[Integration Success](../INTEGRATION_SUCCESS.md)** - Verify everything works

### 🧪 Testing
- **ML Model Tests**
  - `test_api.py` - API endpoint testing
  - `test_imports.py` - Dependency verification
  
- **Chatbot Tests**
  - `test-chatbot-integration.js` - Full integration
  - `test-interactive-chat.js` - Conversation testing
  - `test-ollama-direct.js` - Direct Ollama testing

### 🐛 Troubleshooting

#### ML Model Issues
**Location**: [ML Model README](ML-MODEL/README.md#troubleshooting)
- Model not loading
- Predictions failing
- Low confidence
- API errors

#### Chatbot Issues
**Location**: [Chatbot README](CHATBOT/README.md#troubleshooting-guide)
- Ollama disconnected
- Fallback mode
- Follow-up questions not working
- Slow responses

#### Integration Issues
**Location**: [Project Overview](PROJECT-OVERVIEW.md#troubleshooting-quick-reference)
- Services not starting
- Connection errors
- CORS issues

### 📊 Reference

#### Supported Diseases
**Location**: [Project Overview](PROJECT-OVERVIEW.md#supported-diseases-16-classes)
- 9 Tomato diseases
- 3 Potato diseases
- 2 Pepper diseases
- 1 General category

#### API Endpoints
**ML API**: [ML Model README](ML-MODEL/README.md#api-endpoints)
- GET /health
- GET /classes
- POST /predict
- POST /predict/batch

**Chatbot API**: [Chatbot README](CHATBOT/README.md#api-endpoints)
- POST /api/analyze-plant
- GET /api/chat/stream/:id
- GET /api/health

#### Configuration
**ML Model**: [ML Model README](ML-MODEL/README.md#current-configuration)
**Chatbot**: [Chatbot README](CHATBOT/README.md#configuration)

### 🎬 Demo Resources
- **[Demo Script](PROJECT-OVERVIEW.md#demo-script-3-minutes)** - 3-minute presentation
- **[Competitive Advantages](PROJECT-OVERVIEW.md#competitive-advantages)** - Key selling points
- **[Performance Metrics](PROJECT-OVERVIEW.md#performance-metrics)** - System stats

### 📝 Version History
- **ML Model**: [ML Model README](ML-MODEL/README.md#version-history)
- **Chatbot**: [Chatbot README](CHATBOT/README.md#version-history)
- **Project**: [Project Overview](PROJECT-OVERVIEW.md#version-history)

## 🗂️ Documentation Structure

```
docs/
├── INDEX.md                    # This file - Navigation hub
├── PROJECT-OVERVIEW.md         # Complete project summary
│
├── ML-MODEL/                   # ML Model Division
│   └── README.md              # Everything about ML model
│       ├── What was done
│       ├── Issues fixed
│       ├── Configuration
│       ├── API endpoints
│       ├── Troubleshooting
│       └── Version history
│
└── CHATBOT/                    # Chatbot Division
    └── README.md              # Everything about chatbot
        ├── What was done
        ├── Issues fixed
        ├── Architecture
        ├── API endpoints
        ├── Conversation flow
        ├── Troubleshooting
        └── Version history
```

## 🎯 How to Use This Documentation

### For Development
1. Check **[Project Overview](PROJECT-OVERVIEW.md)** for system architecture
2. Go to specific division for detailed info
3. Check version history for what changed

### For Debugging
1. Identify which component has the issue
2. Go to that division's README
3. Check troubleshooting section
4. Review what was done previously

### For New Features
1. Create new division folder
2. Add README.md with same structure
3. Update this INDEX.md
4. Update PROJECT-OVERVIEW.md

### For Hackathon Demo
1. Read **[Demo Script](PROJECT-OVERVIEW.md#demo-script-3-minutes)**
2. Review **[Competitive Advantages](PROJECT-OVERVIEW.md#competitive-advantages)**
3. Check **[Performance Metrics](PROJECT-OVERVIEW.md#performance-metrics)**
4. Practice with demo.html

## 🔍 Quick Search

### "How do I start the system?"
→ [Quick Start Guide](../QUICKSTART_CHATBOT.md)

### "ML model not loading"
→ [ML Model Troubleshooting](ML-MODEL/README.md#troubleshooting)

### "Chatbot not responding"
→ [Chatbot Troubleshooting](CHATBOT/README.md#troubleshooting-guide)

### "What diseases are supported?"
→ [Supported Diseases](PROJECT-OVERVIEW.md#supported-diseases-16-classes)

### "How does the chatbot work?"
→ [Chatbot Architecture](CHATBOT/README.md#current-architecture)

### "What was changed in the ML model?"
→ [ML Model - What Was Done](ML-MODEL/README.md#what-was-done)

### "How to test everything?"
→ [Testing Section](#testing)

### "Prepare for demo"
→ [Demo Resources](#demo-resources)

## 📞 Support Flow

```
Issue Occurs
    ↓
Check PROJECT-OVERVIEW.md
    ↓
Identify Component (ML or Chatbot)
    ↓
Go to Component Division README
    ↓
Check Troubleshooting Section
    ↓
Review What Was Done
    ↓
Check Version History
    ↓
Apply Fix
    ↓
Update Documentation
```

## ✅ Documentation Checklist

When adding new features:
- [ ] Update component division README
- [ ] Add to "What Was Done" section
- [ ] Update version history
- [ ] Add troubleshooting if needed
- [ ] Update PROJECT-OVERVIEW.md
- [ ] Update this INDEX.md

## 🎉 Quick Status Check

### Is Everything Working?
```bash
# Check ML API
curl http://localhost:5000/health

# Check Chatbot
curl http://localhost:4000/api/health

# Check Ollama
curl http://localhost:11434/api/tags
```

### Run All Tests
```bash
# ML Model
python test_api.py

# Chatbot Integration
node test-chatbot-integration.js

# Interactive Conversation
node test-interactive-chat.js
```

### Start Everything
```bash
# Quick start
start-demo.bat

# Or manual
python api_service.py          # Terminal 1
node chatbot-server.js         # Terminal 2
start demo.html                # Browser
```

---

**Last Updated**: 2025-11-13
**Status**: ✅ Complete & Organized
**Ready**: YES! 🚀

**Need help?** Start with [Project Overview](PROJECT-OVERVIEW.md)


---

## 🌾 KrishiRaksha Multi-Page Platform Documentation

### New Platform Features

#### User Documentation
- **[User Guide](USER-GUIDE.md)** - Complete guide for farmers and users
  - Getting started
  - Disease detection guide
  - Market prices guide
  - Environmental monitoring guide
  - Harvest calculator guide
  - Crop calendar guide
  - Tips and best practices
  - Troubleshooting

#### Setup Documentation
- **[Setup Instructions](SETUP-INSTRUCTIONS.md)** - Detailed setup for all features
  - Prerequisites
  - Step-by-step installation
  - Feature-specific setup
  - Database configuration
  - Production deployment
  - Troubleshooting

#### Technical Documentation
- **[Architecture Guide](ARCHITECTURE.md)** - Multi-page system architecture
- **[API Reference](API-REFERENCE.md)** - Complete API documentation
  - Disease detection endpoints
  - Market prices endpoints
  - Environmental monitoring endpoints
  - Harvest calculator endpoints
  - Crop calendar endpoints

#### Frontend Documentation
- **[React Frontend README](../frontend-react/README.md)** - Frontend documentation
  - Multi-page navigation
  - Component structure
  - Professional design system
  - Performance optimizations
  - Accessibility features

### Platform Pages

1. **Home Page** - Professional landing page with service overview
2. **Market Prices** - Real-time crop price comparison and trends
3. **Disease Detection** - AI-powered plant disease diagnosis
4. **Environmental Monitoring** - Weather, AQI, and farming recommendations
5. **Harvest Calculator** - Optimize harvest timing for maximum profit
6. **Crop Calendar** - Plan and track farming activities

### New API Endpoints

#### Market Prices
- `GET /api/market-prices/:crop` - Get crop prices across markets

#### Environmental Monitoring
- `GET /api/environment/current?lat=X&lon=Y` - Current weather and AQI
- `GET /api/environment/forecast?lat=X&lon=Y` - 7-day forecast

#### Harvest Calculator
- `POST /api/harvest/calculate` - Calculate optimal harvest timing

#### Crop Calendar
- `GET /api/calendar/events/:userId` - Get calendar events
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/:eventId` - Update event
- `DELETE /api/calendar/events/:eventId` - Delete event

### Database Models

New MongoDB collections:
- **marketprices** - Crop price data
- **environmentaldata** - Weather history
- **harvestcalculations** - Harvest calculations
- **cropevents** - Calendar events

### Testing New Features

```bash
# Test environment API
node test-environment-api.js

# Test harvest calculator
node test-harvest-calculator.js

# Test crop calendar
node test-crop-calendar.js

# Test calendar optimistic updates
node test-calendar-optimistic-updates.js

# Test upcoming activities
node test-upcoming-activities.js
```

### Configuration Requirements

#### Weather API Key (Required)
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get free API key
3. Add to `.env` as `WEATHER_API_KEY`

#### Environment Variables
```bash
# Required for new features
WEATHER_API_KEY=your_openweathermap_api_key_here

# Optional
CACHE_DURATION_MINUTES=30
FRONTEND_URL=http://localhost:3000
```

### Quick Start for New Features

```bash
# 1. Update environment
cp .env.example .env
# Add WEATHER_API_KEY to .env

# 2. Start all services
npm run dev

# 3. Access platform
# Open http://localhost:3000

# 4. Test features
# - Navigate to Market Prices
# - Check Environmental Monitoring
# - Try Harvest Calculator
# - Create Calendar Events
```

### Feature Documentation Links

- **Disease Detection**: [ML Model README](ML-MODEL/README.md)
- **AI Chatbot**: [Chatbot README](CHATBOT/README.md)
- **Market Prices**: [API Reference - Market Prices](API-REFERENCE.md#market-prices-endpoints)
- **Environmental Monitoring**: [API Reference - Environmental](API-REFERENCE.md#environmental-monitoring-endpoints)
- **Harvest Calculator**: [API Reference - Harvest Calculator](API-REFERENCE.md#harvest-calculator-endpoints)
- **Crop Calendar**: [API Reference - Crop Calendar](API-REFERENCE.md#crop-calendar-endpoints)

### Troubleshooting New Features

#### Weather API Issues
- Verify API key in `.env`
- Check API key is active
- Verify free tier limits (1000 calls/day)
- See [Setup Instructions - Weather API](SETUP-INSTRUCTIONS.md#weather-api-not-working)

#### Market Prices Not Loading
- Currently uses mock data
- Ready for real API integration
- See [API Reference](API-REFERENCE.md#market-prices-endpoints)

#### Calendar Events Not Saving
- Check MongoDB connection
- Verify user ID format
- See [User Guide - Crop Calendar](USER-GUIDE.md#crop-calendar)

---

**Platform Status**: ✅ Multi-Page Platform Complete
**Features**: 6 Major Features Implemented
**Documentation**: Complete & Up-to-date

🌾 **KrishiRaksha - Empowering Farmers with Smart Agriculture**
