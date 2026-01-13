import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { Pencil, Trash, GeoAlt, Calendar, CurrencyRupee } from "react-bootstrap-icons";

const MyCrops = () => {
    const navigate = useNavigate();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const { auth } = useAuth();
    const [deleteLoading, setDeleteLoading] = useState(null);

    const fetchMyCrops = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `/api/crops/my-crops`,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                setCrops(data.crops);
            }
        } catch (error) {
            console.error("Error fetching crops:", error);
            toast.error("Failed to load crops");
        } finally {
            setLoading(false);
        }
    }, [auth?.token]);

    useEffect(() => {
        if (auth?.token) {
            fetchMyCrops();
        }
    }, [fetchMyCrops, auth?.token]);

    const handleDelete = async (cropId) => {
        if (window.confirm("Are you sure you want to delete this crop?")) {
            setDeleteLoading(cropId);
            try {
                const { data } = await axios.delete(
                    `/api/crops/delete/${cropId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${auth?.token}`, // Fixed: use auth.token
                        },
                    }
                );

                if (data.success) {
                    toast.success("Crop deleted successfully");
                    fetchMyCrops();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error("Error deleting crop:", error);
                toast.error(
                    error.response?.data?.message || "Failed to delete crop"
                );
            } finally {
                setDeleteLoading(null);
            }
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
            <span className={`badge bg-${statusColors[status] || "secondary"}`}>
                {status}
            </span>
        );
    };

    // Helper to format location
    const formatLocation = (crop) => {
        if (crop.locationDetails && crop.locationDetails.village) {
            const loc = crop.locationDetails;
            return `${loc.village}, ${loc.tehsil || ''}, ${loc.district}`;
        }
        return crop.location || "Not specified";
    };

    // Helper to get harvest date
    const getHarvestDate = (crop) => {
        const date = crop.expectedHarvestDate || crop.harvestDate;
        return date ? new Date(date).toLocaleDateString() : "Not set";
    };

    // Helper to get price
    const getPrice = (crop) => {
        return crop.expectedPricePerUnit || crop.pricePerUnit || 0;
    };

    if (loading) {
        return (
            <Layout title="My Crops">
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
                                <p className="mt-3">Loading your crops...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="My Crops">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <FarmerMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="text-success">🌾 My Crops</h3>
                            <Link to="/farmer/add-crop" className="btn btn-success">
                                ➕ Add New Crop
                            </Link>
                        </div>

                        {crops.length === 0 ? (
                            <div className="card shadow-sm">
                                <div className="card-body text-center py-5">
                                    <h5 className="text-muted">No crops added yet</h5>
                                    <p className="text-muted">
                                        Start by adding your first crop to the platform
                                    </p>
                                    <Link to="/farmer/add-crop" className="btn btn-success mt-3">
                                        Add Your First Crop
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {crops.map((crop) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={crop._id}>
                                        <div className="card h-100 shadow-sm crop-card">
                                            <div className="card-body">
                                                {/* Crop Header */}
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="card-title text-success mb-1">
                                                            {crop.cropName}
                                                        </h5>
                                                        <div>
                                                            <small className="text-muted">{crop.category}</small>
                                                            {crop.variety && (
                                                                <span className="badge bg-info ms-2">{crop.variety}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(crop.status)}
                                                </div>

                                                {/* Crop Details */}
                                                <div className="mb-3">
                                                    <p className="mb-2">
                                                        <strong>Quantity:</strong> {crop.quantity} {crop.unit}
                                                        {crop.landUnderCultivation && (
                                                            <small className="text-muted ms-2">
                                                                ({crop.landUnderCultivation} acres)
                                                            </small>
                                                        )}
                                                    </p>
                                                    <p className="mb-2">
                                                        <CurrencyRupee size={14} className="me-1" />
                                                        <strong>Expected Price:</strong> ₹{getPrice(crop)}/{crop.unit}
                                                    </p>
                                                    <p className="mb-2">
                                                        <strong>Quality:</strong> {crop.quality}
                                                    </p>
                                                    <p className="mb-2">
                                                        <GeoAlt size={14} className="me-1" />
                                                        <strong>Location:</strong> {formatLocation(crop)}
                                                    </p>
                                                    <p className="mb-2">
                                                        <Calendar size={14} className="me-1" />
                                                        <strong>Expected Harvest:</strong> {getHarvestDate(crop)}
                                                    </p>
                                                    {crop.reservedQuantity > 0 && (
                                                        <p className="mb-0 text-warning">
                                                            <strong>Reserved:</strong> {crop.reservedQuantity}{" "}
                                                            {crop.unit}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary flex-fill"
                                                        onClick={() => navigate(`/farmer/edit-crop/${crop._id}`)}
                                                    >
                                                        <Pencil size={14} className="me-1" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(crop._id)}
                                                        disabled={deleteLoading === crop._id || crop.reservedQuantity > 0}
                                                        title={
                                                            crop.reservedQuantity > 0
                                                                ? "Cannot delete crop with active orders"
                                                                : "Delete crop"
                                                        }
                                                    >
                                                        {deleteLoading === crop._id ? (
                                                            <span
                                                                className="spinner-border spinner-border-sm"
                                                                role="status"
                                                            ></span>
                                                        ) : (
                                                            <Trash size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="card-footer bg-light">
                                                <small className="text-muted">
                                                    Added on {new Date(crop.createdAt).toLocaleDateString()}
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

            <style>
                {`
          .crop-card {
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .crop-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          }
        `}
            </style>
        </Layout>
    );
};

export default MyCrops;

