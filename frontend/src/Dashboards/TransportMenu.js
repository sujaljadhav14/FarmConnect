import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Speedometer2,
    Truck,
    ClipboardData,
    ClipboardCheck,
    FileText,
} from "react-bootstrap-icons";

const TransportMenu = () => {
    const location = useLocation();

    const menuItems = [
        {
            name: "Dashboard",
            icon: <Speedometer2 className="me-2" />,
            path: "/transport/dashboard",
        },
        {
            name: "Available Deliveries",
            icon: <Truck className="me-2" />,
            path: "/transport/available",
        },
        {
            name: "My Deliveries",
            icon: <ClipboardData className="me-2" />,
            path: "/transport/my-deliveries",
        },
        {
            name: "KYC Verification",
            icon: <ClipboardCheck className="me-2" />,
            path: "/transport/kyc",
        },
        {
            name: "My KYC Data",
            icon: <FileText className="me-2" />,
            path: "/transport/kyc-data",
        },
    ];

    return (
        <div className="card shadow-sm rounded-4 border-0">
            <div className="card-header bg-info text-white text-center fw-semibold rounded-top-4">
                Transport Menu
            </div>

            <div className="list-group list-group-flush">
                {menuItems.map((item, idx) => (
                    <Link
                        key={idx}
                        to={item.path}
                        className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${location.pathname === item.path ? "active fw-semibold" : ""
                            }`}
                    >
                        {item.icon}
                        {item.name}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TransportMenu;
