# KrishiRaksha Setup Instructions

Complete setup guide for the KrishiRaksha multi-page farmer platform.

## Quick Start

For experienced developers who want to get started quickly:

```bash
# 1. Clone and install
git clone <repository-url>
cd krishiraksha
npm install
cd frontend-react && npm install && cd ..

# 2. Install Python dependencies
pip install -r requirements_ml.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and add your WEATHER_API_KEY

# 4. Start MongoDB
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 5. Start Ollama and pull model
ollama serve
ollama pull minimax-m2:cloud

# 6. Start all services
npm run dev

# 7. Open http://localhost:3000
```

## Detailed Setup

### Prerequisites

Install the following before proceeding:

1. **Node.js** 16.x or higher - [Download](https://nodejs.org/)
2. **Python** 3.8 or higher - [Download](https://www.python.org/)
3. **MongoDB** 4.4 or higher - [Download](https://www.mongodb.com/try/download/community)
4. **Ollama** - [Download](https://ollama.ai/download)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd krishiraksha
```

### Step 2: Install Dependencies

#### Backend Dependencies
```bash
# From project root
npm install
```

This installs:
- express - Web server
- mongoose - MongoDB ODM
- multer - File uploads
- axios - HTTP client
- cors - CORS handling
- dotenv - Environment config
- concurrently - Run multiple services

#### Frontend Dependencies
```bash
cd frontend-react
npm install
cd ..
```

This installs:
- react - UI library
- react-router-dom - Routing
- recharts - Charts
- axios - API client

#### Python ML Dependencies
```bash
pip install -r requirements_ml.txt
```

This installs:
- torch - PyTorch ML framework
- torchvision - Image processing
- fastapi - ML API server
- uvicorn - ASGI server
- Pillow - Image handling

### Step 3: Configure Environment

```bash
# Copy example file
cp .env.example .env

# Windows
copy .env.example .env
```

Edit `.env` file:

```bash
# Backend
PORT=4000

# Database
MONGODB_URI=mongodb://localhost:27017/plant-disease-db

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=minimax-m2:cloud

# ML Service
ML_API_URL=http://localhost:5000

# Weather API (REQUIRED)
WEATHER_API_KEY=your_api_key_here

# Environment
NODE_ENV=development
```

### Step 4: Get Weather API Key

The Environmental Monitoring feature requires a Weather API key:

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API Keys section
4. Copy your API key
5. Add it to `.env` as `WEATHER_API_KEY`

**Free Tier Limits:**
- 1,000 API calls per day
- Current weather data
- 7-day forecast
- Air Quality Index (AQI)

### Step 5: Start MongoDB

#### Windows
```bash
net start MongoDB
```

#### macOS
```bash
brew services start mongodb-community
```

#### Linux
```bash
sudo systemctl start mongod
sudo systemctl enable mongod  # Auto-start on boot
```

#### Verify MongoDB
```bash
mongosh --eval "db.version()"
```

### Step 6: Start Ollama

#### Start Ollama Service
```bash
ollama serve
```

#### Pull AI Model (First Time Only)
```bash
# In a new terminal
ollama pull minimax-m2:cloud

# This downloads ~4GB, may take several minutes
```

#### Verify Ollama
```bash
ollama list
curl http://localhost:11434/api/tags
```

### Step 7: Verify ML Model

Check that the trained model file exists:

```bash
# Should see efficientnet_plant_disease.pth
ls -la efficientnet_plant_disease.pth

# Windows
dir efficientnet_plant_disease.pth
```

If missing, train the model:
```bash
python train_model.py
```

### Step 8: Start All Services

#### Option 1: Start All at Once (Recommended)
```bash
npm run dev
```

This starts:
- ML Service (port 5000)
- Backend Server (port 4000)
- React Frontend (port 3000)

#### Option 2: Start Individually

**Terminal 1 - ML Service:**
```bash
npm run start:ml
# Or: python api_service.py
```

**Terminal 2 - Backend:**
```bash
npm run start:backend
# Or: node backend/server.js
```

**Terminal 3 - Frontend:**
```bash
npm run start:frontend
# Or: cd frontend-react && npm start
```

### Step 9: Verify Installation

#### Check Service Health

```bash
# ML Service
curl http://localhost:5000/health
# Expected: {"status": "healthy"}

# Backend
curl http://localhost:4000/api/health
# Expected: {"status": "ok", "database": "connected", "ollama": "connected"}

# Frontend
# Open http://localhost:3000 in browser
```

#### Run Integration Tests

```bash
# Test ML API
python test_api.py

# Test Backend
node test-backend-complete.js

# Test Chatbot
node test-chatbot-integration.js

# Test Environment API
node test-environment-api.js

# Test Harvest Calculator
node test-harvest-calculator.js

# Test Crop Calendar
node test-crop-calendar.js
```

### Step 10: Access the Application

Open your browser and navigate to:

**http://localhost:3000**

You should see the KrishiRaksha home page with:
- Professional hero section
- Service feature cards
- Platform statistics
- Navigation menu

## Feature-Specific Setup

### Disease Detection

No additional setup required. Works out of the box with:
- ML model (efficientnet_plant_disease.pth)
- Ollama chatbot
- MongoDB for history

### Market Prices

Currently uses mock data. To integrate real market price API:

1. Sign up for agricultural market data API
2. Add API key to `.env`
3. Update `backend/server.js` market price routes
4. Replace mock data with real API calls

### Environmental Monitoring

Requires Weather API key (already configured in Step 4).

**Features:**
- Current weather conditions
- 7-day forecast
- Temperature and humidity trends
- Air Quality Index (AQI)
- Farming recommendations

**API Endpoints:**
- `/api/environment/current?lat=X&lon=Y`
- `/api/environment/forecast?lat=X&lon=Y`

### Harvest Calculator

No additional setup required. Uses:
- Backend calculation algorithm
- MongoDB for history
- React frontend for visualization

### Crop Calendar

No additional setup required. Uses:
- MongoDB for event storage
- React Calendar component
- Backend CRUD API

## Database Setup

### MongoDB Collections

The application automatically creates these collections:

1. **users** - User accounts
2. **predictions** - Disease detection history
3. **conversations** - Chatbot conversations
4. **marketprices** - Market price data
5. **environmentaldata** - Weather history
6. **harvestcalculations** - Harvest calculations
7. **cropevents** - Calendar events

### Database Indexes

Indexes are automatically created by Mongoose models for:
- User email (unique)
- Prediction timestamps
- Market price crop and timestamp
- Calendar event dates

### Backup and Restore

**Backup:**
```bash
mongodump --uri="mongodb://localhost:27017/plant-disease-db" --out=./backup
```

**Restore:**
```bash
mongorestore --uri="mongodb://localhost:27017/plant-disease-db" ./backup/plant-disease-db
```

## Development Workflow

### Making Changes

1. **Frontend Changes:**
   - Edit files in `frontend-react/src/`
   - React dev server auto-reloads
   - Check browser console for errors

2. **Backend Changes:**
   - Edit files in `backend/`
   - Restart backend server
   - Or use: `npm run dev:backend` (auto-restart)

3. **ML Model Changes:**
   - Edit `api_service.py`
   - Restart ML service
   - Test with `python test_api.py`

### Testing Changes

```bash
# Frontend tests
cd frontend-react
npm test

# Backend tests
node test-backend-complete.js

# ML tests
python test_api.py

# Integration tests
node test-integration-complete.js
```

### Debugging

**Frontend:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Use React DevTools extension

**Backend:**
- Check terminal output
- Add console.log statements
- Use Node.js debugger

**ML Service:**
- Check terminal output
- Add print statements
- Test with curl or Postman

## Production Deployment

### Build Frontend

```bash
cd frontend-react
npm run build
cd ..
```

This creates optimized production build in `frontend-react/build/`.

### Environment Variables

Update `.env` for production:

```bash
NODE_ENV=production
PORT=4000
MONGODB_URI=<production-mongodb-uri>
WEATHER_API_KEY=<production-api-key>
```

### Process Management

Use PM2 for production:

```bash
# Install PM2
npm install -g pm2

# Start services
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Serve Frontend

**Option 1: Serve from Backend**
```javascript
// In backend/server.js
app.use(express.static(path.join(__dirname, '../frontend-react/build')));
```

**Option 2: Use Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/frontend-react/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
    }
}
```

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:4000 | xargs kill -9
```

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Weather API Not Working

1. Verify API key is correct in `.env`
2. Check API key is active on OpenWeatherMap
3. Verify you haven't exceeded free tier limits (1000 calls/day)
4. Check backend logs for error messages

### Ollama Not Responding

```bash
# Restart Ollama
ollama serve

# Verify model is downloaded
ollama list

# Pull model if missing
ollama pull minimax-m2:cloud
```

### Frontend Build Errors

```bash
# Clear cache and reinstall
cd frontend-react
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Getting Help

1. **Check Documentation:**
   - [Main README](../README.md)
   - [User Guide](USER-GUIDE.md)
   - [API Reference](API-REFERENCE.md)

2. **Run Tests:**
   - Identify which component is failing
   - Check test output for specific errors

3. **Check Logs:**
   - Frontend: Browser console
   - Backend: Terminal output
   - ML Service: Terminal output

4. **Common Issues:**
   - See [Troubleshooting](../README.md#troubleshooting) in main README

## Next Steps

After successful setup:

1. **Explore Features:**
   - Try disease detection with sample images
   - Check market prices for different crops
   - View environmental data for your location
   - Calculate optimal harvest timing
   - Create calendar events

2. **Customize:**
   - Update branding and colors
   - Add more crops to market prices
   - Integrate real market price API
   - Add more calendar event types

3. **Deploy:**
   - Follow production deployment guide
   - Set up monitoring and logging
   - Configure backups
   - Set up SSL/HTTPS

---

**Setup Complete!** 🎉

You're now ready to use KrishiRaksha. Open http://localhost:3000 and start exploring!

For questions or issues, refer to the documentation or contact support.

🌾 **Happy Farming with KrishiRaksha!**
