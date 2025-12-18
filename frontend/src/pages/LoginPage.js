import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Layout from "../components/layout/Layout";

const API = process.env.REACT_APP_API;

const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  if (auth?.user) navigate("/");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone.trim() || !password.trim())
      return toast.error("All fields are required");

    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/auth/login`, {
        phone: phone.trim(),
        password: password.trim(),
      });

      setAuth({
        user: res.data.user,
        token: res.data.token,
      });

      toast.success("Login Successful");

      // Role-based redirect
      const userRole = res.data.user.role;
      switch (userRole) {
        case "farmer":
          navigate("/farmer/dashboard");
          break;
        case "trader":
          navigate("/trader/dashboard");
          break;
        case "transport":
          navigate("/transport/dashboard");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", background: "#f1f9f1", padding: "20px" }}
      >
        <div
          className="card shadow-lg p-4"
          style={{
            maxWidth: "420px",
            width: "100%",
            borderRadius: "18px",
          }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="fw-bold text-success">Login</h3>
            <p className="text-muted small">Login using Phone & Password</p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Phone */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-telephone"></i>
                </span>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\s+/g, ""); // remove spaces

                    // Auto add +91 if user types 10-digit number
                    if (/^\d{10}$/.test(value)) {
                      value = "+91" + value;
                    }

                    // Prevent double +
                    if (value.startsWith("++")) {
                      value = value.replace("++", "+");
                    }

                    // Prevent double +91
                    if (value.startsWith("+91+91")) {
                      value = value.replace("+91+91", "+91");
                    }

                    setPhone(value);
                  }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              className="btn w-100 text-white fw-semibold"
              disabled={loading}
              style={{
                background: "linear-gradient(90deg, #28a745, #1e7e34)",
                borderRadius: "10px",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="text-center my-3">
            <span className="text-muted small">OR</span>
          </div>

          {/* Switch to OTP Login */}
          <Link
            to="/otp-login"
            className="btn btn-outline-success w-100 fw-semibold"
            style={{ borderRadius: "10px" }}
          >
            Login with OTP
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
