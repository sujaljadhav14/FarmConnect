import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import { ArrowUp, ArrowDown } from "react-bootstrap-icons";

const MarketPrices = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sample market prices data
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setPrices([
                {
                    crop: "Wheat",
                    currentPrice: 2500,
                    previousPrice: 2400,
                    unit: "per quintal",
                    trend: "up",
                },
                {
                    crop: "Rice",
                    currentPrice: 3200,
                    previousPrice: 3300,
                    unit: "per quintal",
                    trend: "down",
                },
                {
                    crop: "Sugarcane",
                    currentPrice: 350,
                    previousPrice: 340,
                    unit: "per quintal",
                    trend: "up",
                },
                {
                    crop: "Cotton",
                    currentPrice: 6500,
                    previousPrice: 6400,
                    unit: "per quintal",
                    trend: "up",
                },
                {
                    crop: "Maize",
                    currentPrice: 1800,
                    previousPrice: 1850,
                    unit: "per quintal",
                    trend: "down",
                },
                {
                    crop: "Potato",
                    currentPrice: 1200,
                    previousPrice: 1150,
                    unit: "per quintal",
                    trend: "up",
                },
                {
                    crop: "Onion",
                    currentPrice: 2200,
                    previousPrice: 2400,
                    unit: "per quintal",
                    trend: "down",
                },
                {
                    crop: "Tomato",
                    currentPrice: 1800,
                    previousPrice: 1700,
                    unit: "per quintal",
                    trend: "up",
                },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const getPriceChange = (current, previous) => {
        const change = current - previous;
        const percentage = ((change / previous) * 100).toFixed(2);
        return { change, percentage };
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

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {prices.map((item, idx) => {
                                    const { change, percentage } = getPriceChange(
                                        item.currentPrice,
                                        item.previousPrice
                                    );
                                    const isPositive = change >= 0;

                                    return (
                                        <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={idx}>
                                            <div
                                                className="card shadow-sm h-100"
                                                style={{
                                                    borderTop: `4px solid ${isPositive ? "#28a745" : "#dc3545"
                                                        }`,
                                                    transition: "transform 0.2s, box-shadow 0.2s",
                                                }}
                                            >
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h5 className="card-title mb-0">{item.crop}</h5>
                                                        {item.trend === "up" ? (
                                                            <ArrowUp className="text-success" size={24} />
                                                        ) : (
                                                            <ArrowDown className="text-danger" size={24} />
                                                        )}
                                                    </div>

                                                    <div className="mb-2">
                                                        <h3 className="mb-0 text-dark">
                                                            ₹{item.currentPrice}
                                                        </h3>
                                                        <small className="text-muted">{item.unit}</small>
                                                    </div>

                                                    <div
                                                        className={`d-flex align-items-center ${isPositive ? "text-success" : "text-danger"
                                                            }`}
                                                    >
                                                        <span className="fw-semibold">
                                                            {isPositive ? "+" : ""}₹{change}
                                                        </span>
                                                        <span className="ms-2">
                                                            ({isPositive ? "+" : ""}
                                                            {percentage}%)
                                                        </span>
                                                    </div>

                                                    <small className="text-muted">
                                                        vs Previous: ₹{item.previousPrice}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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
