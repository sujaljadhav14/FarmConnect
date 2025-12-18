import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, GeoAlt, Calendar } from "react-bootstrap-icons";

const CropCard = ({ crop, showFarmerInfo = false }) => {
    const navigate = useNavigate();

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

    const getQualityBadge = (quality) => {
        const qualityColors = {
            "A+": "success",
            A: "info",
            B: "warning",
            C: "secondary",
        };

        return (
            <span className={`badge bg-${qualityColors[quality] || "secondary"} ms-2`}>
                {quality}
            </span>
        );
    };

    return (
        <div className="card h-100 shadow-sm crop-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 className="card-title text-success mb-1">{crop.cropName}</h5>
                        <small className="text-muted">{crop.category}</small>
                        {getQualityBadge(crop.quality)}
                    </div>
                    {getStatusBadge(crop.status)}
                </div>

                {/* Crop Details */}
                <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Quantity:</span>
                        <strong>
                            {crop.quantity} {crop.unit}
                        </strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Price:</span>
                        <strong className="text-success">
                            ₹{crop.pricePerUnit}/{crop.unit}
                        </strong>
                    </div>
                    {crop.reservedQuantity > 0 && (
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Available:</span>
                            <strong className="text-warning">
                                {crop.quantity - crop.reservedQuantity} {crop.unit}
                            </strong>
                        </div>
                    )}
                </div>

                {/* Location & Date */}
                <div className="mb-3">
                    <p className="mb-2 small">
                        <GeoAlt size={14} className="me-1 text-muted" />
                        <span className="text-muted">{crop.location}</span>
                    </p>
                    <p className="mb-0 small">
                        <Calendar size={14} className="me-1 text-muted" />
                        <span className="text-muted">
                            Harvested: {new Date(crop.harvestDate).toLocaleDateString()}
                        </span>
                    </p>
                </div>

                {/* Farmer Info (if enabled) */}
                {showFarmerInfo && crop.farmerId && (
                    <div className="border-top pt-2 mb-3 small">
                        <p className="mb-1">
                            <strong>Farmer:</strong> {crop.farmerId.name}
                        </p>
                        {crop.farmerId.phone && (
                            <p className="mb-0 text-muted">📞 {crop.farmerId.phone}</p>
                        )}
                    </div>
                )}

                {/* View Details Button */}
                <button
                    className="btn btn-outline-success w-100"
                    onClick={() => navigate(`/trader/crop/${crop._id}`)}
                >
                    <Eye size={16} className="me-2" />
                    View Details
                </button>
            </div>

            {/* Card Footer */}
            <div className="card-footer bg-light">
                <small className="text-muted">
                    Listed on {new Date(crop.createdAt).toLocaleDateString()}
                </small>
            </div>

            <style jsx>{`
        .crop-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .crop-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
        </div>
    );
};

export default CropCard;
