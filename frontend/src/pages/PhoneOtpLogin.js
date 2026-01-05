import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import Layout from "../components/layout/Layout";

const PhoneOtpLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState("");

  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  if (auth?.user) navigate("/");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return toast.error("Please enter phone number");

    try {
      setLoading(true);
      const res = await axios.post("/api/auth/send-otp", {
        phone: phone.trim(),
      });
      setStep("otp");
      setDebugOtp(res.data.debugOtp);
      toast.success(res.data.message || "OTP sent");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.error("Please enter OTP");

    try {
      setLoading(true);
      const res = await axios.post("/api/auth/verify-otp", {
        phone: phone.trim(),
        code: otp.trim(),
      });

      setAuth({
        user: res.data.user,
        token: res.data.token,
      });

      toast.success(res.data.message || "Login successful");
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to verify OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setStep("phone");
    setOtp("");
    setDebugOtp("");
  };

  return (
    <Layout>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", padding: "20px", background: "#f6f8fc" }}
      >
        <div
          className="card shadow-lg p-4"
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="fw-bold text-success">
              {step === "phone" ? "Login with Phone" : "Enter OTP"}
            </h3>
            <p className="text-muted small">
              {step === "phone"
                ? "Enter your registered phone number"
                : "Enter the OTP sent to your phone"}
            </p>
          </div>

          {/* STEP 1: Phone */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Phone</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    className="form-control"
                    placeholder="9876543210 or +919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    type="tel"
                  />
                </div>
              </div>

              <button
                className="btn w-100 text-white fw-semibold"
                style={{
                  background: "linear-gradient(90deg, #28a745, #1e7e34)",
                  borderRadius: "8px",
                }}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
              <p className="text-center mt-3 small">
                Prefer password login?{" "}
                <Link to="/login" className="text-success fw-semibold">
                  Login with password
                </Link>
              </p>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <p className="text-muted small mb-2">
                OTP sent to <strong>{phone}</strong>
              </p>

              <div className="mb-3">
                <label className="form-label fw-semibold">OTP</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-shield-lock"></i>
                  </span>
                  <input
                    className="form-control"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    type="number"
                  />
                </div>
              </div>

              <button
                className="btn w-100 text-white fw-semibold mb-2"
                style={{
                  background: "linear-gradient(90deg, #28a745, #1e7e34)",
                  borderRadius: "8px",
                }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                style={{ borderRadius: "8px" }}
                onClick={handleChangeNumber}
              >
                Change phone number
              </button>
            </form>
          )}

          {/* Debug OTP */}
          {debugOtp && (
            <div className="alert alert-warning mt-3 p-2 small">
              <strong>Debug OTP:</strong> {debugOtp}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PhoneOtpLogin;
