import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Speedometer2,
  ClipboardCheck,
  FileEarmarkText,
  CartCheck,
  Basket3,
} from "react-bootstrap-icons";

const TraderMenu = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: <Speedometer2 className="me-2" />,
      path: "/trader/dashboard",
    },
    {
      name: "Browse Crops",
      icon: <Basket3 className="me-2" />,
      path: "/trader/crops",
    },
    {
      name: "My Orders",
      icon: <CartCheck className="me-2" />,
      path: "/trader/my-orders",
    },
    {
      name: "KYC Verification",
      icon: <ClipboardCheck className="me-2" />,
      path: "/trader/kyc",
    },
    {
      name: "My KYC",
      icon: <FileEarmarkText className="me-2" />,
      path: "/trader/kyc-data",
    },
  ];

  return (
    <div className="card shadow-sm rounded-4 border-0">
      <div className="card-header bg-primary text-white text-center fw-semibold rounded-top-4">
        Trader Menu
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

export default TraderMenu;
