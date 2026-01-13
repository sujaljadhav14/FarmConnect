import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { Eye, CheckCircle, XCircle, BoxSeam, FileEarmarkPdf } from "react-bootstrap-icons";
import { generateSignedAgreement } from "../../utils/generateSignedAgreement";


const FarmerMyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const { auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchMyOrders = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `/api/orders/farmer/my-orders`,
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
    }, [auth?.token]);

    useEffect(() => {
        fetchMyOrders();
    }, [fetchMyOrders]);



    const handleRejectOrder = async (orderId) => {
        const reason = prompt("Enter rejection reason:");
        if (reason) {
            setActionLoading(orderId);
            try {
                const { data } = await axios.put(
                    `/api/orders/reject/${orderId}`,
                    { rejectionReason: reason },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (data.success) {
                    toast.success("Order rejected");
                    fetchMyOrders();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error("Error rejecting order:", error);
                toast.error(error.response?.data?.message || "Failed to reject order");
            } finally {
                setActionLoading(null);
            }
        }
    };

    const handleMarkReady = async (orderId) => {
        if (window.confirm("Mark this order as ready for pickup?")) {
            setActionLoading(orderId);
            try {
                const { data } = await axios.put(
                    `/api/orders/ready/${orderId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (data.success) {
                    toast.success("Order marked ready for pickup!");
                    fetchMyOrders();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error("Error updating order:", error);
                toast.error(error.response?.data?.message || "Failed to update order");
            } finally {
                setActionLoading(null);
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Pending: { color: "warning", text: "⏳ Pending" },
            "Farmer Agreed": { color: "info", text: "✍️ You Signed" },
            "Both Agreed": { color: "primary", text: "🤝 Both Agreed" },
            "Awaiting Advance": { color: "warning", text: "💰 Awaiting Payment" },
            "Advance Paid": { color: "success", text: "✓ Advance Received" },
            Accepted: { color: "info", text: "✓ Accepted" },
            Rejected: { color: "danger", text: "✗ Rejected" },
            "Ready for Pickup": { color: "primary", text: "📦 Ready" },
            "Transport Assigned": { color: "info", text: "🚛 Transport Assigned" },
            "In Transit": { color: "info", text: "🚚 In Transit" },
            Delivered: { color: "success", text: "✓ Delivered" },
            "Awaiting Final Payment": { color: "warning", text: "💰 Awaiting Final" },
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
                            <FarmerMenu />
                        </div>
                        <div className="col-md-9 col-lg-10">
                            <div className="text-center mt-5">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Loading orders...</p>
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
                        <FarmerMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <h3 className="text-success mb-4">📦 Orders Received</h3>

                        {orders.length === 0 ? (
                            <div className="card shadow-sm">
                                <div className="card-body text-center py-5">
                                    <h5 className="text-muted">No orders received yet</h5>
                                    <p className="text-muted">
                                        Orders from traders will appear here
                                    </p>
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
                                                                <small className="text-muted">Trader:</small>
                                                                <p className="mb-0">
                                                                    <strong>{order.traderId?.name || "N/A"}</strong>
                                                                </p>
                                                                {order.traderId?.phone && (
                                                                    <small className="text-muted">
                                                                        📞 {order.traderId.phone}
                                                                    </small>
                                                                )}
                                                            </div>
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
                                                                <small className="text-muted">Payment:</small>
                                                                <p className="mb-0">
                                                                    {order.paymentMethod} -{" "}
                                                                    {getPaymentStatusBadge(order.paymentStatus)}
                                                                </p>
                                                            </div>
                                                            <div className="col-md-12 mb-2">
                                                                <small className="text-muted">
                                                                    Delivery Address:
                                                                </small>
                                                                <p className="mb-0">{order.deliveryAddress}</p>
                                                            </div>
                                                            {order.notes && (
                                                                <div className="col-md-12 mb-2">
                                                                    <small className="text-muted">Notes:</small>
                                                                    <p className="mb-0 fst-italic">
                                                                        "{order.notes}"
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="col-md-4">
                                                        <div className="text-md-end">
                                                            <small className="text-muted d-block mb-3">
                                                                Ordered on{" "}
                                                                {new Date(order.orderDate).toLocaleDateString()}
                                                            </small>

                                                            <div className="d-flex flex-column gap-2">

                                                                {/* Pending: Sign Agreement / Reject */}
                                                                {order.orderStatus === "Pending" && (
                                                                    <>
                                                                        <button
                                                                            className="btn btn-sm btn-success"
                                                                            onClick={() => navigate(`/farmer/agreement/${order._id}`)}
                                                                        >
                                                                            <CheckCircle size={14} className="me-1" />
                                                                            Sign Agreement
                                                                        </button>

                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() => handleRejectOrder(order._id)}
                                                                            disabled={actionLoading === order._id}
                                                                        >
                                                                            <XCircle size={14} className="me-1" />
                                                                            Reject Order
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {/* Farmer Agreed: Waiting for Trader */}
                                                                {order.orderStatus === "Farmer Agreed" && (
                                                                    <div className="alert alert-info py-2 mb-0 small">
                                                                        ⏳ Waiting for trader to confirm agreement
                                                                    </div>
                                                                )}

                                                                {/* Both Agreed: Download Agreement + Waiting for Payment */}
                                                                {order.orderStatus === "Both Agreed" && (
                                                                    <>
                                                                        <button
                                                                            className="btn btn-sm btn-success"
                                                                            onClick={async () => {
                                                                                try {
                                                                                    const { data } = await axios.get(
                                                                                        `/api/agreements/${order._id}`,
                                                                                        { headers: { Authorization: `Bearer ${auth?.token}` } }
                                                                                    );
                                                                                    if (data.success) {
                                                                                        generateSignedAgreement(order, {
                                                                                            farmerSigned: true,
                                                                                            farmerName: data.agreement?.farmerAgreement?.digitalSignature || auth?.user?.name,
                                                                                            farmerSignedAt: data.agreement?.farmerAgreement?.signedAt,
                                                                                            traderSigned: true,
                                                                                            traderName: data.agreement?.traderAgreement?.digitalSignature || order?.traderId?.name,
                                                                                            traderSignedAt: data.agreement?.traderAgreement?.signedAt,
                                                                                        }, data.agreement);
                                                                                        toast.success("Agreement downloaded!");
                                                                                    }
                                                                                } catch (err) {
                                                                                    toast.error("Failed to download agreement");
                                                                                }
                                                                            }}
                                                                        >
                                                                            <FileEarmarkPdf size={14} className="me-1" />
                                                                            Download Agreement
                                                                        </button>
                                                                        <div className="alert alert-warning py-2 mb-0 small">
                                                                            💰 Waiting for trader's 30% advance payment
                                                                        </div>
                                                                    </>
                                                                )}

                                                                {/* Advance Paid or Accepted: Mark Ready */}
                                                                {(order.orderStatus === "Advance Paid" || order.orderStatus === "Accepted") && (
                                                                    <button
                                                                        className="btn btn-sm btn-primary"
                                                                        onClick={() => handleMarkReady(order._id)}
                                                                        disabled={actionLoading === order._id}
                                                                    >
                                                                        {actionLoading === order._id ? (
                                                                            <span className="spinner-border spinner-border-sm" />
                                                                        ) : (
                                                                            <>
                                                                                <BoxSeam size={14} className="me-1" />
                                                                                Mark Ready
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}

                                                                {/* View Details */}
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => navigate(`/farmer/order/${order._id}`)}
                                                                >
                                                                    <Eye size={14} className="me-1" />
                                                                    View Details
                                                                </button>

                                                                {/* ✅ DOWNLOAD AGREEMENT BUTTON */}
                                                                {["Accepted", "Ready for Pickup", "Delivered", "Completed"].includes(order.orderStatus) && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-success"
                                                                        onClick={async () => {
                                                                            try {
                                                                                const { data } = await axios.get(
                                                                                    `/api/agreements/${order._id}`,
                                                                                    { headers: { Authorization: `Bearer ${auth?.token}` } }
                                                                                );
                                                                                if (data.success) {
                                                                                    generateSignedAgreement(order, {
                                                                                        farmerSigned: true,
                                                                                        farmerName: data.agreement?.farmerAgreement?.digitalSignature || auth?.user?.name,
                                                                                        farmerSignedAt: data.agreement?.farmerAgreement?.signedAt,
                                                                                        traderSigned: true,
                                                                                        traderName: data.agreement?.traderAgreement?.digitalSignature || order?.traderId?.name,
                                                                                        traderSignedAt: data.agreement?.traderAgreement?.signedAt,
                                                                                    }, data.agreement);
                                                                                    toast.success("Agreement downloaded!");
                                                                                }
                                                                            } catch (err) {
                                                                                toast.error("Failed to download agreement");
                                                                            }
                                                                        }}
                                                                    >
                                                                        <FileEarmarkPdf size={14} className="me-1" />
                                                                        Download Agreement
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

export default FarmerMyOrders;
