import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { Plus, Edit, Trash2, AlertCircle } from "react-bootstrap-icons";
import axios from "axios";
import "../../styles/VehicleManagement.css";

const VehicleManagement = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/vehicles/my-vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setVehicles(response.data.vehicles);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err.response?.data?.message || "Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    navigate("/transport/vehicles/add");
  };

  const handleEditVehicle = (vehicleId) => {
    navigate(`/transport/vehicles/edit/${vehicleId}`);
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `/api/vehicles/${vehicleToDelete._id}/delete`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Vehicle deleted successfully");
        setVehicles(vehicles.filter((v) => v._id !== vehicleToDelete._id));
        setDeleteModalVisible(false);
        setVehicleToDelete(null);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      setError(err.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const toggleAvailability = async (vehicleId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "available" ? "maintenance" : "available";
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `/api/vehicles/${vehicleId}/availability`,
        { availabilityStatus: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setVehicles(
          vehicles.map((v) =>
            v._id === vehicleId
              ? { ...v, availabilityStatus: newStatus }
              : v
          )
        );
        setSuccessMessage(
          `Vehicle marked as ${newStatus === "available" ? "Available" : "Maintenance"}`
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error updating vehicle availability:", err);
      setError(err.response?.data?.message || "Failed to update vehicle");
    }
  };

  if (loading) {
    return (
      <Layout title="Vehicle Management">
        <div className="container mt-5">
          <div className="text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Vehicle Management">
      <div className="container-fluid mt-4">
        <div className="vehicle-management-wrapper">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="text-success mb-2">🚚 My Vehicles</h2>
              <p className="text-muted">
                Manage your transport vehicles and weight categories
              </p>
            </div>
            <button
              className="btn btn-success btn-lg"
              onClick={handleAddVehicle}
            >
              <Plus size={20} className="me-2" />
              Add New Vehicle
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <AlertCircle size={20} className="me-2" />
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {successMessage && (
            <div
              className="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              {successMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage("")}
              ></button>
            </div>
          )}

          {/* Vehicles List */}
          {vehicles.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No vehicles added yet</h5>
              <p className="text-muted mb-3">
                Start by adding your first vehicle to receive transport orders
              </p>
              <button
                className="btn btn-success"
                onClick={handleAddVehicle}
              >
                <Plus size={20} className="me-2" />
                Add Your First Vehicle
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="col-12 col-md-6 col-lg-4">
                  <div className="vehicle-card card shadow-sm h-100">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">{vehicle.vehicleName}</h5>
                      <small>{vehicle.vehicleNumber}</small>
                    </div>

                    <div className="card-body">
                      {/* Status Badge */}
                      <div className="mb-3">
                        <span
                          className={`badge bg-${vehicle.availabilityStatus === "available"
                              ? "success"
                              : "warning"
                            }`}
                        >
                          {vehicle.availabilityStatus === "available"
                            ? "Available"
                            : "Maintenance"}
                        </span>
                        {!vehicle.isActive && (
                          <span className="badge bg-danger ms-2">Inactive</span>
                        )}
                      </div>

                      {/* Vehicle Details */}
                      <div className="vehicle-details">
                        <div className="detail-row">
                          <span className="label">Type:</span>
                          <span className="value">{vehicle.vehicleType}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Year:</span>
                          <span className="value">
                            {vehicle.yearOfManufacture}
                          </span>
                        </div>

                        {/* Weight Slab */}
                        <div className="detail-row weight-slab">
                          <span className="label">Weight Capacity:</span>
                          <span className="value font-weight-bold text-success">
                            {vehicle.weightSlab.minWeight} -{" "}
                            {vehicle.weightSlab.maxWeight}{" "}
                            {vehicle.weightSlab.unit}
                          </span>
                        </div>

                        {/* Load Capacity */}
                        <div className="detail-row">
                          <span className="label">Load Capacity:</span>
                          <span className="value">
                            {vehicle.loadCapacity} {vehicle.loadCapacityUnit}
                          </span>
                        </div>

                        {/* Pricing */}
                        <div className="detail-row">
                          <span className="label">Base Fare:</span>
                          <span className="value">₹{vehicle.baseFare}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Per KM Fare:</span>
                          <span className="value">₹{vehicle.farePerKm}/km</span>
                        </div>

                        {/* Certifications */}
                        <div className="detail-row">
                          <span className="label">Certifications:</span>
                          <span className="value">
                            {[
                              vehicle.registrationCertificate && "Reg",
                              vehicle.insuranceCertificate && "Ins",
                              vehicle.pollutionCertificate && "PUC",
                            ]
                              .filter(Boolean)
                              .join(", ") || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer - Actions */}
                    <div className="card-footer bg-light">
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-primary flex-grow-1"
                          onClick={() => handleEditVehicle(vehicle._id)}
                        >
                          <Edit size={16} className="me-1" />
                          Edit
                        </button>

                        <button
                          className={`btn btn-sm flex-grow-1 ${vehicle.availabilityStatus === "available"
                              ? "btn-outline-warning"
                              : "btn-outline-success"
                            }`}
                          onClick={() =>
                            toggleAvailability(
                              vehicle._id,
                              vehicle.availabilityStatus
                            )
                          }
                        >
                          {vehicle.availabilityStatus === "available"
                            ? "Mark Maintenance"
                            : "Mark Available"}
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger flex-grow-1"
                          onClick={() => handleDeleteClick(vehicle)}
                        >
                          <Trash2 size={16} className="me-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Delete Vehicle</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setDeleteModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{vehicleToDelete?.vehicleName}</strong>?
                </p>
                <p className="text-muted small">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteModalVisible(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default VehicleManagement;
