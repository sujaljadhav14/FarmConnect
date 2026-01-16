import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import {
  ClipboardCheck,
  FileText,
  CartCheck,
  BarChartLine,
  Wallet,
  People,
  ChatSquareText,
} from "react-bootstrap-icons";
import TraderMenu from "./TraderMenu";

const TraderDashboard = () => {
  const features = [
    {
      title: "KYC Verification",
      icon: <FileText size={40} className="mb-2" />,
      description: "Submit or track your trader KYC verification.",
      link: "/trader/kyc",
      color: "primary",
    },
    {
      title: "Browse Crops",
      icon: <ClipboardCheck size={40} className="mb-2" />,
      description: "View crops listed by farmers and place orders.",
      link: "/trader/crops",
      color: "success",
    },
    {
      title: "My Proposals",
      icon: <ChatSquareText size={40} className="mb-2" />,
      description: "View and manage your bids on crops.",
      link: "/trader/my-proposals",
      color: "warning",
    },
    {
      title: "My Orders",
      icon: <CartCheck size={40} className="mb-2" />,
      description: "Track placed orders and delivery status.",
      link: "/trader/my-orders",
      color: "info",
    },
    {
      title: "Payments",
      icon: <Wallet size={40} className="mb-2" />,
      description: "Manage advance & final payments to farmers.",
      link: "/trader/payments",
      color: "danger",
    },
    {
      title: "Market Analytics",
      icon: <BarChartLine size={40} className="mb-2" />,
      description: "Analyze price trends and demand.",
      link: "/trader/analytics",
      color: "dark",
    },
    {
      title: "Farmer Network",
      icon: <People size={40} className="mb-2" />,
      description: "Connect and build trust with farmers.",
      link: "/trader/farmers",
      color: "secondary",
    },
  ];

  return (
    <Layout title="Trader Dashboard">
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-md-3 col-lg-2 mb-3">
            <TraderMenu />
          </div>

          <div className="col-md-9 col-lg-10">
            <h2 className="text-primary mb-4">📊 Trader Dashboard</h2>
            <p className="text-muted mb-4">
              Manage orders, payments, analytics, and farmer interactions.
            </p>

            <div className="row g-4">
              {features.map((feature, idx) => (
                <div className="col-12 col-sm-6 col-lg-4" key={idx}>
                  <div
                    className={`card border-${feature.color} shadow-sm h-100 feature-card`}
                  >
                    <div className="card-body text-center">
                      <div className={`text-${feature.color}`}>
                        {feature.icon}
                      </div>
                      <h5 className="card-title mt-2">{feature.title}</h5>
                      <p className="card-text text-muted">
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

export default TraderDashboard;
