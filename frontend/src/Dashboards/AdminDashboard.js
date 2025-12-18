import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AdminMenu from "./AdminMenu";

const AdminDashboard = () => {
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
                title="Reports"
                text="Platform statistics and activity reports."
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
const DashboardCard = ({ title, text, link, btnText, btnClass, disabled }) => (
  <div className="col-md-4">
    <div className="card shadow-sm h-100">
      <div className="card-body text-center">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{text}</p>
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
