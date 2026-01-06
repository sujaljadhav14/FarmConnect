import React, { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../components/layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import TraderMenu from "../Dashboards/TraderMenu";

const TraderKYC = () => {
  const { auth } = useAuth();

  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [gstPreview, setGstPreview] = useState(null);
  const [businessPreview, setBusinessPreview] = useState(null);

  const [aadhaarPan, setAadhaarPan] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [gst, setGst] = useState(null);
  const [businessReg, setBusinessReg] = useState(null);

  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  const aadhaarRef = useRef();
  const selfieRef = useRef();
  const gstRef = useRef();
  const businessRef = useRef();

  const fetchMyKYC = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/my-kyc", {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setKycStatus(data.status || "not_submitted");
    } catch (err) {
      console.error(err);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (auth?.token) fetchMyKYC();
  }, [auth?.token, fetchMyKYC]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aadhaarPan || !selfie || !gst || !businessReg) {
      return toast.error("All documents are required");
    }

    const formData = new FormData();
    formData.append("aadhaarPan", aadhaarPan);
    formData.append("selfie", selfie);
    formData.append("gst", gst);
    formData.append("businessReg", businessReg);

    try {
      setLoading(true);
      await axios.post("/api/auth/submit-kyc", formData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      toast.success("Trader KYC submitted successfully ✅");
      setKycStatus("pending");
    } catch (err) {
      toast.error(err.response?.data?.error || "KYC failed");
    } finally {
      setLoading(false);
    }
  };

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
    if (!gst) return setGstPreview(null);
    const url = URL.createObjectURL(gst);
    setGstPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [gst]);

  useEffect(() => {
    if (!businessReg) return setBusinessPreview(null);
    const url = URL.createObjectURL(businessReg);
    setBusinessPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [businessReg]);

  return (
    <Layout title="Trader KYC">
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-md-3 col-lg-2 mb-3">
            <TraderMenu />
          </div>

          <div className="col-md-9 col-lg-10">
            <div className="card shadow p-4 rounded-4 col-md-6">
              <h3 className="text-primary mb-3">🏢 Trader KYC Verification</h3>

              {kycStatus === "not_submitted" && (
                <div className="alert alert-danger mb-3 fw-bold" role="alert">
                  ⚠️ Complete your KYC to start trading!
                </div>
              )}

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
                      KYC Status: <b>{kycStatus}</b>
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

              {kycStatus === "not_submitted" || kycStatus === "rejected" ? (
                <form onSubmit={handleSubmit}>
                  <FileInput
                    label="Aadhaar / PAN Card"
                    refEl={aadhaarRef}
                    onChange={setAadhaarPan}
                    preview={aadhaarPreview}
                    file={aadhaarPan}
                  />

                  <FileInput
                    label="Selfie (Photo)"
                    refEl={selfieRef}
                    onChange={setSelfie}
                    preview={selfiePreview}
                    file={selfie}
                    imageOnly
                  />

                  <FileInput
                    label="GST Certificate"
                    refEl={gstRef}
                    onChange={setGst}
                    preview={gstPreview}
                    file={gst}
                  />

                  <FileInput
                    label="Business Registration Proof"
                    refEl={businessRef}
                    onChange={setBusinessReg}
                    preview={businessPreview}
                    file={businessReg}
                  />

                  <button className="btn btn-primary w-100" disabled={loading}>
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

const FileInput = ({ label, refEl, onChange, preview, file, imageOnly }) => (
  <div className="mb-3">
    <label className="form-label fw-semibold">{label}</label>
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

export default TraderKYC;
