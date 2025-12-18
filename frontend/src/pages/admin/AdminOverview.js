import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import AdminMenu from "../../Dashboards/AdminMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import {
    People,
    Basket3,
    CartCheck,
    Truck,
    CashStack,
} from "react-bootstrap-icons";

const AdminOverview = () => {
    const { auth } = useAuth();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchActivities();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API}/api/admin/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Failed to load statistics");
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API}/api/admin/activities?limit=10`,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.token}`,
                    },
                }
            );

            if (data.success) {
                setActivities(data.activities);
            }
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    if (loading) {
        return (
            <Layout title="Admin Overview">
                <div className="container-fluid mt-4">
                    <div className="row">
                        <div className="col-md-3 col-lg-2 mb-3">
                            <AdminMenu />
                        </div>
                        <div className="col-md-9 col-lg-10">
                            <div className="text-center mt-5">
                                <div className="spinner-border text-danger" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Loading dashboard...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Admin Dashboard">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <AdminMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <h3 className="text-danger mb-4">📊 System Overview</h3>

                        {/* Stats Cards */}
                        <div className="row g-4 mb-4">
                            {/* Users Card */}
                            <div className="col-md-6 col-lg-3">
                                <div className="card shadow-sm h-100 border-primary">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-2">Total Users</h6>
                                                <h2 className="mb-0">{stats?.users?.total || 0}</h2>
                                            </div>
                                            <People size={40} className="text-primary" />
                                        </div>
                                        <hr />
                                        <small className="text-muted">
                                            Farmers: {stats?.users?.farmers || 0} | Traders:{" "}
                                            {stats?.users?.traders || 0} | Transport:{" "}
                                            {stats?.users?.transport || 0}
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Crops Card */}
                            <div className="col-md-6 col-lg-3">
                                <div className="card shadow-sm h-100 border-success">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-2">Total Crops</h6>
                                                <h2 className="mb-0">{stats?.crops?.total || 0}</h2>
                                            </div>
                                            <Basket3 size={40} className="text-success" />
                                        </div>
                                        <hr />
                                        <small className="text-muted">
                                            Available: {stats?.crops?.available || 0} | Sold:{" "}
                                            {stats?.crops?.sold || 0}
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Orders Card */}
                            <div className="col-md-6 col-lg-3">
                                <div className="card shadow-sm h-100 border-warning">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-2">Total Orders</h6>
                                                <h2 className="mb-0">{stats?.orders?.total || 0}</h2>
                                            </div>
                                            <CartCheck size={40} className="text-warning" />
                                        </div>
                                        <hr />
                                        <small className="text-muted">
                                            Pending: {stats?.orders?.pending || 0} | Delivered:{" "}
                                            {stats?.orders?.delivered || 0}
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Deliveries Card */}
                            <div className="col-md-6 col-lg-3">
                                <div className="card shadow-sm h-100 border-info">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-2">Deliveries</h6>
                                                <h2 className="mb-0">{stats?.deliveries?.total || 0}</h2>
                                            </div>
                                            <Truck size={40} className="text-info" />
                                        </div>
                                        <hr />
                                        <small className="text-muted">
                                            Active: {stats?.deliveries?.active || 0} | Completed:{" "}
                                            {stats?.deliveries?.completed || 0}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Card */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <div className="card shadow-sm border-success">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="text-muted mb-2">Total Revenue</h6>
                                                <h2 className="text-success mb-0">
                                                    ₹{stats?.revenue?.total?.toLocaleString() || 0}
                                                </h2>
                                                <small className="text-muted">
                                                    From {stats?.orders?.delivered || 0} delivered orders
                                                </small>
                                            </div>
                                            <CashStack size={50} className="text-success" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="row">
                            <div className="col-12">
                                <div className="card shadow-sm">
                                    <div className="card-header bg-light">
                                        <h5 className="mb-0">Recent Activities</h5>
                                    </div>
                                    <div className="card-body">
                                        {activities.length === 0 ? (
                                            <p className="text-muted text-center">
                                                No recent activities
                                            </p>
                                        ) : (
                                            <div className="list-group list-group-flush">
                                                {activities.map((activity, index) => (
                                                    <div
                                                        key={index}
                                                        className="list-group-item d-flex justify-content-between align-items-center"
                                                    >
                                                        <div>
                                                            <span
                                                                className={`badge ${activity.type === "crop"
                                                                    ? "bg-success"
                                                                    : activity.type === "order"
                                                                        ? "bg-warning"
                                                                        : "bg-info"
                                                                    } me-2`}
                                                            >
                                                                {activity.type.toUpperCase()}
                                                            </span>
                                                            {activity.message}
                                                            {activity.status && (
                                                                <span className="badge bg-secondary ms-2">
                                                                    {activity.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <small className="text-muted">
                                                            {new Date(activity.timestamp).toLocaleString()}
                                                        </small>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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

export default AdminOverview;
