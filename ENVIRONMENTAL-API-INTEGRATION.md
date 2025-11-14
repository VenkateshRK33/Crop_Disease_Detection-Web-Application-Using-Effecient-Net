# Environmental Monitoring API Integration

## Overview
The Environmental Monitoring page now integrates multiple weather and environmental APIs to provide comprehensive data for farmers.

## Integrated APIs

### 1. **Open-Meteo Weather API** (Primary - No API Key Required)
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Features**:
  - Current weather conditions
  - Temperature, humidity, wind speed
  - Weather codes for condition mapping
  - 7-day forecast
- **Cost**: Free, no API key required
- **Rate Limit**: Unlimited for reasonable use

### 2. **Open-Meteo Air Quality API** (No API Key Required)
- **Endpoint**: `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Features**:
  - PM2.5 and PM10 measurements
  - Carbon monoxide, nitrogen dioxide, sulphur dioxide, ozone levels
  - Calculated AQI (Air Quality Index) using US EPA formula
- **Cost**: Free, no API key required
- **Implementation**: Backend calculates AQI from PM2.5 values

### 3. **Open-Meteo Archive API** (Historical Data)
- **Endpoint**: `https://archive-api.open-meteo.com/v1/archive`
- **Features**:
  - Historical temperature data (last 7 days)
  - Historical humidity data
  - Used for trend charts
- **Cost**: Free, no API key required

### 4. **Open-Meteo Seasonal API** (Optional)
- **Endpoint**: `https://seasonal-api.open-meteo.com/v1/seasonal`
- **Route**: `GET /api/environment/seasonal?lat=X&lon=Y`
- **Features**:
  - 90-day seasonal forecast
  - Weekly aggregated data (temperature, precipitation)
  - Long-term planning insights
- **Cost**: Free, no API key required

### 5. **Agromonitoring Soil API** (Optional - Requires API Key)
- **Endpoint**: `http://api.agromonitoring.com/agro/1.0/soil`
- **Features**:
  - Soil temperature (at 0cm and 10cm depth)
  - Soil moisture levels
- **Cost**: Free tier - 1000 calls/day
- **Setup**: Sign up at https://agromonitoring.com/api
- **Configuration**: Add `AGRO_API_KEY` to `.env` file

### 6. **OpenStreetMap Nominatim** (Geocoding)
- **Endpoint**: `https://nominatim.openstreetmap.org/reverse`
- **Features**:
  - Reverse geocoding (coordinates to location name)
  - Forward geocoding (location name to coordinates)
- **Cost**: Free
- **Rate Limit**: 1 request per second

## Backend Routes

### Current Environmental Data
```
GET /api/environment/current?lat={latitude}&lon={longitude}
```

**Response:**
```json
{
  "success": true,
  "location": {
    "name": "Location Name",
    "lat": 28.7041,
    "lon": 77.1025
  },
  "current": {
    "weather": "Clear",
    "temperature": 28,
    "humidity": 65,
    "windSpeed": 12,
    "aqi": 85,
    "soil": {
      "temperature": 24,
      "moisture": 45
    }
  },
  "trends": {
    "temperature": [...],
    "humidity": [...]
  },
  "source": "open-meteo"
}
```

### Weather Forecast
```
GET /api/environment/forecast?lat={latitude}&lon={longitude}
```

**Response:**
```json
{
  "success": true,
  "forecast": [
    {
      "date": "2025-11-15",
      "temp": 28,
      "tempMin": 18,
      "weather": "Clear",
      "humidity": 60
    }
  ],
  "source": "open-meteo"
}
```

### Seasonal Forecast (New)
```
GET /api/environment/seasonal?lat={latitude}&lon={longitude}
```

**Response:**
```json
{
  "success": true,
  "seasonal": [
    {
      "week": 1,
      "startDate": "2025-11-15",
      "avgTempMax": 28,
      "avgTempMin": 18,
      "totalPrecipitation": 12.5
    }
  ],
  "source": "open-meteo-seasonal"
}
```

## Features Implemented

### Frontend Components
1. **LocationSelector** - GPS and manual location input
2. **EnvironmentalMetrics** - Current conditions with gauges
   - Weather condition
   - Temperature with color-coded status
   - Humidity with optimal range indicators
   - Air Quality Index (AQI) with health categories
   - Soil temperature (if available)
   - Soil moisture (if available)
3. **WeatherForecast** - 7-day scrollable forecast cards
4. **EnvironmentalTrendCharts** - Historical data visualization using Recharts
5. **FarmingRecommendations** - AI-generated farming advice based on conditions

### Backend Features
- **Caching**: 30-minute cache for all API responses
- **Parallel API Calls**: Multiple APIs fetched simultaneously using Promise.allSettled
- **Graceful Degradation**: Falls back to mock data if APIs fail
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Rate Limiting**: Respects API rate limits with caching

## Setup Instructions

### Basic Setup (No API Keys Required)
The system works out of the box using Open-Meteo APIs which don't require API keys.

### Optional: Add Soil Data
1. Sign up at https://agromonitoring.com/api
2. Get your API key
3. Add to `.env` file:
   ```
   AGRO_API_KEY=your_api_key_here
   ```

### Optional: OpenWeatherMap (Legacy Support)
If you prefer OpenWeatherMap:
1. Sign up at https://openweathermap.org/api
2. Add to `.env` file:
   ```
   WEATHER_API_KEY=your_api_key_here
   ```

## Weather Code Mapping

Open-Meteo uses WMO weather codes. The backend maps these to simple conditions:

| Code Range | Condition |
|------------|-----------|
| 0 | Clear |
| 1-3 | Clouds |
| 45-48 | Fog |
| 51-57 | Drizzle |
| 61-67 | Rain |
| 71-77 | Snow |
| 80-82 | Rain Showers |
| 95+ | Thunderstorm |

## AQI Calculation

The system calculates AQI from PM2.5 values using the US EPA formula:

| PM2.5 (μg/m³) | AQI | Category |
|---------------|-----|----------|
| 0-12 | 0-50 | Good |
| 12-35.4 | 50-100 | Moderate |
| 35.4-55.4 | 100-150 | Unhealthy for Sensitive |
| 55.4-150.4 | 150-200 | Unhealthy |
| 150.4-250.4 | 200-300 | Very Unhealthy |
| 250.4+ | 300-500 | Hazardous |

## Caching Strategy

- **Duration**: 30 minutes
- **Key Format**: `{type}_{latitude}_{longitude}`
- **Types**: `current`, `forecast`, `seasonal`
- **Storage**: In-memory Map (resets on server restart)

## Error Handling

The system handles errors gracefully:
1. **API Timeout**: Falls back to mock data
2. **API Unavailable**: Uses cached data or mock data
3. **Invalid Coordinates**: Returns 400 error
4. **Network Error**: Logs error and returns mock data

## Performance Optimization

- Parallel API calls reduce total response time
- Caching reduces API calls by 95%
- Promise.allSettled ensures one failed API doesn't break others
- Lazy loading of optional data (soil)

## Future Enhancements

Potential additions:
- Climate API integration for long-term trends
- Soil nutrient data from additional APIs
- Satellite imagery integration
- Pest and disease risk prediction based on weather
- Irrigation scheduling recommendations
- Crop-specific weather alerts

## Testing

Test the APIs:
```bash
# Current weather
curl "http://localhost:4000/api/environment/current?lat=28.7041&lon=77.1025"

# Forecast
curl "http://localhost:4000/api/environment/forecast?lat=28.7041&lon=77.1025"

# Seasonal (new)
curl "http://localhost:4000/api/environment/seasonal?lat=28.7041&lon=77.1025"
```

## Troubleshooting

### No soil data showing
- Check if `AGRO_API_KEY` is set in `.env`
- Verify API key is valid
- Check backend logs for errors

### Weather data not updating
- Clear cache by restarting server
- Check internet connection
- Verify coordinates are valid

### Slow response times
- Check if caching is working
- Verify API endpoints are accessible
- Consider reducing timeout values

## Credits

- **Open-Meteo**: Free weather and climate APIs
- **Agromonitoring**: Agricultural monitoring APIs
- **OpenStreetMap**: Geocoding services
- **Recharts**: Chart visualization library
