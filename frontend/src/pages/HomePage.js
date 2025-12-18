// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);

        // Redirect to dashboard based on role
        if (parsed.user?.role) {
          switch (parsed.user.role) {
            case "farmer":
              navigate("/farmer/dashboard");
              break;
            case "trader":
              navigate("/trader/dashboard");
              break;
            case "transport":
              navigate("/transport/dashboard");
              break;
            case "admin":
              navigate("/admin/dashboard");
              break;
            default:
              break;
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [navigate]);

  const features = [
    {
      title: "💰 Fair Pricing",
      description:
        "Farmers get the right price for their produce without middlemen.",
      color: "success",
    },
    {
      title: "🔒 Secure Payments",
      description: "Payments go directly to farmers with advance options.",
      color: "primary",
    },
    {
      title: "🤝 Connect Traders",
      description:
        "Traders and customers can directly connect with verified farmers.",
      color: "warning",
    },
    {
      title: "📊 Track & Manage",
      description: "Farmers can track sales, stock, and orders in one place.",
      color: "info",
    },
  ];

  return (
    <Layout>
      <div
        className="homepage-wrapper d-flex flex-column justify-content-center align-items-center text-center"
        style={{
          minHeight: "80vh",
          padding: "40px 20px",
          background: "linear-gradient(135deg, #e0f7e9, #ffffff)",
        }}
      >
        {/* Hero Section */}
        <h1 className="fw-bold text-success mb-3 display-5">
          🌾 Welcome to FarmConnect 🌱
        </h1>
        <p className="text-muted mb-5 fs-5" style={{ maxWidth: "700px" }}>
          FarmConnect is your digital bridge between farmers and traders! Our
          goal is to ensure fair pricing, safe transactions, and faster payments
          💸 while empowering farmers across rural areas 🌿.
        </p>

        {/* User Greeting */}
        {user && (
          <div
            className="bg-white p-4 rounded-4 shadow-sm mb-5 w-100"
            style={{ maxWidth: "500px" }}
          >
            <h5 className="text-success fw-semibold mb-2">
              👋 Hello, {user.name || user.phone}!
            </h5>
            <p className="text-muted mb-0">
              You are logged in. Explore markets, manage your produce, and
              connect with traders safely 🚜.
            </p>
          </div>
        )}

        {/* Features Section */}
        <div className="row justify-content-center g-4 w-100">
          {features.map((feature, idx) => (
            <div className="col-12 col-sm-6 col-md-4" key={idx}>
              <div
                className={`card text-${feature.color} shadow feature-card h-100`}
                style={{
                  borderRadius: "20px",
                  padding: "20px",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  backgroundColor: "#ffffff",
                }}
              >
                <h4 className="card-title mb-3">{feature.title}</h4>
                <p className="card-text text-muted">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted mt-5 fs-5" style={{ maxWidth: "700px" }}>
          Whether you are a farmer 🌾 or a trader 🤝, FarmConnect helps you work
          efficiently and safely in one platform 🚀.
        </p>

        {/* Inline CSS for hover effects */}
        <style>
          {`
            .feature-card:hover {
              transform: translateY(-8px);
              box-shadow: 0 12px 25px rgba(0,0,0,0.15);
            }
          `}
        </style>
      </div>
    </Layout>
  );
};

export default HomePage;
