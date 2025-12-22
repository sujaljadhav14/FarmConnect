# Weather Updates Feature - Setup Guide

## Overview
A comprehensive real-time weather updates feature for farmers with:
- ✅ Current weather conditions
- ✅ 24-hour hourly forecast
- ✅ 7-day weather forecast
- ✅ Weather alerts for extreme conditions
- ✅ Multiple location tracking
- ✅ Real-time socket.io updates
- ✅ Favorite location bookmarks

## Architecture

### Backend
- **Model**: `Weather.js` - MongoDB schema for storing weather data
- **Controller**: `weatherController.js` - Business logic for weather operations
- **Routes**: `weatherRoutes.js` - API endpoints
- **Utils**: `weatherSockets.js` - Real-time socket.io handlers

### Frontend
- **Page**: `WeatherPage.js` - Main weather dashboard
- **Hook**: `useWeatherSocket.js` - Real-time weather socket integration

### API
- **Provider**: OpenWeatherMap (Free tier: 1M calls/month)
- **Alternative**: WeatherAPI

## Setup Instructions

### 1. Get API Key from OpenWeatherMap

1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Generate API key from dashboard
4. Copy the API key

### 2. Configure Environment Variables

Add to your `.env` file in the backend directory:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

### 3. Database Setup

The Weather model is automatically created when the app starts. It stores:
- User ID reference
- Location name & coordinates
- Current weather data
- Hourly forecast (24 hours)
- 7-day forecast
- Weather alerts
- Favorite status
- Last update timestamp

### 4. API Endpoints

All endpoints require JWT authentication and farmer role.

#### Get Weather by Location
```
POST /api/weather/get-weather
Body: {
  location: "Delhi" // or use latitude/longitude
}
Response: {
  success: true,
  weather: {
    _id: "...",
    location: "Delhi",
    currentWeather: {
      temperature: 25.5,
      humidity: 60,
      windSpeed: 5.2,
      ...
    },
    forecast: [...],
    hourlyForecast: [...],
    alerts: [...]
  }
}
```

#### Get All User Weather Locations
```
GET /api/weather/my-locations
Response: {
  success: true,
  count: 2,
  weather: [...]
}
```

#### Get Single Weather Location
```
GET /api/weather/location/:weatherId
Response: {
  success: true,
  weather: {...}
}
```

#### Delete Weather Location
```
DELETE /api/weather/location/:weatherId
Response: {
  success: true,
  message: "Weather location deleted successfully"
}
```

#### Toggle Favorite
```
PUT /api/weather/favorite/:weatherId
Response: {
  success: true,
  weather: {...}
}
```

#### Get All Weather Alerts
```
GET /api/weather/alerts/all
Response: {
  success: true,
  count: 3,
  alerts: [...]
}
```

## Real-time Features with Socket.io

### Client-side Events

#### Subscribe to Weather Alerts
```javascript
socket.emit('subscribe-weather-alerts', userId);
```

#### Listen for Weather Updates
```javascript
socket.on('weather-updated', (data) => {
  console.log('Weather updated:', data.weather);
});
```

#### Listen for Weather Alerts
```javascript
socket.on('weather-alert', (data) => {
  console.log('Weather alert:', data.alert);
});
```

#### Listen for Broadcast Alerts
```javascript
socket.on('weather-alert-broadcast', (data) => {
  console.log('Broadcast alert for', data.location);
});
```

### Server-side Functions

```javascript
import { 
  emitWeatherUpdate, 
  emitWeatherAlert, 
  broadcastWeatherAlert 
} from "./utils/weatherSockets.js";

// Send weather update to specific user
emitWeatherUpdate(io, userId, weatherData);

// Send alert to specific user
emitWeatherAlert(io, userId, alertData);

// Broadcast alert to all users
broadcastWeatherAlert(io, "Delhi", alertData);
```

## Weather Alerts System

### Alert Types

1. **EXTREME_HEAT** - Temperature > 40°C
   - Severity: HIGH
   - Recommendation: Reduce irrigation frequency

2. **FROST** - Temperature < 0°C
   - Severity: HIGH
   - Recommendation: Protect crops from frost

3. **STRONG_WIND** - Wind speed > 30 m/s
   - Severity: MEDIUM
   - Recommendation: Secure loose items, reduce outdoor activities

4. **HEAVY_CLOUDS** - Cloud cover > 80%
   - Severity: LOW
   - Recommendation: Prepare for possible rain

5. **RAIN** - Rain forecast
   - Severity: LOW
   - Recommendation: Monitor rainfall amount

## Weather Data Updates

- **Auto-refresh**: Every 30 minutes
- **Manual refresh**: Whenever user requests
- **Cache strategy**: Weather data is cached to reduce API calls
- **Cron job** (optional): Can be set up for scheduled updates

## Features Implemented

### Current Weather Display
- Temperature (with "feels like")
- Weather description
- Humidity percentage
- Wind speed & direction
- Visibility distance
- Air pressure
- Cloud coverage

### Hourly Forecast (Next 24 Hours)
- Hour-wise breakdown
- Temperature per hour
- Weather condition
- Chance of rain
- Wind speed
- Humidity

### 7-Day Forecast
- High/Low temperatures
- Average temperature
- Weather description
- Humidity
- Wind speed
- Chance of rain
- Precipitation amount

### Location Management
- Add multiple locations
- Mark favorite locations
- Delete locations
- Track last update time

### Alert System
- Automatic alert generation based on thresholds
- Alert severity levels (low, medium, high, severe)
- Alert history with timestamps
- Real-time alert notifications

## Frontend Components

### WeatherPage.js
Main dashboard component with:
- Location selector
- Add location form
- Current weather card
- Hourly forecast carousel
- 7-day forecast table
- Alert display
- Weather icons

## Integration with Farmer Dashboard

The weather feature is integrated into:
- Farmer Dashboard menu (Weather Updates button)
- Navigation link: `/farmer/weather`
- Protected by farmer role authentication

## Testing the Feature

1. Start backend server:
   ```bash
   npm run server
   ```

2. Start frontend:
   ```bash
   npm start
   ```

3. Login as farmer

4. Navigate to Weather Updates or click from dashboard

5. Add a location (e.g., "Delhi")

6. View real-time weather and forecasts

7. Test alert system by checking extreme weather conditions

## Customization Options

### Change Alert Thresholds
Edit `weatherController.js` in `generateAlerts()` function:
```javascript
if (weatherData.main?.temp > 40) { // Change 40 to your threshold
  alerts.push({...});
}
```

### Add Custom Alert Types
```javascript
if (condition) {
  alerts.push({
    type: "CUSTOM_ALERT",
    description: "Custom alert message",
    severity: "high",
  });
}
```

### Modify Weather Icons
Edit icon mapping in `WeatherPage.js`:
```javascript
const iconMap = {
  "01d": "☀️", // Your custom emoji
  // ...
};
```

## Performance Optimization

1. **Caching**: Weather data cached for 30 minutes
2. **API Calls**: Minimized through smart refresh logic
3. **Database**: Indexed by userId for fast queries
4. **Socket.io**: Room-based broadcasting to reduce traffic
5. **Frontend**: Lazy loading of forecast data

## Error Handling

- Invalid location handling
- API rate limit protection
- Network error recovery
- Fallback to cached data
- Graceful error messages to user

## Future Enhancements

1. Historical weather data tracking
2. Weather-based crop recommendations
3. Seasonal weather patterns
4. Integration with crop calendar
5. Mobile app notifications
6. Weather export to CSV
7. Multi-language support
8. Weather radar integration

## Support

For issues or questions:
1. Check API key configuration
2. Verify OpenWeatherMap API limits
3. Check database connectivity
4. Review socket.io logs
5. Check browser console for errors

---

**Weather Feature Ready for Production!** ✅
