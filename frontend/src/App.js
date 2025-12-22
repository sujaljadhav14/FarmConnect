// src/App.jsx
import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegiserPage";
import OtpLoginPage from "./pages/OtpLoginPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./Dashboards/AdminDashboard";
import FarmerDashboard from "./Dashboards/FarmerDashboard";
import TraderDashboard from "./Dashboards/TraderDashboard";
import TransportDashboard from "./Dashboards/TransportDashboard";
import Unauthorized from "./pages/Unauthorized";
import RoleProtectedRoute from "./Routes/RoleProtectedRoute";
import FarmerKYC from "./KYC/FarmerKYC";
import FarmerKYC_Data from "./KYC/FarmerKYC_Data";
import AdminKYC from "./KYC/AdminKYC";
import TraderKYC from "./KYC/TraderKYC";
import TraderKYC_Data from "./KYC/TraderKYC_Data";

// Farmer Pages
import AddCrop from "./pages/farmer/AddCrop";
import MyCrops from "./pages/farmer/MyCrops";
import FarmerMyOrders from "./pages/farmer/MyOrders";
import OrderDetails from "./pages/farmer/OrderDetails";
import CommunityPage from "./pages/farmer/CommunityPage";
import FarmCalendarPage from "./pages/farmer/FarmCalendarPage";
import WeatherPage from "./pages/farmer/WeatherPage";

// Trader Pages
import BrowseCrops from "./pages/trader/BrowseCrops";
import CropDetails from "./pages/trader/CropDetails";
import PlaceOrder from "./pages/trader/PlaceOrder";
import TraderMyOrders from "./pages/trader/MyOrders";

// Transport Pages
import AvailableDeliveries from "./pages/transport/AvailableDeliveries";
import MyDeliveries from "./pages/transport/MyDeliveries";

const App = () => {
  return (
    <>
      {/* Page content */}
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/otp-login" element={<OtpLoginPage />} />

        <Route
          path="/farmer/dashboard"
          element={
            <RoleProtectedRoute role="farmer">
              <FarmerDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer/kyc"
          element={
            <RoleProtectedRoute role="farmer">
              <FarmerKYC />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer/kyc-data"
          element={
            <RoleProtectedRoute role="farmer">
              <FarmerKYC_Data />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer/add-crop"
          element={
            <RoleProtectedRoute role="farmer">
              <AddCrop />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer/edit-crop/:id"
          element={
            <RoleProtectedRoute role="farmer">
              <AddCrop />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer/my-crops"
          element={
            <RoleProtectedRoute role="farmer">
              <MyCrops />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer/orders"
          element={
            <RoleProtectedRoute role="farmer">
              <FarmerMyOrders />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer/order/:id"
          element={
            <RoleProtectedRoute role="farmer">
              <OrderDetails />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer/community"
          element={
            <RoleProtectedRoute role="farmer">
              <CommunityPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer/calendar"
          element={
            <RoleProtectedRoute role="farmer">
              <FarmCalendarPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/farmer/weather"
          element={
            <RoleProtectedRoute role="farmer">
              <WeatherPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/trader/crops"
          element={
            <RoleProtectedRoute role="trader">
              <BrowseCrops />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/trader/crop/:id"
          element={
            <RoleProtectedRoute role="trader">
              <CropDetails />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/trader/place-order/:cropId"
          element={
            <RoleProtectedRoute role="trader">
              <PlaceOrder />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/trader/my-orders"
          element={
            <RoleProtectedRoute role="trader">
              <TraderMyOrders />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/trader/dashboard"
          element={
            <RoleProtectedRoute role="trader">
              <TraderDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/trader/kyc"
          element={
            <RoleProtectedRoute role="trader">
              <TraderKYC />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/trader/kyc-data"
          element={
            <RoleProtectedRoute role="trader">
              <TraderKYC_Data />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/transport/available"
          element={
            <RoleProtectedRoute role="transport">
              <AvailableDeliveries />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/transport/my-deliveries"
          element={
            <RoleProtectedRoute role="transport">
              <MyDeliveries />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/transport/dashboard"
          element={
            <RoleProtectedRoute role="transport">
              <TransportDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute role="admin">
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/kyc"
          element={
            <RoleProtectedRoute role="admin">
              <AdminKYC />
            </RoleProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
};

export default App;
