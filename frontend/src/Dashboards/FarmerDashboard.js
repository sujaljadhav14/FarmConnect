import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import FarmerMenu from "./FamerMenu";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext";
import {
  PlusCircle,
  FileText,
  ClipboardCheck,
  CloudSun,
  BarChartLine,
  People,
  CalendarCheck,
  CreditCard,
  GraphUp,
  BoxSeam,
  CashStack,
  ExclamationTriangle,
} from "react-bootstrap-icons";

const FarmerDashboard = () => {
  const { auth } = useAuth();
  const [stats, setStats] = useState({
    totalCrops: 0,
    activeCrops: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = React.useCallback(async () => {
    try {
      // Fetch crops stats
      const cropsRes = await axios.get("/api/crops/my-crops", {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      // Fetch orders stats
      const ordersRes = await axios.get("/api/orders/farmer/my-orders", {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      const crops = cropsRes.data?.crops || [];
      const orders = ordersRes.data?.orders || [];

      setStats({
        totalCrops: crops.length,
        activeCrops: crops.filter(c => c.status === "Available").length,
        pendingOrders: orders.filter(o => ["Pending", "Confirmed", "Processing"].includes(o.status)).length,
        completedOrders: orders.filter(o => o.status === "Completed").length,
        totalEarnings: orders.filter(o => o.status === "Completed").reduce((sum, o) => sum + (o.totalPrice || 0), 0),
        pendingPayments: orders.filter(o => o.status === "Confirmed").reduce((sum, o) => sum + (o.totalPrice || 0), 0),
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const statCards = [
    { title: "Total Crops", value: stats.totalCrops, icon: <BoxSeam size={28} />, color: "success", suffix: "" },
    { title: "Active Listings", value: stats.activeCrops, icon: <GraphUp size={28} />, color: "primary", suffix: "" },
    { title: "Pending Orders", value: stats.pendingOrders, icon: <ClipboardCheck size={28} />, color: "warning", suffix: "" },
    { title: "Total Earnings", value: stats.totalEarnings, icon: <CashStack size={28} />, color: "success", suffix: "", prefix: "₹" },
  ];

  const features = [
    {
      title: "Add Crop Details",
      icon: <PlusCircle size={40} className="mb-2" />,
      description: "Add and manage your crop information, quantity, and prices.",
      link: "/farmer/add-crop",
      color: "success",
    },
    {
      title: "My Crops",
      icon: <BoxSeam size={40} className="mb-2" />,
      description: "View and manage all your listed crops.",
      link: "/farmer/my-crops",
      color: "primary",
    },
    {
      title: "My Orders",
      icon: <ClipboardCheck size={40} className="mb-2" />,
      description: "View your past and current orders with status updates.",
      link: "/farmer/my-orders",
      color: "warning",
    },
    {
      title: "Bank Details",
      icon: <CreditCard size={40} className="mb-2" />,
      description: "Add your bank account for receiving payments.",
      link: "/farmer/bank-details",
      color: "info",
    },
    {
      title: "Weather Updates",
      icon: <CloudSun size={40} className="mb-2" />,
      description: "Get real-time weather updates for your farm location.",
      link: "/farmer/weather",
      color: "secondary",
    },
    {
      title: "Market Prices",
      icon: <BarChartLine size={40} className="mb-2" />,
      description: "Check current crop market prices to sell at the best rates.",
      link: "/farmer/market-prices",
      color: "dark",
    },
    {
      title: "KYC Verification",
      icon: <FileText size={40} className="mb-2" />,
      description: "Submit or check the status of your KYC documents.",
      link: "/farmer/kyc",
      color: "primary",
    },
    {
      title: "Community",
      icon: <People size={40} className="mb-2" />,
      description: "Connect with other farmers, share tips, and get advice.",
      link: "/farmer/community",
      color: "success",
    },
    {
      title: "Farm Calendar",
      icon: <CalendarCheck size={40} className="mb-2" />,
      description: "Schedule tasks, track harvest, and maintain farm activities.",
      link: "/farmer/calendar",
      color: "info",
    },
  ];

  return (
    <Layout title="Farmer Dashboard">
      <div className="container-fluid mt-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 mb-3">
            <FarmerMenu />
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10">
            <h2 className="text-success mb-4">🌾 Farmer Dashboard</h2>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              {statCards.map((stat, idx) => (
                <div className="col-6 col-md-3" key={idx}>
                  <div className={`card border-${stat.color} shadow-sm h-100`}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p className="text-muted mb-1 small">{stat.title}</p>
                          <h4 className={`mb-0 text-${stat.color}`}>
                            {loading ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <>{stat.prefix}{stat.value.toLocaleString()}{stat.suffix}</>
                            )}
                          </h4>
                        </div>
                        <div className={`text-${stat.color} opacity-75`}>
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {stats.pendingOrders > 0 && (
              <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                <ExclamationTriangle className="me-2" size={20} />
                <div>
                  You have <strong>{stats.pendingOrders}</strong> pending order(s) that need attention.
                  <Link to="/farmer/orders" className="alert-link ms-2">View Orders →</Link>
                </div>
              </div>
            )}

            <p className="text-muted mb-4">
              Access all features to manage your farm, crops, orders, payments, and more.
            </p>

            {/* Feature Cards */}
            <div className="row g-4">
              {features.map((feature, idx) => (
                <div className="col-12 col-sm-6 col-lg-4" key={idx}>
                  <div
                    className={`card border-${feature.color} shadow-sm h-100 feature-card`}
                    style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                  >
                    <div className="card-body text-center">
                      <div className={`text-${feature.color}`}>
                        {feature.icon}
                      </div>
                      <h5 className="card-title mt-2">{feature.title}</h5>
                      <p className="card-text text-muted small">
                        {feature.description}
                      </p>
                      <Link
                        to={feature.link}
                        className={`btn btn-${feature.color} w-100`}
                      >
                        Go
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inline CSS for hover effect */}
      <style>
        {`
          .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          }
        `}
      </style>
    </Layout>
  );
};

export default FarmerDashboard;

