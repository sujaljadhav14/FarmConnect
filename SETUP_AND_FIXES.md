# 🚀 Complete Setup & Fix Guide

## Issues Found & Fixed

### ✅ FIXED Issues

1. **Missing Axios BaseURL** - FIXED
   - Added `axios.defaults.baseURL` in frontend/src/index.js
   - Set to use environment variable or default to http://localhost:8080

2. **Missing Transporter Role Check** - FIXED
   - Added `isTransport` middleware to vehicle management routes
   - Now only transporters can access vehicle endpoints

3. **Missing Auth Import** - ALREADY FIXED
   - Changed from `isAuth` to `requireSignIn`
   - Correct middleware is now being used

### ✅ Environment Files Created

- `backend/.env` - Database, JWT, Twilio configuration
- `frontend/.env` - API URL configuration

---

## Complete Setup Instructions

### Step 1: Backend Setup

#### 1.1 Navigate to backend folder
```bash
cd backend
```

#### 1.2 Install dependencies (if not already done)
```bash
npm install
```

#### 1.3 Configure MongoDB Connection

**Option A: Local MongoDB (if installed)**
- No changes needed - uses localhost:27017

**Option B: MongoDB Atlas (Cloud)**
```bash
# Edit backend/.env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmconnect
```

#### 1.4 Configure Twilio (for OTP)
```bash
# Edit backend/.env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

#### 1.5 Start Backend
```bash
npm start
```

**Expected Output**:
```
App running at http://localhost:8080
Weather scheduler initialized
✓ Connected to MongoDB
```

---

### Step 2: Frontend Setup

#### 2.1 Navigate to frontend folder (in a NEW terminal)
```bash
cd frontend
```

#### 2.2 Install dependencies (if not already done)
```bash
npm install
```

#### 2.3 Start Frontend
```bash
npm start
```

**Expected Output**:
```
Compiled successfully!
You can now view frontend in the browser.
  Local: http://localhost:3000
```

---

## ✅ Verification Checklist

### Backend Check
```bash
# Should see no errors
npm start

# Verify endpoints work
curl http://localhost:8080
# Response: "Farmer Trader Platform"
```

### Frontend Check
```
Open http://localhost:3000 in browser
Should load homepage without errors
```

### API Connection Check
1. Go to http://localhost:3000
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try logging in
5. Check if requests are going to http://localhost:8080 (✅ OK)

---

## 🔍 Testing the Transport System

### 1. Create a Test User (Transporter)
```bash
# Use the Register page
# Select Role: "Transport"
# Complete registration
```

### 2. Test Vehicle Management
```
1. Login as Transporter
2. Go to Dashboard
3. Click "Vehicle Management"
4. Click "Add New Vehicle"
5. Fill form:
   - Name: "Test Tempo"
   - Number: "MH01TEST1234"
   - Type: "Tempo"
   - Min Weight: 100 kg
   - Max Weight: 1000 kg
   - Load Capacity: 1000 kg
   - Base Fare: 500
   - Per KM Fare: 10
6. Submit
7. Verify vehicle appears in list
```

### 3. Test Order Availability
```
1. Create Farmer and Trader accounts
2. Farmer creates Crop
3. Trader places Order
4. Farmer signs Agreement
5. Trader signs Agreement
6. Order status becomes "Ready for Pickup"
7. Transporter sees order in "Available Orders"
```

### 4. Test Vehicle Suggestion
```
1. In Available Orders
2. Click on order (shows weight, e.g., 500 kg)
3. System should suggest vehicles with:
   - Min Weight ≤ 500 kg
   - Max Weight ≥ 500 kg
4. Select suggested vehicle
5. Click "Accept Order & Proceed"
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: `Cannot find module 'mongoose'`
```bash
cd backend
npm install
npm start
```

**Error**: `Port 8080 already in use`
```bash
# Kill the process
lsof -ti:8080 | xargs kill -9
# Or change port in .env
PORT=8081
```

**Error**: `MongoDB connection failed`
```bash
# Check if MongoDB is running
# Option 1: Start local MongoDB
mongod

# Option 2: Use MongoDB Atlas
# Update MONGODB_URI in .env with your connection string
```

---

### Frontend Won't Start

**Error**: `npm: command not found`
```bash
# Install Node.js from https://nodejs.org/
```

**Error**: `Port 3000 already in use`
```bash
# Kill process
lsof -ti:3000 | xargs kill -9
# Then start again
npm start
```

**Error**: `Cannot find module 'react'`
```bash
cd frontend
npm install
npm start
```

---

### API Calls Fail

**Error**: `404 Not Found` on API calls
```
Check:
1. Backend is running on port 8080
2. REACT_APP_API_URL=http://localhost:8080 in .env
3. Token is present in localStorage
```

**Error**: `401 Unauthorized`
```
Check:
1. User is logged in
2. Token is stored in localStorage
3. Token format is correct: "Bearer {token}"
```

**Error**: `403 Forbidden`
```
Check:
1. User role matches endpoint (e.g., "transport" for vehicle endpoints)
2. Token is valid and not expired
```

---

## 📝 Environment Variables Reference

### Backend (.env)
```
# Server
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/farmconnect

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Twilio (SMS/OTP)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### Frontend (.env)
```
# API Configuration
REACT_APP_API_URL=http://localhost:8080
```

---

## 📊 API Endpoints Summary

### Vehicle Management
```
POST   /api/vehicles/add                      Add vehicle
GET    /api/vehicles/my-vehicles             Get all vehicles
GET    /api/vehicles/:vehicleId              Get vehicle
PUT    /api/vehicles/:vehicleId/update       Update vehicle
DELETE /api/vehicles/:vehicleId/delete       Delete vehicle
PUT    /api/vehicles/:vehicleId/availability Toggle availability
```

### Order & Matching
```
GET    /api/vehicles/orders/available        Get available orders
GET    /api/vehicles/suggest/:orderId        Get suggestions
GET    /api/vehicles/weight-range/filter     Filter by weight
```

---

## 🎯 Quick Start (5 minutes)

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start
# Should see: "App running at http://localhost:8080"

# Terminal 2 - Frontend
cd frontend
npm install
npm start
# Should see: "You can now view frontend at http://localhost:3000"
```

---

## ✨ What's New in This Update

1. ✅ Fixed Axios baseURL configuration
2. ✅ Added transporter role protection to routes
3. ✅ Created .env files with required variables
4. ✅ Added comprehensive setup guide

---

## 🚀 Status: READY TO USE

All issues have been fixed. The system is now:
- ✅ Properly configured
- ✅ Secured with role checks
- ✅ Connected to correct API endpoints
- ✅ Ready for testing

**Next Step**: Start both servers and test the vehicle management system!

---

## 📞 Support

For issues:
1. Check troubleshooting section above
2. Verify .env files are configured
3. Check browser console for errors
4. Check terminal output for backend errors
5. Ensure MongoDB is running
6. Verify Node.js version (v16+)

---

**Happy Coding! 🎉**
