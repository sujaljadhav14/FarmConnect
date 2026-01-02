import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import TraderMenu from "../../Dashboards/TraderMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { ArrowLeft, CheckCircle, FileText, CashStack, Truck, Download, PenFill, Award } from "react-bootstrap-icons";
import { generateSignedAgreement } from "../../utils/generateSignedAgreement";

const ConfirmAgreement = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [order, setOrder] = useState(null);
    const [agreement, setAgreement] = useState(null);
    const [digitalSignature, setDigitalSignature] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);

    useEffect(() => {
        fetchOrderAndAgreement();
    }, [orderId]);

    const fetchOrderAndAgreement = async () => {
        try {
            // Fetch order details
            const orderRes = await axios.get(
                `${process.env.REACT_APP_API}/api/orders/details/${orderId}`,
                {
                    headers: { Authorization: `Bearer ${auth?.token}` },
                }
            );

            if (orderRes.data.success) {
                setOrder(orderRes.data.order);
            } else {
                toast.error("Failed to load order details");
                navigate("/trader/my-orders");
                return;
            }

            // Fetch agreement details
            try {
                const agreementRes = await axios.get(
                    `${process.env.REACT_APP_API}/api/agreements/${orderId}`,
                    {
                        headers: { Authorization: `Bearer ${auth?.token}` },
                    }
                );

                if (agreementRes.data.success) {
                    setAgreement(agreementRes.data.agreement);
                }
            } catch (agreementError) {
                console.log("No agreement found yet:", agreementError.message);
            }
        } catch (error) {
            console.error("Error fetching details:", error);
            toast.error("Failed to load order details");
            navigate("/trader/my-orders");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAgreement = async () => {
        if (!termsAccepted) {
            toast.error("Please accept the terms and conditions");
            return;
        }

        if (!digitalSignature.trim()) {
            toast.error("Please enter your name as digital signature");
            return;
        }

        if (!window.confirm("Are you sure you want to confirm this agreement? You will need to pay 30% advance after confirmation.")) {
            return;
        }

        setConfirming(true);
        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_API}/api/agreements/trader-sign/${orderId}`,
                { digitalSignature },
                {
                    headers: { Authorization: `Bearer ${auth?.token}` },
                }
            );

            if (data.success) {
                toast.success("Agreement confirmed! Downloading signed agreement...");

                // Generate the final signed agreement PDF with both signatures
                generateSignedAgreement(order, {
                    farmerSigned: true,
                    farmerName: agreement?.farmerAgreement?.qualityCommitment ? order?.farmerId?.name : order?.farmerId?.name,
                    farmerSignedAt: agreement?.farmerAgreement?.signedAt || new Date(),
                    traderSigned: true,
                    traderName: digitalSignature,
                    traderSignedAt: new Date(),
                }, agreement);

                // Navigate to orders page
                setTimeout(() => {
                    navigate("/trader/my-orders");
                }, 1500);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error confirming agreement:", error);
            toast.error(error.response?.data?.message || "Failed to confirm agreement");
        } finally {
            setConfirming(false);
        }
    };

    const handleCancelAgreement = async () => {
        const reason = prompt("Please provide a reason for cancelling:");
        if (!reason) return;

        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_API}/api/agreements/cancel/${orderId}`,
                { cancellationReason: reason },
                {
                    headers: { Authorization: `Bearer ${auth?.token}` },
                }
            );

            if (data.success) {
                toast.success("Agreement cancelled");
                navigate("/trader/my-orders");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel");
        }
    };

    if (loading) {
        return (
            <Layout title="Confirm Agreement">
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
                                <p className="mt-3">Loading agreement...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    const advanceAmount = Math.round(order?.totalPrice * 0.30);
    const finalAmount = order?.totalPrice - advanceAmount;

    return (
        <Layout title="Confirm Agreement">
            <div className="container-fluid mt-4">
                <div className="row">
                    <div className="col-md-3 col-lg-2 mb-3">
                        <TraderMenu />
                    </div>

                    <div className="col-md-9 col-lg-10">
                        <div className="d-flex align-items-center mb-4">
                            <button
                                className="btn btn-outline-secondary me-3"
                                onClick={() => navigate("/trader/my-orders")}
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="text-primary mb-0">
                                <FileText className="me-2" />
                                Confirm Agreement
                            </h3>
                        </div>

                        <div className="row">
                            {/* Left Column - Order & Farmer Details */}
                            <div className="col-lg-6 mb-4">
                                {/* Order Details */}
                                <div className="card shadow-sm">
                                    <div className="card-header bg-primary text-white">
                                        <h5 className="mb-0">📦 Order Details</h5>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-borderless">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted">Crop:</td>
                                                    <td><strong>{order?.cropId?.cropName}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Quantity:</td>
                                                    <td><strong>{order?.quantity} {order?.cropId?.unit}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Rate:</td>
                                                    <td><strong>₹{order?.pricePerUnit}/{order?.cropId?.unit}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Total:</td>
                                                    <td><strong className="text-success fs-5">₹{order?.totalPrice}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Farmer:</td>
                                                    <td><strong>{order?.farmerId?.name}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Contact:</td>
                                                    <td>{order?.farmerId?.phone || "N/A"}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Crop Quality Details (Read-Only) */}
                                <div className="card shadow-sm mt-3">
                                    <div className="card-header bg-info text-white">
                                        <h5 className="mb-0">🌾 Crop Quality Details</h5>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-borderless mb-0">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted">Quality Grade:</td>
                                                    <td>
                                                        <span className="badge bg-success fs-6">
                                                            <Award className="me-1" />
                                                            {order?.cropId?.quality || "Standard"}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Category:</td>
                                                    <td><strong>{order?.cropId?.category}</strong></td>
                                                </tr>
                                                {order?.cropId?.description && (
                                                    <tr>
                                                        <td className="text-muted">Description:</td>
                                                        <td><small>{order?.cropId?.description}</small></td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Farmer's Commitment */}
                                {agreement && (
                                    <div className="card shadow-sm mt-3">
                                        <div className="card-header bg-success text-white">
                                            <h5 className="mb-0">✅ Farmer's Commitment (Signed)</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="alert alert-light mb-0">
                                                <p className="mb-2 fst-italic">
                                                    "{agreement.farmerAgreement?.qualityCommitment || "I commit to supply the produce as per the agreed quality and quantity."}"
                                                </p>
                                                <hr />
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        <strong>Signed by:</strong> {order?.farmerId?.name}
                                                    </small>
                                                    <small className="text-success">
                                                        <strong>Date:</strong> {new Date(agreement.farmerAgreement?.signedAt).toLocaleString()}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Payment Terms & Signature */}
                            <div className="col-lg-6">
                                {/* Payment Terms */}
                                <div className="card shadow-sm">
                                    <div className="card-header bg-warning text-dark">
                                        <h5 className="mb-0">
                                            <CashStack className="me-2" />
                                            Payment Terms (30/70 Split)
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="payment-breakdown">
                                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-3">
                                                <div>
                                                    <strong>30% Advance</strong>
                                                    <br />
                                                    <small className="text-muted">Pay immediately after signing</small>
                                                </div>
                                                <span className="badge bg-warning text-dark fs-5">₹{advanceAmount}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-3">
                                                <div>
                                                    <strong>70% After Delivery</strong>
                                                    <br />
                                                    <small className="text-muted">Pay when goods are delivered</small>
                                                </div>
                                                <span className="badge bg-info fs-5">₹{finalAmount}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-3">
                                                <div>
                                                    <strong><Truck className="me-1" /> Transport Cost</strong>
                                                    <br />
                                                    <small className="text-muted">Added when transport is selected</small>
                                                </div>
                                                <span className="badge bg-secondary fs-6">TBD</span>
                                            </div>
                                            <hr />
                                            <div className="d-flex justify-content-between align-items-center">
                                                <strong>Crop Total:</strong>
                                                <strong className="text-success fs-4">₹{order?.totalPrice}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms & Signature */}
                                <div className="card shadow-sm mt-3">
                                    <div className="card-header bg-primary text-white">
                                        <h5 className="mb-0">✍️ Your Signature & Confirmation</h5>
                                    </div>
                                    <div className="card-body">
                                        {/* Terms */}
                                        <div className="alert alert-secondary mb-3">
                                            <h6>📋 By signing, you agree to:</h6>
                                            <ul className="small mb-0">
                                                <li>Pay 30% advance (₹{advanceAmount}) immediately after signing</li>
                                                <li>Pay remaining 70% + transport cost after delivery</li>
                                                <li>Accept the quality commitment made by the farmer</li>
                                                <li>Not back out after payment is made</li>
                                            </ul>
                                        </div>

                                        {/* Accept Terms */}
                                        <div className="form-check mb-4">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="termsAccepted"
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                required
                                            />
                                            <label className="form-check-label" htmlFor="termsAccepted">
                                                <strong>I accept the terms and agree to pay 30% advance</strong>
                                            </label>
                                        </div>

                                        {/* Digital Signature */}
                                        <div className="card bg-light mb-4">
                                            <div className="card-body">
                                                <label className="form-label d-flex align-items-center">
                                                    <PenFill className="me-2 text-primary" />
                                                    <strong>Your Digital Signature</strong>
                                                </label>
                                                <p className="text-muted small mb-2">
                                                    Type your full name below to digitally sign this agreement.
                                                    This serves as your legal electronic signature.
                                                </p>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg border-primary"
                                                    placeholder="Type your full name here..."
                                                    value={digitalSignature}
                                                    onChange={(e) => setDigitalSignature(e.target.value)}
                                                    style={{ fontFamily: "cursive", fontSize: "1.5rem" }}
                                                    required
                                                />
                                                {digitalSignature && (
                                                    <small className="text-success mt-2 d-block">
                                                        ✓ Signing as: <strong style={{ fontFamily: "cursive" }}>{digitalSignature}</strong>
                                                        <br />
                                                        <span className="text-muted">Date: {new Date().toLocaleString()}</span>
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-grid gap-2">
                                            <button
                                                className="btn btn-success btn-lg"
                                                onClick={handleConfirmAgreement}
                                                disabled={confirming || !termsAccepted || !digitalSignature.trim()}
                                            >
                                                {confirming ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Signing & Generating PDF...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="me-2" />
                                                        Sign Agreement & Download PDF
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={handleCancelAgreement}
                                                disabled={confirming}
                                            >
                                                Cancel Deal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .card {
                    border-radius: 12px;
                }
                .card-header {
                    border-radius: 12px 12px 0 0 !important;
                }
                .payment-breakdown .badge {
                    min-width: 80px;
                }
            `}</style>
        </Layout>
    );
};

export default ConfirmAgreement;
