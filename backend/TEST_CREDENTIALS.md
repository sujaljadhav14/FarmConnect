# Test User Credentials

This document contains all the test user credentials for the Farmer-Trader application.

## 🔐 Admin User

Use this account to access the admin dashboard and manage KYC approvals:

- **Phone:** `+919999999999`
- **Password:** `admin123`
- **Dashboard:** `/admin/dashboard`

---

## 👨‍🌾 Farmer Users

Use any of these accounts to access the farmer dashboard:

### Farmer 1: Ramesh Kumar
- **Phone:** `+919876543210`
- **Password:** `farmer123`
- **Dashboard:** `/farmer/dashboard`

### Farmer 2: Suresh Patil
- **Phone:** `+919876543211`
- **Password:** `farmer123`
- **Dashboard:** `/farmer/dashboard`

### Farmer 3: Rajesh Singh
- **Phone:** `+919876543212`
- **Password:** `farmer123`
- **Dashboard:** `/farmer/dashboard`

---

## 🏪 Trader Users

Use any of these accounts to access the trader dashboard:

### Trader 1: Amit Traders
- **Phone:** `+919876543220`
- **Password:** `trader123`
- **Dashboard:** `/trader/dashboard`

### Trader 2: Vijay Wholesale
- **Phone:** `+919876543221`
- **Password:** `trader123`
- **Dashboard:** `/trader/dashboard`

### Trader 3: Prakash Trading Co
- **Phone:** `+919876543222`
- **Password:** `trader123`
- **Dashboard:** `/trader/dashboard`

---

## 🚚 Transport Users

Use any of these accounts to access the transport dashboard:

### Transport 1: Ram Transport Services
- **Phone:** `+919876543230`
- **Password:** `transport123`
- **Dashboard:** `/transport/dashboard`

### Transport 2: Shyam Logistics
- **Phone:** `+919876543231`
- **Password:** `transport123`
- **Dashboard:** `/transport/dashboard`

---

## 🚀 How to Seed the Database

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Run the seed script:
   ```bash
   npm run seed
   ```

3. You should see a success message with all credentials listed.

4. Now you can login with any of the credentials above!

---

## ⚠️ Important Notes

- The seed script will **delete all existing users** before creating new ones
- If you want to keep existing users, comment out the line in `seedUsers.js`:
  ```javascript
  // await User.deleteMany({});
  ```
- Make sure your MongoDB connection is working before running the seed script
- All passwords are securely hashed using bcrypt
