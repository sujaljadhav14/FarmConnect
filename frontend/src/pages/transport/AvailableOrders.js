import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { MapPin, Calendar, Package, TrendingUp, Truck, AlertCircle } from "react-bootstrap-icons";
import axios from "axios";
import "../../styles/AvailableOrders.css";

const AvailableOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [suggestedVehicles, setSuggestedVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [acceptingOrder, setAcceptingOrder] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/vehicles/orders/available", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to fetch available orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    setSuggestedVehicles([]);
    setSelectedVehicle(null);

    // Fetch suggested vehicles for this order
    try {
      setLoadingVehicles(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/vehicles/suggest/${order._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuggestedVehicles(response.data.suggestedVehicles);
        if (response.data.suggestedVehicles.length === 0) {
          setError(
            `No suitable vehicles found for ${response.data.orderQuantity} ${response.data.quantityUnit}. Please add a vehicle with appropriate weight capacity.`
          );
        } else {
          setError(null);
        }
      }
    } catch (err) {
      console.error("Error fetching suggested vehicles:", err);
      setError(err.response?.data?.message || "Failed to load suggested vehicles");
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrder || !selectedVehicle) {
      setError("Please select both an order and a vehicle");
      return;
    }

    try {
      setAcceptingOrder(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `/api/transport/accept/${selectedOrder._id}`,
        {
          vehicleId: selectedVehicle._id,
          vehicleType: selectedVehicle.vehicleType,
          vehicleNumber: selectedVehicle.vehicleNumber,
          deliveryFee: selectedVehicle.baseFare + selectedVehicle.farePerKm * 10, // Estimated fee
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Remove accepted order from list
        setOrders(orders.filter((o) => o._id !== selectedOrder._id));
        setSelectedOrder(null);
        setSelectedVehicle(null);
        setSuggestedVehicles([]);

        // Show success message
        alert("Order accepted successfully! Check your active deliveries.");
        navigate("/transport/deliveries");
      }
    } catch (err) {
      console.error("Error accepting order:", err);
      setError(err.response?.data?.message || "Failed to accept order");
    } finally {
      setAcceptingOrder(false);
    }
  };

  const convertWeightToKg = (quantity, unit) => {
    switch (unit) {
      case "quintal":
        return quantity * 100;
      case "ton":
        return quantity * 1000;
      default:
        return quantity;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout title="Available Orders">
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
    <Layout title="Available Orders">
      <div className="container-fluid mt-4">
        <div className="available-orders-wrapper">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-success mb-2">📦 Available Orders</h2>
            <p className="text-muted">
              Select from active trader orders ready for transport
            </p>
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

          {/* Empty State */}
          {orders.length === 0 ? (
            <div className="text-center py-5">
              <Package size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No orders available</h5>
              <p className="text-muted">
                Check back later when traders complete agreements with farmers
              </p>
            </div>
          ) : (
            <div className="row">
              {/* Orders List */}
              <div className="col-lg-6">
                <h5 className="mb-3">Available Orders ({orders.length})</h5>

                <div className="orders-list">
                  {orders.map((order) => {
                    const quantityInKg = convertWeightToKg(
                      order.cropId.quantity,
                      order.cropId.unit
                    );
                    const isSelected = selectedOrder?._id === order._id;

                    return (
                      <div
                        key={order._id}
                        className={`order-card card mb-3 cursor-pointer ${isSelected ? "selected" : ""
                          }`}
                        onClick={() => handleSelectOrder(order)}
                        style={{
                          borderLeft: isSelected
                            ? "4px solid #28a745"
                            : "4px solid transparent",
                          backgroundColor: isSelected ? "#f0f8f5" : "white",
                        }}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="mb-1 text-success">
                                {order.cropId.cropName}
                              </h6>
                              <small className="text-muted">
                                Order #{order._id.slice(-6).toUpperCase()}
                              </small>
                            </div>
                            <span className="badge bg-success">
                              Ready for Pickup
                            </span>
                          </div>

                          <div className="order-info">
                            <div className="info-row">
                              <Package size={16} className="me-2" />
                              <div>
                                <small className="text-muted d-block">Quantity</small>
                                <strong>
                                  {order.cropId.quantity} {order.cropId.unit}
                                  <span className="text-muted ms-2">
                                    (~{quantityInKg.toFixed(0)} kg)
                                  </span>
                                </strong>
                              </div>
                            </div>

                            <div className="info-row">
                              <TrendingUp size={16} className="me-2" />
                              <div>
                                <small className="text-muted d-block">
                                  Total Price
                                </small>
                                <strong className="text-success">
                                  ₹{order.totalPrice.toLocaleString("en-IN")}
                                </strong>
                              </div>
                            </div>

                            <div className="info-row">
                              <MapPin size={16} className="me-2" />
                              <div>
                                <small className="text-muted d-block">
                                  Delivery Location
                                </small>
                                <strong>{order.deliveryAddress}</strong>
                              </div>
                            </div>

                            <div className="info-row">
                              <Calendar size={16} className="me-2" />
                              <div>
                                <small className="text-muted d-block">
                                  Expected Delivery
                                </small>
                                <strong>
                                  {formatDate(order.expectedDeliveryDate)}
                                </strong>
                              </div>
                            </div>

                            {order.traderId && (
                              <div className="info-row">
                                <small className="text-muted">
                                  Trader: <strong>{order.traderId.name}</strong>
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Details & Vehicle Selection */}
              <div className="col-lg-6">
                {selectedOrder ? (
                  <div className="card shadow-sm">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">
                        <Truck size={20} className="me-2" />
                        Select Vehicle for Delivery
                      </h5>
                    </div>

                    <div className="card-body">
                      <div className="selected-order-summary p-3 bg-light rounded mb-4">
                        <h6 className="text-success mb-2">
                          {selectedOrder.cropId.cropName}
                        </h6>
                        <div className="row g-2 text-sm">
                          <div className="col-6">
                            <small className="text-muted">Quantity</small>
                            <p className="mb-0">
                              <strong>{selectedOrder.cropId.quantity} {selectedOrder.cropId.unit}</strong>
                            </p>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Destination</small>
                            <p className="mb-0">
                              <strong>{selectedOrder.deliveryAddress.slice(0, 30)}...</strong>
                            </p>
                          </div>
                        </div>
                      </div>

                      {loadingVehicles ? (
                        <div className="text-center py-4">
                          <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">
                              Loading vehicles...
                            </span>
                          </div>
                        </div>
                      ) : suggestedVehicles.length === 0 ? (
                        <div className="alert alert-warning">
                          <AlertCircle size={20} className="me-2" />
                          <strong>No suitable vehicles</strong>
                          <p className="mb-0 mt-2">
                            Please add a vehicle that can carry{" "}
                            {convertWeightToKg(
                              selectedOrder.cropId.quantity,
                              selectedOrder.cropId.unit
                            ).toFixed(0)}{" "}
                            kg
                          </p>
                          <button
                            className="btn btn-sm btn-warning mt-2"
                            onClick={() => navigate("/transport/vehicles/add")}
                          >
                            Add Vehicle
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h6 className="mb-3">Recommended Vehicles</h6>
                          <div className="vehicles-list">
                            {suggestedVehicles.map((vehicle) => (
                              <div
                                key={vehicle._id}
                                className={`vehicle-option card mb-2 cursor-pointer ${selectedVehicle?._id === vehicle._id
                                    ? "border-success"
                                    : ""
                                  }`}
                                onClick={() => setSelectedVehicle(vehicle)}
                                style={{
                                  cursor: "pointer",
                                  borderWidth:
                                    selectedVehicle?._id === vehicle._id
                                      ? "2px"
                                      : "1px",
                                  borderColor:
                                    selectedVehicle?._id === vehicle._id
                                      ? "#28a745"
                                      : "#ddd",
                                }}
                              >
                                <div className="card-body p-3">
                                  <div className="d-flex justify-content-between mb-2">
                                    <h6 className="mb-0">
                                      {vehicle.vehicleName}
                                    </h6>
                                    <span className="badge bg-success">
                                      {vehicle.vehicleType}
                                    </span>
                                  </div>

                                  <div className="row g-2 text-sm mb-2">
                                    <div className="col-6">
                                      <small className="text-muted">
                                        Weight Capacity
                                      </small>
                                      <p className="mb-0">
                                        <strong>
                                          {vehicle.weightSlab.minWeight} -{" "}
                                          {vehicle.weightSlab.maxWeight}{" "}
                                          {vehicle.weightSlab.unit}
                                        </strong>
                                      </p>
                                    </div>
                                    <div className="col-6">
                                      <small className="text-muted">
                                        Registration
                                      </small>
                                      <p className="mb-0">
                                        <strong>
                                          {vehicle.vehicleNumber}
                                        </strong>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="row g-2 text-sm">
                                    <div className="col-6">
                                      <small className="text-muted">
                                        Base Fare
                                      </small>
                                      <p className="mb-0">
                                        <strong>₹{vehicle.baseFare}</strong>
                                      </p>
                                    </div>
                                    <div className="col-6">
                                      <small className="text-muted">
                                        Per KM Fare
                                      </small>
                                      <p className="mb-0">
                                        <strong>
                                          ₹{vehicle.farePerKm}/km
                                        </strong>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Accept Button */}
                      {suggestedVehicles.length > 0 && (
                        <div className="mt-4 d-grid gap-2">
                          <button
                            className="btn btn-success btn-lg"
                            onClick={handleAcceptOrder}
                            disabled={
                              !selectedVehicle ||
                              acceptingOrder ||
                              loadingVehicles
                            }
                          >
                            {acceptingOrder ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Accepting...
                              </>
                            ) : (
                              "Accept Order & Proceed"
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card shadow-sm">
                    <div className="card-body text-center py-5">
                      <Truck size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">Select an Order</h5>
                      <p className="text-muted">
                        Click on an order to see recommended vehicles
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .orders-list {
          max-height: 600px;
          overflow-y: auto;
        }
        .order-card {
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .order-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .order-info .info-row {
          display: flex;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .vehicle-option {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .vehicle-option:hover {
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.1);
        }
      `}</style>
    </Layout>
  );
};

export default AvailableOrders;
