import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import TraderMenu from "../../Dashboards/TraderMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import {
    GeoAlt,
    Calendar,
    Person,
    Telephone,
    Cart3,
    ArrowLeft,
} from "react-bootstrap-icons";

const CropDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCropDetails();
    }, [id]);

    const fetchCropDetails = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API}/api/crops/details/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                setCrop(data.crop);
            }
        } catch (error) {
            console.error("Error fetching crop details:", error);
            toast.error("Failed to load crop details");
            navigate("/trader/crops");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            Available: "success",
            Reserved: "warning",
            Sold: "danger",
            Unavailable: "secondary",
        };

        return (
            <span className={`badge bg-${statusColors[status] || "secondary"} fs-6`}>
                {status}
            </span>
        );
    };

    const getQualityBadge = (quality) => {
        const qualityColors = {
            "A+": "success",
            A: "info",
            B: "warning",
            C: "secondary",
        };

        return (
            <span className={`badge bg-${qualityColors[quality] || "secondary"} fs-6`}>
                Grade {quality}
            </span>
        );
    };

    if (loading) {
        return (
            <Layout title="Crop Details">
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
                                <p className="mt-3">Loading crop details...</p>
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

    return (
        <Layout title={`${crop.cropName} Details`}>
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
                            onClick={() => navigate("/trader/crops")}
                        >
                            <ArrowLeft size={18} className="me-2" />
                            Back to Crops
                        </button>

                        <div className="row">
                            {/* Crop Details Card */}
                            <div className="col-lg-8 mb-4">
                                <div className="card shadow-sm h-100">
                                    <div className="card-body">
                                        {/* Header */}
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div>
                                                <h3 className="text-success mb-2">{crop.cropName}</h3>
                                                <p className="text-muted mb-2">{crop.category}</p>
                                                <div>
                                                    {getQualityBadge(crop.quality)}
                                                    <span className="ms-2">{getStatusBadge(crop.status)}</span>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <h4 className="text-success mb-0">
                                                    ₹{crop.pricePerUnit}
                                                    <small className="text-muted">/{crop.unit}</small>
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Quantity Information */}
                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <div className="p-3 bg-light rounded">
                                                    <small className="text-muted d-block mb-1">
                                                        Total Quantity
                                                    </small>
                                                    <h5 className="mb-0">
                                                        {crop.quantity} {crop.unit}
                                                    </h5>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="p-3 bg-light rounded">
                                                    <small className="text-muted d-block mb-1">
                                                        Available Now
                                                    </small>
                                                    <h5
                                                        className={`mb-0 ${availableQuantity > 0
                                                            ? "text-success"
                                                            : "text-danger"
                                                            }`}
                                                    >
                                                        {availableQuantity} {crop.unit}
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {crop.description && (
                                            <div className="mb-4">
                                                <h6 className="text-secondary mb-2">Description</h6>
                                                <p className="text-muted">{crop.description}</p>
                                            </div>
                                        )}

                                        {/* Dates */}
                                        <div className="mb-4">
                                            <h6 className="text-secondary mb-3">Important Dates</h6>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <p className="mb-2">
                                                        <Calendar size={18} className="me-2 text-muted" />
                                                        <strong>Harvest Date:</strong>{" "}
                                                        {new Date(crop.harvestDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <p className="mb-2">
                                                        <Calendar size={18} className="me-2 text-muted" />
                                                        <strong>Available From:</strong>{" "}
                                                        {new Date(crop.availabilityDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="mb-4">
                                            <h6 className="text-secondary mb-2">Location</h6>
                                            <p className="mb-0">
                                                <GeoAlt size={18} className="me-2 text-muted" />
                                                {crop.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Farmer & Order Card */}
                            <div className="col-lg-4 mb-4">
                                {/* Farmer Information */}
                                <div className="card shadow-sm mb-3">
                                    <div className="card-header bg-success text-white">
                                        <h6 className="mb-0">Farmer Information</h6>
                                    </div>
                                    <div className="card-body">
                                        {crop.farmerId ? (
                                            <>
                                                <p className="mb-2">
                                                    <Person size={18} className="me-2 text-success" />
                                                    <strong>{crop.farmerId.name}</strong>
                                                </p>
                                                {crop.farmerId.phone && (
                                                    <p className="mb-2">
                                                        <Telephone size={18} className="me-2 text-success" />
                                                        {crop.farmerId.phone}
                                                    </p>
                                                )}
                                                {crop.farmerId.location && (
                                                    <p className="mb-0">
                                                        <GeoAlt size={18} className="me-2 text-success" />
                                                        {crop.farmerId.location}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-muted mb-0">
                                                Farmer information not available
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Action */}
                                <div className="card shadow-sm">
                                    <div className="card-body text-center">
                                        {crop.status === "Available" && availableQuantity > 0 ? (
                                            <>
                                                <h6 className="text-success mb-3">Ready to Order?</h6>
                                                <p className="text-muted small mb-3">
                                                    {availableQuantity} {crop.unit} available for immediate
                                                    purchase
                                                </p>
                                                <button
                                                    className="btn btn-success w-100"
                                                    onClick={() => navigate(`/trader/place-order/${crop._id}`)}
                                                >
                                                    <Cart3 size={18} className="me-2" />
                                                    Place Order
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <h6 className="text-danger mb-3">Not Available</h6>
                                                <p className="text-muted small mb-0">
                                                    This crop is currently not available for ordering
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Listed Date */}
                                <div className="card shadow-sm mt-3">
                                    <div className="card-body">
                                        <small className="text-muted">
                                            Listed on {new Date(crop.createdAt).toLocaleDateString()}
                                        </small>
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

export default CropDetails;
