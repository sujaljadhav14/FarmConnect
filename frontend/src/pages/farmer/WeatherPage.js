import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import {
    Cloud,
    Wind,
    Droplet,
    Eye,
    Speedometer,
    Trash,
    Heart,
    HeartFill,
    Plus,
    ExclamationTriangle,
} from "react-bootstrap-icons";

const WeatherPage = () => {
    const { auth } = useAuth();
    const [weatherLocations, setWeatherLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeLocation, setActiveLocation] = useState(null);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchWeatherLocations();
        fetchAlerts();
    }, []);

    const fetchWeatherLocations = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/weather/my-locations", {
                headers: { Authorization: `Bearer ${auth?.token}` },
            });

            if (data.success) {
                setWeatherLocations(data.weather || []);
                if (data.weather.length > 0) {
                    setActiveLocation(data.weather[0]._id);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch weather data");
        } finally {
            setLoading(false);
        }
    };

    const fetchAlerts = async () => {
        try {
            const { data } = await axios.get("/api/weather/alerts/all", {
                headers: { Authorization: `Bearer ${auth?.token}` },
            });

            if (data.success) {
                setAlerts(data.alerts || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            toast.error("Please enter a location");
            return;
        }

        try {
            setLoading(true);
            const { data } = await axios.post(
                "/api/weather/get-weather",
                { location: searchQuery },
                { headers: { Authorization: `Bearer ${auth?.token}` } }
            );

            if (data.success) {
                toast.success("Location added successfully!");
                setSearchQuery("");
                setShowForm(false);
                fetchWeatherLocations();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add location");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLocation = async (weatherId) => {
        if (!window.confirm("Remove this location?")) return;

        try {
            const { data } = await axios.delete(
                `/api/weather/location/${weatherId}`,
                { headers: { Authorization: `Bearer ${auth?.token}` } }
            );

            if (data.success) {
                toast.success("Location removed");
                fetchWeatherLocations();
            }
        } catch (error) {
            toast.error("Failed to delete location");
        }
    };

    const handleToggleFavorite = async (weatherId) => {
        try {
            const { data } = await axios.put(
                `/api/weather/favorite/${weatherId}`,
                {},
                { headers: { Authorization: `Bearer ${auth?.token}` } }
            );

            if (data.success) {
                fetchWeatherLocations();
            }
        } catch (error) {
            toast.error("Failed to update favorite");
        }
    };

    const getWeatherIcon = (iconCode) => {
        const iconMap = {
            "01d": "☀️",
            "01n": "🌙",
            "02d": "🌤️",
            "02n": "🌤️",
            "03d": "☁️",
            "03n": "☁️",
            "04d": "☁️",
            "04n": "☁️",
            "09d": "🌧️",
            "09n": "🌧️",
            "10d": "🌧️",
            "10n": "🌧️",
            "11d": "⛈️",
            "11n": "⛈️",
            "13d": "❄️",
            "13n": "❄️",
            "50d": "🌫️",
            "50n": "🌫️",
        };
        return iconMap[iconCode] || "🌡️";
    };

    const activeWeather = weatherLocations.find((w) => w._id === activeLocation);

    if (loading && weatherLocations.length === 0) {
        return (
            <Layout title="Weather Updates">
                <div className="container-fluid mt-4">
                    <div className="row">
                        <div className="col-md-3">
                            <FarmerMenu />
                        </div>
                        <div className="col-md-9">
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Weather Updates">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3">
                        <FarmerMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9">
                        <h1 className="mb-4 fw-bold text-success">🌤️ Weather Updates</h1>

                        {/* Alerts Section */}
                        {alerts.length > 0 && (
                            <div className="mb-4">
                                <h5 className="mb-3">⚠️ Active Alerts</h5>
                                {alerts.slice(0, 3).map((alert, idx) => (
                                    <div
                                        key={idx}
                                        className={`alert alert-${alert.severity === "severe"
                                            ? "danger"
                                            : alert.severity === "high"
                                                ? "warning"
                                                : "info"
                                            } d-flex justify-content-between align-items-center`}
                                        role="alert"
                                    >
                                        <div>
                                            <ExclamationTriangle size={20} className="me-2" />
                                            <strong>{alert.type}</strong> - {alert.location}
                                            <br />
                                            <small>{alert.description}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Location Section */}
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                {!showForm ? (
                                    <button
                                        className="btn btn-success w-100"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <Plus size={20} className="me-2" />
                                        Add New Location
                                    </button>
                                ) : (
                                    <form onSubmit={handleAddLocation}>
                                        <div className="row">
                                            <div className="col-md-9">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter city name (e.g., Delhi, Mumbai)"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <button
                                                    type="submit"
                                                    className="btn btn-success w-100"
                                                    disabled={loading}
                                                >
                                                    {loading ? "Adding..." : "Add"}
                                                </button>
                                            </div>
                                        </div>
                                        <small className="text-muted mt-2 d-block">
                                            Note: Uses OpenWeatherMap API for real-time data
                                        </small>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Weather Locations List */}
                        {weatherLocations.length > 0 ? (
                            <div className="row">
                                <div className="col-md-3">
                                    <h5 className="mb-3">📍 Your Locations</h5>
                                    <div className="list-group">
                                        {weatherLocations.map((weather) => (
                                            <button
                                                key={weather._id}
                                                className={`list-group-item list-group-item-action ${activeLocation === weather._id ? "active" : ""
                                                    }`}
                                                onClick={() => setActiveLocation(weather._id)}
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        {getWeatherIcon(weather.currentWeather?.icon)}{" "}
                                                        {weather.location}
                                                    </span>
                                                    {weather.isFavorite && (
                                                        <HeartFill size={14} className="text-danger" />
                                                    )}
                                                </div>
                                                <small className="text-muted">
                                                    {weather.currentWeather?.temperature}°C
                                                </small>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Weather Details */}
                                {activeWeather && (
                                    <div className="col-md-9">
                                        {/* Current Weather Card */}
                                        <div className="card shadow-sm mb-4">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-4">
                                                    <div>
                                                        <h3 className="mb-1">
                                                            {getWeatherIcon(activeWeather.currentWeather?.icon)}{" "}
                                                            {activeWeather.location}
                                                        </h3>
                                                        <p className="text-muted mb-1">
                                                            {activeWeather.currentWeather?.description}
                                                        </p>
                                                        <small className="text-muted">
                                                            Last updated:{" "}
                                                            {new Date(
                                                                activeWeather.lastUpdated
                                                            ).toLocaleTimeString()}
                                                        </small>
                                                    </div>
                                                    <div className="text-end">
                                                        <button
                                                            className="btn btn-sm btn-outline-danger me-2"
                                                            onClick={() =>
                                                                handleToggleFavorite(activeWeather._id)
                                                            }
                                                        >
                                                            {activeWeather.isFavorite ? (
                                                                <HeartFill size={18} />
                                                            ) : (
                                                                <Heart size={18} />
                                                            )}
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() =>
                                                                handleDeleteLocation(activeWeather._id)
                                                            }
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Temperature Display */}
                                                <div className="row mb-4">
                                                    <div className="col-md-6">
                                                        <div className="text-center p-4 bg-light rounded">
                                                            <h1 className="display-3 text-primary mb-2">
                                                                {activeWeather.currentWeather?.temperature}°C
                                                            </h1>
                                                            <p className="text-muted mb-0">
                                                                Feels like{" "}
                                                                {activeWeather.currentWeather?.feelsLike}°C
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="row">
                                                            <div className="col-6 mb-3">
                                                                <div className="p-3 bg-light rounded text-center">
                                                                    <Droplet size={24} className="text-primary mb-2" />
                                                                    <p className="small mb-1 text-muted">Humidity</p>
                                                                    <h5>
                                                                        {activeWeather.currentWeather?.humidity}%
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 mb-3">
                                                                <div className="p-3 bg-light rounded text-center">
                                                                    <Wind size={24} className="text-info mb-2" />
                                                                    <p className="small mb-1 text-muted">Wind Speed</p>
                                                                    <h5>
                                                                        {activeWeather.currentWeather?.windSpeed} m/s
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 mb-3">
                                                                <div className="p-3 bg-light rounded text-center">
                                                                    <Eye size={24} className="text-warning mb-2" />
                                                                    <p className="small mb-1 text-muted">Visibility</p>
                                                                    <h5>
                                                                        {activeWeather.currentWeather?.visibility} km
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-6 mb-3">
                                                                <div className="p-3 bg-light rounded text-center">
                                                                    <Speedometer size={24} className="text-success mb-2" />
                                                                    <p className="small mb-1 text-muted">Pressure</p>
                                                                    <h5>
                                                                        {activeWeather.currentWeather?.pressure} hPa
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hourly Forecast */}
                                        <div className="card shadow-sm mb-4">
                                            <div className="card-header bg-light">
                                                <h5 className="mb-0">⏰ Hourly Forecast (Next 24 Hours)</h5>
                                            </div>
                                            <div className="card-body">
                                                <div
                                                    className="d-flex overflow-auto"
                                                    style={{ gap: "10px" }}
                                                >
                                                    {activeWeather.hourlyForecast?.map((hour, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="card flex-shrink-0"
                                                            style={{ minWidth: "120px" }}
                                                        >
                                                            <div className="card-body p-3 text-center">
                                                                <p className="small mb-2">
                                                                    <strong>{hour.time}</strong>
                                                                </p>
                                                                <p className="mb-2 fs-4">
                                                                    {getWeatherIcon(hour.icon)}
                                                                </p>
                                                                <p className="small mb-2">
                                                                    <strong>{hour.temperature}°C</strong>
                                                                </p>
                                                                <small className="text-muted d-block">
                                                                    {hour.chanceOfRain}% rain
                                                                </small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 7-Day Forecast */}
                                        <div className="card shadow-sm">
                                            <div className="card-header bg-light">
                                                <h5 className="mb-0">📅 7-Day Forecast</h5>
                                            </div>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table table-hover mb-0">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Day</th>
                                                                <th className="text-center">Condition</th>
                                                                <th className="text-center">
                                                                    High / Low
                                                                </th>
                                                                <th className="text-center">Humidity</th>
                                                                <th className="text-center">Wind</th>
                                                                <th className="text-center">
                                                                    Rain Chance
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {activeWeather.forecast?.map((day, idx) => (
                                                                <tr key={idx}>
                                                                    <td>
                                                                        <strong>{day.day}</strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {day.date}
                                                                        </small>
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <p className="mb-1">
                                                                            {getWeatherIcon(day.icon)}
                                                                        </p>
                                                                        <small>{day.description}</small>
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <strong>
                                                                            {day.maxTemp}°C
                                                                        </strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {day.minTemp}°C
                                                                        </small>
                                                                    </td>
                                                                    <td className="text-center">
                                                                        {day.humidity}%
                                                                    </td>
                                                                    <td className="text-center">
                                                                        {day.windSpeed} m/s
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <span className="badge bg-info">
                                                                            {day.chanceOfRain}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="card shadow-sm">
                                <div className="card-body text-center p-5">
                                    <Cloud size={60} className="text-muted mb-3" />
                                    <h4>No Weather Locations Added Yet</h4>
                                    <p className="text-muted mb-3">
                                        Add your farm location to get real-time weather updates
                                    </p>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <Plus size={20} className="me-2" />
                                        Add Your First Location
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default WeatherPage;
