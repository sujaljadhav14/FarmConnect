import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import TransportMenu from "../../Dashboards/TransportMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { Truck, GeoAlt, Calendar } from "react-bootstrap-icons";

const AvailableDeliveries = () => {
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState([]);
    const { auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [acceptLoading, setAcceptLoading] = useState(null);

    useEffect(() => {
        fetchAvailableDeliveries();
    }, []);

    const fetchAvailableDeliveries = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API}/api/transport/available`,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Error fetching deliveries:", error);
            toast.error("Failed to load available deliveries");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptDelivery = async (orderId) => {
        const vehicleType = prompt("Enter vehicle type (Bike/Auto/Tempo/Truck):");
        if (!vehicleType) return;

        const vehicleNumber = prompt("Enter vehicle number:");
        if (!vehicleNumber) return;

        const deliveryFee = prompt("Enter delivery fee (₹):");
        if (!deliveryFee || isNaN(deliveryFee)) {
            toast.error("Invalid delivery fee");
            return;
        }

        setAcceptLoading(orderId);
        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_API}/api/transport/accept/${orderId}`,
                {
                    vehicleType,
                    vehicleNumber,
                    deliveryFee: Number(deliveryFee),
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                toast.success("Delivery accepted successfully!");
                navigate("/transport/my-deliveries");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error accepting delivery:", error);
            toast.error(error.response?.data?.message || "Failed to accept delivery");
        } finally {
            setAcceptLoading(null);
        }
    };

    if (loading) {
        return (
            <Layout title="Available Deliveries">
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
                                <p className="mt-3">Loading available deliveries...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Available Deliveries">
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
                            Available Deliveries
                        </h3>

                        {orders.length === 0 ? (
                            <div className="card shadow-sm">
                                <div className="card-body text-center py-5">
                                    <h5 className="text-muted">No deliveries available</h5>
                                    <p className="text-muted">
                                        Orders ready for pickup will appear here
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {orders.map((order) => (
                                    <div className="col-12 col-lg-6" key={order._id}>
                                        <div className="card shadow-sm h-100 delivery-card">
                                            <div className="card-body">
                                                {/* Crop & Status */}
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="text-primary mb-1">
                                                            {order.cropId?.cropName || "N/A"}
                                                        </h5>
                                                        <small className="text-muted">
                                                            {order.cropId?.category}
                                                        </small>
                                                    </div>
                                                    <span className="badge bg-success">Ready for Pickup</span>
                                                </div>

                                                {/* Quantity & Price */}
                                                <div className="row mb-3">
                                                    <div className="col-6">
                                                        <small className="text-muted">Quantity</small>
                                                        <p className="mb-0">
                                                            <strong>
                                                                {order.quantity} {order.cropId?.unit || "unit"}
                                                            </strong>
                                                        </p>
                                                    </div>
                                                    <div className="col-6">
                                                        <small className="text-muted">Order Value</small>
                                                        <p className="mb-0">
                                                            <strong className="text-success">
                                                                ₹{order.totalPrice}
                                                            </strong>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Locations */}
                                                <div className="mb-3">
                                                    <div className="mb-2">
                                                        <small className="text-muted d-block">
                                                            <GeoAlt size={14} className="me-1" />
                                                            Pickup from:
                                                        </small>
                                                        <p className="mb-0 ms-3">
                                                            {order.cropId?.location || order.farmerId?.location || "N/A"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <small className="text-muted d-block">
                                                            <GeoAlt size={14} className="me-1" />
                                                            Deliver to:
                                                        </small>
                                                        <p className="mb-0 ms-3">{order.deliveryAddress}</p>
                                                    </div>
                                                </div>

                                                {/* Farmer & Trader Info */}
                                                <div className="row mb-3">
                                                    <div className="col-6">
                                                        <small className="text-muted">Farmer</small>
                                                        <p className="mb-0">{order.farmerId?.name || "N/A"}</p>
                                                        {order.farmerId?.phone && (
                                                            <small className="text-muted">
                                                                📞 {order.farmerId.phone}
                                                            </small>
                                                        )}
                                                    </div>
                                                    <div className="col-6">
                                                        <small className="text-muted">Trader</small>
                                                        <p className="mb-0">{order.traderId?.name || "N/A"}</p>
                                                        {order.traderId?.phone && (
                                                            <small className="text-muted">
                                                                📞 {order.traderId.phone}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Expected Delivery */}
                                                <div className="mb-3">
                                                    <small className="text-muted">
                                                        <Calendar size={14} className="me-1" />
                                                        Expected by:{" "}
                                                        {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                                                    </small>
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                    className="btn btn-primary w-100"
                                                    onClick={() => handleAcceptDelivery(order._id)}
                                                    disabled={acceptLoading === order._id}
                                                >
                                                    {acceptLoading === order._id ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" />
                                                            Accepting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Truck size={16} className="me-2" />
                                                            Accept Delivery
                                                        </>
                                                    )}
                                                </button>
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
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }
      `}</style>
        </Layout>
    );
};

export default AvailableDeliveries;
