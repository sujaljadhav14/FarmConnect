import Layout from "../components/layout/Layout";
import TransportMenu from "./TransportMenu";
import { Link } from "react-router-dom";
import {
    TruckFront,
    FileText,
    ClipboardCheck,
    MapFill,
    Wallet,
    CalendarCheck,
    Tools,
    InfoCircle,
} from "react-bootstrap-icons";

const TransportDashboard = () => {
    const features = [
        {
            title: "Available Orders",
            icon: <TruckFront size={40} className="mb-2" />,
            description:
                "View available orders from completed trader agreements ready for transport.",
            link: "/transport/available-orders",
            color: "info",
        },
        {
            title: "Active Deliveries",
            icon: <TruckFront size={40} className="mb-2" />,
            description:
                "View and manage your active delivery orders and schedules.",
            link: "/transport/deliveries",
            color: "success",
        },
        {
            title: "KYC Verification",
            icon: <FileText size={40} className="mb-2" />,
            description: "Submit or check the status of your KYC documents.",
            link: "/transport/kyc",
            color: "primary",
        },
        {
            title: "Delivery History",
            icon: <ClipboardCheck size={40} className="mb-2" />,
            description: "View your past deliveries and completion records.",
            link: "/transport/history",
            color: "warning",
        },
        {
            title: "Route Planning",
            icon: <MapFill size={40} className="mb-2" />,
            description:
                "Plan and optimize delivery routes for maximum efficiency.",
            link: "/transport/routes",
            color: "info",
        },
        {
            title: "Earnings & Payments",
            icon: <Wallet size={40} className="mb-2" />,
            description: "Track your earnings, payments, and pending transactions.",
            link: "/transport/payments",
            color: "success",
        },
        {
            title: "Schedule Management",
            icon: <CalendarCheck size={40} className="mb-2" />,
            description:
                "Manage your availability and delivery schedules.",
            link: "/transport/schedule",
            color: "secondary",
        },
        {
            title: "Vehicle Management",
            icon: <Tools size={40} className="mb-2" />,
            description:
                "Manage your vehicle details, maintenance, and documentation.",
            link: "/transport/vehicles",
            color: "dark",
        },
        {
            title: "Support & Help",
            icon: <InfoCircle size={40} className="mb-2" />,
            description:
                "Access help, guidelines, and customer support services.",
            link: "/transport/support",
            color: "primary",
        },
    ];

    return (
        <Layout title="Transport Dashboard">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <TransportMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <h2 className="text-success mb-4">🚚 Transport Dashboard</h2>
                        <p className="text-muted mb-4">
                            Access all features to manage your deliveries, routes, vehicles,
                            earnings, and more.
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

export default TransportDashboard;
