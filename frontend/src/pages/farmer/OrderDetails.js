import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { ArrowLeft, Person, GeoAlt, Calendar, Telephone } from "react-bootstrap-icons";

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const { data } = await axios.get(
                `/api/orders/details/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                setOrder(data.order);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            toast.error("Failed to load order details");
            navigate("/farmer/orders");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Pending: { color: "warning", text: "⏳ Pending" },
            Accepted: { color: "info", text: "✓ Accepted" },
            Rejected: { color: "danger", text: "✗ Rejected" },
            "Ready for Pickup": { color: "primary", text: "📦 Ready" },
            "In Transit": { color: "info", text: "🚚 In Transit" },
            Delivered: { color: "success", text: "✓ Delivered" },
            Cancelled: { color: "secondary", text: "Cancelled" },
            Completed: { color: "success", text: "✓ Completed" },
        };

        const config = statusConfig[status] || { color: "secondary", text: status };
        return <span className={`badge bg-${config.color} fs-6`}>{config.text}</span>;
    };

    if (loading) {
        return (
            <Layout title="Order Details">
                <div className="container-fluid mt-4">
                    <div className="row">
                        <div className="col-md-3 col-lg-2 mb-3">
                            <FarmerMenu />
                        </div>
                        <div className="col-md-9 col-lg-10">
                            <div className="text-center mt-5">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Loading order details...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <Layout title="Order Details">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <FarmerMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        {/* Back Button */}
                        <button
                            className="btn btn-outline-secondary mb-3"
                            onClick={() => navigate("/farmer/orders")}
                        >
                            <ArrowLeft size={18} className="me-2" />
                            Back to Orders
                        </button>

                        <div className="row">
                            {/* Order Details */}
                            <div className="col-lg-8 mb-4">
                                <div className="card shadow-sm">
                                    <div className="card-header bg-success text-white">
                                        <h5 className="mb-0">Order Details</h5>
                                    </div>
                                    <div className="card-body">
                                        {/* Order ID & Status */}
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div>
                                                <h6 className="text-muted mb-1">Order ID</h6>
                                                <p className="mb-0">{order._id}</p>
                                            </div>
                                            <div>{getStatusBadge(order.orderStatus)}</div>
                                        </div>

                                        {/* Crop Information */}
                                        <div className="mb-4">
                                            <h6 className="text-secondary mb-3">Crop Information</h6>
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <small className="text-muted">Crop Name</small>
                                                    <p className="mb-0">
                                                        <strong>{order.cropId?.cropName || "N/A"}</strong>
                                                    </p>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <small className="text-muted">Category</small>
                                                    <p className="mb-0">{order.cropId?.category || "N/A"}</p>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <small className="text-muted">Quality</small>
                                                    <p className="mb-0">{order.cropId?.quality || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Information */}
                                        <div className="mb-4">
                                            <h6 className="text-secondary mb-3">Order Information</h6>
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <small className="text-muted">Quantity</small>
                                                    <p className="mb-0">
                                                        <strong>
                                                            {order.quantity} {order.cropId?.unit || "unit"}
                                                        </strong>
                                                    </p>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <small className="text-muted">Price per Unit</small>
                                                    <p className="mb-0">₹{order.pricePerUnit}</p>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <small className="text-muted">Total Price</small>
                                                    <p className="mb-0">
                                                        <strong className="text-success">
                                                            ₹{order.totalPrice}
                                                        </strong>
                                                    </p>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <small className="text-muted">Payment Method</small>
                                                    <p className="mb-0">{order.paymentMethod}</p>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <small className="text-muted">Payment Status</small>
                                                    <p className="mb-0">
                                                        <span
                                                            className={`badge bg-${order.paymentStatus === "Full Paid"
                                                                ? "success"
                                                                : order.paymentStatus === "Advance Paid"
                                                                    ? "info"
                                                                    : "warning"
                                                                }`}
                                                        >
                                                            {order.paymentStatus}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delivery Information */}
                                        <div className="mb-4">
                                            <h6 className="text-secondary mb-3">Delivery Information</h6>
                                            <div className="mb-3">
                                                <small className="text-muted">Delivery Address</small>
                                                <p className="mb-0">{order.deliveryAddress}</p>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <small className="text-muted">Order Date</small>
                                                    <p className="mb-0">
                                                        <Calendar size={14} className="me-1" />
                                                        {new Date(order.orderDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <small className="text-muted">Expected Delivery</small>
                                                    <p className="mb-0">
                                                        <Calendar size={14} className="me-1" />
                                                        {new Date(
                                                            order.expectedDeliveryDate
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {order.notes && (
                                            <div className="mb-3">
                                                <h6 className="text-secondary mb-2">Notes from Trader</h6>
                                                <p className="mb-0 fst-italic">"{order.notes}"</p>
                                            </div>
                                        )}

                                        {/* Rejection Reason */}
                                        {order.rejectionReason && (
                                            <div className="alert alert-danger">
                                                <strong>Rejection Reason:</strong> {order.rejectionReason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Trader Information */}
                            <div className="col-lg-4 mb-4">
                                <div className="card shadow-sm mb-3">
                                    <div className="card-header bg-primary text-white">
                                        <h6 className="mb-0">Trader Information</h6>
                                    </div>
                                    <div className="card-body">
                                        {order.traderId ? (
                                            <>
                                                <p className="mb-2">
                                                    <Person size={18} className="me-2 text-primary" />
                                                    <strong>{order.traderId.name}</strong>
                                                </p>
                                                {order.traderId.phone && (
                                                    <p className="mb-2">
                                                        <Telephone size={18} className="me-2 text-primary" />
                                                        {order.traderId.phone}
                                                    </p>
                                                )}
                                                {order.traderId.location && (
                                                    <p className="mb-0">
                                                        <GeoAlt size={18} className="me-2 text-primary" />
                                                        {order.traderId.location}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-muted mb-0">Information not available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Transport Information (if assigned) */}
                                {order.transportId && (
                                    <div className="card shadow-sm">
                                        <div className="card-header bg-info text-white">
                                            <h6 className="mb-0">Transport Information</h6>
                                        </div>
                                        <div className="card-body">
                                            <p className="mb-2">
                                                <Person size={18} className="me-2 text-info" />
                                                <strong>{order.transportId.name}</strong>
                                            </p>
                                            {order.transportId.phone && (
                                                <p className="mb-0">
                                                    <Telephone size={18} className="me-2 text-info" />
                                                    {order.transportId.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default OrderDetails;
