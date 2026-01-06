import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { ArrowLeft, CheckCircle, ExclamationCircle } from "react-bootstrap-icons";
import axios from "axios";

const AddVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const [formData, setFormData] = useState({
    vehicleName: "",
    vehicleNumber: "",
    vehicleType: "Tempo",
    minWeight: "",
    maxWeight: "",
    weightUnit: "kg",
    yearOfManufacture: new Date().getFullYear(),
    registrationCertificate: "",
    insuranceCertificate: "",
    pollutionCertificate: "",
    vehicleImage: "",
    loadCapacity: "",
    loadCapacityUnit: "kg",
    notes: "",
  });

  const vehicleTypes = ["Bike", "Auto", "Tempo", "Truck", "Mini Truck", "Other"];
  const weightUnits = ["kg", "quintal", "ton"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.vehicleName ||
      !formData.vehicleNumber ||
      !formData.vehicleType
    ) {
      setError("Vehicle name, number, and type are required");
      return false;
    }

    if (!formData.minWeight || !formData.maxWeight) {
      setError("Weight slab (min and max) is required");
      return false;
    }

    const minW = parseFloat(formData.minWeight);
    const maxW = parseFloat(formData.maxWeight);

    if (isNaN(minW) || isNaN(maxW)) {
      setError("Weight values must be numbers");
      return false;
    }

    if (maxW <= minW) {
      setError("Maximum weight must be greater than minimum weight");
      return false;
    }

    if (
      !formData.registrationCertificate ||
      !formData.insuranceCertificate
    ) {
      setError("Registration and insurance certificates are required");
      return false;
    }

    if (!formData.vehicleImage) {
      setError("Vehicle photo is required");
      return false;
    }

    return true;
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera start error", err);
      setError("Unable to access camera. Please allow camera permissions.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setFormData((prev) => ({ ...prev, vehicleImage: dataUrl }));
    stopCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("auth") || "{}");
      const token = authData.token;

      if (!token) {
        setError("Authentication required. Please login again.");
        navigate("/login");

              console.log("Submitting vehicle data:", {
                vehicleName: formData.vehicleName,
                vehicleNumber: formData.vehicleNumber,
                hasImage: !!formData.vehicleImage,
                imageLength: formData.vehicleImage?.length,
                registrationCert: formData.registrationCertificate,
                insuranceCert: formData.insuranceCertificate,
              });
        return;
      }

      const response = await axios.post("/api/vehicles/add", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuccessMessage("Vehicle added successfully!");
        setTimeout(() => {
          navigate("/transport/vehicles");
        }, 2000);
      }
    } catch (err) {
      console.error("Error adding vehicle:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      setError(
        err.response?.data?.message || err.message || "Failed to add vehicle. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Vehicle">
      <div className="container-fluid mt-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
              <button
                className="btn btn-outline-secondary me-3"
                onClick={() => navigate("/transport/vehicles")}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-success mb-1">Add New Vehicle</h2>
                <p className="text-muted">Register your transport vehicle with weight categories</p>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <ExclamationCircle size={20} className="me-2" />
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                ></button>
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <CheckCircle size={20} className="me-2" />
                {successMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="card shadow-sm">
              <div className="card-body p-4">
                {/* Basic Information */}
                <section className="mb-5">
                  <h5 className="text-success mb-3 border-bottom pb-2">
                    Basic Information
                  </h5>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="vehicleName" className="form-label">
                        Vehicle Name/Description <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="vehicleName"
                        name="vehicleName"
                        value={formData.vehicleName}
                        onChange={handleChange}
                        placeholder="e.g., Tempo Blue"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="vehicleNumber" className="form-label">
                        Vehicle Number/Registration <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="vehicleNumber"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        placeholder="e.g., MH01AB1234"
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="vehicleType" className="form-label">
                        Vehicle Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="vehicleType"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        required
                      >
                        {vehicleTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="yearOfManufacture" className="form-label">
                        Year of Manufacture
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="yearOfManufacture"
                        name="yearOfManufacture"
                        value={formData.yearOfManufacture}
                        onChange={handleChange}
                        min="2000"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                </section>

                {/* Weight Slab Information */}
                <section className="mb-5">
                  <h5 className="text-success mb-3 border-bottom pb-2">
                    Weight Category (Slab)
                  </h5>
                  <p className="text-muted small mb-3">
                    Define the weight range this vehicle can transport
                  </p>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label htmlFor="minWeight" className="form-label">
                        Minimum Weight <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="minWeight"
                        name="minWeight"
                        value={formData.minWeight}
                        onChange={handleChange}
                        placeholder="e.g., 100"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="maxWeight" className="form-label">
                        Maximum Weight <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="maxWeight"
                        name="maxWeight"
                        value={formData.maxWeight}
                        onChange={handleChange}
                        placeholder="e.g., 1000"
                        step="0.01"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="weightUnit" className="form-label">
                        Unit <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="weightUnit"
                        name="weightUnit"
                        value={formData.weightUnit}
                        onChange={handleChange}
                      >
                        {weightUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="alert alert-info small">
                    <strong>Example:</strong> If you set Min: 100 kg, Max: 1000 kg, this
                    vehicle will be suggested for orders between 100-1000 kg.
                  </div>
                </section>

                {/* Vehicle Photo */}
                <section className="mb-5">
                  <h5 className="text-success mb-3 border-bottom pb-2">
                    Vehicle Photo (Live Capture) <span className="text-danger">*</span>
                  </h5>
                  <p className="text-muted small mb-3">
                    Capture a clear photo of the vehicle using your camera.
                  </p>

                  <div className="d-flex flex-column flex-md-row gap-3 align-items-start">
                    <div className="flex-grow-1">
                      {formData.vehicleImage ? (
                        <div className="mb-3">
                          <label className="form-label">Captured Photo</label>
                          <div className="border rounded p-2 text-center">
                            <img
                              src={formData.vehicleImage}
                              alt="Vehicle"
                              className="img-fluid"
                              style={{ maxHeight: "260px" }}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline-secondary mt-2"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, vehicleImage: "" }));
                              startCamera();
                            }}
                          >
                            Retake Photo
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-2 d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={startCamera}
                              disabled={isCameraActive}
                            >
                              {isCameraActive ? "Camera On" : "Start Camera"}
                            </button>
                            {isCameraActive && (
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={stopCamera}
                              >
                                Stop
                              </button>
                            )}
                          </div>
                          {isCameraActive && (
                            <div className="border rounded p-2">
                              <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-100"
                                style={{ maxHeight: "280px" }}
                              />
                              <div className="text-end mt-2">
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={capturePhoto}
                                >
                                  Capture Photo
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="d-none" />
                </section>

                {/* Certifications */}
                <section className="mb-5">
                  <h5 className="text-success mb-3 border-bottom pb-2">
                    Certifications & Documents <span className="text-danger">*</span>
                  </h5>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label htmlFor="registrationCertificate" className="form-label">
                        Registration Certificate Link/Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="registrationCertificate"
                        name="registrationCertificate"
                        value={formData.registrationCertificate}
                        onChange={handleChange}
                        placeholder="Ref. number"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="insuranceCertificate" className="form-label">
                        Insurance Certificate Link/Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="insuranceCertificate"
                        name="insuranceCertificate"
                        value={formData.insuranceCertificate}
                        onChange={handleChange}
                        placeholder="Ref. number"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="pollutionCertificate" className="form-label">
                        Pollution Certificate (PUC)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="pollutionCertificate"
                        name="pollutionCertificate"
                        value={formData.pollutionCertificate}
                        onChange={handleChange}
                        placeholder="Ref. number"
                      />
                    </div>
                  </div>
                </section>

                {/* Additional Notes */}
                <section className="mb-5">
                  <h5 className="text-success mb-3 border-bottom pb-2">
                    Additional Information
                  </h5>

                  <div className="mb-3">
                    <label htmlFor="notes" className="form-label">
                      Notes
                    </label>
                    <textarea
                      className="form-control"
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional information about the vehicle"
                      rows="3"
                      maxLength="500"
                    ></textarea>
                    <small className="text-muted">
                      {formData.notes.length}/500 characters
                    </small>
                  </div>
                </section>

                {/* Submit Buttons */}
                <div className="d-flex gap-3 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/transport/vehicles")}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Adding...
                      </>
                    ) : (
                      "Add Vehicle"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddVehicle;
