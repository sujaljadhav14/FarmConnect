import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import TraderMenu from "../../Dashboards/TraderMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { CurrencyRupee, Calendar, InfoCircle } from "react-bootstrap-icons";

const MakeProposal = () => {
    const { cropId } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existingProposal, setExistingProposal] = useState(null);

    const [formData, setFormData] = useState({
        proposedPrice: "",
        quantity: "",
        message: "",
        expectedDeliveryDate: "",
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days default
    });

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

                // Set default quantity and price
                setFormData(prev => ({
                    ...prev,
                    quantity: data.crop.availableQuantity,
                    proposedPrice: data.crop.pricePerUnit || data.crop.expectedPricePerUnit || "",
                }));
            } catch (error) {
                console.error("Error fetching crop:", error);
                toast.error("Failed to load crop details");
            } finally {
                setLoading(false);
            }
        };

        const checkExistingProposal = async () => {
            try {
                const { data } = await axios.get(
                    `/api/proposals/trader?status=pending`,
                    {
                        headers: {
                            Authorization: `Bearer ${auth?.token}`,
                        },
                    }
                );
                const existing = data.find(p => p.cropId._id === cropId);
                if (existing) {
                    setExistingProposal(existing);
                }
            } catch (error) {
                console.error("Error checking existing proposal:", error);
            }
        };

        if (cropId && auth?.token) {
            fetchCrop();
            checkExistingProposal();
        }
    }, [cropId, auth?.token]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Calculate totals
    const calculateTotals = () => {
        const price = parseFloat(formData.proposedPrice) || 0;
        const qty = parseFloat(formData.quantity) || 0;

        // Convert to kg for fee calculation
        let qtyInKg = qty;
        if (crop?.unit === "quintal") qtyInKg = qty * 100;
        if (crop?.unit === "ton") qtyInKg = qty * 1000;

        const totalAmount = price * qty;
        const platformFees = qtyInKg * 1; // ₹1 per kg
        const bookingAmount = totalAmount * 0.10; // 10%

        return { totalAmount, platformFees, bookingAmount };
    };

    const { totalAmount, platformFees, bookingAmount } = calculateTotals();

    // Calculate price difference from farmer's asking price
    const getPriceDifference = () => {
        const farmerPrice = crop?.pricePerUnit || crop?.expectedPricePerUnit || 0;
        const yourPrice = parseFloat(formData.proposedPrice) || 0;

        if (farmerPrice === 0) return null;

        const diff = ((yourPrice - farmerPrice) / farmerPrice) * 100;
        return diff;
    };

    const priceDiff = getPriceDifference();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (parseFloat(formData.proposedPrice) <= 0) {
            toast.error("Please enter a valid price");
            return;
        }
        if (parseFloat(formData.quantity) <= 0 || parseFloat(formData.quantity) > crop.availableQuantity) {
            toast.error(`Quantity must be between 1 and ${crop.availableQuantity}`);
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await axios.post(
                `/api/proposals`,
                {
                    cropId,
                    proposedPrice: parseFloat(formData.proposedPrice),
                    quantity: parseFloat(formData.quantity),
                    unit: crop.unit,
                    message: formData.message,
                    expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
                    validUntil: formData.validUntil,
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            toast.success("Proposal submitted successfully!");
            setTimeout(() => {
                navigate("/trader/my-proposals");
            }, 1500);
        } catch (error) {
            console.error("Error submitting proposal:", error);
            toast.error(error.response?.data?.message || "Failed to submit proposal");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Make Proposal">
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
                                <p className="mt-3">Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (existingProposal) {
        return (
            <Layout title="Make Proposal">
                <div className="container-fluid mt-4">
                    <div className="row">
                        <div className="col-md-3 col-lg-2 mb-3">
                            <TraderMenu />
                        </div>
                        <div className="col-md-9 col-lg-10">
                            <div className="card shadow-sm">
                                <div className="card-body text-center py-5">
                                    <InfoCircle size={48} className="text-warning mb-3" />
                                    <h5>Pending Proposal Exists</h5>
                                    <p className="text-muted">
                                        You already have a pending proposal for this crop.
                                    </p>
                                    <div className="mt-4">
                                        <Link to="/trader/my-proposals" className="btn btn-primary me-2">
                                            View My Proposals
                                        </Link>
                                        <Link to="/trader/crops" className="btn btn-outline-secondary">
                                            Browse Other Crops
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!crop) {
        return (
            <Layout title="Make Proposal">
                <div className="container-fluid mt-4">
                    <div className="row">
                        <div className="col-md-3 col-lg-2 mb-3">
                            <TraderMenu />
                        </div>
                        <div className="col-md-9 col-lg-10">
                            <div className="card shadow-sm">
                                <div className="card-body text-center py-5">
                                    <h5 className="text-danger">Crop Not Found</h5>
                                    <p className="text-muted">
                                        Unable to load crop details. Please try again.
                                    </p>
                                    <Link to="/trader/crops" className="btn btn-primary mt-3">
                                        Browse Crops
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Make Proposal">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <TraderMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="text-primary">💼 Place Your Bid</h3>
                            <Link to={`/trader/crop/${cropId}`} className="btn btn-outline-secondary">
                                ← Back to Crop Details
                            </Link>
                        </div>

                        <div className="row">
                            {/* Crop Info Card */}
                            <div className="col-md-4">
                                <div className="card shadow-sm mb-4">
                                    <div className="card-header bg-success text-white">
                                        <h6 className="mb-0">Crop Information</h6>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="text-success mb-3">{crop.cropName}</h5>
                                        <p className="mb-2">
                                            <strong>Category:</strong> {crop.category}
                                        </p>
                                        {crop.variety && (
                                            <p className="mb-2">
                                                <strong>Variety:</strong> {crop.variety}
                                            </p>
                                        )}
                                        <p className="mb-2">
                                            <strong>Quality:</strong> {crop.quality}
                                        </p>
                                        <p className="mb-2">
                                            <strong>Available:</strong> {crop.availableQuantity} {crop.unit}
                                        </p>
                                        <p className="mb-2">
                                            <CurrencyRupee size={14} />
                                            <strong>Farmer's Price:</strong>{" "}
                                            <span className="text-success fw-bold">
                                                ₹{crop.pricePerUnit || crop.expectedPricePerUnit}/{crop.unit}
                                            </span>
                                        </p>
                                        <p className="mb-0">
                                            <strong>Farmer:</strong> {crop.farmerId?.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Calculation Summary */}
                                <div className="card shadow-sm">
                                    <div className="card-header bg-primary text-white">
                                        <h6 className="mb-0">Bid Summary</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Total Amount:</span>
                                            <strong>₹{totalAmount.toLocaleString()}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Platform Fees:</span>
                                            <span className="text-muted">₹{platformFees.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Booking (10%):</span>
                                            <span className="text-muted">₹{bookingAmount.toFixed(2)}</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between">
                                            <strong>You Pay:</strong>
                                            <strong className="text-primary">
                                                ₹{(totalAmount + platformFees).toLocaleString()}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Proposal Form */}
                            <div className="col-md-8">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            {/* Proposed Price */}
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    <CurrencyRupee size={16} /> Your Proposed Price per {crop.unit} *
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="proposedPrice"
                                                    value={formData.proposedPrice}
                                                    onChange={handleChange}
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                                {priceDiff !== null && (
                                                    <small className={`form-text ${priceDiff >= 0 ? "text-success" : "text-danger"}`}>
                                                        {priceDiff >= 0 ? "+" : ""}{priceDiff.toFixed(1)}% vs farmer's asking price
                                                    </small>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Quantity ({crop.unit}) *
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="quantity"
                                                    value={formData.quantity}
                                                    onChange={handleChange}
                                                    step="0.01"
                                                    min="0.01"
                                                    max={crop.availableQuantity}
                                                    required
                                                />
                                                <small className="form-text text-muted">
                                                    Max available: {crop.availableQuantity} {crop.unit}
                                                </small>
                                            </div>

                                            {/* Message to Farmer */}
                                            <div className="mb-3">
                                                <label className="form-label">Message to Farmer (Optional)</label>
                                                <textarea
                                                    className="form-control"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    rows="3"
                                                    maxLength="500"
                                                    placeholder="Add any special requests or information..."
                                                ></textarea>
                                                <small className="form-text text-muted">
                                                    {formData.message.length}/500 characters
                                                </small>
                                            </div>

                                            {/* Expected Delivery Date */}
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    <Calendar size={16} /> Expected Delivery Date (Optional)
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="expectedDeliveryDate"
                                                    value={formData.expectedDeliveryDate}
                                                    onChange={handleChange}
                                                    min={new Date().toISOString().split("T")[0]}
                                                />
                                            </div>

                                            {/* Proposal Validity */}
                                            <div className="mb-3">
                                                <label className="form-label">Proposal Valid Until *</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="validUntil"
                                                    value={formData.validUntil}
                                                    onChange={handleChange}
                                                    min={new Date().toISOString().split("T")[0]}
                                                    required
                                                />
                                                <small className="form-text text-muted">
                                                    Your bid will expire after this date
                                                </small>
                                            </div>

                                            {/* Info Alert */}
                                            <div className="alert alert-info">
                                                <InfoCircle size={16} className="me-2" />
                                                <strong>Note:</strong> Once the farmer accepts your proposal, an order will be automatically created. You cannot withdraw after acceptance.
                                            </div>

                                            {/* Submit Button */}
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary flex-fill"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            Submitting...
                                                        </>
                                                    ) : (
                                                        "Submit Proposal"
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => navigate(`/trader/crop/${cropId}`)}
                                                    disabled={submitting}
                                                >
                                                    Cancel
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
        </Layout>
    );
};

export default MakeProposal;
