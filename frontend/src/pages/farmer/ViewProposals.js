import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { CheckCircle, XCircle, Calendar, CurrencyRupee, PersonCircle, StarFill } from "react-bootstrap-icons";

const ViewProposals = () => {
    const { cropId } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [crop, setCrop] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [actionLoading, setActionLoading] = useState(null);

    // Fetch crop details
    useEffect(() => {
        const fetchCrop = async () => {
            try {
                const { data } = await axios.get(`/api/crops/details/${cropId}`, {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                });
                setCrop(data.crop);
            } catch (error) {
                console.error("Error fetching crop:", error);
                toast.error("Failed to load crop details");
            }
        };

        if (cropId) {
            fetchCrop();
        }
    }, [cropId]);

    // Fetch proposals
    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const { data } = await axios.get(
                    `/api/proposals/crop/${cropId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${auth?.token}`,
                        },
                    }
                );
                setProposals(data);
            } catch (error) {
                console.error("Error fetching proposals:", error);
                toast.error("Failed to load proposals");
            } finally {
                setLoading(false);
            }
        };

        if (auth?.token && cropId) {
            fetchProposals();
        }
    }, [auth?.token, cropId]);

    // Accept proposal
    const handleAccept = async (proposalId) => {
        if (!window.confirm("Accept this proposal? This will create a new order.")) {
            return;
        }

        setActionLoading(proposalId);
        try {
            const { data } = await axios.patch(
                `/api/proposals/${proposalId}/accept`,
                {
                    farmerResponse: "Proposal accepted. Looking forward to working with you!",
                    deliveryAddress: crop?.locationDetails
                        ? `${crop.locationDetails.village}, ${crop.locationDetails.tehsil}, ${crop.locationDetails.district}`
                        : crop?.location || "Farmer location",
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            toast.success(data.message);

            // Refresh proposals
            setProposals(proposals.map(p =>
                p._id === proposalId ? { ...p, status: "accepted" } : p
            ));

            // Navigate to order details
            setTimeout(() => {
                navigate(`/farmer/order/${data.order._id}`);
            }, 1500);
        } catch (error) {
            console.error("Error accepting proposal:", error);
            toast.error(error.response?.data?.message || "Failed to accept proposal");
        } finally {
            setActionLoading(null);
        }
    };

    // Reject proposal
    const handleReject = async (proposalId) => {
        const reason = window.prompt("Reason for rejection (optional):");
        if (reason === null) return; // User cancelled

        setActionLoading(proposalId);
        try {
            const { data } = await axios.patch(
                `/api/proposals/${proposalId}/reject`,
                {
                    farmerResponse: reason || "Proposal rejected",
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            toast.success("Proposal rejected");

            // Refresh proposals
            setProposals(proposals.map(p =>
                p._id === proposalId ? { ...p, status: "rejected" } : p
            ));
        } catch (error) {
            console.error("Error rejecting proposal:", error);
            toast.error("Failed to reject proposal");
        } finally {
            setActionLoading(null);
        }
    };

    // Filter proposals by status
    const filteredProposals = proposals.filter((p) => {
        if (activeTab === "pending") return p.status === "pending";
        if (activeTab === "accepted") return p.status === "accepted";
        if (activeTab === "rejected") return p.status === "rejected";
        return true;
    });

    // Find highest bid
    const highestBid = proposals.length > 0
        ? Math.max(...proposals.map(p => p.proposedPrice))
        : 0;

    if (loading) {
        return (
            <Layout title="View Proposals">
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
                                <p className="mt-3">Loading proposals...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="View Proposals">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <FarmerMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="text-success mb-1">📋 Proposals for {crop?.cropName}</h3>
                                <p className="text-muted mb-0">
                                    Available: {crop?.availableQuantity} {crop?.unit} | Your asking price: ₹{crop?.pricePerUnit}/{crop?.unit}
                                </p>
                            </div>
                            <Link to="/farmer/my-crops" className="btn btn-outline-secondary">
                                ← Back to My Crops
                            </Link>
                        </div>

                        {/* Tabs */}
                        <ul className="nav nav-tabs mb-4">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "pending" ? "active" : ""}`}
                                    onClick={() => setActiveTab("pending")}
                                >
                                    Pending ({proposals.filter(p => p.status === "pending").length})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "accepted" ? "active" : ""}`}
                                    onClick={() => setActiveTab("accepted")}
                                >
                                    Accepted ({proposals.filter(p => p.status === "accepted").length})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "rejected" ? "active" : ""}`}
                                    onClick={() => setActiveTab("rejected")}
                                >
                                    Rejected ({proposals.filter(p => p.status === "rejected").length})
                                </button>
                            </li>
                        </ul>

                        {/* Proposals List */}
                        {filteredProposals.length === 0 ? (
                            <div className="card shadow-sm">
                                <div className="card-body text-center py-5">
                                    <h5 className="text-muted">No {activeTab} proposals</h5>
                                    <p className="text-muted">
                                        {activeTab === "pending"
                                            ? "Traders haven't placed any bids yet"
                                            : `No ${activeTab} proposals for this crop`}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {filteredProposals.map((proposal) => (
                                    <div className="col-12" key={proposal._id}>
                                        <div className={`card shadow-sm proposal-card ${proposal.proposedPrice === highestBid && activeTab === "pending"
                                            ? "border-warning border-3"
                                            : ""
                                            }`}>
                                            <div className="card-body">
                                                <div className="row">
                                                    {/* Trader Info */}
                                                    <div className="col-md-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <PersonCircle size={32} className="text-primary me-2" />
                                                            <div>
                                                                <h6 className="mb-0">{proposal.traderId?.name || "Unknown Trader"}</h6>
                                                                {proposal.traderId?.rating && (
                                                                    <small className="text-warning">
                                                                        <StarFill size={12} /> {proposal.traderId.rating.toFixed(1)}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <small className="text-muted">
                                                            Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                                                        </small>
                                                    </div>

                                                    {/* Proposal Details */}
                                                    <div className="col-md-5">
                                                        <div className="mb-2">
                                                            <strong>
                                                                <CurrencyRupee size={16} />
                                                                Proposed Price:
                                                            </strong>{" "}
                                                            <span className={`fs-5 ${proposal.proposedPrice === highestBid
                                                                ? "text-success fw-bold"
                                                                : "text-primary"
                                                                }`}>
                                                                ₹{proposal.proposedPrice}/{proposal.unit}
                                                            </span>
                                                            {proposal.proposedPrice === highestBid && activeTab === "pending" && (
                                                                <span className="badge bg-warning text-dark ms-2">Highest Bid 🏆</span>
                                                            )}
                                                        </div>
                                                        <p className="mb-1">
                                                            <strong>Quantity:</strong> {proposal.quantity} {proposal.unit}
                                                        </p>
                                                        <p className="mb-1">
                                                            <strong>Total Value:</strong> ₹{proposal.totalAmount.toLocaleString()}
                                                        </p>
                                                        <p className="mb-1">
                                                            <Calendar size={14} className="me-1" />
                                                            <strong>Valid Until:</strong> {new Date(proposal.validUntil).toLocaleDateString()}
                                                        </p>
                                                        {proposal.message && (
                                                            <p className="mb-0 mt-2">
                                                                <small className="text-muted fst-italic">
                                                                    "{proposal.message}"
                                                                </small>
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Fees & Actions */}
                                                    <div className="col-md-4">
                                                        <div className="bg-light p-3 rounded mb-3">
                                                            <small className="d-block mb-1">
                                                                <strong>Platform Fees:</strong> ₹{proposal.platformFees}
                                                            </small>
                                                            <small className="d-block">
                                                                <strong>Booking (10%):</strong> ₹{proposal.bookingAmount.toFixed(2)}
                                                            </small>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        {activeTab === "pending" && (
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    className="btn btn-success flex-fill"
                                                                    onClick={() => handleAccept(proposal._id)}
                                                                    disabled={actionLoading === proposal._id}
                                                                >
                                                                    {actionLoading === proposal._id ? (
                                                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle size={16} className="me-1" />
                                                                            Accept
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-danger flex-fill"
                                                                    onClick={() => handleReject(proposal._id)}
                                                                    disabled={actionLoading === proposal._id}
                                                                >
                                                                    <XCircle size={16} className="me-1" />
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}

                                                        {activeTab === "accepted" && proposal.orderId && (
                                                            <Link
                                                                to={`/farmer/order/${proposal.orderId}`}
                                                                className="btn btn-primary w-100"
                                                            >
                                                                View Order →
                                                            </Link>
                                                        )}

                                                        {proposal.farmerResponse && (
                                                            <div className="mt-2">
                                                                <small className="text-muted">
                                                                    <strong>Your Response:</strong> {proposal.farmerResponse}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>
                {`
                    .proposal-card {
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .proposal-card:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                    }
                    .nav-tabs .nav-link {
                        color: #6c757d;
                    }
                    .nav-tabs .nav-link.active {
                        color: #198754;
                        border-color: #dee2e6 #dee2e6 #fff;
                    }
                `}
            </style>
        </Layout>
    );
};

export default ViewProposals;
