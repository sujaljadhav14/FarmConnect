import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import TraderMenu from "../Dashboards/TraderMenu";

const TraderKYC_Data = () => {
  const { auth } = useAuth();
  const [kyc, setKyc] = useState(null);
  const [status, setStatus] = useState("loading");

  const fetchMyKYC = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/my-kyc", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (data.status === "not_submitted") {
        setStatus("not_submitted");
        setKyc(null);
      } else {
        setStatus(data.status);
        setKyc(data.kyc);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load KYC details");
      setStatus("error");
    }
  }, [auth?.token]);

  useEffect(() => {
    if (auth?.token) fetchMyKYC();
  }, [auth?.token, fetchMyKYC]);

  const badgeClass = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };

  return (
    <Layout title="My KYC">
      <div className="container-fluid mt-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 mb-3">
            <TraderMenu />
          </div>

          {/* Content */}
          <div className="col-md-9 col-lg-10">
            <div className="card shadow p-4 col-md-8">
              <h3 className="text-primary mb-3">🏢 My Trader KYC Details</h3>

              {/* LOADING */}
              {status === "loading" && (
                <p className="text-muted">Loading KYC details...</p>
              )}

              {/* NOT SUBMITTED */}
              {status === "not_submitted" && (
                <div className="alert alert-info">
                  ❗ KYC not submitted yet.
                  <div className="mt-3">
                    <Link to="/trader/kyc" className="btn btn-primary">
                      Submit KYC
                    </Link>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {status === "error" && (
                <div className="alert alert-danger">
                  Failed to load KYC. Please try again.
                </div>
              )}

              {/* KYC DATA */}
              {kyc && (
                <>
                  <div className="mb-3">
                    <span
                      className={`badge bg-${badgeClass[status]} px-3 py-2`}
                    >
                      Status: {status.toUpperCase()}
                    </span>
                  </div>

                  {/* STATUS ALERTS */}
                  {status === "approved" && (
                    <div className="alert alert-success">
                      ✅ Your KYC is approved. You can start trading.
                    </div>
                  )}

                  {status === "pending" && (
                    <div className="alert alert-warning">
                      ⏳ KYC is under verification (24–48 hours).
                    </div>
                  )}

                  {status === "rejected" && (
                    <div className="alert alert-danger">
                      ❌ KYC Rejected
                      <br />
                      <strong>Reason:</strong>{" "}
                      {kyc.adminRemark || "Not specified"}
                    </div>
                  )}

                  <hr />

                  {/* DOCUMENTS */}
                  <h5 className="mb-3">📂 Uploaded Documents</h5>

                  <ul className="list-group">
                    <DocumentItem label="Aadhaar Card" file={kyc.aadhaarDocument} />

                    <DocumentItem label="PAN Card" file={kyc.panDocument} />

                    <DocumentItem label="Selfie" file={kyc.selfie} />

                    {kyc.gst && (
                      <DocumentItem label="GST Certificate" file={kyc.gst} />
                    )}

                    {kyc.businessReg && (
                      <DocumentItem
                        label="Business Registration"
                        file={kyc.businessReg}
                      />
                    )}
                  </ul>

                  {/* RESUBMIT */}
                  {status === "rejected" && (
                    <div className="text-center mt-4">
                      <Link to="/trader/kyc" className="btn btn-danger">
                        Re-submit KYC
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const DocumentItem = ({ label, file }) => (
  <li className="list-group-item d-flex justify-content-between align-items-center">
    <span>{label}</span>
    <a
      href={`/uploads/${file}`}
      target="_blank"
      rel="noreferrer"
      className="btn btn-sm btn-outline-primary"
    >
      View
    </a>
  </li>
);

export default TraderKYC_Data;
