import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/layout/Layout";
import AnalyticsChart from "../../components/analytics/AnalyticsChart";
import "../../styles/Analytics.css";

const TraderAnalytics = () => {
    const [crops, setCrops] = useState([]);
    const [cropId, setCropId] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [interval, setInterval] = useState("daily");
    const [loading, setLoading] = useState(false);
    const [trendData, setTrendData] = useState([]);
    const [topCrops, setTopCrops] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch crop list for selector
        const fetchCrops = async () => {
            try {
                const res = await axios.get("/api/crops");
                setCrops(res.data.crops || []);
            } catch (err) {
                console.error("Failed to fetch crops", err);
            }
        };
        fetchCrops();

        // Fetch initial top crops for default period
        fetchTopCrops();
    }, []);

    const fetchTopCrops = async () => {
        try {
            const res = await axios.get("/api/analytics/top-crops?limit=6");
            setTopCrops(res.data.data || []);
        } catch (err) {
            console.error("Top crops fetch failed", err);
        }
    };

    const fetchTrend = async (e) => {
        e && e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (cropId) params.append("cropId", cropId);
            if (start) params.append("start", start);
            if (end) params.append("end", end);
            if (interval) params.append("interval", interval);

            const url = `/api/analytics/price-trend?${params.toString()}`;
            const res = await axios.get(url);
            setTrendData(res.data.data || []);
        } catch (err) {
            console.error("Price trend fetch failed", err);
            setError("Failed to load analytics. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Market Analytics">
            <div className="container mt-4">
                <h2 className="mb-3">Market Analytics</h2>
                <p className="text-muted">Analyze price trends, volume, and top crops.</p>

                <div className="analytics-card card mb-4">
                    <div className="card-body">
                        <form className="row g-3" onSubmit={fetchTrend}>
                            <div className="col-md-4">
                                <label className="form-label">Crop</label>
                                <select
                                    className="form-select"
                                    value={cropId}
                                    onChange={(e) => setCropId(e.target.value)}
                                >
                                    <option value="">All crops</option>
                                    {crops.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                />
                            </div>

                            <div className="col-md-2">
                                <label className="form-label">Interval</label>
                                <select
                                    className="form-select"
                                    value={interval}
                                    onChange={(e) => setInterval(e.target.value)}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div className="col-12 text-end mt-2">
                                <button className="btn btn-primary" type="submit" disabled={loading}>
                                    {loading ? "Loading..." : "Show"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="row">
                    <div className="col-lg-8">
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title">Price Trend</h5>
                                {trendData.length === 0 ? (
                                    <div className="text-muted">No trend data. Select filters and click Show.</div>
                                ) : (
                                    <AnalyticsChart data={trendData} />
                                )}
                            </div>
                        </div>

                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title">Price Summary</h5>
                                <ul className="list-unstyled mb-0">
                                    {trendData.slice(0, 5).map((d) => (
                                        <li key={d.label} className="mb-2">
                                            <strong>{d.label}</strong>: Avg {d.avgPrice} | Min {d.minPrice} | Max {d.maxPrice} | Qty {d.totalQty}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title">Top Crops</h5>
                                <ol className="mt-3 mb-0">
                                    {topCrops.map((t) => (
                                        <li key={t.cropId} className="mb-2">
                                            <div><strong>{t.cropName || "Unknown"}</strong></div>
                                            <div className="text-muted small">Qty: {t.totalQty} • Value: {Math.round(t.totalValue)}</div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">Notes</h6>
                                <p className="text-muted small mb-0">
                                    Inputs required: crop (optional), start date (optional), end date (optional), interval (daily|weekly|monthly). If no dates provided, the system will use a sensible default range.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TraderAnalytics;