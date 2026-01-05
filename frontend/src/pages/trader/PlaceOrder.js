import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import TraderMenu from "../../Dashboards/TraderMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { ArrowLeft, Cart3 } from "react-bootstrap-icons";

const PlaceOrder = () => {
    const { cropId } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [orderData, setOrderData] = useState({
        quantity: "",
        deliveryAddress: "",
        paymentMethod: "Full",
        expectedDeliveryDate: "",
        notes: "",
    });

    useEffect(() => {
        fetchCropDetails();
    }, [cropId]);

    const fetchCropDetails = async () => {
        try {
            const { data } = await axios.get(
                `/api/crops/details/${cropId}`,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                setCrop(data.crop);
                // Set minimum delivery date to tomorrow
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setOrderData((prev) => ({
                    ...prev,
                    expectedDeliveryDate: tomorrow.toISOString().split("T")[0],
                }));
            }
        } catch (error) {
            console.error("Error fetching crop:", error);
            toast.error("Failed to load crop details");
            navigate("/trader/crops");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setOrderData({
            ...orderData,
            [e.target.name]: e.target.value,
        });
    };

    const calculateTotalPrice = () => {
        if (!crop || !orderData.quantity) return 0;
        return crop.pricePerUnit * Number(orderData.quantity);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const availableQuantity = crop.quantity - crop.reservedQuantity;

            // Validate quantity
            if (Number(orderData.quantity) > availableQuantity) {
                toast.error(`Only ${availableQuantity} ${crop.unit} available`);
                setSubmitting(false);
                return;
            }

            if (Number(orderData.quantity) <= 0) {
                toast.error("Quantity must be greater than 0");
                setSubmitting(false);
                return;
            }

            const { data } = await axios.post(
                `/api/orders/create`,
                {
                    cropId,
                    quantity: Number(orderData.quantity),
                    deliveryAddress: orderData.deliveryAddress,
                    paymentMethod: orderData.paymentMethod,
                    expectedDeliveryDate: orderData.expectedDeliveryDate,
                    notes: orderData.notes,
                },
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                toast.success("Order placed successfully!");
                navigate("/trader/my-orders");
            } else {
                toast.error(data.message || "Failed to place order");
            }
        } catch (error) {
            console.error("Error placing order:", error);
            toast.error(
                error.response?.data?.message || "Failed to place order"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Place Order">
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
                                <p className="mt-3">Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!crop) {
        return null;
    }

    const availableQuantity = crop.quantity - crop.reservedQuantity;
    const totalPrice = calculateTotalPrice();

    return (
        <Layout title="Place Order">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <TraderMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        {/* Back Button */}
                        <button
                            className="btn btn-outline-secondary mb-3"
                            onClick={() => navigate(`/trader/crop/${cropId}`)}
                        >
                            <ArrowLeft size={18} className="me-2" />
                            Back to Crop Details
                        </button>

                        <div className="row">
                            {/* Order Form */}
                            <div className="col-lg-8 mb-4">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h4 className="text-success mb-4">
                                            <Cart3 size={28} className="me-2" />
                                            Place Order
                                        </h4>

                                        <form onSubmit={handleSubmit}>
                                            {/* Quantity */}
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Quantity ({crop.unit}){" "}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    className="form-control"
                                                    placeholder={`Max: ${availableQuantity}`}
                                                    value={orderData.quantity}
                                                    onChange={handleChange}
                                                    min="1"
                                                    max={availableQuantity}
                                                    step="0.01"
                                                    required
                                                />
                                                <small className="text-muted">
                                                    Available: {availableQuantity} {crop.unit}
                                                </small>
                                            </div>

                                            {/* Delivery Address */}
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Delivery Address <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    name="deliveryAddress"
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Enter complete delivery address"
                                                    value={orderData.deliveryAddress}
                                                    onChange={handleChange}
                                                    required
                                                ></textarea>
                                            </div>

                                            {/* Payment Method */}
                                            <div className="mb-3">
                                                <label className="form-label">Payment Method</label>
                                                <select
                                                    name="paymentMethod"
                                                    className="form-select"
                                                    value={orderData.paymentMethod}
                                                    onChange={handleChange}
                                                >
                                                    <option value="Full">Full Payment</option>
                                                    <option value="Advance">Advance Payment</option>
                                                    <option value="COD">Cash on Delivery</option>
                                                </select>
                                            </div>

                                            {/* Expected Delivery Date */}
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Expected Delivery Date{" "}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="expectedDeliveryDate"
                                                    className="form-control"
                                                    value={orderData.expectedDeliveryDate}
                                                    onChange={handleChange}
                                                    min={new Date().toISOString().split("T")[0]}
                                                    required
                                                />
                                            </div>

                                            {/* Notes */}
                                            <div className="mb-4">
                                                <label className="form-label">Notes (Optional)</label>
                                                <textarea
                                                    name="notes"
                                                    className="form-control"
                                                    rows="2"
                                                    placeholder="Any special instructions or requirements..."
                                                    value={orderData.notes}
                                                    onChange={handleChange}
                                                    maxLength="500"
                                                ></textarea>
                                                <small className="text-muted">
                                                    {orderData.notes.length}/500 characters
                                                </small>
                                            </div>

                                            {/* Submit Button */}
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-success"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <span
                                                                className="spinner-border spinner-border-sm me-2"
                                                                role="status"
                                                            ></span>
                                                            Placing Order...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Cart3 size={18} className="me-2" />
                                                            Place Order
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => navigate(`/trader/crop/${cropId}`)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="col-lg-4 mb-4">
                                <div className="card shadow-sm mb-3">
                                    <div className="card-header bg-success text-white">
                                        <h6 className="mb-0">Crop Details</h6>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="text-success mb-3">{crop.cropName}</h5>
                                        <div className="mb-2">
                                            <small className="text-muted">Category:</small>
                                            <p className="mb-2">{crop.category}</p>
                                        </div>
                                        <div className="mb-2">
                                            <small className="text-muted">Quality:</small>
                                            <p className="mb-2">{crop.quality}</p>
                                        </div>
                                        <div className="mb-2">
                                            <small className="text-muted">Price per {crop.unit}:</small>
                                            <p className="mb-2">₹{crop.pricePerUnit}</p>
                                        </div>
                                        <div>
                                            <small className="text-muted">Farmer:</small>
                                            <p className="mb-0">{crop.farmerId?.name || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card shadow-sm">
                                    <div className="card-header bg-primary text-white">
                                        <h6 className="mb-0">Order Summary</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Quantity:</span>
                                            <strong>
                                                {orderData.quantity || 0} {crop.unit}
                                            </strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Price per {crop.unit}:</span>
                                            <strong>₹{crop.pricePerUnit}</strong>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between">
                                            <strong>Total Amount:</strong>
                                            <h5 className="text-success mb-0">₹{totalPrice}</h5>
                                        </div>
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

export default PlaceOrder;
