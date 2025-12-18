import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import {
  CheckCircle,
  XCircle,
  HourglassSplit,
  FileEarmarkText,
  PersonBadge,
} from "react-bootstrap-icons";
import Layout from "../components/layout/Layout";
import AdminMenu from "../Dashboards/AdminMenu";

const API = process.env.REACT_APP_API;

const AdminKYC = () => {
  const { auth } = useAuth();
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState({});

  const fetchAllKYC = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/auth/get-all-kyc`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setKycs(data);
    } catch {
      toast.error("Failed to load KYC data");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(
        `${API}/api/auth/kyc-status/${id}`,
        { status, adminRemark: remarks[id] || "" },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      toast.success(data.message);
      setRemarks((p) => ({ ...p, [id]: "" }));
      fetchAllKYC();
    } catch {
      toast.error("Status update failed");
    }
  };

  useEffect(() => {
    if (auth?.token) fetchAllKYC();
  }, [auth?.token]);

  const statusBadge = (status) => {
    if (status === "approved")
      return <span className="badge bg-success">Approved</span>;
    if (status === "rejected")
      return <span className="badge bg-danger">Rejected</span>;
    return <span className="badge bg-warning text-dark">Pending</span>;
  };

  return (
    <Layout title="Admin - KYC Management">
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-md-3 col-lg-2 mb-3">
            <AdminMenu />
          </div>

          <div className="col-md-9 col-lg-10">
            <h3 className="mb-4 text-center fw-bold">
              📄 KYC Verification Dashboard
            </h3>

            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" />
              </div>
            ) : (
              <div className="row g-4">
                {kycs.map((k) => (
                  <div key={k._id} className="col-lg-6">
                    <div className="card shadow-sm border-0 h-100 rounded-4">
                      <div className="card-body">
                        {/* HEADER */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="fw-bold mb-0">
                              <PersonBadge className="me-1" />
                              {k.user?.name}
                            </h5>
                            <small className="text-muted">
                              📞 {k.user?.phone}
                            </small>
                          </div>
                          {statusBadge(k.status)}
                        </div>

                        {/* ROLE */}
                        <div className="mb-3">
                          <span
                            className={`badge ${k.role === "farmer" ? "bg-success" : "bg-primary"
                              }`}
                          >
                            {k.role.toUpperCase()}
                          </span>
                        </div>

                        {/* DOCUMENTS */}
                        <h6 className="fw-semibold">📂 Documents</h6>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <DocBtn label="Aadhaar / PAN" file={k.aadhaarPan} />
                          <DocBtn label="Selfie" file={k.selfie} />
                          {k.landProof && (
                            <DocBtn label="Land Proof" file={k.landProof} />
                          )}
                          {k.gst && <DocBtn label="GST" file={k.gst} />}
                          {k.businessReg && (
                            <DocBtn
                              label="Business Reg."
                              file={k.businessReg}
                            />
                          )}
                        </div>

                        {/* ACTIONS */}
                        {k.status === "pending" ? (
                          <>
                            <textarea
                              className="form-control mb-2"
                              placeholder="Admin remark (optional)"
                              value={remarks[k._id] || ""}
                              onChange={(e) =>
                                setRemarks((p) => ({
                                  ...p,
                                  [k._id]: e.target.value,
                                }))
                              }
                            />

                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-success flex-fill"
                                onClick={() => updateStatus(k._id, "approved")}
                              >
                                <CheckCircle className="me-1" />
                                Approve
                              </button>
                              <button
                                className="btn btn-danger flex-fill"
                                onClick={() => updateStatus(k._id, "rejected")}
                              >
                                <XCircle className="me-1" />
                                Reject
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-muted mt-2">
                            ✔ Decision already taken
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

/* ---------- DOCUMENT BUTTON ---------- */
const DocBtn = ({ label, file }) => (
  <a
    href={`${API}/uploads/${file}`}
    target="_blank"
    rel="noreferrer"
    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
  >
    <FileEarmarkText /> {label}
  </a>
);

export default AdminKYC;
