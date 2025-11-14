# Quick Start: Environmental Monitoring Page

## 🚀 Getting Started (No Setup Required!)

The Environmental Monitoring page works immediately without any API keys. All primary APIs are free and don't require registration.

## 📍 How to Use

1. **Start the servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   node server.js

   # Terminal 2 - Frontend
   cd frontend-react
   npm start
   ```

2. **Navigate to**: `http://localhost:3000/environment`

3. **Select a location**:
   - Click "Use Current Location" for GPS
   - OR type a city name and click "Search"

4. **View environmental data**:
   - Current weather conditions
   - Temperature, humidity, wind speed
   - Air Quality Index (AQI)
   - 7-day weather forecast
   - Historical trends (last 7 days)
   - Farming recommendations

## 🌐 Integrated APIs (All Free!)

### Primary APIs (No Keys Required)
1. **Open-Meteo Weather** - Current weather & forecast
2. **Open-Meteo Air Quality** - AQI and pollutant levels
3. **Open-Meteo Archive** - Historical data for trends
4. **Open-Meteo Seasonal** - 90-day seasonal forecast
5. **OpenStreetMap Nominatim** - Location geocoding

### Optional API (Requires Free Key)
6. **Agromonitoring** - Soil temperature & moisture

## 🔧 Optional: Add Soil Data

Want soil temperature and moisture data?

1. Sign up at: https://agromonitoring.com/api (Free tier: 1000 calls/day)
2. Get your API key
3. Add to `backend/.env`:
   ```env
   AGRO_API_KEY=your_api_key_here
   ```
4. Restart backend server

## 📊 Features Available

### Current Conditions
- ☀️ Weather condition
- 🌡️ Temperature with status (Cold/Moderate/Warm/Hot)
- 💧 Humidity with status (Low/Optimal/High)
- 🌫️ Air Quality Index with health categories
- 🌱 Soil temperature (if API key configured)
- 💦 Soil moisture (if API key configured)

### 7-Day Forecast
- Daily weather conditions
- High/low temperatures
- Humidity levels
- Scrollable card interface

### Historical Trends
- Temperature trend (last 7 days)
- Humidity trend (last 7 days)
- Interactive line charts

### Farming Recommendations
- Temperature-based advice
- Humidity-based advice
- Weather-specific tips
- Alert system for unfavorable conditions
- General farming best practices

## 🧪 Test the APIs

Run the test suite to verify all endpoints:
```bash
node test-environment-api.js
```

Expected output:
```
✓ PASS - Current Environmental Data
✓ PASS - 7-Day Weather Forecast
✓ PASS - Seasonal Forecast (90 days)

Total: 3/3 tests passed
🎉 All tests passed!
```

## 📱 Responsive Design

The page works on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🎨 Color Coding

### Temperature
- 🔵 Blue: Cold (< 10°C)
- 🟢 Green: Moderate (10-25°C)
- 🟡 Yellow: Warm (25-35°C)
- 🔴 Red: Hot (> 35°C)

### Humidity
- 🔴 Red: Low (< 30%) or Very High (> 80%)
- 🟢 Green: Optimal (30-60%)
- 🟡 Yellow: High (60-80%)

### Air Quality Index (AQI)
- 🟢 Green: Good (0-50)
- 🟡 Yellow: Moderate (51-100)
- 🟠 Orange: Unhealthy for Sensitive (101-150)
- 🔴 Red: Unhealthy (151-200)
- 🟣 Purple: Very Unhealthy (201-300)
- 🟤 Maroon: Hazardous (301+)

## 🔍 Troubleshooting

### "Failed to fetch environmental data"
- Check if backend server is running on port 4000
- Verify internet connection (APIs need internet access)
- Check browser console for detailed errors

### "Location not found"
- Try a different search term (e.g., "Delhi" instead of "New Delhi")
- Use GPS location instead
- Check if location name is spelled correctly

### No soil data showing
- Soil data requires AGRO_API_KEY in .env
- Sign up at agromonitoring.com to get a free key
- Restart backend after adding the key

### Slow loading
- First request may be slow (no cache)
- Subsequent requests use 30-minute cache
- Check internet speed

## 📖 API Endpoints

### Get Current Data
```bash
curl "http://localhost:4000/api/environment/current?lat=28.7041&lon=77.1025"
```

### Get 7-Day Forecast
```bash
curl "http://localhost:4000/api/environment/forecast?lat=28.7041&lon=77.1025"
```

### Get Seasonal Forecast
```bash
curl "http://localhost:4000/api/environment/seasonal?lat=28.7041&lon=77.1025"
```

## 💡 Tips

1. **Use GPS for accuracy**: GPS provides exact coordinates
2. **Check daily**: Weather data updates every 30 minutes
3. **Review trends**: Historical data helps identify patterns
4. **Follow recommendations**: AI-generated advice based on conditions
5. **Monitor AQI**: Important for outdoor farming activities

## 🌟 Example Locations to Try

- Delhi, India: `lat=28.7041, lon=77.1025`
- Mumbai, India: `lat=19.0760, lon=72.8777`
- Bangalore, India: `lat=12.9716, lon=77.5946`
- Punjab, India: `lat=31.1471, lon=75.3412`
- Hyderabad, India: `lat=17.3850, lon=78.4867`

## 📚 Documentation

For detailed information:
- **ENVIRONMENTAL-API-INTEGRATION.md** - Complete API documentation
- **TASK-5-COMPLETION-SUMMARY.md** - Implementation details

## ✅ Checklist

Before using:
- [ ] Backend server running on port 4000
- [ ] Frontend running on port 3000
- [ ] Internet connection active
- [ ] (Optional) AGRO_API_KEY configured for soil data

## 🎯 What's Next?

The Environmental Monitoring page is complete! You can now:
1. Use it for real farming decisions
2. Integrate with other pages (Disease Detection, Market Prices)
3. Add more features (notifications, alerts, etc.)
4. Deploy to production

Enjoy your comprehensive environmental monitoring system! 🌱🌤️
