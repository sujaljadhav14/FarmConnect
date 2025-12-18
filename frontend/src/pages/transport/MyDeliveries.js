import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import TransportMenu from "../../Dashboards/TransportMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { Truck, GeoAlt, Eye } from "react-bootstrap-icons";

const MyDeliveries = () => {
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState([]);
    const { auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(null);

    useEffect(() => {
        fetchMyDeliveries();
    }, []);

    const fetchMyDeliveries = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API}/api/transport/my-deliveries`,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                setDeliveries(data.deliveries);
            }
        } catch (error) {
            console.error("Error fetching deliveries:", error);
            toast.error("Failed to load deliveries");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (deliveryId, newStatus) => {
        const confirmed = window.confirm(`Mark delivery as "${newStatus}"?`);
        if (!confirmed) return;

        setStatusLoading(deliveryId);
        try {
            const { data } = await axios.put(
                `${process.env.REACT_APP_API}/api/transport/status/${deliveryId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                toast.success(`Status updated to ${newStatus}`);
                fetchMyDeliveries();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
            setStatusLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Assigned: { color: "warning", text: "📍 Assigned" },
            "Picked Up": { color: "info", text: "📦 Picked Up" },
            "In Transit": { color: "primary", text: "🚚 In Transit" },
            Delivered: { color: "success", text: "✓ Delivered" },
            Failed: { color: "danger", text: "✗ Failed" },
        };

        const config = statusConfig[status] || { color: "secondary", text: status };
        return <span className={`badge bg-${config.color}`}>{config.text}</span>;
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            Assigned: "Picked Up",
            "Picked Up": "In Transit",
            "In Transit": "Delivered",
        };
        return statusFlow[currentStatus];
    };

    if (loading) {
        return (
            <Layout title="My Deliveries">
                <div className="container-fluid mt-4">
                    <div className="row">
                        <div className="col-md-3 col-lg-2 mb-3">
                            <TransportMenu />
                        </div>
                        <div className="col-md-9 col-lg-10">
                            <div className="text-center mt-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Loading deliveries...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="My Deliveries">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <TransportMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <h3 className="text-primary mb-4">
                            <Truck size={32} className="me-2" />
                            My Active Deliveries
                        </h3>

                        {deliveries.length === 0 ? (
                            <div className="card shadow-sm">
                                <div className="card-body text-center py-5">
                                    <h5 className="text-muted">No active deliveries</h5>
                                    <p className="text-muted">
                                        Accept deliveries from available list
                                    </p>
                                    <button
                                        className="btn btn-primary mt-3"
                                        onClick={() => navigate("/transport/available")}
                                    >
                                        View Available Deliveries
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {deliveries.map((delivery) => (
                                    <div className="col-12" key={delivery._id}>
                                        <div className="card shadow-sm delivery-card">
                                            <div className="card-body">
                                                <div className="row">
                                                    {/* Delivery Details */}
                                                    <div className="col-md-8">
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <div>
                                                                <h5 className="text-primary mb-1">
                                                                    {delivery.orderId?.cropId?.cropName || "N/A"}
                                                                </h5>
                                                                <small className="text-muted">
                                                                    Delivery ID: {delivery._id.slice(-8)}
                                                                </small>
                                                            </div>
                                                            <div>{getStatusBadge(delivery.status)}</div>
                                                        </div>

                                                        <div className="row">
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted">Quantity:</small>
                                                                <p className="mb-0">
                                                                    <strong>
                                                                        {delivery.orderId?.quantity}{" "}
                                                                        {delivery.orderId?.cropId?.unit || "unit"}
                                                                    </strong>
                                                                </p>
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted">Delivery Fee:</small>
                                                                <p className="mb-0">
                                                                    <strong className="text-success">
                                                                        ₹{delivery.deliveryFee}
                                                                    </strong>
                                                                </p>
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted">Vehicle:</small>
                                                                <p className="mb-0">
                                                                    {delivery.vehicleType} - {delivery.vehicleNumber}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Locations */}
                                                        <div className="mt-3">
                                                            <div className="mb-2">
                                                                <small className="text-muted">
                                                                    <GeoAlt size={14} className="me-1" />
                                                                    Pickup:
                                                                </small>
                                                                <p className="mb-0">{delivery.pickupLocation}</p>
                                                            </div>
                                                            <div>
                                                                <small className="text-muted">
                                                                    <GeoAlt size={14} className="me-1" />
                                                                    Delivery:
                                                                </small>
                                                                <p className="mb-0">{delivery.deliveryLocation}</p>
                                                            </div>
                                                        </div>

                                                        {/* Contacts */}
                                                        <div className="row mt-3">
                                                            <div className="col-md-6">
                                                                <small className="text-muted">Farmer:</small>
                                                                <p className="mb-0">
                                                                    {delivery.orderId?.farmerId?.name || "N/A"}
                                                                </p>
                                                                {delivery.orderId?.farmerId?.phone && (
                                                                    <small>📞 {delivery.orderId.farmerId.phone}</small>
                                                                )}
                                                            </div>
                                                            <div className="col-md-6">
                                                                <small className="text-muted">Trader:</small>
                                                                <p className="mb-0">
                                                                    {delivery.orderId?.traderId?.name || "N/A"}
                                                                </p>
                                                                {delivery.orderId?.traderId?.phone && (
                                                                    <small>📞 {delivery.orderId.traderId.phone}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="col-md-4">
                                                        <div className="text-md-end">
                                                            <small className="text-muted d-block mb-3">
                                                                Accepted on{" "}
                                                                {new Date(delivery.createdAt).toLocaleDateString()}
                                                            </small>

                                                            <div className="d-flex flex-column gap-2">
                                                                {/* Update Status Button */}
                                                                {getNextStatus(delivery.status) && (
                                                                    <button
                                                                        className="btn btn-sm btn-primary"
                                                                        onClick={() =>
                                                                            handleUpdateStatus(
                                                                                delivery._id,
                                                                                getNextStatus(delivery.status)
                                                                            )
                                                                        }
                                                                        disabled={statusLoading === delivery._id}
                                                                    >
                                                                        {statusLoading === delivery._id ? (
                                                                            <span className="spinner-border spinner-border-sm" />
                                                                        ) : (
                                                                            <>
                                                                                Mark as {getNextStatus(delivery.status)}
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}

                                                                {/* View Details */}
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() =>
                                                                        navigate(`/transport/delivery/${delivery._id}`)
                                                                    }
                                                                >
                                                                    <Eye size={14} className="me-1" />
                                                                    View Details
                                                                </button>

                                                                {/* Mark Failed (if needed) */}
                                                                {delivery.status !== "Delivered" && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() =>
                                                                            handleUpdateStatus(delivery._id, "Failed")
                                                                        }
                                                                        disabled={statusLoading === delivery._id}
                                                                    >
                                                                        Mark Failed
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer bg-light">
                                                <small className="text-muted">
                                                    Expected by:{" "}
                                                    {new Date(
                                                        delivery.orderId?.expectedDeliveryDate
                                                    ).toLocaleDateString()}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .delivery-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .delivery-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
        </Layout>
    );
};

export default MyDeliveries;
