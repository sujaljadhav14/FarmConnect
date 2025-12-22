# 🌤️ Weather Feature - Testing Guide

## Pre-Testing Checklist

- [ ] Backend server running (`npm run server`)
- [ ] Frontend running (`npm start`)
- [ ] MongoDB connected
- [ ] OpenWeatherMap API key configured in `.env`
- [ ] Browser developer tools open (F12)
- [ ] Network tab enabled

---

## Test Scenarios

### Test 1: Basic Authentication & Access
**Goal**: Verify farmers can access weather feature

**Steps**:
1. Open application in browser
2. Go to home page
3. Click "Login"
4. Enter farmer credentials
5. Navigate to Farmer Dashboard
6. Click "Weather Updates"

**Expected Result**:
- ✅ WeatherPage loads
- ✅ Empty state shows "No Weather Locations Added Yet"
- ✅ "Add New Location" button visible
- ✅ Sidebar menu loaded correctly

**Console Check**:
- No 401/403 errors
- No auth errors

---

### Test 2: Add Weather Location
**Goal**: Test adding a new location

**Steps**:
1. On WeatherPage, click "Add New Location"
2. Enter city name: "Delhi"
3. Click "Add" button
4. Wait for data to load

**Expected Result**:
- ✅ Form submits successfully
- ✅ Location card appears in sidebar
- ✅ Weather data displays in main area
- ✅ Current temperature shows
- ✅ Toast message: "Location added successfully!"

**Data to Verify**:
- Current temperature value (number)
- Humidity percentage (0-100)
- Wind speed (m/s)
- Visibility (km)
- Pressure (hPa)

**Network Check**:
- POST request to `/api/weather/get-weather`
- Response 200 with weather data

---

### Test 3: View Current Weather
**Goal**: Verify current weather display

**Steps**:
1. After adding location, check current weather card
2. Hover over temperature display
3. Check all weather metrics

**Expected Result**:
- ✅ Large temperature display (top section)
- ✅ "Feels like" temperature shown
- ✅ Weather description visible
- ✅ Weather emoji icon displayed
- ✅ 4 metric boxes show:
  - Humidity %
  - Wind Speed m/s
  - Visibility km
  - Pressure hPa

**Visual Check**:
- All values have correct units
- No "undefined" or "null" values
- Colors are appropriate

---

### Test 4: View Hourly Forecast
**Goal**: Test 24-hour hourly forecast display

**Steps**:
1. Scroll to "Hourly Forecast" section
2. Check horizontal scroll container
3. Scroll through forecast cards

**Expected Result**:
- ✅ Shows "Hourly Forecast (Next 24 Hours)" title
- ✅ Each hour card shows:
  - Time (e.g., "10:00 AM")
  - Temperature (°C)
  - Weather icon emoji
  - Rain chance (%)
- ✅ At least 8 hours displayed
- ✅ Scrollable container
- ✅ No overlapping elements

**Data Check**:
- All temperatures are numbers
- Times are readable
- Rain % is 0-100
- Emojis display correctly

---

### Test 5: View 7-Day Forecast
**Goal**: Test 7-day forecast table display

**Steps**:
1. Scroll to "7-Day Forecast" section
2. Check all columns
3. Verify all rows

**Expected Result**:
- ✅ Table headers visible:
  - Day
  - Condition (with emoji)
  - High/Low (°C)
  - Humidity (%)
  - Wind (m/s)
  - Rain Chance (%)
- ✅ 7 rows of forecast data
- ✅ Each row shows complete data
- ✅ Table is responsive (scrolls on mobile)

**Data Validation**:
- Max temp > Min temp (for each day)
- All values are numbers
- Weather descriptions match icons

---

### Test 6: Manage Multiple Locations
**Goal**: Test adding and switching between locations

**Steps**:
1. Click "Add New Location"
2. Add second location: "Mumbai"
3. Click on "Mumbai" in sidebar
4. Verify weather updates
5. Click on "Delhi" to switch back
6. Verify data switches correctly

**Expected Result**:
- ✅ Both locations appear in sidebar
- ✅ Active location highlighted
- ✅ Weather data changes when switching
- ✅ Temperature updates immediately
- ✅ Forecast updates for selected location
- ✅ No data mixing between locations

**Console Check**:
- GET requests work for each location
- No data corruption errors

---

### Test 7: Favorite Locations
**Goal**: Test marking locations as favorite

**Steps**:
1. With location selected, click heart icon (❤️)
2. Verify heart fills (becomes solid)
3. Switch to another location
4. Switch back
5. Verify favorite status persists

**Expected Result**:
- ✅ Heart icon fills when clicked
- ✅ Toast: "Added to favorites"
- ✅ Heart remains filled after switching
- ✅ PUT request succeeds
- ✅ Database updates correctly

**API Check**:
- PUT request to `/api/weather/favorite/{weatherId}`
- Response includes `isFavorite: true`

---

### Test 8: Delete Location
**Goal**: Test removing a location

**Steps**:
1. Click trash icon (🗑️) for a location
2. Confirm deletion
3. Verify location removed

**Expected Result**:
- ✅ Confirmation dialog appears
- ✅ If confirmed:
  - Location disappears from sidebar
  - Weather data for that location removed
  - Toast: "Location removed"
- ✅ If cancelled:
  - Location remains
  - No changes

**Database Check**:
- DELETE request succeeds
- Location removed from MongoDB

---

### Test 9: Weather Alerts
**Goal**: Test alert generation for extreme conditions

**Steps**:
1. Add a location with extreme weather
2. Look for alerts section (top of page)
3. Check alert details

**Expected Result**:
- ✅ If extreme heat (>40°C):
  - Alert appears with warning icon ⚠️
  - Type: "EXTREME_HEAT"
  - Description includes temperature
  - Severity color shown
- ✅ Similar for other alert types

**Alert Types to Test** (if location has them):
- Extreme Heat (red)
- Frost (blue)
- Strong Wind (orange)
- Heavy Clouds (gray)
- Rain (blue)

---

### Test 10: Real-time Socket.io Updates
**Goal**: Test Socket.io real-time connections

**Steps**:
1. Open developer tools → Network tab
2. Filter by WS (WebSocket)
3. Add weather location
4. Wait 30 minutes OR manually trigger update

**Expected Result**:
- ✅ Socket.io connection established
- ✅ WebSocket connection visible in Network tab
- ✅ After 30 mins: New socket messages appear
- ✅ Weather data updates without page refresh

**Console Check**:
- Socket.io connected message
- No WebSocket errors
- Messages like `weather-updated` received

---

### Test 11: Error Handling - Invalid Location
**Goal**: Test handling of non-existent locations

**Steps**:
1. Click "Add New Location"
2. Enter invalid city: "XyzNotACity123"
3. Click Add

**Expected Result**:
- ✅ Toast error: "Location not found"
- ✅ Form stays visible
- ✅ No location added to sidebar
- ✅ No data display

**Console Check**:
- 404 error response
- Clean error handling

---

### Test 12: Error Handling - Network Error
**Goal**: Test handling of network failures

**Steps**:
1. Open DevTools → Network tab
2. Add a location
3. While loading, disconnect internet/throttle network
4. Or block API requests in DevTools

**Expected Result**:
- ✅ Toast error message shown
- ✅ Graceful failure (no crash)
- ✅ Button remains clickable
- ✅ Can retry

**Console Check**:
- Network error logged
- Proper error handling

---

### Test 13: Responsive Design - Mobile
**Goal**: Test weather feature on mobile screens

**Steps**:
1. Press F12 (DevTools)
2. Click device toolbar icon
3. Select iPhone 12 (or similar)
4. Refresh page
5. Test all features

**Expected Result**:
- ✅ Layout adjusts for mobile
- ✅ Sidebar collapses/stacks
- ✅ Weather metrics stack vertically
- ✅ Forecast carousel scrolls horizontally
- ✅ Table is horizontally scrollable
- ✅ Buttons are touch-friendly

**Mobile Checks**:
- Readable font sizes
- No horizontal overflow
- All buttons clickable
- Alerts display properly

---

### Test 14: Performance - Loading Speed
**Goal**: Test page load performance

**Steps**:
1. Open DevTools → Performance tab
2. Load WeatherPage with location
3. Check Network tab timings

**Expected Result**:
- ✅ First load < 2 seconds
- ✅ Data display < 500ms after loading
- ✅ Image/icon loading complete
- ✅ No layout shifts after load

**Metrics**:
- DOMContentLoaded < 1s
- Network requests < 5
- Bundle size reasonable

---

### Test 15: Data Persistence
**Goal**: Test that data persists correctly

**Steps**:
1. Add multiple locations
2. Mark some as favorites
3. Refresh page (F5)
4. Check if all locations still there

**Expected Result**:
- ✅ All locations still visible
- ✅ Favorite status preserved
- ✅ No data loss

**Database Check**:
- All locations in MongoDB
- Favorite flags correct
- User ID references valid

---

## Performance Benchmark Tests

### Test 16: API Response Time
**Steps**:
1. Open Network tab
2. Add location
3. Measure request time

**Target**:
- ✅ Initial request: < 1000ms
- ✅ Subsequent requests: < 500ms (cached)

### Test 17: Memory Usage
**Steps**:
1. Open DevTools → Memory tab
2. Add 5+ locations
3. Switch between them
4. Take heap snapshot
5. Check memory increase

**Target**:
- ✅ Reasonable memory increase
- ✅ No memory leaks

---

## Browser Compatibility Tests

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Test |
| Firefox | Latest | ✅ Test |
| Safari | Latest | ✅ Test |
| Edge | Latest | ✅ Test |

**Test Steps** (for each browser):
1. Login as farmer
2. Navigate to weather
3. Add location
4. Test all features
5. Check console for errors

---

## Security Tests

### Test 18: Authentication Protection
**Steps**:
1. Try accessing `/farmer/weather` without login
2. Try accessing with expired token
3. Try with non-farmer user

**Expected Result**:
- ✅ Redirects to login without auth
- ✅ Shows 401 with expired token
- ✅ Shows 403 for non-farmers

### Test 19: Data Isolation
**Steps**:
1. Login as farmer A
2. Add location
3. Note location ID
4. Logout
5. Login as farmer B
6. Try to access farmer A's location via API

**Expected Result**:
- ✅ Farmer B can't see farmer A's weather
- ✅ API returns 404 for other user's data

---

## Regression Testing

After any code changes, test:

1. ✅ Can still add locations
2. ✅ Weather data displays correctly
3. ✅ Alerts still generate
4. ✅ Socket.io still works
5. ✅ No console errors
6. ✅ Responsive design maintained
7. ✅ Performance unchanged

---

## Test Report Template

```
WEATHER FEATURE TEST REPORT
Date: _______________
Tester: _______________
Build Version: _______________

SUMMARY:
- Total Tests: 19
- Passed: ___
- Failed: ___
- Issues: ___

DETAILED RESULTS:

Test 1: Basic Authentication
Status: ☐ PASS ☐ FAIL ☐ SKIP
Notes: _____________________

[Continue for each test...]

CRITICAL ISSUES:
1. _____________________
2. _____________________

RECOMMENDATIONS:
1. _____________________
2. _____________________

Signed: _______________
```

---

## Automated Testing (Future)

Consider implementing:

```javascript
// Example: Jest + React Testing Library

describe('WeatherPage', () => {
  test('Should display add location form', () => {
    // Test implementation
  });

  test('Should fetch weather on location add', () => {
    // Test implementation
  });

  test('Should display current weather data', () => {
    // Test implementation
  });

  test('Should handle errors gracefully', () => {
    // Test implementation
  });
});
```

---

## Known Issues & Limitations

### Current Limitations:
1. ❌ No historical weather data tracking
2. ❌ No offline mode
3. ❌ No weather radar integration
4. ❌ API rate limit: 1M calls/month (free tier)

### Future Improvements:
1. ✅ Add weather alerts via SMS/email
2. ✅ Weather-based crop recommendations
3. ✅ Export data to CSV
4. ✅ Multi-language support

---

## Support Contact

For issues during testing:
1. Check browser console for errors
2. Check backend server logs
3. Verify API key configuration
4. Review network requests in DevTools

---

**✅ Ready to Begin Testing!** Start with Test 1 and work through systematically.

