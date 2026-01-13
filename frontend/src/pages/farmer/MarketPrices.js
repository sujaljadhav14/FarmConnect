import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import { ArrowUp, ArrowDown } from "react-bootstrap-icons";
import axios from "axios";
import { useAuth } from "../../context/authContext";

const MarketPrices = () => {
    const { auth } = useAuth();
    const [prices, setPrices] = useState([]);
    const [myCropPrices, setMyCropPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myCropsLoading, setMyCropsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("my-crops"); // "my-crops" or "all-crops"

    // Fetch farmer's crops and their market prices
    useEffect(() => {
        fetchMyCropPrices();
        fetchAllPrices();
    }, []);

    const fetchMyCropPrices = async () => {
        try {
            setMyCropsLoading(true);
            // Fetch farmer's crops
            const { data } = await axios.get("/api/crops/my-crops", {
                headers: { Authorization: `Bearer ${auth?.token}` },
            });

            if (data.crops && data.crops.length > 0) {
                // Map farmer's crops with simulated market prices
                const cropPrices = data.crops.map(crop => ({
                    crop: crop.cropName,
                    category: crop.category,
                    myPrice: crop.pricePerUnit,
                    currentPrice: getMarketPrice(crop.cropName),
                    previousPrice: getMarketPrice(crop.cropName) * (0.95 + Math.random() * 0.1),
                    unit: `per ${crop.unit}`,
                    quantity: crop.quantity,
                    status: crop.status,
                }));
                setMyCropPrices(cropPrices);
            }
        } catch (error) {
            console.error("Error fetching my crops:", error);
        } finally {
            setMyCropsLoading(false);
        }
    };

    // Helper to get simulated market price based on crop name
    const getMarketPrice = (cropName) => {
        const basePrices = {
            "Wheat": 2500, "Rice": 3200, "Sugarcane": 350, "Cotton": 6500,
            "Maize": 1800, "Potato": 1200, "Onion": 2200, "Tomato": 1800,
            "Mango": 4500, "Apple": 8000, "Banana": 600, "Grapes": 5500,
        };
        return basePrices[cropName] || Math.floor(1000 + Math.random() * 5000);
    };

    const fetchAllPrices = () => {
        // Simulate API call for all market prices
        setTimeout(() => {
            setPrices([
                { crop: "Wheat", currentPrice: 2500, previousPrice: 2400, unit: "per quintal", trend: "up" },
                { crop: "Rice", currentPrice: 3200, previousPrice: 3300, unit: "per quintal", trend: "down" },
                { crop: "Sugarcane", currentPrice: 350, previousPrice: 340, unit: "per quintal", trend: "up" },
                { crop: "Cotton", currentPrice: 6500, previousPrice: 6400, unit: "per quintal", trend: "up" },
                { crop: "Maize", currentPrice: 1800, previousPrice: 1850, unit: "per quintal", trend: "down" },
                { crop: "Potato", currentPrice: 1200, previousPrice: 1150, unit: "per quintal", trend: "up" },
                { crop: "Onion", currentPrice: 2200, previousPrice: 2400, unit: "per quintal", trend: "down" },
                { crop: "Tomato", currentPrice: 1800, previousPrice: 1700, unit: "per quintal", trend: "up" },
                { crop: "Mango", currentPrice: 4500, previousPrice: 4200, unit: "per quintal", trend: "up" },
                { crop: "Apple", currentPrice: 8000, previousPrice: 8200, unit: "per quintal", trend: "down" },
                { crop: "Banana", currentPrice: 600, previousPrice: 580, unit: "per quintal", trend: "up" },
                { crop: "Grapes", currentPrice: 5500, previousPrice: 5300, unit: "per quintal", trend: "up" },
            ]);
            setLoading(false);
        }, 500);
    };

    const getPriceChange = (current, previous) => {
        const change = current - previous;
        const percentage = ((change / previous) * 100).toFixed(2);
        return { change, percentage };
    };

    const renderPriceCard = (item, idx, showMyPrice = false) => {
        const { change, percentage } = getPriceChange(item.currentPrice, item.previousPrice);
        const isPositive = change >= 0;

        return (
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={idx}>
                <div
                    className="card shadow-sm h-100"
                    style={{
                        borderTop: `4px solid ${isPositive ? "#28a745" : "#dc3545"}`,
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                >
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title mb-0">{item.crop}</h5>
                            {item.trend === "up" || isPositive ? (
                                <ArrowUp className="text-success" size={24} />
                            ) : (
                                <ArrowDown className="text-danger" size={24} />
                            )}
                        </div>

                        {showMyPrice && (
                            <div className="mb-2 p-2 bg-light rounded">
                                <small className="text-muted">Your Listed Price:</small>
                                <h5 className="mb-0 text-primary">₹{item.myPrice}</h5>
                            </div>
                        )}

                        <div className="mb-2">
                            <small className="text-muted">Market Price:</small>
                            <h3 className="mb-0 text-dark">₹{Math.round(item.currentPrice)}</h3>
                            <small className="text-muted">{item.unit}</small>
                        </div>

                        <div className={`d-flex align-items-center ${isPositive ? "text-success" : "text-danger"}`}>
                            <span className="fw-semibold">
                                {isPositive ? "+" : ""}₹{Math.round(change)}
                            </span>
                            <span className="ms-2">
                                ({isPositive ? "+" : ""}{percentage}%)
                            </span>
                        </div>

                        {showMyPrice && item.myPrice < item.currentPrice && (
                            <div className="alert alert-success py-1 px-2 mt-2 mb-0">
                                <small>💡 Market price is higher - good time to sell!</small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Layout title="Market Prices">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <FarmerMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="text-success">📊 Market Prices</h2>
                            <small className="text-muted">Last Updated: Today</small>
                        </div>

                        {/* Tab Navigation */}
                        <ul className="nav nav-tabs mb-4">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "my-crops" ? "active" : ""}`}
                                    onClick={() => setActiveTab("my-crops")}
                                >
                                    🌾 My Crops Prices
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "all-crops" ? "active" : ""}`}
                                    onClick={() => setActiveTab("all-crops")}
                                >
                                    📈 All Market Prices
                                </button>
                            </li>
                        </ul>

                        {/* Tab 1: My Crops Prices */}
                        {activeTab === "my-crops" && (
                            <>
                                {myCropsLoading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-success" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2 text-muted">Fetching your crop prices...</p>
                                    </div>
                                ) : myCropPrices.length > 0 ? (
                                    <div className="row g-4">
                                        {myCropPrices.map((item, idx) => renderPriceCard(item, idx, true))}
                                    </div>
                                ) : (
                                    <div className="card shadow-sm">
                                        <div className="card-body text-center py-5">
                                            <h4>No Crops Listed Yet</h4>
                                            <p className="text-muted">
                                                Add crops to your listings to see their market prices here.
                                            </p>
                                            <a href="/farmer/add-crop" className="btn btn-success">
                                                Add Your First Crop
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Tab 2: All Market Prices */}
                        {activeTab === "all-crops" && (
                            <>
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-success" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="row g-4">
                                        {prices.map((item, idx) => renderPriceCard(item, idx, false))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Info Section */}
                        <div className="alert alert-info mt-4" role="alert">
                            <h6 className="alert-heading">
                                <i className="bi bi-info-circle"></i> Note
                            </h6>
                            <p className="mb-0">
                                Market prices are indicative and subject to change based on
                                market conditions, location, and crop quality. Please verify
                                with local mandis or traders before making decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Effect Styles */}
            <style>
                {`
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
          }
        `}
            </style>
        </Layout>
    );
};

export default MarketPrices;

