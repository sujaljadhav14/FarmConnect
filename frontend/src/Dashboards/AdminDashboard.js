import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AdminMenu from "./AdminMenu";
import axios from "axios";
import { useAuth } from "../context/authContext";
import {
  People,
  FileEarmarkCheck,
  BoxSeam,
  CashStack,
  PersonCheck,
  ShopWindow,
  TruckFront,
  GraphUp,
} from "react-bootstrap-icons";

const AdminDashboard = () => {
  const { auth } = useAuth();
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalTraders: 0,
    totalTransporters: 0,
    pendingKYC: 0,
    approvedKYC: 0,
    totalCrops: 0,
    totalOrders: 0,
    platformRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch KYC stats
      const kycRes = await axios.get("/api/auth/get-all-kyc", {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      const kycData = kycRes.data?.kycData || [];

      setStats({
        totalFarmers: kycData.filter(k => k.userId?.role === "farmer").length,
        totalTraders: kycData.filter(k => k.userId?.role === "trader").length,
        totalTransporters: kycData.filter(k => k.userId?.role === "transport").length,
        pendingKYC: kycData.filter(k => k.status === "Pending").length,
        approvedKYC: kycData.filter(k => k.status === "Approved").length,
        totalCrops: 0, // Would need separate API
        totalOrders: 0, // Would need separate API
        platformRevenue: 0, // Would need separate API
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Farmers", value: stats.totalFarmers, icon: <People size={28} />, color: "success" },
    { title: "Traders", value: stats.totalTraders, icon: <ShopWindow size={28} />, color: "primary" },
    { title: "Transporters", value: stats.totalTransporters, icon: <TruckFront size={28} />, color: "info" },
    { title: "Pending KYC", value: stats.pendingKYC, icon: <FileEarmarkCheck size={28} />, color: "warning" },
  ];

  return (
    <Layout title="Admin Dashboard">
      <div className="container-fluid mt-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 mb-3">
            <AdminMenu />
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10">
            <h2 className="text-danger mb-4">🛠 Admin Dashboard</h2>

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
                              stat.value.toLocaleString()
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

            {/* Farmer Network Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">🌾 Farmer Network Overview</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-4">
                    <div className="p-3">
                      <PersonCheck size={40} className="text-success mb-2" />
                      <h3 className="text-success">{loading ? "-" : stats.totalFarmers}</h3>
                      <p className="text-muted mb-0">Registered Farmers</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3">
                      <FileEarmarkCheck size={40} className="text-primary mb-2" />
                      <h3 className="text-primary">{loading ? "-" : stats.approvedKYC}</h3>
                      <p className="text-muted mb-0">KYC Verified</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3">
                      <GraphUp size={40} className="text-warning mb-2" />
                      <h3 className="text-warning">{loading ? "-" : stats.approvedKYC > 0 ? Math.round((stats.approvedKYC / (stats.totalFarmers + stats.totalTraders + stats.totalTransporters)) * 100) : 0}%</h3>
                      <p className="text-muted mb-0">Verification Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted mb-4">
              Manage users, KYC verification, and system controls.
            </p>

            <div className="row g-4">
              {/* KYC Management */}
              <DashboardCard
                title="KYC Management"
                text="View, approve or reject user KYC documents."
                link="/admin/kyc"
                btnText="Manage KYC"
                btnClass="btn-danger"
                badge={stats.pendingKYC > 0 ? stats.pendingKYC : null}
              />

              {/* Users */}
              <DashboardCard
                title="User Management"
                text="View all registered users and roles."
                btnText="Coming Soon"
                btnClass="btn-secondary"
                disabled
              />

              {/* Reports */}
              <DashboardCard
                title="Platform Reports"
                text="Platform statistics and activity reports."
                btnText="Coming Soon"
                btnClass="btn-secondary"
                disabled
              />

              {/* Transactions */}
              <DashboardCard
                title="Transactions"
                text="Monitor all platform payments and transactions."
                btnText="Coming Soon"
                btnClass="btn-secondary"
                disabled
              />

              {/* Disputes */}
              <DashboardCard
                title="Dispute Resolution"
                text="Handle user disputes and complaints."
                btnText="Coming Soon"
                btnClass="btn-secondary"
                disabled
              />

              {/* Settings */}
              <DashboardCard
                title="Platform Settings"
                text="Configure platform fees, limits and policies."
                btnText="Coming Soon"
                btnClass="btn-secondary"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

/* Dashboard Card */
const DashboardCard = ({ title, text, link, btnText, btnClass, disabled, badge }) => (
  <div className="col-md-4">
    <div className="card shadow-sm h-100">
      <div className="card-body text-center">
        <h5 className="card-title">
          {title}
          {badge && <span className="badge bg-danger ms-2">{badge}</span>}
        </h5>
        <p className="card-text small text-muted">{text}</p>
        {link ? (
          <Link
            to={link}
            className={`btn ${btnClass} btn-sm`}
            disabled={disabled}
          >
            {btnText}
          </Link>
        ) : (
          <button className={`btn ${btnClass} btn-sm`} disabled>
            {btnText}
          </button>
        )}
      </div>
    </div>
  </div>
);

export default AdminDashboard;

