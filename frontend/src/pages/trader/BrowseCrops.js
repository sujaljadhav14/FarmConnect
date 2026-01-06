import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import TraderMenu from "../../Dashboards/TraderMenu";
import CropCard from "../../components/shared/CropCard";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { Search } from "react-bootstrap-icons";

const BrowseCrops = () => {
    const [crops, setCrops] = useState([]);
    const [filteredCrops, setFilteredCrops] = useState([]);
    const [loading, setLoading] = useState(false);
    const { auth } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        category: "",
        quality: "",
        minPrice: "",
        maxPrice: "",
        location: "",
    });

    const fetchAvailableCrops = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `/api/crops/available`,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                setCrops(data.crops);
                setFilteredCrops(data.crops);
            }
        } catch (error) {
            console.error("Error fetching crops:", error);
            toast.error("Failed to load crops");
        } finally {
            setLoading(false);
        }
    }, [auth?.token]);

    const applyFilters = useCallback(() => {
        let filtered = [...crops];

        // Search by crop name
        if (searchTerm) {
            filtered = filtered.filter((crop) =>
                crop.cropName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (filters.category) {
            filtered = filtered.filter((crop) => crop.category === filters.category);
        }

        // Filter by quality
        if (filters.quality) {
            filtered = filtered.filter((crop) => crop.quality === filters.quality);
        }

        // Filter by location
        if (filters.location) {
            filtered = filtered.filter((crop) =>
                crop.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Filter by price range
        if (filters.minPrice) {
            filtered = filtered.filter(
                (crop) => crop.pricePerUnit >= Number(filters.minPrice)
            );
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(
                (crop) => crop.pricePerUnit <= Number(filters.maxPrice)
            );
        }

        setFilteredCrops(filtered);
    }, [searchTerm, filters, crops]);

    useEffect(() => {
        fetchAvailableCrops();
    }, [fetchAvailableCrops]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const clearFilters = () => {
        setFilters({
            category: "",
            quality: "",
            minPrice: "",
            maxPrice: "",
            location: "",
        });
        setSearchTerm("");
    };

    if (loading) {
        return (
            <Layout title="Browse Crops">
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
                                <p className="mt-3">Loading available crops...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Browse Crops">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <TraderMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <h3 className="text-success mb-4">
                            🌾 Browse Available Crops
                        </h3>

                        {/* Search and Filters */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                {/* Search Bar */}
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <Search size={18} />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search crops by name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label small">Category</label>
                                        <select
                                            name="category"
                                            className="form-select form-select-sm"
                                            value={filters.category}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">All Categories</option>
                                            <option value="Grains">Grains</option>
                                            <option value="Vegetables">Vegetables</option>
                                            <option value="Fruits">Fruits</option>
                                            <option value="Pulses">Pulses</option>
                                            <option value="Spices">Spices</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label small">Quality</label>
                                        <select
                                            name="quality"
                                            className="form-select form-select-sm"
                                            value={filters.quality}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="">All Grades</option>
                                            <option value="A+">A+</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                        </select>
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label small">Min Price (₹)</label>
                                        <input
                                            type="number"
                                            name="minPrice"
                                            className="form-control form-control-sm"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={handleFilterChange}
                                            min="0"
                                        />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label small">Max Price (₹)</label>
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            className="form-control form-control-sm"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={handleFilterChange}
                                            min="0"
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label small">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            className="form-control form-control-sm"
                                            placeholder="Enter location..."
                                            value={filters.location}
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                {/* Filter Actions */}
                                <div className="mt-3 d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                        Showing {filteredCrops.length} of {crops.length} crops
                                    </small>
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={clearFilters}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Crops Grid */}
                        {filteredCrops.length === 0 ? (
                            <div className="card shadow-sm">
                                <div className="card-body text-center py-5">
                                    <h5 className="text-muted">No crops found</h5>
                                    <p className="text-muted">
                                        {crops.length === 0
                                            ? "No crops are currently available"
                                            : "Try adjusting your filters"}
                                    </p>
                                    {crops.length > 0 && (
                                        <button
                                            className="btn btn-success mt-3"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {filteredCrops.map((crop) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={crop._id}>
                                        <CropCard crop={crop} showFarmerInfo={true} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BrowseCrops;
