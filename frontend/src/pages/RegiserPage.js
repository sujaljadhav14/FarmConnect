import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer"); // Default role
  const navigate = useNavigate();

  const handlePhone = (e) => {
    let value = e.target.value.replace(/\s+/g, ""); // remove spaces

    // Remove +91 if user tries to type it manually
    if (value.startsWith("+91")) value = value.replace("+91", "");

    // Allow only numbers
    value = value.replace(/\D/g, "");

    // Limit to 10 digits
    if (value.length > 10) value = value.slice(0, 10);

    // Add +91 prefix automatically
    setPhone("+91" + value);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/register", {
        name,
        phone,
        password,
        role, // Include role in registration
      });

      toast.success("Registered Successfully");
      navigate("/otp-login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Register error");
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-center align-items-center mt-5 mb-5">
        <div
          className="card shadow-lg p-4"
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "16px",
            border: "none",
          }}
        >
          <h3 className="text-center fw-bold mb-4" style={{ color: "#2e7d32" }}>
            Create Your Account
          </h3>

          {/* Form */}
          <form onSubmit={submit}>
            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-person-fill"></i>
                </span>
                <input
                  className="form-control"
                  placeholder="Enter Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Register As</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-briefcase-fill"></i>
                </span>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="farmer">Farmer</option>
                  <option value="trader">Trader</option>
                  <option value="transport">Transport</option>
                </select>
              </div>
              <small className="text-muted">Select your role</small>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Phone (India)</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-phone-fill"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={handlePhone}
                  placeholder="+91XXXXXXXXXX"
                  maxLength={13} // +91 + 10 digits = 13 total characters
                />
              </div>
              <small className="text-muted">Prefix +91 auto-applied</small>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-shield-lock-fill"></i>
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

            {/* Button */}
            <button
              className="btn w-100 text-white fw-semibold py-2"
              style={{
                background: "linear-gradient(135deg, #2e7d32, #1b5e20)",
                borderRadius: "10px",
                fontSize: "1.05rem",
              }}
            >
              Register
            </button>

            {/* Link to login */}
            <div className="text-center mt-3">
              <small>
                Already have an account?{" "}
                <span
                  className="text-success fw-semibold"
                  role="button"
                  onClick={() => navigate("/otp-login")}
                >
                  Login
                </span>
              </small>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
