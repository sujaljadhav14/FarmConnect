import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";

// Variety suggestions based on crop/category
const varietySuggestions = {
    // Fruits
    "Mango": ["Alphonso (Hapus)", "Kesar", "Langra", "Dasheri", "Totapuri", "Banganapalli", "Himsagar", "Other"],
    "Banana": ["Cavendish", "Robusta", "Poovan", "Nendran", "Red Banana", "Elakki", "Other"],
    "Grapes": ["Thompson Seedless", "Sharad Seedless", "Black Grapes", "Flame Seedless", "Other"],
    "Orange": ["Nagpur Orange", "Kinnow", "Mosambi", "Malta", "Blood Orange", "Other"],
    "Apple": ["Kashmiri", "Shimla", "Royal Delicious", "Golden", "Fuji", "Other"],
    "Pomegranate": ["Bhagwa", "Ganesh", "Arakta", "Ruby", "Other"],
    // Vegetables
    "Tomato": ["Pusa Ruby", "Arka Vikas", "Cherry Tomato", "Roma", "Hybrid", "Other"],
    "Potato": ["Kufri Jyoti", "Kufri Bahar", "Kufri Pukhraj", "Kufri Sindhuri", "Other"],
    "Onion": ["Nashik Red", "Bellary", "White Onion", "Pink Onion", "Other"],
    // Grains
    "Rice": ["Basmati", "Sona Masoori", "Ponni", "IR-64", "Kolam", "Other"],
    "Wheat": ["Sharbati", "Lokwan", "MP Wheat", "Punjab Wheat", "Other"],
    // Default
    "default": ["Grade A", "Grade B", "Premium", "Standard", "Organic", "Other"]
};

const AddCrop = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // For edit mode
    const { auth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cropName: "",
        category: "",
        variety: "",
        quantity: "",
        unit: "kg",
        expectedPricePerUnit: "",
        quality: "A",
        expectedHarvestDate: "",
        cultivationDate: "",
        landUnderCultivation: "",
        // Structured location
        village: "",
        tehsil: "",
        district: "",
        state: "",
        pincode: "",
        description: "",
    });

    const [varietyOptions, setVarietyOptions] = useState([]);

    // Update variety options when crop name changes
    useEffect(() => {
        const cropName = formData.cropName.trim();
        if (varietySuggestions[cropName]) {
            setVarietyOptions(varietySuggestions[cropName]);
        } else {
            setVarietyOptions(varietySuggestions["default"]);
        }
    }, [formData.cropName]);

    const fetchCropData = useCallback(async () => {
        try {
            const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
            const { data } = await axios.get(
                `/api/crops/details/${id}`,
                { headers }
            );

            if (data.success) {
                const crop = data.crop;
                setFormData({
                    cropName: crop.cropName || "",
                    category: crop.category || "",
                    variety: crop.variety || "",
                    quantity: crop.quantity || "",
                    unit: crop.unit || "kg",
                    expectedPricePerUnit: crop.expectedPricePerUnit || crop.pricePerUnit || "",
                    quality: crop.quality || "A",
                    expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.split("T")[0] : (crop.harvestDate ? crop.harvestDate.split("T")[0] : ""),
                    cultivationDate: crop.cultivationDate ? crop.cultivationDate.split("T")[0] : "",
                    landUnderCultivation: crop.landUnderCultivation || "",
                    // Handle both old location string and new locationDetails object
                    village: crop.locationDetails?.village || "",
                    tehsil: crop.locationDetails?.tehsil || "",
                    district: crop.locationDetails?.district || "",
                    state: crop.locationDetails?.state || "",
                    pincode: crop.locationDetails?.pincode || "",
                    description: crop.description || "",
                });
            }
        } catch (error) {
            console.error("Error fetching crop:", error);
            toast.error("Failed to load crop data");
        }
    }, [id, auth?.token]);

    // If editing, fetch crop data
    useEffect(() => {
        if (id) {
            fetchCropData();
        }
    }, [id, fetchCropData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Prepare data for API (map to backend field names)
        const submitData = {
            cropName: formData.cropName,
            category: formData.category,
            variety: formData.variety,
            quantity: formData.quantity,
            unit: formData.unit,
            pricePerUnit: formData.expectedPricePerUnit, // Backend uses pricePerUnit
            expectedPricePerUnit: formData.expectedPricePerUnit,
            quality: formData.quality,
            harvestDate: formData.expectedHarvestDate, // Backend uses harvestDate
            expectedHarvestDate: formData.expectedHarvestDate,
            cultivationDate: formData.cultivationDate,
            landUnderCultivation: formData.landUnderCultivation,
            // Combine for old location field and new locationDetails
            location: `${formData.village}, ${formData.tehsil}, ${formData.district}, ${formData.state} - ${formData.pincode}`,
            locationDetails: {
                village: formData.village,
                tehsil: formData.tehsil,
                district: formData.district,
                state: formData.state,
                pincode: formData.pincode,
            },
            description: formData.description,
        };

        try {
            const url = id
                ? `/api/crops/update/${id}`
                : `/api/crops/add`;

            const method = id ? "put" : "post";

            const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
            const { data } = await axios[method](url, submitData, { headers });

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
                                    {/* Section: Crop Information */}
                                    <h5 className="text-muted mb-3">🌾 Crop Information</h5>
                                    <div className="row">
                                        {/* Crop Name */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Crop Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="cropName"
                                                className="form-control"
                                                placeholder="e.g., Mango, Wheat, Tomato"
                                                value={formData.cropName}
                                                onChange={handleChange}
                                                list="cropSuggestions"
                                                required
                                            />
                                            <datalist id="cropSuggestions">
                                                <option value="Mango" />
                                                <option value="Banana" />
                                                <option value="Grapes" />
                                                <option value="Orange" />
                                                <option value="Tomato" />
                                                <option value="Potato" />
                                                <option value="Onion" />
                                                <option value="Rice" />
                                                <option value="Wheat" />
                                            </datalist>
                                        </div>

                                        {/* Category */}
                                        <div className="col-md-4 mb-3">
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

                                        {/* Variety */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Variety <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                name="variety"
                                                className="form-select"
                                                value={formData.variety}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Variety</option>
                                                {varietyOptions.map((variety, idx) => (
                                                    <option key={idx} value={variety}>{variety}</option>
                                                ))}
                                            </select>
                                            <small className="text-muted">e.g., Alphonso for Mango</small>
                                        </div>
                                    </div>

                                    {/* Section: Quantity & Pricing */}
                                    <h5 className="text-muted mb-3 mt-3">📦 Quantity & Pricing</h5>
                                    <div className="row">
                                        {/* Quantity */}
                                        <div className="col-md-3 mb-3">
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
                                        <div className="col-md-3 mb-3">
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
                                                <option value="dozen">Dozen</option>
                                            </select>
                                        </div>

                                        {/* Expected Price Per Unit */}
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">
                                                Expected Price per Unit (₹) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="expectedPricePerUnit"
                                                className="form-control"
                                                placeholder="e.g., 50"
                                                value={formData.expectedPricePerUnit}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        {/* Quality */}
                                        <div className="col-md-3 mb-3">
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
                                    </div>

                                    {/* Section: Cultivation Details */}
                                    <h5 className="text-muted mb-3 mt-3">🌱 Cultivation Details</h5>
                                    <div className="row">
                                        {/* Land Under Cultivation */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Land Under Cultivation (Acres) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="landUnderCultivation"
                                                className="form-control"
                                                placeholder="e.g., 2.5"
                                                value={formData.landUnderCultivation}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        {/* Cultivation Date */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Cultivation/Sowing Date
                                            </label>
                                            <input
                                                type="date"
                                                name="cultivationDate"
                                                className="form-control"
                                                value={formData.cultivationDate}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Expected Harvest Date */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Expected Harvest Date <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="expectedHarvestDate"
                                                className="form-control"
                                                value={formData.expectedHarvestDate}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Section: Farm Location */}
                                    <h5 className="text-muted mb-3 mt-3">📍 Farm Location</h5>
                                    <div className="row">
                                        {/* Village */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Village <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="village"
                                                className="form-control"
                                                placeholder="Enter village name"
                                                value={formData.village}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* Tehsil */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                Tehsil/Taluka <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="tehsil"
                                                className="form-control"
                                                placeholder="Enter tehsil/taluka"
                                                value={formData.tehsil}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* District */}
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">
                                                District <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="district"
                                                className="form-control"
                                                placeholder="Enter district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        {/* State */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                State <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                name="state"
                                                className="form-select"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select State</option>
                                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                <option value="Bihar">Bihar</option>
                                                <option value="Gujarat">Gujarat</option>
                                                <option value="Haryana">Haryana</option>
                                                <option value="Karnataka">Karnataka</option>
                                                <option value="Kerala">Kerala</option>
                                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Punjab">Punjab</option>
                                                <option value="Rajasthan">Rajasthan</option>
                                                <option value="Tamil Nadu">Tamil Nadu</option>
                                                <option value="Telangana">Telangana</option>
                                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                <option value="West Bengal">West Bengal</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {/* Pincode */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Pincode <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                className="form-control"
                                                placeholder="e.g., 411001"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                pattern="[0-9]{6}"
                                                maxLength="6"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="row">
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
                                    <div className="d-flex gap-2 mt-3">
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

