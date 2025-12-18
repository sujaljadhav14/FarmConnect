import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Speedometer2,
  ClipboardCheck,
  FileEarmarkText,
  CartCheck,
  Basket3,
} from "react-bootstrap-icons";

const FarmerMenu = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: <Speedometer2 className="me-2" />,
      path: "/farmer/dashboard",
    },
    {
      name: "My Crops",
      icon: <Basket3 className="me-2" />,
      path: "/farmer/my-crops",
    },
    {
      name: "KYC Verification",
      icon: <ClipboardCheck className="me-2" />,
      path: "/farmer/kyc",
    },
    {
      name: "My KYC",
      icon: <FileEarmarkText className="me-2" />,
      path: "/farmer/kyc-data",
    },
    {
      name: "My Orders",
      icon: <CartCheck className="me-2" />,
      path: "/farmer/orders",
    },
  ];

  return (
    <div className="card shadow-sm rounded-4 border-0">
      {/* Header */}
      <div className="card-header bg-success text-white text-center fw-semibold rounded-top-4">
        Farmer Menu
      </div>

      {/* Menu Items */}
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

export default FarmerMenu;
