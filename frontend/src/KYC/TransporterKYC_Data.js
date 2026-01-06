import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/layout/Layout";
import TransportMenu from "../Dashboards/TransportMenu";
import { useAuth } from "../context/authContext";
import axios from "axios";
import toast from "react-hot-toast";

const TransporterKYC_Data = () => {
  const { auth } = useAuth();
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKYCData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/auth/my-kyc", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (data.kyc) {
        setKyc(data.kyc);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch KYC data");
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (auth?.token) {
      fetchKYCData();
    }
  }, [auth?.token, fetchKYCData]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: "badge bg-warning text-dark",
      approved: "badge bg-success",
      rejected: "badge bg-danger",
    };
    return badges[status] || "badge bg-secondary";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <Layout title="My KYC Data">
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-md-3 col-lg-2 mb-3">
            <TransportMenu />
          </div>

          <div className="col-md-9 col-lg-10">
            <div className="card shadow p-4 rounded-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-info mb-0">🚛 My KYC Details</h3>
                {kyc && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => window.print()}
                    >
                      🖨️ Print
                    </button>
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => window.location.reload()}
                    >
                      🔄 Refresh
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : !kyc ? (
                <div className="alert alert-warning">
                  <strong>No KYC Data Found!</strong>
                  <p className="mb-0 mt-2">
                    You haven't submitted your KYC yet. Please complete your KYC
                    verification to access all features.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary Status Card */}
                  <div className="alert alert-light border shadow-sm">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                          <strong className="me-2">Status:</strong>
                          <span className={getStatusBadge(kyc.status)}>
                            {kyc.status?.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-muted small">
                          <div>📅 Submitted: {formatDate(kyc.createdAt)}</div>
                          {kyc.updatedAt !== kyc.createdAt && (
                            <div>🔄 Updated: {formatDate(kyc.updatedAt)}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="small">
                          <div><strong>License:</strong> {kyc.licenseNumber || "N/A"}</div>
                          <div><strong>Vehicle:</strong> {kyc.vehicleNumber || "N/A"}</div>
                          <div><strong>Type:</strong> {kyc.vehicleType || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                    {kyc.adminRemark && (
                      <div className="mt-3 pt-3 border-top">
                        <strong>📝 Admin Remark:</strong>
                        <p className="mb-0 mt-1 text-muted fst-italic">{kyc.adminRemark}</p>
                      </div>
                    )}
                  </div>

                  {/* Documents Section */}
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <h5 className="text-muted mb-3 d-flex align-items-center">
                        <span className="badge bg-info text-white me-2">1</span>
                        Personal Documents
                      </h5>

                      <DocumentCard
                        label="Aadhaar / PAN Card"
                        filename={kyc.aadhaarPan}
                      />
                      <DocumentCard label="Selfie Photo" filename={kyc.selfie} />

                      <h5 className="text-muted mb-3 mt-4 d-flex align-items-center">
                        <span className="badge bg-info text-white me-2">2</span>
                        License Information
                      </h5>

                      <DocumentCard
                        label="Driving License"
                        filename={kyc.drivingLicense}
                      />

                      <div className="card mb-3">
                        <div className="card-body">
                          <p className="mb-2">
                            <strong>License Number:</strong>{" "}
                            {kyc.licenseNumber || "N/A"}
                          </p>
                          <p className="mb-0">
                            <strong>License Expiry:</strong>{" "}
                            {formatDate(kyc.licenseExpiry)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h5 className="text-muted mb-3 d-flex align-items-center">
                        <span className="badge bg-info text-white me-2">3</span>
                        Vehicle Information
                      </h5>

                      <DocumentCard
                        label="Vehicle RC"
                        filename={kyc.vehicleRC}
                      />

                      <div className="card mb-3">
                        <div className="card-body">
                          <p className="mb-2">
                            <strong>Vehicle Number:</strong>{" "}
                            {kyc.vehicleNumber || "N/A"}
                          </p>
                          <p className="mb-0">
                            <strong>Vehicle Type:</strong>{" "}
                            {kyc.vehicleType || "N/A"}
                          </p>
                        </div>
                      </div>

                      {kyc.insurance && (
                        <DocumentCard
                          label="Vehicle Insurance"
                          filename={kyc.insurance}
                        />
                      )}

                      {kyc.pollution && (
                        <DocumentCard
                          label="Pollution Certificate"
                          filename={kyc.pollution}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const DocumentCard = ({ label, filename }) => {
  if (!filename) return null;

  const isPDF = filename?.endsWith(".pdf");
  const fileUrl = `${window.location.origin}/uploads/${filename}`;

  return (
    <div className="card mb-3 border">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <h6 className="card-title mb-0">{label}</h6>
          {isPDF ? (
            <span className="badge bg-danger">PDF</span>
          ) : (
            <span className="badge bg-success">Image</span>
          )}
        </div>
        <hr className="my-2" />
        {isPDF ? (
          <div className="d-flex gap-2 mt-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary flex-grow-1"
            >
              👁️ View Document
            </a>
            <a
              href={fileUrl}
              download
              className="btn btn-sm btn-outline-success"
            >
              📥
            </a>
          </div>
        ) : (
          <>
            <img
              src={fileUrl}
              alt={label}
              className="img-thumbnail mt-2"
              style={{ maxHeight: 200, maxWidth: "100%", objectFit: "cover" }}
            />
            <div className="d-flex gap-2 mt-2">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary flex-grow-1"
              >
                🔍 View Full Size
              </a>
              <a
                href={fileUrl}
                download
                className="btn btn-sm btn-outline-success"
              >
                📥
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransporterKYC_Data;
