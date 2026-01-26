// src/components/layout/Header.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useLanguage } from "../../context/languageContext";
import LanguageButton from "./LanguageButton";
import toast from "react-hot-toast";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
    toast.success("Logged out successfully 👋");
    navigate("/otp-login");
  };

  const isActive = (path) =>
    location.pathname === path ? "active text-success fw-semibold" : "";

  const userInitial = auth?.user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  // ⭐ Auto Dashboard Path Based on Role
  const getDashboardPath = () => {
    const role = auth?.user?.role;
    if (role === "farmer") return "/farmer/dashboard";
    if (role === "trader") return "/trader/dashboard";
    if (role === "admin") return "/admin/dashboard";
    return "/";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div
            className="rounded-circle bg-light text-white d-flex align-items-center justify-content-center me-2"
            style={{ width: 44, height: 48 }}
          >
            🌾
          </div>
          <strong>FarmConnect</strong>
        </Link>

        {/* Mobile Toggler */}
        <button
          className="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarMenu">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item mx-lg-2">
              <Link className={`nav-link ${isActive("/")}`} to="/">
                {t("common", "home")}
              </Link>
            </li>

            {/* If NOT logged in */}
            {!auth?.user ? (
              <>
                <li className="nav-item mx-lg-2">
                  <Link
                    className={`nav-link ${isActive("/register")}`}
                    to="/register"
                  >
                    {t("common", "register")}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="btn btn-success px-3" to="/otp-login">
                    {t("common", "login")}
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* ⭐ Dashboard Link (role-based) */}
                <li className="nav-item mx-lg-2">
                  <Link
                    className={`nav-link ${isActive(getDashboardPath())}`}
                    to={getDashboardPath()}
                  >
                    {t("common", "dashboard")}
                  </Link>
                </li>

                {/* User Dropdown */}
                <li className="nav-item dropdown ms-lg-3">
                  <button
                    className="btn btn-light border-0 dropdown-toggle d-flex align-items-center px-3 py-1 rounded-5"
                    data-bs-toggle="dropdown"
                  >
                    <div
                      className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2"
                      style={{ width: 30, height: 30 }}
                    >
                      {userInitial}
                    </div>
                    <span className="d-none d-md-inline">
                      {auth?.user?.name}
                    </span>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow-sm mt-2">
                    <li>
                      <button
                        className="dropdown-item text-danger fw-semibold"
                        onClick={handleLogout}
                      >
                        {t("common", "logout")}
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}

            {/* Language Button */}
            <li className="nav-item ms-lg-3">
              <LanguageButton />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
