import React, { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../components/layout/Layout";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import TraderMenu from "../Dashboards/TraderMenu";

const TraderKYC = () => {
  const { auth } = useAuth();

  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [gstPreview, setGstPreview] = useState(null);
  const [businessPreview, setBusinessPreview] = useState(null);

  const [aadhaar, setAadhaar] = useState(null);
  const [pan, setPan] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [gst, setGst] = useState(null);
  const [businessReg, setBusinessReg] = useState(null);

  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  const aadhaarRef = useRef();
  const panRef = useRef();
  const selfieRef = useRef();
  const gstRef = useRef();
  const businessRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();

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

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob/file
    canvas.toBlob((blob) => {
      const file = new File([blob], `selfie_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setSelfie(file);

      // Create preview
      const url = URL.createObjectURL(file);
      setSelfiePreview(url);

      toast.success("✅ Selfie captured successfully!");
      closeCamera();
    }, "image/jpeg", 0.95);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aadhaar || !pan || !selfie || !gst || !businessReg) {
      return toast.error("All documents are required (Aadhaar, PAN, Selfie, GST, Business Registration)");
    }

    const formData = new FormData();
    formData.append("aadhaar", aadhaar);
    formData.append("pan", pan);
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

      // Reset file inputs
      aadhaarRef.current.value = "";
      panRef.current.value = "";
      selfieRef.current.value = "";
      gstRef.current.value = "";
      businessRef.current.value = "";

      // Reset state
      setAadhaar(null);
      setPan(null);
      setSelfie(null);
      setGst(null);
      setBusinessReg(null);

    } catch (err) {
      toast.error(err.response?.data?.error || "KYC failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!aadhaar) return setAadhaarPreview(null);
    const url = URL.createObjectURL(aadhaar);
    setAadhaarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [aadhaar]);

  useEffect(() => {
    if (!pan) return setPanPreview(null);
    const url = URL.createObjectURL(pan);
    setPanPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pan]);

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

              {kycStatus && kycStatus !== "not_submitted" && kycStatus !== "rejected" && (
                <div
                  className={`alert ${
                    kycStatus === "approved"
                      ? "alert-success"
                      : "alert-warning"
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      KYC Status: <b className="text-capitalize">{kycStatus}</b>
                    </div>
                  </div>
                </div>
              )}

              {/* REJECTED STATUS - SHOW SEPARATELY */}
              {kycStatus === "rejected" && (
                <div className="alert alert-danger mb-3">
                  <div className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong>❌ KYC Rejected</strong>
                        <p className="mb-0 mt-2 small">
                          Your KYC was rejected. Please review and modify your documents below, then resubmit with correct information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(kycStatus === "not_submitted" || kycStatus === "rejected" || kycStatus === null) ? (
                <form onSubmit={handleSubmit}>
                  <FileInput
                    label="Aadhaar Card *"
                    refEl={aadhaarRef}
                    onChange={setAadhaar}
                    preview={aadhaarPreview}
                    file={aadhaar}
                  />

                  <FileInput
                    label="PAN Card *"
                    refEl={panRef}
                    onChange={setPan}
                    preview={panPreview}
                    file={pan}
                  />

                  {/* Live Selfie Capture */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
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
                            className="btn btn-primary flex-grow-1"
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
