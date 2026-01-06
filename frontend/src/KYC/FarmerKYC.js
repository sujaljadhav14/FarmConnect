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

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  const aadhaarRef = useRef();
  const selfieRef = useRef();
  const landRef = useRef();
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
        stream.getTracks().forEach(track => track.stop());
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
    if (!landProof) return setLandPreview(null);
    const url = URL.createObjectURL(landProof);
    setLandPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [landProof]);

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

      // Reset file inputs
      aadhaarRef.current.value = "";
      selfieRef.current.value = "";
      landRef.current.value = "";

      // Reset state
      setAadhaarPan(null);
      setSelfie(null);
      setLandProof(null);

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

                  {/* Live Selfie Capture */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Live Selfie (Photo) *
                    </label>
                    
                    {!selfie && !isCameraOpen && (
                      <button
                        type="button"
                        className="btn btn-success w-100"
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
