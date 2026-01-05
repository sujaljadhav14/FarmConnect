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
  const [drivingLicense, setDrivingLicense] = useState(null);
  const [vehicleRC, setVehicleRC] = useState(null);
  const [insurance, setInsurance] = useState(null);
  const [pollution, setPollution] = useState(null);

  // Preview
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [rcPreview, setRCPreview] = useState(null);
  const [insurancePreview, setInsurancePreview] = useState(null);
  const [pollutionPreview, setPollutionPreview] = useState(null);

  // Additional fields
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  const aadhaarRef = useRef();
  const selfieRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const licenseRef = useRef();
  const rcRef = useRef();
  const insuranceRef = useRef();
  const pollutionRef = useRef();

  /* ---------- FETCH MY KYC ---------- */
  const fetchMyKYC = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/my-kyc", {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      if (data.status !== "not_submitted") {
        setKycStatus(data.status);
        // Pre-fill additional fields if KYC exists
        if (data.kyc) {
          setLicenseNumber(data.kyc.licenseNumber || "");
          setLicenseExpiry(data.kyc.licenseExpiry || "");
          setVehicleNumber(data.kyc.vehicleNumber || "");
          setVehicleType(data.kyc.vehicleType || "");
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
    if (!drivingLicense) return setLicensePreview(null);
    const url = URL.createObjectURL(drivingLicense);
    setLicensePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [drivingLicense]);

  useEffect(() => {
    if (!vehicleRC) return setRCPreview(null);
    const url = URL.createObjectURL(vehicleRC);
    setRCPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [vehicleRC]);

  useEffect(() => {
    if (!insurance) return setInsurancePreview(null);
    const url = URL.createObjectURL(insurance);
    setInsurancePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [insurance]);

  useEffect(() => {
    if (!pollution) return setPollutionPreview(null);
    const url = URL.createObjectURL(pollution);
    setPollutionPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pollution]);

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

    // Detailed validation with specific messages
    if (!aadhaarPan) {
      return toast.error("❌ Aadhaar/PAN Card is required");
    }
    
    if (!selfie) {
      return toast.error("❌ Selfie photo is required");
    }

    if (!drivingLicense) {
      return toast.error("❌ Driving License is required");
    }

    if (!vehicleRC) {
      return toast.error("❌ Vehicle RC (Registration Certificate) is required");
    }

    if (!licenseNumber || !licenseNumber.trim()) {
      return toast.error("❌ License Number is required");
    }

    if (!licenseExpiry) {
      return toast.error("❌ License Expiry Date is required");
    }

    if (!vehicleNumber || !vehicleNumber.trim()) {
      return toast.error("❌ Vehicle Number is required");
    }

    if (!vehicleType) {
      return toast.error("❌ Vehicle Type is required");
    }

    const formData = new FormData();
    formData.append("aadhaarPan", aadhaarPan);
    formData.append("selfie", selfie);
    formData.append("drivingLicense", drivingLicense);
    formData.append("vehicleRC", vehicleRC);
    if (insurance) formData.append("insurance", insurance);
    if (pollution) formData.append("pollution", pollution);

    // Additional text fields
    formData.append("licenseNumber", licenseNumber);
    formData.append("licenseExpiry", licenseExpiry);
    formData.append("vehicleNumber", vehicleNumber);
    formData.append("vehicleType", vehicleType);

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
      aadhaarRef.current.value = "";
      selfieRef.current.value = "";
      licenseRef.current.value = "";
      rcRef.current.value = "";
      if (insuranceRef.current) insuranceRef.current.value = "";
      if (pollutionRef.current) pollutionRef.current.value = "";

      // Reset state
      setAadhaarPan(null);
      setSelfie(null);
      setDrivingLicense(null);
      setVehicleRC(null);
      setInsurance(null);
      setPollution(null);

      // Show success message with link to view data
      setTimeout(() => {
        toast.success("View your submitted KYC in 'My KYC Data' menu", {
          duration: 5000,
        });
      }, 1000);

    } catch (error) {
      console.error("KYC Error:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || "KYC submission failed. Please try again.";
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
                    {aadhaarPan ? "✅ Aadhaar/PAN" : "❌ Aadhaar/PAN"} | {" "}
                    {selfie ? "✅ Selfie" : "❌ Selfie"} | {" "}
                    {drivingLicense ? "✅ License" : "❌ License"} | {" "}
                    {vehicleRC ? "✅ Vehicle RC" : "❌ Vehicle RC"} | {" "}
                    {licenseNumber && licenseExpiry && vehicleNumber && vehicleType
                      ? "✅ Details"
                      : "❌ Details"}
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
                      <h5 className="text-muted mb-3">Personal Documents</h5>
                      
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

                      <h5 className="text-muted mb-3 mt-4">License Details</h5>

                      <FileInput
                        label="Driving License *"
                        refEl={licenseRef}
                        onChange={setDrivingLicense}
                        preview={licensePreview}
                        file={drivingLicense}
                      />

                      <div className="mb-3">
                        <label className="form-label fw-bold">License Number *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter license number"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">License Expiry Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={licenseExpiry}
                          onChange={(e) => setLicenseExpiry(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h5 className="text-muted mb-3">Vehicle Documents</h5>

                      <FileInput
                        label="Vehicle RC (Registration Certificate) *"
                        refEl={rcRef}
                        onChange={setVehicleRC}
                        preview={rcPreview}
                        file={vehicleRC}
                      />

                      <div className="mb-3">
                        <label className="form-label fw-bold">Vehicle Number *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g., MH12AB1234"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">Vehicle Type *</label>
                        <select
                          className="form-select"
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                          required
                        >
                          <option value="">Select vehicle type</option>
                          <option value="2-Wheeler">2-Wheeler</option>
                          <option value="3-Wheeler">3-Wheeler (Auto)</option>
                          <option value="Pickup">Pickup Truck</option>
                          <option value="Mini-Truck">Mini Truck</option>
                          <option value="Truck">Truck</option>
                          <option value="Trailer">Trailer/Large Truck</option>
                          <option value="Tempo">Tempo</option>
                          <option value="Van">Van</option>
                        </select>
                      </div>

                      <FileInput
                        label="Vehicle Insurance (Optional)"
                        refEl={insuranceRef}
                        onChange={setInsurance}
                        preview={insurancePreview}
                        file={insurance}
                      />

                      <FileInput
                        label="Pollution Certificate (Optional)"
                        refEl={pollutionRef}
                        onChange={setPollution}
                        preview={pollutionPreview}
                        file={pollution}
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
