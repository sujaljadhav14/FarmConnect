import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import TransportMenu from "../Dashboards/TransportMenu";

const TransporterKYC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  // Files
  const [aadhaarPan, setAadhaarPan] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [businessLicense, setBusinessLicense] = useState(null);
  const [rtoPermit, setRtoPermit] = useState(null);
  const [commercialPermit, setCommercialPermit] = useState(null);

  // Preview
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [businessPreview, setBusinessPreview] = useState(null);
  const [rtoPreview, setRtoPreview] = useState(null);
  const [commercialPreview, setCommercialPreview] = useState(null);

  // Additional fields
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [transporterId, setTransporterId] = useState("");

  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  const aadhaarRef = useRef();
  const selfieRef = useRef();
  const businessRef = useRef();
  const rtoRef = useRef();
  const commercialRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();

  /* ---------- FETCH MY KYC ---------- */
  const fetchMyKYC = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/my-kyc", {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      if (data.status !== "not_submitted") {
        setKycStatus(data.status);
        if (data.kyc) {
          setCompanyName(data.kyc.companyName || "");
          setGstNumber(data.kyc.gstNumber || "");
          setTransporterId(data.kyc.transporterId || "");
        }
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

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

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
    if (!businessLicense) return setBusinessPreview(null);
    const url = URL.createObjectURL(businessLicense);
    setBusinessPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [businessLicense]);

  useEffect(() => {
    if (!rtoPermit) return setRtoPreview(null);
    const url = URL.createObjectURL(rtoPermit);
    setRtoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [rtoPermit]);

  useEffect(() => {
    if (!commercialPermit) return setCommercialPreview(null);
    const url = URL.createObjectURL(commercialPermit);
    setCommercialPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [commercialPermit]);

  /* ---------- CAMERA FUNCTIONS ---------- */
  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Camera Error:", error);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `selfie_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setSelfie(file);

        const url = URL.createObjectURL(file);
        setSelfiePreview(url);

        toast.success("✅ Selfie captured successfully!");
        closeCamera();
      },
      "image/jpeg",
      0.95
    );
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aadhaarPan) {
      return toast.error("❌ Aadhaar/PAN Card is required");
    }

    if (!selfie) {
      return toast.error("❌ Selfie photo is required");
    }

    if (!businessLicense) {
      return toast.error("❌ Business License is required");
    }

    if (!companyName || !companyName.trim()) {
      return toast.error("❌ Transport company name is required");
    }

    if (!gstNumber || !gstNumber.trim()) {
      return toast.error("❌ GST number is required");
    }

    if (!transporterId || !transporterId.trim()) {
      return toast.error("❌ Transporter ID / Registration No is required");
    }

    if (!rtoPermit) {
      return toast.error("❌ RTO-issued permit is required");
    }

    if (!commercialPermit) {
      return toast.error("❌ Commercial vehicle permit is required");
    }

    const formData = new FormData();
    formData.append("aadhaarPan", aadhaarPan);
    formData.append("selfie", selfie);
    formData.append("businessLicense", businessLicense);
    formData.append("companyName", companyName);
    formData.append("gstNumber", gstNumber);
    formData.append("transporterId", transporterId);
    formData.append("rtoPermit", rtoPermit);
    formData.append("commercialPermit", commercialPermit);

    try {
      setLoading(true);

      await axios.post("/api/auth/submit-kyc", formData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      toast.success("✅ Transporter KYC submitted successfully!");
      setKycStatus("pending");

      // Reset file inputs
      if (aadhaarRef.current) aadhaarRef.current.value = "";
      if (selfieRef.current) selfieRef.current.value = "";
      if (businessRef.current) businessRef.current.value = "";
      if (rtoRef.current) rtoRef.current.value = "";
      if (commercialRef.current) commercialRef.current.value = "";

      // Reset state
      setAadhaarPan(null);
      setSelfie(null);
      setBusinessLicense(null);
      setCompanyName("");
      setGstNumber("");
      setTransporterId("");
      setRtoPermit(null);
      setCommercialPermit(null);

      setTimeout(() => {
        toast.success("View your submitted KYC in 'My KYC Data' menu", {
          duration: 5000,
        });
      }, 1000);
    } catch (error) {
      console.error("KYC Error:", error.response?.data || error.message);
      const errorMsg =
        error.response?.data?.error || "KYC submission failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <Layout title="Transporter KYC">
      <div className="container-fluid mt-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 mb-3">
            <TransportMenu />
          </div>

          {/* Content */}
          <div className="col-md-9 col-lg-10">
            <div className="card shadow p-4 rounded-4">
              <h3 className="text-info mb-3">🚛 Transporter KYC Verification</h3>

              {/* ---------- FORM COMPLETION STATUS ---------- */}
              {kycStatus === null || kycStatus === "not_submitted" ? (
                <div className="alert alert-light border mb-3">
                  <strong>📋 Form Progress:</strong>
                  <div className="small mt-2">
                    {aadhaarPan ? "✅ Aadhaar/PAN" : "❌ Aadhaar/PAN"} |{" "}
                    {selfie ? "✅ Selfie" : "❌ Selfie"} |{" "}
                    {businessLicense ? "✅ Business License" : "❌ Business License"} |{" "}
                    {companyName ? "✅ Company Name" : "❌ Company Name"} |{" "}
                    {gstNumber ? "✅ GST" : "❌ GST"} |{" "}
                    {transporterId ? "✅ Transporter ID" : "❌ Transporter ID"} |{" "}
                    {rtoPermit ? "✅ RTO Permit" : "❌ RTO Permit"} |{" "}
                    {commercialPermit ? "✅ Commercial Permit" : "❌ Commercial Permit"}
                  </div>
                </div>
              ) : null}

              {/* ---------- ALERT ---------- */}
              {kycStatus === "not_submitted" && (
                <div className="alert alert-danger mb-3 fw-bold" role="alert">
                  ⚠️ You have not submitted your KYC. Complete your KYC to
                  access transport orders and features!
                </div>
              )}

              {/* STATUS MESSAGE */}
              {kycStatus && kycStatus !== "not_submitted" && (
                <div
                  className={`alert ${
                    kycStatus === "approved"
                      ? "alert-success"
                      : kycStatus === "rejected"
                      ? "alert-danger"
                      : "alert-warning"
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>KYC Status:</strong>{" "}
                      <span className="text-capitalize fw-bold">{kycStatus}</span>
                      {kycStatus === "pending" && (
                        <p className="mb-0 mt-2">
                          Your KYC is under review. You'll be notified once it's approved.
                        </p>
                      )}
                      {kycStatus === "approved" && (
                        <p className="mb-0 mt-2">
                          🎉 Your KYC has been approved! You can now access all transport features.
                        </p>
                      )}
                      {kycStatus === "rejected" && (
                        <p className="mb-0 mt-2">
                          ❌ Your KYC has been rejected. Please review and resubmit with correct information.
                        </p>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-info text-white"
                        onClick={() => navigate("/transport/kyc-data")}
                      >
                        View My KYC Data
                      </button>
                      {kycStatus === "rejected" && (
                        <button
                          className="btn btn-warning text-dark"
                          onClick={() => setKycStatus("not_submitted")}
                        >
                          🔄 Resubmit KYC
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* FORM */}
              {kycStatus === null || kycStatus === "not_submitted" || kycStatus === "rejected" ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <h5 className="text-muted mb-3">Identity</h5>

                      <FileInput
                        label="Aadhaar / PAN Card *"
                        refEl={aadhaarRef}
                        onChange={setAadhaarPan}
                        preview={aadhaarPreview}
                        file={aadhaarPan}
                      />

                      {/* Live Selfie Capture */}
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Live Selfie (Photo) *
                        </label>

                        {!selfie && !isCameraOpen && (
                          <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={openCamera}
                          >
                            📷 Open Camera to Take Selfie
                          </button>
                        )}

                        {isCameraOpen && (
                          <div className="border rounded p-3 bg-light">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-100 rounded mb-2"
                              style={{ maxHeight: "300px", objectFit: "cover" }}
                            />
                            <canvas ref={canvasRef} style={{ display: "none" }} />
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-success flex-grow-1"
                                onClick={capturePhoto}
                              >
                                📸 Capture Photo
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={closeCamera}
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {selfie && selfiePreview && (
                          <div className="border rounded p-2 bg-light">
                            <img
                              src={selfiePreview}
                              alt="Captured Selfie"
                              className="w-100 rounded mb-2"
                              style={{ maxHeight: "200px", objectFit: "cover" }}
                            />
                            <button
                              type="button"
                              className="btn btn-warning btn-sm w-100"
                              onClick={() => {
                                setSelfie(null);
                                setSelfiePreview(null);
                              }}
                            >
                              🔄 Retake Selfie
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h5 className="text-muted mb-3">Business Verification</h5>

                      <FileInput
                        label="Business License *"
                        refEl={businessRef}
                        onChange={setBusinessLicense}
                        preview={businessPreview}
                        file={businessLicense}
                      />

                      <div className="mb-3">
                        <label className="form-label fw-bold">Transport Company Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Registered company or operator name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">GST Number *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="15-digit GSTIN"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">Transporter ID / Registration No *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Official transporter ID"
                          value={transporterId}
                          onChange={(e) => setTransporterId(e.target.value)}
                          required
                        />
                      </div>

                      <FileInput
                        label="RTO-issued Permit *"
                        refEl={rtoRef}
                        onChange={setRtoPermit}
                        preview={rtoPreview}
                        file={rtoPermit}
                      />

                      <FileInput
                        label="Commercial Vehicle Permit *"
                        refEl={commercialRef}
                        onChange={setCommercialPermit}
                        preview={commercialPreview}
                        file={commercialPermit}
                      />
                    </div>
                  </div>

                  <div className="alert alert-info mt-3">
                    <strong>Note:</strong> Fields marked with * are mandatory. Please ensure all documents are clear and valid.
                  </div>

                  <button className="btn btn-info text-white w-100 mt-3" disabled={loading}>
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

export default TransporterKYC;
