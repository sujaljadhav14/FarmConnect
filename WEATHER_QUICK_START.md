# 🌤️ Weather Feature - Quick Start Guide

## Files Created/Modified

### Backend Files Created:
1. ✅ [backend/models/Weather.js](backend/models/Weather.js) - MongoDB Weather schema
2. ✅ [backend/controllers/weatherController.js](backend/controllers/weatherController.js) - Weather business logic
3. ✅ [backend/routes/weatherRoutes.js](backend/routes/weatherRoutes.js) - API routes
4. ✅ [backend/utils/weatherSockets.js](backend/utils/weatherSockets.js) - Socket.io handlers
5. ✅ [backend/utils/weatherScheduler.js](backend/utils/weatherScheduler.js) - Batch update scheduler

### Backend Files Modified:
- ✅ [backend/server.js](backend/server.js) - Added weather routes

### Frontend Files Created:
1. ✅ [frontend/src/pages/farmer/WeatherPage.js](frontend/src/pages/farmer/WeatherPage.js) - Main weather dashboard
2. ✅ [frontend/src/hooks/useWeatherSocket.js](frontend/src/hooks/useWeatherSocket.js) - Socket.io hook

### Frontend Files Modified:
- ✅ [frontend/src/App.js](frontend/src/App.js) - Added weather route

---

## ⚙️ Configuration Steps

### Step 1: Get OpenWeatherMap API Key

1. Visit: https://openweathermap.org/api
2. Click "Sign Up" → Create account
3. Go to API keys section
4. Copy your default API key

### Step 2: Update .env File

Add this to your backend `.env` file:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

**Example:**
```env
OPENWEATHER_API_KEY=
```

### Step 3: Update server.js (Optional - for scheduled updates)

If you want automatic weather updates every 30 minutes, add to [backend/server.js](backend/server.js):

```javascript
import { scheduleWeatherUpdates } from "./utils/weatherScheduler.js";

// After server initialization:
scheduleWeatherUpdates(io);
```

### Step 4: Start Backend

```bash
cd backend
npm install  # if needed
npm run server
```

### Step 5: Start Frontend

```bash
cd frontend
npm start
```

---

## 🧪 Testing the Feature

1. **Login as Farmer**
   - Use farmer credentials
   - Navigate to farmer dashboard

2. **Access Weather Feature**
   - Click "Weather Updates" button on dashboard
   - Or visit: `http://localhost:3000/farmer/weather`

3. **Add a Location**
   - Click "Add New Location"
   - Enter city name (e.g., "Delhi", "Mumbai", "Bangalore")
   - System will fetch real-time weather

4. **View Weather Data**
   - Current temperature, humidity, wind speed
   - Hourly forecast (next 24 hours)
   - 7-day forecast
   - Weather alerts

5. **Manage Locations**
   - Mark as favorite ❤️
   - Delete location 🗑️
   - Switch between multiple locations

---

## 📊 Features Overview

### Current Weather
- Temperature (with "feels like")
- Weather description with emoji icons
- Humidity percentage
- Wind speed and direction
- Visibility distance
- Air pressure
- Cloud coverage

### Forecasts
- **Hourly**: Next 24 hours breakdown
- **7-Day**: Daily high/low, conditions, precipitation

### Alerts
- Extreme heat (>40°C)
- Frost (<0°C)
- Strong winds (>30 m/s)
- Heavy clouds (>80% coverage)
- Rain forecasts

### Real-time Features
- Socket.io powered updates
- Automatic refresh every 30 minutes
- Alert notifications
- Multiple location tracking

---

## 🔌 API Endpoints

All require farmer authentication via JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Add/Get Weather by Location
```
POST /api/weather/get-weather
{
  "location": "Delhi"
}
```

### Get All Locations
```
GET /api/weather/my-locations
```

### Get Single Location
```
GET /api/weather/location/:weatherId
```

### Delete Location
```
DELETE /api/weather/location/:weatherId
```

### Toggle Favorite
```
PUT /api/weather/favorite/:weatherId
```

### Get All Alerts
```
GET /api/weather/alerts/all
```

---

## 🐛 Troubleshooting

### "Weather API not configured"
- ✅ Check `.env` file has `OPENWEATHER_API_KEY`
- ✅ Restart backend server after adding key
- ✅ Verify API key from OpenWeatherMap dashboard

### "Location not found"
- ✅ Check spelling of city name
- ✅ Use full city name (e.g., "New Delhi" instead of just "Delhi")
- ✅ Try with country code (e.g., "Delhi, IN")

### No real-time updates
- ✅ Verify socket.io connection in browser console
- ✅ Check browser network tab for socket connections
- ✅ Ensure server has io set correctly

### Weather data not updating
- ✅ Check 30-minute auto-refresh is working
- ✅ Try manually adding location again
- ✅ Check API rate limits on OpenWeatherMap dashboard

---

## 📝 Integration Notes

### With Farmer Dashboard
- Weather button already present on dashboard
- Links to `/farmer/weather` route
- Protected by farmer role authentication

### With Existing Features
- Weather data stored in MongoDB
- Uses same authentication system
- Socket.io integrated with existing infrastructure
- Follows existing UI patterns

### Data Storage
- All weather data persists in MongoDB
- Cached for 30 minutes to reduce API calls
- User-specific weather locations
- Full alert history maintained

---

## 🚀 Next Steps

1. ✅ Configure API key
2. ✅ Start backend & frontend
3. ✅ Test weather feature
4. ✅ Monitor console for errors
5. ✅ Deploy to production

---

## 📚 Additional Resources

- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [Socket.io Documentation](https://socket.io/docs/)
- [Full Setup Guide](./WEATHER_SETUP_GUIDE.md)

---

## ✅ Production Checklist

- [ ] API key configured in `.env`
- [ ] MongoDB connection verified
- [ ] Backend routes working
- [ ] Frontend page rendering
- [ ] Weather data displaying correctly
- [ ] Alerts triggering properly
- [ ] Socket.io connections established
- [ ] Error handling tested
- [ ] Deployment to production server
- [ ] Monitoring & logging setup

---

**Weather Feature is Ready! 🌤️** Start adding locations and tracking weather for your farm! 🌾

