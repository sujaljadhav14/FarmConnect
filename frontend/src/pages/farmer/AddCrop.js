import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";

const AddCrop = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // For edit mode
    const { auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cropName: "",
        category: "",
        quantity: "",
        unit: "kg",
        pricePerUnit: "",
        quality: "A",
        harvestDate: "",
        location: "",
        description: "",
    });

    // If editing, fetch crop data
    useEffect(() => {
        if (id) {
            fetchCropData();
        }
    }, [id]);

    const fetchCropData = async () => {
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
                const crop = data.crop;
                setFormData({
                    cropName: crop.cropName,
                    category: crop.category,
                    quantity: crop.quantity,
                    unit: crop.unit,
                    pricePerUnit: crop.pricePerUnit,
                    quality: crop.quality,
                    harvestDate: crop.harvestDate.split("T")[0],
                    location: crop.location,
                    description: crop.description || "",
                });
            }
        } catch (error) {
            console.error("Error fetching crop:", error);
            toast.error("Failed to load crop data");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = id
                ? `${process.env.REACT_APP_API}/api/crops/update/${id}`
                : `${process.env.REACT_APP_API}/api/crops/add`;

            const method = id ? "put" : "post";

            const { data } = await axios[method](url, formData, {
                headers: {
                    Authorization: `Bearer ${auth?.token}`,
                },
            });

            if (data.success) {
                toast.success(id ? "Crop updated successfully!" : "Crop added successfully!");
                navigate("/farmer/my-crops");
            } else {
                toast.error(data.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Error saving crop:", error);
            toast.error(error.response?.data?.message || "Failed to save crop");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title={id ? "Edit Crop" : "Add Crop Details"}>
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <FarmerMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h3 className="text-success mb-4">
                                    {id ? "📝 Edit Crop Details" : "➕ Add New Crop"}
                                </h3>

                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        {/* Crop Name */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Crop Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="cropName"
                                                className="form-control"
                                                placeholder="e.g., Wheat, Rice, Tomato"
                                                value={formData.cropName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* Category */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Category <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                name="category"
                                                className="form-select"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Grains">Grains</option>
                                                <option value="Vegetables">Vegetables</option>
                                                <option value="Fruits">Fruits</option>
                                                <option value="Pulses">Pulses</option>
                                                <option value="Spices">Spices</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {/* Quantity */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Quantity <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                className="form-control"
                                                placeholder="e.g., 100"
                                                value={formData.quantity}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        {/* Unit */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Unit <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                name="unit"
                                                className="form-select"
                                                value={formData.unit}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="kg">Kilogram (kg)</option>
                                                <option value="quintal">Quintal</option>
                                                <option value="ton">Ton</option>
                                                <option value="piece">Piece</option>
                                            </select>
                                        </div>

                                        {/* Price Per Unit */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Price per Unit (₹) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="pricePerUnit"
                                                className="form-control"
                                                placeholder="e.g., 25"
                                                value={formData.pricePerUnit}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        {/* Quality */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Quality Grade</label>
                                            <select
                                                name="quality"
                                                className="form-select"
                                                value={formData.quality}
                                                onChange={handleChange}
                                            >
                                                <option value="A+">A+ (Premium)</option>
                                                <option value="A">A (Good)</option>
                                                <option value="B">B (Standard)</option>
                                                <option value="C">C (Basic)</option>
                                            </select>
                                        </div>

                                        {/* Harvest Date */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Harvest Date <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="harvestDate"
                                                className="form-control"
                                                value={formData.harvestDate}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* Location */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Farm Location <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                className="form-control"
                                                placeholder="e.g., Village, District, State"
                                                value={formData.location}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="col-12 mb-3">
                                            <label className="form-label">Description (Optional)</label>
                                            <textarea
                                                name="description"
                                                className="form-control"
                                                rows="3"
                                                placeholder="Add any additional information about the crop..."
                                                value={formData.description}
                                                onChange={handleChange}
                                                maxLength="500"
                                            ></textarea>
                                            <small className="text-muted">
                                                {formData.description.length}/500 characters
                                            </small>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="d-flex gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>
                                                    {id ? "Updating..." : "Adding..."}
                                                </>
                                            ) : (
                                                <>{id ? "Update Crop" : "Add Crop"}</>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate("/farmer/my-crops")}
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
        </Layout>
    );
};

export default AddCrop;
