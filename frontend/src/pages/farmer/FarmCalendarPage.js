import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from "../../context/authContext";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import {
    PlusCircle,
    CalendarCheck,
    ClipboardCheck,
    Trash,
    CheckCircle,
    ClockHistory,
} from "react-bootstrap-icons";

const FarmCalendarPage = () => {
    const { auth } = useAuth();
    const [date, setDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Other");

    // Fetch all tasks
    const getAllTasks = async () => {
        try {
            const { data } = await axios.get("/api/tasks/my-tasks", {
                headers: { Authorization: `Bearer ${auth?.token}` },
            });
            if (data?.success) {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.log(error);
            toast.error("Error fetching tasks");
        }
    };

    useEffect(() => {
        getAllTasks();
        // eslint-disable-next-line
    }, [auth?.token]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await axios.post(
                "/api/tasks/create",
                { title, description, date, category },
                { headers: { Authorization: `Bearer ${auth?.token}` } }
            );
            if (data?.success) {
                toast.success("Task scheduled successfully");
                setShowForm(false);
                setTitle("");
                setDescription("");
                setCategory("Other");
                getAllTasks();
            }
        } catch (error) {
            console.log(error);
            toast.error("Error creating task");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const { data } = await axios.put(
                `/api/tasks/update/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${auth?.token}` } }
            );
            if (data?.success) {
                toast.success("Task status updated");
                getAllTasks();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            const { data } = await axios.delete("/api/tasks/delete/" + id, {
                headers: { Authorization: `Bearer ${auth?.token}` },
            });
            if (data?.success) {
                toast.success("Task deleted");
                getAllTasks();
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Filter tasks for selected date
    const selectedDateTasks = tasks.filter(
        (task) => new Date(task.date).toDateString() === date.toDateString()
    );

    // Function to add class to tiles with tasks
    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            if (tasks.find((d) => new Date(d.date).toDateString() === date.toDateString())) {
                return "has-task";
            }
        }
    };

    return (
        <Layout title="Farm Calendar">
            <div className="container-fluid mt-4">
                <div className="row">
                    <div className="col-md-3">
                        <FarmerMenu />
                    </div>
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="text-success mb-0">📅 Farm Calendar & Tasks</h2>
                            <button
                                className="btn btn-success rounded-pill px-4 shadow-sm"
                                onClick={() => setShowForm(!showForm)}
                            >
                                {showForm ? "View Schedule" : "Add New Task"} <PlusCircle className="ms-2" />
                            </button>
                        </div>

                        <div className="row g-4">
                            {/* Calendar Column */}
                            <div className="col-lg-6">
                                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                                    <div className="card-body p-0">
                                        <Calendar
                                            onChange={setDate}
                                            value={date}
                                            className="w-100 border-0 custom-calendar"
                                            tileClassName={tileClassName}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-light rounded-4 border">
                                    <h6 className="text-success fw-bold mb-2">💡 Quick Tips</h6>
                                    <small className="text-muted">
                                        - Mark your **Harvesting** dates to plan ahead.<br />
                                        - Dot on the calendar tile indicates an activity scheduled for that day.
                                    </small>
                                </div>
                            </div>

                            {/* Tasks Column */}
                            <div className="col-lg-6">
                                {showForm ? (
                                    <div className="card shadow-sm border-0 rounded-4 animate-fadeIn">
                                        <div className="card-header bg-success text-white py-3">
                                            <h5 className="mb-0">Schedule Activity for {date.toDateString()}</h5>
                                        </div>
                                        <div className="card-body">
                                            <form onSubmit={handleCreateTask}>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Task Title</label>
                                                    <input
                                                        type="text"
                                                        className="form-control rounded-3"
                                                        placeholder="e.g., Sow Wheat Seeds"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Category</label>
                                                    <select
                                                        className="form-select rounded-3"
                                                        value={category}
                                                        onChange={(e) => setCategory(e.target.value)}
                                                    >
                                                        <option value="Sowing">Sowing</option>
                                                        <option value="Irrigation">Irrigation</option>
                                                        <option value="Fertilizing">Fertilizing</option>
                                                        <option value="Harvesting">Harvesting</option>
                                                        <option value="Maintenance">Maintenance</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Description</label>
                                                    <textarea
                                                        className="form-control rounded-3"
                                                        rows="3"
                                                        placeholder="Optional details..."
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                    ></textarea>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="btn btn-success w-100 rounded-3 py-2 fw-bold"
                                                >
                                                    {loading ? "Saving..." : "Save to Calendar"}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="tasks-list animate-fadeIn">
                                        <div className="card shadow-sm border-0 rounded-4 mb-3">
                                            <div className="card-body py-3 d-flex align-items-center bg-light">
                                                <CalendarCheck className="text-success me-3" size={24} />
                                                <h5 className="mb-0 fw-bold">Activities for {date.toDateString()}</h5>
                                            </div>
                                        </div>

                                        {selectedDateTasks.length === 0 ? (
                                            <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                                                <ClipboardCheck size={50} className="text-muted mb-3" />
                                                <h6 className="text-muted">No activities scheduled for this day.</h6>
                                                <button
                                                    className="btn btn-sm btn-outline-success mt-2"
                                                    onClick={() => setShowForm(true)}
                                                >
                                                    Schedule One
                                                </button>
                                            </div>
                                        ) : (
                                            selectedDateTasks.map((task) => (
                                                <div key={task._id} className="card shadow-sm border-0 rounded-4 mb-3 feature-card">
                                                    <div className={`card-body border-start border-5 border-${task.category === "Harvesting" ? "warning" :
                                                        task.category === "Irrigation" ? "info" :
                                                            task.category === "Sowing" ? "primary" : "success"
                                                        }`}>
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <span className={`badge mb-2 bg-${task.category === "Harvesting" ? "warning text-dark" :
                                                                    task.category === "Irrigation" ? "info" :
                                                                        task.category === "Sowing" ? "primary" : "success"
                                                                    }`}>
                                                                    {task.category}
                                                                </span>
                                                                <h6 className={`fw-bold mb-1 ${task.status === "Completed" ? "text-decoration-line-through text-muted" : ""}`}>
                                                                    {task.title}
                                                                </h6>
                                                                <p className="text-muted small mb-0">{task.description}</p>
                                                            </div>
                                                            <div className="d-flex gap-2">
                                                                {task.status === "Pending" ? (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-success rounded-circle p-1"
                                                                        onClick={() => handleUpdateStatus(task._id, "Completed")}
                                                                        title="Mark Completed"
                                                                    >
                                                                        <CheckCircle size={18} />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-secondary rounded-circle p-1"
                                                                        onClick={() => handleUpdateStatus(task._id, "Pending")}
                                                                        title="Mark Pending"
                                                                    >
                                                                        <ClockHistory size={18} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger rounded-circle p-1"
                                                                    onClick={() => handleDeleteTask(task._id)}
                                                                    title="Delete"
                                                                >
                                                                    <Trash size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                {`
          .custom-calendar {
            width: 100% !important;
            border: none !important;
            font-family: inherit;
          }
          .react-calendar__tile {
            padding: 1.5em 0.5em !important;
            position: relative;
          }
          .react-calendar__tile--active {
            background: #28a745 !important;
            border-radius: 10px;
          }
          .react-calendar__tile--now {
            background: #e8f5e9 !important;
            border-radius: 10px;
          }
          .has-task::after {
            content: "";
            position: absolute;
            bottom: 5px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            background: #28a745;
            border-radius: 50%;
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .feature-card:hover {
            transform: scale(1.02);
            transition: all 0.2s ease;
          }
        `}
            </style>
        </Layout>
    );
};

export default FarmCalendarPage;
