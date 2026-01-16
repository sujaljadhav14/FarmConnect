import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import TraderMenu from "../../Dashboards/TraderMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { CurrencyRupee, Calendar, CheckCircle, XCircle, Clock, Eye } from "react-bootstrap-icons";

const MyProposals = () => {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [withdrawing, setWithdrawing] = useState(null);

    useEffect(() => {
        fetchProposals();
        // eslint-disable-next-line
    }, [auth?.token]);

    const fetchProposals = async () => {
        try {
            const { data } = await axios.get(
                `/api/proposals/trader`,
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

    const handleWithdraw = async (proposalId) => {
        if (!window.confirm("Are you sure you want to withdraw this proposal?")) {
            return;
        }

        setWithdrawing(proposalId);
        try {
            await axios.patch(
                `/api/proposals/${proposalId}/withdraw`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            toast.success("Proposal withdrawn successfully");
            fetchProposals();
        } catch (error) {
            console.error("Error withdrawing proposal:", error);
            toast.error("Failed to withdraw proposal");
        } finally {
            setWithdrawing(null);
        }
    };

    const filteredProposals = proposals.filter((p) => {
        if (activeTab === "pending") return p.status === "pending";
        if (activeTab === "accepted") return p.status === "accepted";
        if (activeTab === "rejected") return p.status === "rejected";
        if (activeTab === "withdrawn") return p.status === "withdrawn";
        return true;
    });

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: "warning", icon: Clock, text: "Pending" },
            accepted: { color: "success", icon: CheckCircle, text: "Accepted" },
            rejected: { color: "danger", icon: XCircle, text: "Rejected" },
            withdrawn: { color: "secondary", icon: XCircle, text: "Withdrawn" },
            expired: { color: "dark", icon: Clock, text: "Expired" },
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`badge bg-${badge.color}`}>
                <Icon size={14} className="me-1" />
                {badge.text}
            </span>
        );
    };

    if (loading) {
        return (
            <Layout title="My Proposals">
                <div className="container-fluid mt-4">
                    <div className="row">
                        <div className="col-md-3 col-lg-2 mb-3">
                            <TraderMenu />
                        </div>
                        <div className="col-md-9 col-lg-10">
                            <div className="text-center mt-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Loading your proposals...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="My Proposals">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <TraderMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="text-primary">💼 My Proposals</h3>
                            <Link to="/trader/crops" className="btn btn-primary">
                                Browse Crops
                            </Link>
                        </div>

                        {/* Summary Cards */}
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="card bg-warning bg-opacity-10 border-warning">
                                    <div className="card-body text-center">
                                        <h4 className="text-warning">{proposals.filter(p => p.status === "pending").length}</h4>
                                        <p className="mb-0 text-muted">Pending</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-success bg-opacity-10 border-success">
                                    <div className="card-body text-center">
                                        <h4 className="text-success">{proposals.filter(p => p.status === "accepted").length}</h4>
                                        <p className="mb-0 text-muted">Accepted</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-danger bg-opacity-10 border-danger">
                                    <div className="card-body text-center">
                                        <h4 className="text-danger">{proposals.filter(p => p.status === "rejected").length}</h4>
                                        <p className="mb-0 text-muted">Rejected</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-secondary bg-opacity-10 border-secondary">
                                    <div className="card-body text-center">
                                        <h4 className="text-secondary">{proposals.filter(p => p.status === "withdrawn").length}</h4>
                                        <p className="mb-0 text-muted">Withdrawn</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <ul className="nav nav-tabs mb-4">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "pending" ? "active" : ""}`}
                                    onClick={() => setActiveTab("pending")}
                                >
                                    Pending
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "accepted" ? "active" : ""}`}
                                    onClick={() => setActiveTab("accepted")}
                                >
                                    Accepted
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "rejected" ? "active" : ""}`}
                                    onClick={() => setActiveTab("rejected")}
                                >
                                    Rejected
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "withdrawn" ? "active" : ""}`}
                                    onClick={() => setActiveTab("withdrawn")}
                                >
                                    Withdrawn
                                </button>
                            </li>
                        </ul>

                        {/* Proposals Table/Cards */}
                        {filteredProposals.length === 0 ? (
                            <div className="card shadow-sm">
                                <div className="card-body text-center py-5">
                                    <h5 className="text-muted">No {activeTab} proposals</h5>
                                    <p className="text-muted">
                                        {activeTab === "pending"
                                            ? "You haven't placed any bids yet. Browse crops to get started!"
                                            : `No ${activeTab} proposals`}
                                    </p>
                                    {activeTab === "pending" && (
                                        <Link to="/trader/crops" className="btn btn-primary mt-3">
                                            Browse Crops
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Crop</th>
                                            <th>Farmer</th>
                                            <th>Your Bid</th>
                                            <th>Quantity</th>
                                            <th>Total Value</th>
                                            <th>Valid Until</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProposals.map((proposal) => (
                                            <tr key={proposal._id}>
                                                <td>
                                                    <strong>{proposal.cropId?.cropName || "N/A"}</strong>
                                                    <br />
                                                    <small className="text-muted">{proposal.cropId?.category}</small>
                                                </td>
                                                <td>{proposal.farmerId?.name || "Unknown"}</td>
                                                <td>
                                                    <span className="text-primary fw-bold">
                                                        <CurrencyRupee size={14} />
                                                        {proposal.proposedPrice}/{proposal.unit}
                                                    </span>
                                                </td>
                                                <td>
                                                    {proposal.quantity} {proposal.unit}
                                                </td>
                                                <td>₹{proposal.totalAmount.toLocaleString()}</td>
                                                <td>
                                                    <small>
                                                        <Calendar size={12} className="me-1" />
                                                        {new Date(proposal.validUntil).toLocaleDateString()}
                                                    </small>
                                                </td>
                                                <td>{getStatusBadge(proposal.status)}</td>
                                                <td>
                                                    {proposal.status === "pending" && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleWithdraw(proposal._id)}
                                                            disabled={withdrawing === proposal._id}
                                                        >
                                                            {withdrawing === proposal._id ? (
                                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                                            ) : (
                                                                "Withdraw"
                                                            )}
                                                        </button>
                                                    )}
                                                    {proposal.status === "accepted" && proposal.orderId && (
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => navigate(`/trader/order/${proposal.orderId}`)}
                                                        >
                                                            <Eye size={14} className="me-1" />
                                                            View Order
                                                        </button>
                                                    )}
                                                    {proposal.farmerResponse && (
                                                        <div className="mt-2">
                                                            <small className="text-muted fst-italic">
                                                                "{proposal.farmerResponse}"
                                                            </small>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>
                {`
                    .nav-tabs .nav-link {
                        color: #6c757d;
                    }
                    .nav-tabs .nav-link.active {
                        color: #0d6efd;
                        border-color: #dee2e6 #dee2e6 #fff;
                    }
                `}
            </style>
        </Layout>
    );
};

export default MyProposals;
