import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ClipboardCheck, People, BarChartLine } from "react-bootstrap-icons";

const AdminMenu = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "KYC Management",
      icon: <ClipboardCheck className="me-2" />,
      path: "/admin/kyc",
    },
    {
      name: "User Management",
      icon: <People className="me-2" />,
      path: "/admin/users",
    },
    {
      name: "Reports",
      icon: <BarChartLine className="me-2" />,
      path: "/admin/reports",
    },
  ];

  return (
    <div className="card shadow-sm rounded-4 border-0">
      <div className="card-header bg-danger text-white text-center fw-semibold rounded-top-4">
        Admin Menu
      </div>

      <div className="list-group list-group-flush">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${
              location.pathname === item.path ? "active fw-semibold" : ""
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

export default AdminMenu;
