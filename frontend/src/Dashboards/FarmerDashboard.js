import Layout from "../components/layout/Layout";
import FarmerMenu from "./FamerMenu";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  FileText,
  ClipboardCheck,
  Truck,
  CloudSun,
  BarChartLine,
  People,
  Wallet,
  CalendarCheck,
  InfoCircle,
} from "react-bootstrap-icons";

const FarmerDashboard = () => {
  const features = [
    {
      title: "Add Crop Details",
      icon: <PlusCircle size={40} className="mb-2" />,
      description:
        "Add and manage your crop information, quantity, and prices.",
      link: "/farmer/add-crop",
      color: "success",
    },
    {
      title: "KYC Verification",
      icon: <FileText size={40} className="mb-2" />,
      description: "Submit or check the status of your KYC documents.",
      link: "/farmer/kyc",
      color: "primary",
    },
    {
      title: "My Orders",
      icon: <ClipboardCheck size={40} className="mb-2" />,
      description: "View your past and current orders with status updates.",
      link: "/farmer/orders",
      color: "warning",
    },
    {
      title: "Transportation Details",
      icon: <Truck size={40} className="mb-2" />,
      description:
        "Manage transportation and delivery schedules for your crops.",
      link: "/farmer/transport",
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
      description:
        "Check current crop market prices to sell at the best rates.",
      link: "/farmer/market-prices",
      color: "dark",
    },
    {
      title: "Community",
      icon: <People size={40} className="mb-2" />,
      description: "Connect with other farmers, share tips, and get advice.",
      link: "/farmer/community",
      color: "success",
    },
    {
      title: "Payments & Earnings",
      icon: <Wallet size={40} className="mb-2" />,
      description: "Track your payments, earnings, and pending transactions.",
      link: "/farmer/payments",
      color: "warning",
    },
    {
      title: "Farm Calendar",
      icon: <CalendarCheck size={40} className="mb-2" />,
      description:
        "Schedule tasks, track harvest, and maintain farm activities.",
      link: "/farmer/calendar",
      color: "info",
    },
    {
      title: "Farm Info & Support",
      icon: <InfoCircle size={40} className="mb-2" />,
      description:
        "Access guidelines, help, and agricultural support services.",
      link: "/farmer/support",
      color: "primary",
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
            <p className="text-muted mb-4">
              Access all features to manage your farm, crops, orders, payments,
              and more.
            </p>

            {/* Feature Cards */}
            <div className="row g-4">
              {features.map((feature, idx) => (
                <div className="col-12 col-sm-6 col-lg-4" key={idx}>
                  <div
                    className={`card border-${feature.color} shadow-sm h-100 feature-card`}
                    style={{
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
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
