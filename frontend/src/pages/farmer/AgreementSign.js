import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { ArrowLeft, CheckCircle, FileText, Award, PenFill } from "react-bootstrap-icons";
import { generateSignedAgreement } from "../../utils/generateSignedAgreement";

const AgreementSign = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [order, setOrder] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [digitalSignature, setDigitalSignature] = useState("");

    // Fixed commitment statement (not editable)
    const qualityCommitment = `I, the undersigned farmer, commit to supply ${order?.cropId?.cropName || "the produce"} of ${order?.cropId?.quality || "Standard"} grade as per the agreed quality and quantity (${order?.quantity || 0} ${order?.cropId?.unit || "kg"}) mentioned in this order.`;

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const { data } = await axios.get(
                `/api/orders/details/${orderId}`,
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
            navigate("/farmer/my-orders");
        } finally {
            setLoading(false);
        }
    };

    // No handleChange needed - commitment is fixed, only signature is editable

    const handleSignAgreement = async (e) => {
        e.preventDefault();

        if (!termsAccepted) {
            toast.error("Please accept the terms and conditions");
            return;
        }

        if (!digitalSignature.trim()) {
            toast.error("Please enter your name as digital signature");
            return;
        }

        setSigning(true);
        try {
            const { data } = await axios.post(
                `/api/agreements/farmer-sign/${orderId}`,
                {
                    qualityCommitment,
                    qualityGrade: order?.cropId?.quality || "A",
                    qualityDescription: order?.cropId?.description || `Quality grade: ${order?.cropId?.quality || "Standard"}`,
                    digitalSignature,
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                toast.success("Agreement signed successfully!");
                // Generate and download the preliminary agreement PDF
                generateSignedAgreement(order, {
                    farmerSigned: true,
                    farmerName: digitalSignature,
                    farmerSignedAt: new Date(),
                    traderSigned: false,
                }, { farmerAgreement: { qualityCommitment } });
                navigate("/farmer/my-orders");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error signing agreement:", error);
            toast.error(error.response?.data?.message || "Failed to sign agreement");
        } finally {
            setSigning(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Sign Agreement">
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

    const advanceAmount = Math.round(order?.totalPrice * 0.30);
    const finalAmount = order?.totalPrice - advanceAmount;

    return (
        <Layout title="Sign Agreement">
            <div className="container-fluid mt-4">
                <div className="row">
                    <div className="col-md-3 col-lg-2 mb-3">
                        <FarmerMenu />
                    </div>

                    <div className="col-md-9 col-lg-10">
                        <div className="d-flex align-items-center mb-4">
                            <button
                                className="btn btn-outline-secondary me-3"
                                onClick={() => navigate("/farmer/my-orders")}
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h3 className="text-success mb-0">
                                <FileText className="me-2" />
                                Sign Agreement
                            </h3>
                        </div>

                        <div className="row">
                            {/* Left Column - Order & Crop Details (Read-Only) */}
                            <div className="col-lg-5 mb-4">
                                {/* Order Summary */}
                                <div className="card shadow-sm">
                                    <div className="card-header bg-success text-white">
                                        <h5 className="mb-0">📦 Order Summary</h5>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-borderless mb-0">
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
                                                    <td className="text-muted">Total Value:</td>
                                                    <td><strong className="text-success fs-5">₹{order?.totalPrice}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Trader:</td>
                                                    <td><strong>{order?.traderId?.name}</strong></td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">Delivery To:</td>
                                                    <td>{order?.deliveryAddress}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Crop Quality Details (Read-Only from Crop) */}
                                <div className="card shadow-sm mt-3">
                                    <div className="card-header bg-info text-white">
                                        <h5 className="mb-0">🌾 Your Crop Details (From Listing)</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="alert alert-light mb-3">
                                            <small className="text-muted">These details are from your original crop listing and will be included in the agreement.</small>
                                        </div>
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
                                                <tr>
                                                    <td className="text-muted">Location:</td>
                                                    <td>{order?.cropId?.location || order?.farmerId?.location || "N/A"}</td>
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

                                {/* Payment Terms */}
                                <div className="card shadow-sm mt-3">
                                    <div className="card-header bg-warning text-dark">
                                        <h5 className="mb-0">💰 Payment Terms</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span>30% Advance Payment:</span>
                                            <span className="badge bg-warning text-dark fs-6">₹{advanceAmount}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span>70% After Delivery:</span>
                                            <span className="badge bg-info fs-6">₹{finalAmount}</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong>Total:</strong>
                                            <strong className="text-success fs-5">₹{order?.totalPrice}</strong>
                                        </div>
                                        <small className="text-muted d-block mt-2">
                                            * Transport cost will be added separately
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Agreement Form */}
                            <div className="col-lg-7">
                                <div className="card shadow-sm">
                                    <div className="card-header bg-primary text-white">
                                        <h5 className="mb-0">✍️ Your Commitment & Signature</h5>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSignAgreement}>
                                            {/* Quality Commitment (Read-Only) */}
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    📜 Your Commitment Statement
                                                    <span className="badge bg-secondary ms-2">Read-Only</span>
                                                </label>
                                                <div className="alert alert-light border">
                                                    <p className="mb-0 fst-italic">"{qualityCommitment}"</p>
                                                </div>
                                            </div>

                                            {/* Terms Box */}
                                            <div className="alert alert-secondary mb-3">
                                                <h6 className="alert-heading">📋 Agreement Terms:</h6>
                                                <ul className="mb-0 small">
                                                    <li>I will supply the produce as per the quality grade mentioned above ({order?.cropId?.quality || "Standard"}).</li>
                                                    <li>I will prepare the order within the expected timeframe.</li>
                                                    <li>I understand the trader will pay 30% advance (₹{advanceAmount}) after both parties agree.</li>
                                                    <li>I will receive the remaining 70% (₹{finalAmount}) after successful delivery.</li>
                                                    <li>I accept that backing out may affect my platform rating.</li>
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
                                                    <strong>I accept the terms and agree to fulfill this order</strong>
                                                </label>
                                            </div>

                                            {/* Digital Signature */}
                                            <div className="card bg-light mb-4">
                                                <div className="card-body">
                                                    <label className="form-label d-flex align-items-center">
                                                        <PenFill className="me-2 text-primary" />
                                                        <strong>Digital Signature</strong>
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

                                            {/* Submit Button */}
                                            <div className="d-grid gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-success btn-lg"
                                                    disabled={signing || !termsAccepted || !digitalSignature.trim()}
                                                >
                                                    {signing ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" />
                                                            Signing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="me-2" />
                                                            Sign Agreement & Download PDF
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
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
            `}</style>
        </Layout>
    );
};

export default AgreementSign;
