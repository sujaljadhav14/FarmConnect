import React, { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../components/layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import FarmerMenu from "../Dashboards/FamerMenu";

const FarmerKYC = () => {
  const { auth } = useAuth();

  // Files
  const [aadhaarPan, setAadhaarPan] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [landProof, setLandProof] = useState(null);

  // Preview
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [landPreview, setLandPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null); // pending / approved / rejected / null

  const aadhaarRef = useRef();
  const selfieRef = useRef();
  const landRef = useRef();

  /* ---------- FETCH MY KYC ---------- */
  const fetchMyKYC = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/my-kyc", {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      if (data.status !== "not_submitted") {
        setKycStatus(data.status);
      } else {
        setKycStatus("not_submitted");
      }
    } catch (error) {
      console.error(error);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (auth?.token) fetchMyKYC();
  }, [auth?.token, fetchMyKYC]);

  /* ---------- PREVIEWS ---------- */
  useEffect(() => {
    if (!aadhaarPan) return setAadhaarPreview(null);
    const url = URL.createObjectURL(aadhaarPan);
    setAadhaarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [aadhaarPan]);

  useEffect(() => {
    if (!selfie) return setSelfiePreview(null);
    const url = URL.createObjectURL(selfie);
    setSelfiePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selfie]);

  useEffect(() => {
    if (!landProof) return setLandPreview(null);
    const url = URL.createObjectURL(landProof);
    setLandPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [landProof]);

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aadhaarPan || !selfie || !landProof) {
      return toast.error("All documents are required");
    }

    const formData = new FormData();
    formData.append("aadhaarPan", aadhaarPan);
    formData.append("selfie", selfie);
    formData.append("landProof", landProof);

    try {
      setLoading(true);

      await axios.post("/api/auth/submit-kyc", formData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      toast.success("KYC submitted successfully ✅");
      setKycStatus("pending");

      aadhaarRef.current.value = "";
      selfieRef.current.value = "";
      landRef.current.value = "";
    } catch (error) {
      toast.error(error.response?.data?.error || "KYC failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <Layout title="Farmer KYC">
      <div className="container-fluid mt-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 mb-3">
            <FarmerMenu />
          </div>

          {/* Content */}
          <div className="col-md-9 col-lg-10">
            <div className="card shadow p-4 rounded-4 col-md-6">
              <h3 className="text-success mb-3">🪪 Farmer KYC Verification</h3>

              {/* ---------- ALERT ---------- */}
              {kycStatus === "not_submitted" && (
                <div className="alert alert-danger mb-3 fw-bold" role="alert">
                  ⚠️ You have not submitted your KYC. Complete your KYC to
                  access all features!
                </div>
              )}

              {/* STATUS MESSAGE */}
              {kycStatus && kycStatus !== "not_submitted" && (
                <div
                  className={`alert ${kycStatus === "approved"
                      ? "alert-success"
                      : kycStatus === "rejected"
                        ? "alert-danger"
                        : "alert-warning"
                    }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      KYC Status: <b className="text-capitalize">{kycStatus}</b>
                      {kycStatus === "rejected" && (
                        <p className="mb-0 mt-2 small">
                          ❌ Your KYC was rejected. Please review and resubmit with correct information.
                        </p>
                      )}
                    </div>
                    {kycStatus === "rejected" && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => setKycStatus("not_submitted")}
                      >
                        🔄 Resubmit KYC
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FORM */}
              {kycStatus === null || kycStatus === "not_submitted" || kycStatus === "rejected" ? (
                <form onSubmit={handleSubmit}>
                  <FileInput
                    label="Aadhaar / PAN"
                    refEl={aadhaarRef}
                    onChange={setAadhaarPan}
                    preview={aadhaarPreview}
                    file={aadhaarPan}
                  />

                  <FileInput
                    label="Selfie"
                    refEl={selfieRef}
                    onChange={setSelfie}
                    preview={selfiePreview}
                    file={selfie}
                    imageOnly
                  />

                  <FileInput
                    label="Land Ownership Proof"
                    refEl={landRef}
                    onChange={setLandProof}
                    preview={landPreview}
                    file={landProof}
                  />

                  <button className="btn btn-success w-100" disabled={loading}>
                    {loading ? "Submitting..." : "Submit KYC"}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

/* ---------- FILE INPUT ---------- */
const FileInput = ({ label, refEl, onChange, preview, file, imageOnly }) => (
  <div className="mb-3">
    <label className="form-label fw-bold">{label}</label>
    <input
      ref={refEl}
      type="file"
      className="form-control"
      accept={imageOnly ? "image/*" : "image/*,.pdf"}
      onChange={(e) => onChange(e.target.files[0])}
    />
    {preview && <Preview file={file} preview={preview} />}
  </div>
);

/* ---------- PREVIEW ---------- */
const Preview = ({ file, preview }) =>
  file?.type?.includes("image") ? (
    <img
      src={preview}
      alt="preview"
      className="img-thumbnail mt-2"
      style={{ maxHeight: 150 }}
    />
  ) : (
    <div className="mt-2 d-flex align-items-center gap-2">
      <span className="badge bg-danger">PDF</span>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => window.open(preview)}
      >
        View
      </button>
    </div>
  );

export default FarmerKYC;
