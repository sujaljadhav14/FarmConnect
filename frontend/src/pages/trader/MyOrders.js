import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import TraderMenu from "../../Dashboards/TraderMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { Eye, XCircle, CheckCircle, CashStack } from "react-bootstrap-icons";

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { auth } = useAuth();
    const [cancelLoading, setCancelLoading] = useState(null);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API}/api/orders/trader/my-orders`,
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
            console.error("Error fetching orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            setCancelLoading(orderId);
            try {
                const { data } = await axios.put(
                    `${process.env.REACT_APP_API}/api/orders/cancel/${orderId}`,
                    { cancellationReason: "Cancelled by trader" },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (data.success) {
                    toast.success("Order cancelled successfully");
                    fetchMyOrders();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error("Error cancelling order:", error);
                toast.error(error.response?.data?.message || "Failed to cancel order");
            } finally {
                setCancelLoading(null);
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Pending: { color: "warning", text: "⏳ Pending Approval" },
            "Farmer Agreed": { color: "info", text: "✍️ Farmer Signed - Your Turn" },
            "Both Agreed": { color: "primary", text: "🤝 Agreement Complete" },
            "Awaiting Advance": { color: "warning", text: "💰 Pay 30% Advance" },
            "Advance Paid": { color: "success", text: "✓ Advance Paid" },
            Accepted: { color: "info", text: "✓ Accepted" },
            Rejected: { color: "danger", text: "✗ Rejected" },
            "Ready for Pickup": { color: "primary", text: "📦 Ready for Pickup" },
            "Transport Assigned": { color: "info", text: "🚛 Transport Selected" },
            "In Transit": { color: "info", text: "🚚 In Transit" },
            Delivered: { color: "success", text: "✓ Delivered" },
            "Awaiting Final Payment": { color: "warning", text: "💰 Pay Remaining" },
            Cancelled: { color: "secondary", text: "Cancelled" },
            Completed: { color: "success", text: "✓ Completed" },
        };

        const config = statusConfig[status] || { color: "secondary", text: status };

        return <span className={`badge bg-${config.color}`}>{config.text}</span>;
    };

    const getPaymentStatusBadge = (status) => {
        const statusColors = {
            Pending: "warning",
            "Advance Paid": "info",
            "Full Paid": "success",
            Failed: "danger",
        };

        return (
            <span className={`badge bg-${statusColors[status] || "secondary"}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <Layout title="My Orders">
                <div className="container-fluid mt-4">
                    <div className="row">
                        <div className="col-md-3 col-lg-2 mb-3">
                            <TraderMenu />
                        </div>
                        <div className="col-md-9 col-lg-10">
                            <div className="text-center mt-5">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Loading your orders...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="My Orders">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <TraderMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <h3 className="text-success mb-4">📦 My Orders</h3>

                        {orders.length === 0 ? (
                            <div className="card shadow-sm">
                                <div className="card-body text-center py-5">
                                    <h5 className="text-muted">No orders placed yet</h5>
                                    <p className="text-muted">Start ordering crops from farmers</p>
                                    <button
                                        className="btn btn-success mt-3"
                                        onClick={() => navigate("/trader/crops")}
                                    >
                                        Browse Crops
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {orders.map((order) => (
                                    <div className="col-12" key={order._id}>
                                        <div className="card shadow-sm order-card">
                                            <div className="card-body">
                                                <div className="row">
                                                    {/* Order Details */}
                                                    <div className="col-md-8">
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <div>
                                                                <h5 className="text-success mb-1">
                                                                    {order.cropId?.cropName || "N/A"}
                                                                </h5>
                                                                <small className="text-muted">
                                                                    Order ID: {order._id.slice(-8)}
                                                                </small>
                                                            </div>
                                                            <div className="text-end">
                                                                {getStatusBadge(order.orderStatus)}
                                                            </div>
                                                        </div>

                                                        <div className="row">
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted">Quantity:</small>
                                                                <p className="mb-0">
                                                                    <strong>
                                                                        {order.quantity} {order.cropId?.unit || "unit"}
                                                                    </strong>
                                                                </p>
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted">Total Price:</small>
                                                                <p className="mb-0">
                                                                    <strong className="text-success">
                                                                        ₹{order.totalPrice}
                                                                    </strong>
                                                                </p>
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted">Farmer:</small>
                                                                <p className="mb-0">
                                                                    {order.farmerId?.name || "N/A"}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-6 mb-2">
                                                                <small className="text-muted">Payment Status:</small>
                                                                <p className="mb-0">
                                                                    {getPaymentStatusBadge(order.paymentStatus)}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-12 mb-2">
                                                                <small className="text-muted">
                                                                    Delivery Address:
                                                                </small>
                                                                <p className="mb-0">{order.deliveryAddress}</p>
                                                            </div>
                                                        </div>

                                                        {order.rejectionReason && (
                                                            <div className="alert alert-danger mt-2 mb-0">
                                                                <strong>Rejection Reason:</strong>{" "}
                                                                {order.rejectionReason}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="col-md-4">
                                                        <div className="text-md-end">
                                                            <small className="text-muted d-block mb-3">
                                                                Ordered on{" "}
                                                                {new Date(order.orderDate).toLocaleDateString()}
                                                            </small>

                                                            <div className="d-flex flex-column gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() =>
                                                                        navigate(`/trader/order/${order._id}`)
                                                                    }
                                                                >
                                                                    <Eye size={14} className="me-1" />
                                                                    View Details
                                                                </button>

                                                                {/* Farmer Agreed: Confirm Agreement */}
                                                                {order.orderStatus === "Farmer Agreed" && (
                                                                    <button
                                                                        className="btn btn-sm btn-success"
                                                                        onClick={() => navigate(`/trader/confirm-agreement/${order._id}`)}
                                                                    >
                                                                        <CheckCircle size={14} className="me-1" />
                                                                        Confirm Agreement
                                                                    </button>
                                                                )}

                                                                {/* Both Agreed: Pay Advance */}
                                                                {order.orderStatus === "Both Agreed" && (
                                                                    <button
                                                                        className="btn btn-sm btn-warning"
                                                                        onClick={() => navigate(`/trader/pay-advance/${order._id}`)}
                                                                    >
                                                                        <CashStack size={14} className="me-1" />
                                                                        Pay 30% Advance (₹{Math.round(order.totalPrice * 0.30)})
                                                                    </button>
                                                                )}

                                                                {/* Pending: Cancel */}
                                                                {order.orderStatus === "Pending" && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleCancelOrder(order._id)}
                                                                        disabled={cancelLoading === order._id}
                                                                    >
                                                                        {cancelLoading === order._id ? (
                                                                            <span
                                                                                className="spinner-border spinner-border-sm"
                                                                                role="status"
                                                                            ></span>
                                                                        ) : (
                                                                            <>
                                                                                <XCircle size={14} className="me-1" />
                                                                                Cancel Order
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer bg-light">
                                                <small className="text-muted">
                                                    Expected Delivery:{" "}
                                                    {new Date(
                                                        order.expectedDeliveryDate
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
        .order-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
        </Layout>
    );
};

export default MyOrders;
